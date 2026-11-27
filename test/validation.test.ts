import { describe, expect, test } from 'vitest';

import { Doppio } from '../src/index.js';
import {
  API_KEY,
  call,
  expectDoppioError,
  HTML,
  PAGE_METHODS,
  readyClient,
  stubFetch,
  successResponse,
  TEMPLATE_METHODS,
  WEBHOOK,
} from './helpers.js';

describe.each(PAGE_METHODS)('$name input validation', (method) => {
  test('rejects a missing page config without calling the API', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await expectDoppioError(
      call(readyClient(method), method.name, undefined),
      `${method.pageName} must be defined.`
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('rejects setContent and goto used together', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await expectDoppioError(
      call(readyClient(method), method.name, {
        setContent: { html: HTML },
        goto: { url: 'https://example.com' },
      }),
      'You cannot use setContent and goto at the same time.'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('rejects a page config without setContent or goto', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await expectDoppioError(
      call(readyClient(method), method.name, {
        pdf: { printBackground: true },
      }),
      'You need to set setContent or goto'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe.each(PAGE_METHODS.filter((m) => m.requiresWebhook))(
  '$name webhook requirement',
  (method) => {
    const message =
      'You need to set a webhook property to work with the async render method';

    test('rejects the call when no doppio config is set', async () => {
      const fetchMock = stubFetch(() => successResponse(method.output));

      await expectDoppioError(
        call(new Doppio(API_KEY), method.name, method.validArg),
        message
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('rejects the call when the doppio config has no webhook', async () => {
      const fetchMock = stubFetch(() => successResponse(method.output));
      const client = new Doppio(API_KEY);
      client.doppio({ presignedUrl: 'https://bucket.example.com/doc.pdf' });

      await expectDoppioError(
        call(client, method.name, method.validArg),
        message
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('accepts the call once a webhook is set', async () => {
      const fetchMock = stubFetch(() => successResponse(method.output));
      const client = new Doppio(API_KEY);
      client.doppio({ webhook: WEBHOOK });

      await call(client, method.name, method.validArg);
      expect(fetchMock).toHaveBeenCalledOnce();
    });
  }
);

describe.each(TEMPLATE_METHODS)('$name input validation', (method) => {
  test('sends the request without validating the template config', async () => {
    const fetchMock = stubFetch(() => successResponse(method.output));

    await call(new Doppio(API_KEY), method.name, undefined);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
