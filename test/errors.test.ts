import { describe, expect, test } from 'vitest';

import { DoppioError } from '../src/index.js';
import {
  ALL_METHODS,
  call,
  expectDoppioError,
  jsonResponse,
  readyClient,
  stubFetch,
} from './helpers.js';

const API_ERRORS = [
  {
    status: 401,
    body: {
      statusCode: 401,
      message: 'Invalid API key',
      error: 'Unauthorized',
      code: 'INVALID_API_KEY',
    },
  },
  {
    status: 403,
    body: {
      statusCode: 403,
      message: 'Current subscription does not allow async requests.',
      error: 'Forbidden',
      code: 'ASYNC_NOT_ALLOWED',
    },
  },
  {
    status: 404,
    body: {
      statusCode: 404,
      message: 'Template not found',
      error: 'Not Found',
      code: 'TEMPLATE_NOT_FOUND',
    },
  },
  {
    status: 422,
    body: {
      statusCode: 422,
      message: 'Monthly quota reached',
      error: 'Unprocessable Entity',
      code: 'MONTHLY_QUOTA_REACHED',
    },
  },
  {
    status: 429,
    body: {
      statusCode: 429,
      message: 'Too Many Requests',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    headers: { 'Retry-After': '30' },
  },
  {
    status: 500,
    body: {
      doppioRequestId: 'doppioreq_640d0598',
      renderStatus: 'ERROR',
      documentUrl: '',
      isAsync: false,
      isCustomBucket: false,
    },
  },
];

describe.each(ALL_METHODS)('$name error handling', (method) => {
  test('uses the API message of a 400 response', async () => {
    stubFetch(() =>
      jsonResponse(
        {
          statusCode: 400,
          message: 'page.goto.url must be an URL address',
          error: 'Bad Request',
        },
        400
      )
    );

    await expectDoppioError(
      call(readyClient(method), method.name, method.validArg),
      'page.goto.url must be an URL address'
    );
  });

  test('joins 400 validation messages returned as an array', async () => {
    stubFetch(() =>
      jsonResponse(
        {
          statusCode: 400,
          message: ['first problem', 'second problem'],
          error: 'Bad Request',
        },
        400
      )
    );

    await expectDoppioError(
      call(readyClient(method), method.name, method.validArg),
      'first problem,second problem'
    );
  });

  test('lets the parse error escape when a 400 body is not JSON', async () => {
    stubFetch(() => new Response('Bad Request', { status: 400 }));

    const promise = call(readyClient(method), method.name, method.validArg);

    await expect(promise).rejects.toBeInstanceOf(SyntaxError);
    await expect(promise).rejects.not.toBeInstanceOf(DoppioError);
  });

  test.each(API_ERRORS)(
    'reports only the status of a $status response',
    async ({ status, body, headers }) => {
      stubFetch(() => jsonResponse(body, status, headers));

      await expectDoppioError(
        call(readyClient(method), method.name, method.validArg),
        `HTTP error! status: ${status}`
      );
    }
  );

  test.each([502, 503, 504])(
    'reports only the status of a %i response without a JSON body',
    async (status) => {
      stubFetch(() => new Response('<html>Gateway error</html>', { status }));

      await expectDoppioError(
        call(readyClient(method), method.name, method.validArg),
        `HTTP error! status: ${status}`
      );
    }
  );

  test('lets network failures escape unwrapped', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed');
    });

    const promise = call(readyClient(method), method.name, method.validArg);

    await expect(promise).rejects.toThrow(TypeError);
    await expect(promise).rejects.not.toBeInstanceOf(DoppioError);
  });
});
