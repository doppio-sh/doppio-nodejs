import { describe, expect, test, vi } from 'vitest';

import { Doppio } from '../src/index.js';
import {
  ALL_METHODS,
  API_KEY,
  API_URL,
  ASYNC_RESPONSE,
  binaryResponse,
  call,
  HTML,
  lastRequest,
  PAGE_METHODS,
  readyClient,
  SDK_VERSION,
  SYNC_RESPONSE,
  stubFetch,
  successResponse,
  TEMPLATE_METHODS,
  WEBHOOK,
} from './helpers.js';

const LAUNCH = { defaultViewport: { width: 1280, height: 720 } };

describe.each(ALL_METHODS)('$name request', (method) => {
  test('POSTs JSON to its endpoint with the API key', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await call(readyClient(method), method.name, method.validArg);

    const { url, init } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}${method.path}`);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Authorization: `Bearer ${API_KEY}`,
      'User-Agent': `doppio-nodejs/${SDK_VERSION}`,
      'Content-Type': 'application/json',
    });
  });
});

describe.each(ALL_METHODS.filter((m) => m.output === 'binary'))(
  '$name response',
  (method) => {
    test('resolves with the document bytes as an ArrayBuffer', async () => {
      stubFetch(() => binaryResponse([1, 2, 3]));

      const result = await call(
        readyClient(method),
        method.name,
        method.validArg
      );

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect([...new Uint8Array(result as ArrayBuffer)]).toEqual([1, 2, 3]);
    });
  }
);

describe.each(ALL_METHODS.filter((m) => m.output !== 'binary'))(
  '$name response',
  (method) => {
    test('resolves with the parsed JSON body', async () => {
      stubFetch(() => successResponse(method.output));

      const result = await call(
        readyClient(method),
        method.name,
        method.validArg
      );

      expect(result).toEqual(
        method.output === 'sync' ? SYNC_RESPONSE : ASYNC_RESPONSE
      );
    });
  }
);

describe.each(PAGE_METHODS)('$name body', (method) => {
  test('nests the page config under page', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await call(readyClient(method), method.name, method.validArg);

    const { body } = lastRequest(fetchMock);
    expect(body).toEqual({
      ...(method.requiresWebhook && { doppio: { webhook: WEBHOOK } }),
      page: method.validArg,
    });
  });

  test('adds the doppio and launch configs set on the client', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio(API_KEY);
    const doppio = { webhook: WEBHOOK, contentDisposition: 'inline' } as const;
    client.doppio(doppio);
    client.launch(LAUNCH);

    await call(client, method.name, method.validArg);

    expect(lastRequest(fetchMock).body).toEqual({
      doppio,
      launch: LAUNCH,
      page: method.validArg,
    });
  });
});

describe.each(TEMPLATE_METHODS)('$name body', (method) => {
  test('spreads the template config at the top level', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await call(new Doppio(API_KEY), method.name, method.validArg);

    expect(lastRequest(fetchMock).body).toEqual(method.validArg);
  });

  test('adds the doppio and launch configs set on the client', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio(API_KEY);
    client.doppio({ webhook: WEBHOOK });
    client.launch(LAUNCH);

    await call(client, method.name, method.validArg);

    expect(lastRequest(fetchMock).body).toEqual({
      doppio: { webhook: WEBHOOK },
      launch: LAUNCH,
      ...method.validArg,
    });
  });

  test('merges a template doppio config over the client one', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio(API_KEY);
    client.doppio({ webhook: WEBHOOK });
    const presignedUrl = 'https://bucket.example.com/doc.pdf';

    await call(client, method.name, {
      ...method.validArg,
      doppio: { presignedUrl },
    });

    expect(lastRequest(fetchMock).body).toHaveProperty('doppio', {
      webhook: WEBHOOK,
      presignedUrl,
    });
  });

  test('gives the template doppio config precedence over the call options', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio({
      apiKey: API_KEY,
      doppio: { contentDisposition: 'inline' },
    });

    await call(
      client,
      method.name,
      { ...method.validArg, doppio: { presignedUrl: 'https://b.example/t' } },
      { doppio: { presignedUrl: 'https://b.example/options' } }
    );

    expect(lastRequest(fetchMock).body).toHaveProperty('doppio', {
      contentDisposition: 'inline',
      presignedUrl: 'https://b.example/t',
    });
  });
});

describe.each(PAGE_METHODS)('$name call options', (method) => {
  test('merges the call doppio and launch configs over the client ones', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio({
      apiKey: API_KEY,
      doppio: { contentDisposition: 'inline', webhook: WEBHOOK },
      launch: LAUNCH,
    });

    await call(client, method.name, method.validArg, {
      doppio: {
        contentDisposition: 'attachment',
        presignedUrl: 'https://b.ex',
      },
      launch: { defaultViewport: { width: 800, deviceScaleFactor: 2 } },
    });

    expect(lastRequest(fetchMock).body).toEqual({
      doppio: {
        contentDisposition: 'attachment',
        webhook: WEBHOOK,
        presignedUrl: 'https://b.ex',
      },
      launch: {
        defaultViewport: { width: 800, height: 720, deviceScaleFactor: 2 },
      },
      page: method.validArg,
    });
  });

  test('does not keep the call options for later calls', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio({
      apiKey: API_KEY,
      doppio: { webhook: WEBHOOK },
    });

    await call(client, method.name, method.validArg, {
      doppio: { presignedUrl: 'https://b.ex' },
      launch: LAUNCH,
    });
    await call(client, method.name, method.validArg);

    expect(lastRequest(fetchMock).body).toEqual({
      doppio: { webhook: WEBHOOK },
      page: method.validArg,
    });
  });
});

describe.each(['renderPdfSync', 'renderScreenshotSync'] as const)(
  '%s debug option',
  (name) => {
    test('adds debug: true to the body when set', async () => {
      const fetchMock = stubFetch(() => successResponse('sync'));

      await new Doppio(API_KEY)[name](
        { setContent: { html: HTML } },
        { debug: true }
      );

      expect(lastRequest(fetchMock).body).toEqual({
        page: { setContent: { html: HTML } },
        debug: true,
      });
    });

    test('leaves debug out of the body by default', async () => {
      const fetchMock = stubFetch(() => successResponse('sync'));

      await new Doppio(API_KEY)[name]({ setContent: { html: HTML } });

      expect(lastRequest(fetchMock).body).not.toHaveProperty('debug');
    });
  }
);

describe('client options', () => {
  test('sends the doppio and launch defaults passed to the constructor', async () => {
    const fetchMock = stubFetch(() => binaryResponse());
    const client = new Doppio({
      apiKey: API_KEY,
      doppio: { contentDisposition: 'inline' },
      launch: LAUNCH,
    });

    await client.renderPdfDirect({ setContent: { html: HTML } });

    expect(lastRequest(fetchMock).body).toEqual({
      doppio: { contentDisposition: 'inline' },
      launch: LAUNCH,
      page: { setContent: { html: HTML } },
    });
  });

  test('sends requests to the configured base URL', async () => {
    const fetchMock = stubFetch(() => binaryResponse());
    const client = new Doppio({
      apiKey: API_KEY,
      baseUrl: 'https://staging.doppio.test/',
    });

    await client.renderPdfDirect({ setContent: { html: HTML } });

    expect(lastRequest(fetchMock).url).toBe(
      'https://staging.doppio.test/v1/render/pdf/direct'
    );
  });

  test('uses the fetch passed to the constructor instead of the global one', async () => {
    const globalFetch = stubFetch(() => binaryResponse());
    const customFetch = vi.fn<typeof fetch>(async () => binaryResponse());
    const client = new Doppio({ apiKey: API_KEY, fetch: customFetch });

    await client.renderPdfDirect({ setContent: { html: HTML } });

    expect(customFetch).toHaveBeenCalledOnce();
    expect(globalFetch).not.toHaveBeenCalled();
  });
});

describe('client configuration', () => {
  test('keeps the doppio config for every later call, including direct renders', async () => {
    const fetchMock = stubFetch(() => binaryResponse());
    const client = new Doppio(API_KEY);
    client.doppio({ webhook: WEBHOOK });

    await client.renderPdfDirect({ setContent: { html: HTML } });

    expect(lastRequest(fetchMock).body).toHaveProperty(
      'doppio.webhook',
      WEBHOOK
    );
  });

  test('replaces the previous doppio config on each doppio() call', async () => {
    const fetchMock = stubFetch(() => binaryResponse());
    const client = new Doppio(API_KEY);
    client.doppio({ webhook: WEBHOOK });
    client.doppio({ contentDisposition: 'attachment' });

    await client.renderPdfDirect({ setContent: { html: HTML } });

    expect(lastRequest(fetchMock).body).toHaveProperty('doppio', {
      contentDisposition: 'attachment',
    });
  });
});
