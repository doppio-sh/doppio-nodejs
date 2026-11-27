import { describe, expect, test } from 'vitest';

import {
  DoppioAPIError,
  DoppioConnectionError,
  DoppioError,
} from '../src/index.js';
import {
  ALL_METHODS,
  call,
  jsonResponse,
  readyClient,
  rejectionOf,
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
    message: 'Invalid API key',
    code: 'INVALID_API_KEY',
  },
  {
    status: 403,
    body: {
      statusCode: 403,
      message: 'Current subscription does not allow async requests.',
      error: 'Forbidden',
      code: 'ASYNC_NOT_ALLOWED',
    },
    message: 'Current subscription does not allow async requests.',
    code: 'ASYNC_NOT_ALLOWED',
  },
  {
    status: 404,
    body: {
      statusCode: 404,
      message: 'Template not found',
      error: 'Not Found',
      code: 'TEMPLATE_NOT_FOUND',
    },
    message: 'Template not found',
    code: 'TEMPLATE_NOT_FOUND',
  },
  {
    status: 422,
    body: {
      statusCode: 422,
      message: 'Monthly quota reached',
      error: 'Unprocessable Entity',
      code: 'MONTHLY_QUOTA_REACHED',
    },
    message: 'Monthly quota reached',
    code: 'MONTHLY_QUOTA_REACHED',
  },
  {
    status: 429,
    body: {
      statusCode: 429,
      message: 'Too Many Requests',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    message: 'Too Many Requests',
    code: 'RATE_LIMIT_EXCEEDED',
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
    message: 'The render failed',
    code: undefined,
  },
];

describe.each(ALL_METHODS)('$name error handling', (method) => {
  const render = () => call(readyClient(method), method.name, method.validArg);

  test('turns a 400 response into a DoppioAPIError with the API message', async () => {
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

    const error = await rejectionOf(render());

    expect(error).toBeInstanceOf(DoppioAPIError);
    expect(error).toBeInstanceOf(DoppioError);
    expect(error).toMatchObject({
      name: 'DoppioAPIError',
      message: 'page.goto.url must be an URL address',
      status: 400,
      code: undefined,
      messages: ['page.goto.url must be an URL address'],
    });
  });

  test('keeps every validation message of a 400 response', async () => {
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

    const error = await rejectionOf(render());

    expect(error).toMatchObject({
      message: 'first problem, second problem',
      messages: ['first problem', 'second problem'],
    });
  });

  test('keeps the raw text when a 400 body is not JSON', async () => {
    stubFetch(() => new Response('Bad Request', { status: 400 }));

    const error = await rejectionOf(render());

    expect(error).toBeInstanceOf(DoppioAPIError);
    expect(error).toMatchObject({
      status: 400,
      message: 'Request failed with status 400',
      messages: [],
      body: 'Bad Request',
    });
  });

  test.each(API_ERRORS)(
    'exposes the status, code and message of a $status response',
    async ({ status, body, message, code }) => {
      stubFetch(() => jsonResponse(body, status));

      const error = await rejectionOf(render());

      expect(error).toBeInstanceOf(DoppioAPIError);
      expect(error).toMatchObject({ status, code, message, body });
    }
  );

  test('exposes the response headers', async () => {
    stubFetch(() =>
      jsonResponse({ statusCode: 429, message: 'Too Many Requests' }, 429, {
        'Retry-After': '30',
      })
    );

    const error = await rejectionOf(render());

    expect((error as DoppioAPIError).headers.get('retry-after')).toBe('30');
  });

  test.each([502, 503, 504])(
    'reports the status of a %i response without a JSON body',
    async (status) => {
      stubFetch(() => new Response('<html>Gateway error</html>', { status }));

      const error = await rejectionOf(render());

      expect(error).toBeInstanceOf(DoppioAPIError);
      expect(error).toMatchObject({
        status,
        message: `Request failed with status ${status}`,
        body: '<html>Gateway error</html>',
      });
    }
  );

  test('wraps network failures in a DoppioConnectionError', async () => {
    const failure = new TypeError('fetch failed');
    stubFetch(() => {
      throw failure;
    });

    const error = await rejectionOf(render());

    expect(error).toBeInstanceOf(DoppioConnectionError);
    expect(error).toBeInstanceOf(DoppioError);
    expect(error).toMatchObject({
      name: 'DoppioConnectionError',
      message: 'Could not reach the Doppio API',
      cause: failure,
    });
  });
});

describe.each(ALL_METHODS.filter((m) => m.output !== 'binary'))(
  '$name response parsing',
  (method) => {
    test('rejects a successful response whose body is not JSON', async () => {
      stubFetch(() => new Response('<html>oops</html>', { status: 200 }));

      const error = await rejectionOf(
        call(readyClient(method), method.name, method.validArg)
      );

      expect(error).toBeInstanceOf(DoppioError);
      expect(error).toMatchObject({
        message: 'The Doppio API returned invalid JSON',
      });
      expect((error as DoppioError).cause).toBeInstanceOf(SyntaxError);
    });
  }
);
