# Doppio.sh Node.js SDK

[![npm version](https://img.shields.io/npm/v/doppio-nodejs)](https://www.npmjs.com/package/doppio-nodejs)
[![CI](https://github.com/doppio-sh/doppio-nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/doppio-sh/doppio-nodejs/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/doppio-nodejs)](./LICENCE)

The official TypeScript SDK for [Doppio](https://doppio.sh). Render PDFs and screenshots from HTML or URLs, and render your stored templates.

- No dependencies. It relies on the platform `fetch`, so it runs on Node.js, Bun, Deno and edge runtimes.
- ESM and CommonJS builds, with TypeScript types.
- Typed errors, timeouts, cancellation and opt-in retries.

## Install

```sh
npm install doppio-nodejs
```

Requires Node.js 18 or later. Node.js 22 or later is recommended, because older versions no longer get security updates.

## Quick start

```ts
import { writeFile } from 'node:fs/promises';
import { Doppio } from 'doppio-nodejs';

const doppio = new Doppio(process.env.DOPPIO_API_KEY);

const pdf = await doppio.renderPdfDirect({
  goto: {
    url: 'https://example.com',
    options: { waitUntil: ['networkidle0'] },
  },
  pdf: { format: 'A4', printBackground: true },
});

await writeFile('example.pdf', new Uint8Array(pdf));
```

`const { Doppio } = require('doppio-nodejs')` works too.

## Render methods

| Method                                     | Resolves with                                                |
| ------------------------------------------ | ------------------------------------------------------------ |
| `renderPdfDirect(page, options?)`          | the PDF, as an `ArrayBuffer`                                 |
| `renderScreenshotDirect(page, options?)`   | the image, as an `ArrayBuffer`                               |
| `renderPdfSync(page, options?)`            | a `DoppioResponse` whose `documentUrl` points to the PDF     |
| `renderScreenshotSync(page, options?)`     | a `DoppioResponse` whose `documentUrl` points to the image   |
| `renderPdfAsync(page, options?)`           | `{ requestId, jobId }`, then Doppio calls your webhook       |
| `renderScreenshotAsync(page, options?)`    | `{ requestId, jobId }`, then Doppio calls your webhook       |
| `renderTemplateDirect(template, options?)` | the document, as an `ArrayBuffer`                            |
| `renderTemplateSync(template, options?)`   | a `DoppioResponse`                                           |
| `renderTemplateAsync(template, options?)`  | `{ requestId, jobId }`                                       |
| `getStatistics(options?)`                  | the render counts of your organization for the current month |

A page comes either from a URL (`goto`) or from HTML (`setContent`), never both. The API expects the HTML in base64, which `encodeBase64()` produces for any Unicode text:

```ts
import { Doppio, encodeBase64 } from 'doppio-nodejs';

const doppio = new Doppio(process.env.DOPPIO_API_KEY);

const image = await doppio.renderScreenshotDirect({
  setContent: { html: encodeBase64('<h1>Hello from Doppio</h1>') },
  screenshot: { type: 'png', fullPage: true },
});
```

The [API documentation](https://doc.doppio.sh/guide/render-methods/params-common) describes every page, PDF and screenshot option.

A template render takes the `templateId` of a stored template, and optional `templateData`:

```ts
const invoice = await doppio.renderTemplateSync({
  templateId: '80d89528-5d3d-4310-be1a-efc349389841',
  templateData: { DOP_name: 'Ada' },
});

console.log(invoice.documentUrl);
```

## Configuration

Client-wide settings go to the constructor:

```ts
import { Doppio } from 'doppio-nodejs';

const doppio = new Doppio({
  apiKey: process.env.DOPPIO_API_KEY,
  timeout: 60_000, // milliseconds, retries included
  maxRetries: 2, // after a 429, 502 or 503 response
  doppio: { contentDisposition: 'inline' },
  launch: { defaultViewport: { width: 1280, height: 800 } },
});
```

Each method also accepts these settings for a single call. The `doppio` and `launch` configs are merged over the client ones:

```ts
const controller = new AbortController();

await doppio.renderPdfSync(page, {
  signal: controller.signal,
  timeout: 10_000,
  doppio: {
    presignedUrl:
      'https://my-bucket.s3.amazonaws.com/report.pdf?X-Amz-Signature=…',
  },
});
```

Retries only apply to 429, 502 and 503 responses, because the API did not process those requests. The client waits for the `Retry-After` delay when the API sends one, up to 30 seconds.

## Errors

Every method rejects with a subclass of `DoppioError`:

| Error                   | Thrown when                                                    | Useful properties                               |
| ----------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `DoppioAPIError`        | the API answers with an error status                           | `status`, `code`, `messages`, `body`, `headers` |
| `DoppioTimeoutError`    | the call takes longer than its timeout                         | `timeout`                                       |
| `DoppioConnectionError` | the API cannot be reached                                      | `cause`                                         |
| `DoppioError`           | the input is invalid, such as `goto` and `setContent` together |                                                 |

Aborting a call through its `signal` rejects with the signal's reason instead.

Messages are meant for humans and can change, so branch on `code`, listed in the [API documentation](https://doc.doppio.sh/guide/what-to-expect-from-us#error-codes):

```ts
import { DoppioAPIError } from 'doppio-nodejs';

try {
  await doppio.renderPdfSync(page);
} catch (error) {
  if (
    error instanceof DoppioAPIError &&
    error.code === 'MONTHLY_QUOTA_REACHED'
  ) {
    showUpgradeBanner();
  } else {
    throw error;
  }
}
```

## Async renders and webhooks

An async render needs a webhook, which Doppio calls once the document is ready:

```ts
const { requestId } = await doppio.renderPdfAsync(page, {
  doppio: {
    webhook: { url: 'https://example.com/doppio-webhook', method: 'POST' },
  },
});
```

Doppio signs each webhook call. Check the signature against the raw body before trusting the payload. This handler uses the standard `Request` and `Response` objects of Next.js, Hono, Bun, Deno and Cloudflare Workers:

```ts
import {
  type DoppioWebhookPayload,
  verifyWebhookSignature,
} from 'doppio-nodejs';

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const valid = await verifyWebhookSignature({
    payload: body,
    signature: request.headers.get('x-doppio-payload-signature'),
    secret: process.env.DOPPIO_WEBHOOK_SECRET,
  });
  if (!valid) return new Response('Invalid signature', { status: 401 });

  const result: DoppioWebhookPayload = JSON.parse(body);
  // result.doppioRequestId is the requestId returned by renderPdfAsync
  return new Response(null, { status: 204 });
}
```

## Debugging and usage

`debug: true` sends the browser console output back with sync renders:

```ts
const { consoleOutput } = await doppio.renderPdfSync(page, { debug: true });
```

`onResponse` receives the headers of every response, from which `parseUsageHeaders()` reads the rate limit and the monthly quota. `getStatistics()` returns the counts of the current month:

```ts
import { parseUsageHeaders } from 'doppio-nodejs';

await doppio.renderPdfSync(page, {
  onResponse: ({ headers }) => {
    const { monthlyRemaining } = parseUsageHeaders(headers);
    console.log(`${monthlyRemaining} renders left this month`);
  },
});

const { data } = await doppio.getStatistics();
console.log(
  `${data.successCount} successful renders in ${data.month}/${data.year}`
);
```

## Upgrading from 0.9

Existing calls keep working. Three behaviors changed:

- API errors other than 400 now carry the message of the API instead of `HTTP error! status: N`. Use `status` and `code` on `DoppioAPIError` rather than the message. Every error is still an instance of `DoppioError`.
- A `doppio` config passed to a template render is merged with the client config instead of replacing it.
- `doppio()` and `launch()` are deprecated. The config they set applies to every later call of the client, which is error-prone when one client serves concurrent requests. Pass these configs to the constructor or to a single call instead.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). To report a vulnerability, follow [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENCE)
