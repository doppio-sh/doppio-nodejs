import { describe, expect, test } from 'vitest';

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
      'User-Agent': 'Doppio/0.0.1',
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

  test('lets a template doppio config replace the client one entirely', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));
    const client = new Doppio(API_KEY);
    client.doppio({ webhook: WEBHOOK });
    const presigned = { presignedUrl: 'https://bucket.example.com/doc.pdf' };

    await call(client, method.name, {
      ...method.validArg,
      doppio: presigned,
    });

    expect(lastRequest(fetchMock).body).toMatchObject({ doppio: presigned });
    expect(lastRequest(fetchMock).body).not.toHaveProperty('doppio.webhook');
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
