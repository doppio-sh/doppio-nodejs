import { describe, expect, test, vi } from 'vitest';

import {
  Doppio,
  DoppioError,
  parseUsageHeaders,
  type ResponseInfo,
} from '../src/index.js';
import {
  API_KEY,
  HTML,
  jsonResponse,
  rejectionOf,
  SYNC_RESPONSE,
  stubFetch,
  stubFetchSequence,
} from './helpers.js';

const PAGE = { setContent: { html: HTML } };

describe('parseUsageHeaders', () => {
  test('reads every rate-limit and quota header', () => {
    const headers = new Headers({
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': '59',
      'X-RateLimit-Reset': '42',
      'Retry-After': '30',
      'x-doppio-subscription-limit': '1000',
      'x-doppio-current-month-usage': '250',
      'x-doppio-remaining-usage': '750',
    });

    expect(parseUsageHeaders(headers)).toEqual({
      rateLimit: 60,
      rateLimitRemaining: 59,
      rateLimitReset: 42,
      retryAfter: 30,
      monthlyLimit: 1000,
      monthlyUsage: 250,
      monthlyRemaining: 750,
    });
  });

  test('leaves out missing, empty and non-numeric headers', () => {
    const headers = new Headers({
      'X-RateLimit-Limit': ' ',
      'Retry-After': 'Fri, 27 Nov 2026 10:00:00 GMT',
      'x-doppio-remaining-usage': ' 12 ',
    });

    expect(parseUsageHeaders(headers)).toEqual({ monthlyRemaining: 12 });
  });
});

describe('onResponse', () => {
  const usageHeaders = { 'x-doppio-remaining-usage': '750' };

  test('receives the status and headers of every response, retries included', async () => {
    stubFetchSequence([
      () => jsonResponse({}, 503, { 'Retry-After': '0' }),
      () => jsonResponse(SYNC_RESPONSE, 200, usageHeaders),
    ]);
    const onResponse = vi.fn<(response: ResponseInfo) => void>();
    const client = new Doppio({ apiKey: API_KEY, maxRetries: 1, onResponse });

    await client.renderPdfSync(PAGE);

    expect(onResponse.mock.calls.map(([info]) => info.status)).toEqual([
      503, 200,
    ]);
    const last = onResponse.mock.lastCall?.[0];
    expect(last && parseUsageHeaders(last.headers)).toEqual({
      monthlyRemaining: 750,
    });
  });

  test('lets the call options override the client callback', async () => {
    stubFetch(() => jsonResponse(SYNC_RESPONSE));
    const clientCallback = vi.fn();
    const callCallback = vi.fn();
    const client = new Doppio({ apiKey: API_KEY, onResponse: clientCallback });

    await client.renderPdfSync(PAGE, { onResponse: callCallback });

    expect(callCallback).toHaveBeenCalledOnce();
    expect(clientCallback).not.toHaveBeenCalled();
  });

  test('turns an error thrown by the callback into a DoppioError', async () => {
    stubFetch(() => jsonResponse(SYNC_RESPONSE));
    const failure = new Error('logger offline');

    const error = await rejectionOf(
      new Doppio(API_KEY).renderPdfSync(PAGE, {
        onResponse: () => {
          throw failure;
        },
      })
    );

    expect(error).toBeInstanceOf(DoppioError);
    expect(error).toMatchObject({
      message: 'The onResponse callback threw an error',
      cause: failure,
    });
  });
});
