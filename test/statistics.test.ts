import { describe, expect, test } from 'vitest';

import { Doppio, DoppioAPIError } from '../src/index.js';
import {
  API_KEY,
  API_URL,
  jsonResponse,
  lastRequest,
  rejectionOf,
  SDK_VERSION,
  stubFetch,
} from './helpers.js';

const STATISTICS = {
  data: {
    month: '11',
    year: '2026',
    totalCallCount: '10223',
    successCount: '10220',
    failureCount: '3',
  },
};

describe('getStatistics', () => {
  test('sends GET /v1/statistics without a body', async () => {
    const fetchMock = stubFetch(() => jsonResponse(STATISTICS));

    await new Doppio(API_KEY).getStatistics();

    const { url, init, body } = lastRequest(fetchMock);
    expect(url).toBe(`${API_URL}/v1/statistics`);
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual({
      Authorization: `Bearer ${API_KEY}`,
      'User-Agent': `doppio-nodejs/${SDK_VERSION}`,
    });
    expect(body).toBeUndefined();
  });

  test('resolves with the statistics', async () => {
    stubFetch(() => jsonResponse(STATISTICS));

    await expect(new Doppio(API_KEY).getStatistics()).resolves.toEqual(
      STATISTICS
    );
  });

  test('rejects with a DoppioAPIError on an error status', async () => {
    stubFetch(() =>
      jsonResponse(
        {
          statusCode: 401,
          message: 'Invalid API key',
          code: 'INVALID_API_KEY',
        },
        401
      )
    );

    const error = await rejectionOf(new Doppio(API_KEY).getStatistics());

    expect(error).toBeInstanceOf(DoppioAPIError);
    expect(error).toMatchObject({ status: 401, code: 'INVALID_API_KEY' });
  });
});
