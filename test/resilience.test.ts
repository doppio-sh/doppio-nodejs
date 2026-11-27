import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  Doppio,
  DoppioAPIError,
  DoppioError,
  DoppioTimeoutError,
} from '../src/index.js';
import {
  API_KEY,
  HTML,
  jsonResponse,
  rejectionOf,
  SYNC_RESPONSE,
  stubFetch,
  stubFetchSequence,
  stubHangingFetch,
} from './helpers.js';

const PAGE = { setContent: { html: HTML } };
const ok = (): Response => jsonResponse(SYNC_RESPONSE);
const failure =
  (status: number, headers: Record<string, string> = {}) =>
  (): Response =>
    jsonResponse({ statusCode: status, message: 'Try again' }, status, headers);

afterEach(() => {
  vi.useRealTimers();
});

describe('timeout', () => {
  test('rejects with a DoppioTimeoutError once the client timeout elapses', async () => {
    stubHangingFetch();
    const client = new Doppio({ apiKey: API_KEY, timeout: 20 });

    const error = await rejectionOf(client.renderPdfSync(PAGE));

    expect(error).toBeInstanceOf(DoppioTimeoutError);
    expect(error).toBeInstanceOf(DoppioError);
    expect(error).toMatchObject({
      name: 'DoppioTimeoutError',
      message: 'Request timed out after 20 ms',
      timeout: 20,
    });
  });

  test('lets the call options override the client timeout', async () => {
    stubHangingFetch();
    const client = new Doppio({ apiKey: API_KEY, timeout: 60_000 });

    const error = await rejectionOf(
      client.renderPdfSync(PAGE, { timeout: 20 })
    );

    expect(error).toMatchObject({ timeout: 20 });
  });

  test('also covers the wait between retries', async () => {
    stubFetch(failure(503, { 'Retry-After': '10' }));
    const client = new Doppio({ apiKey: API_KEY, timeout: 20, maxRetries: 3 });

    const error = await rejectionOf(client.renderPdfSync(PAGE));

    expect(error).toBeInstanceOf(DoppioTimeoutError);
  });
});

describe('cancellation', () => {
  test('rejects with the reason of the caller signal', async () => {
    stubHangingFetch();
    const controller = new AbortController();
    const reason = new Error('user navigated away');
    setTimeout(() => controller.abort(reason), 10);

    const error = await rejectionOf(
      new Doppio(API_KEY).renderPdfSync(PAGE, { signal: controller.signal })
    );

    expect(error).toBe(reason);
  });

  test('does not call the API when the signal is already aborted', async () => {
    const fetchMock = stubFetch(ok);
    const controller = new AbortController();
    controller.abort();

    const error = await rejectionOf(
      new Doppio(API_KEY).renderPdfSync(PAGE, { signal: controller.signal })
    );

    expect(error).toMatchObject({ name: 'AbortError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('stops waiting for a retry when the signal aborts', async () => {
    stubFetch(failure(429, { 'Retry-After': '10' }));
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);

    const error = await rejectionOf(
      new Doppio({ apiKey: API_KEY, maxRetries: 1 }).renderPdfSync(PAGE, {
        signal: controller.signal,
      })
    );

    expect(error).toMatchObject({ name: 'AbortError' });
  });

  test('does not wait for a retry when the signal aborted meanwhile', async () => {
    const controller = new AbortController();
    const fetchMock = stubFetch(() => {
      controller.abort();
      return failure(429, { 'Retry-After': '10' })();
    });

    const error = await rejectionOf(
      new Doppio({ apiKey: API_KEY, maxRetries: 1 }).renderPdfSync(PAGE, {
        signal: controller.signal,
      })
    );

    expect(error).toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe('retries', () => {
  test('does not retry by default', async () => {
    const fetchMock = stubFetch(failure(429, { 'Retry-After': '0' }));

    const error = await rejectionOf(new Doppio(API_KEY).renderPdfSync(PAGE));

    expect(error).toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test.each([429, 502, 503])('retries a %i response', async (status) => {
    const fetchMock = stubFetchSequence([
      failure(status, { 'Retry-After': '0' }),
      ok,
    ]);
    const client = new Doppio({ apiKey: API_KEY, maxRetries: 1 });

    await expect(client.renderPdfSync(PAGE)).resolves.toEqual(SYNC_RESPONSE);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test.each([400, 500, 504])('does not retry a %i response', async (status) => {
    const fetchMock = stubFetch(failure(status, { 'Retry-After': '0' }));
    const client = new Doppio({ apiKey: API_KEY, maxRetries: 3 });

    const error = await rejectionOf(client.renderPdfSync(PAGE));

    expect(error).toMatchObject({ status });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  test('throws the last error once the retries are exhausted', async () => {
    const fetchMock = stubFetch(failure(503, { 'Retry-After': '0' }));
    const client = new Doppio({ apiKey: API_KEY, maxRetries: 2 });

    const error = await rejectionOf(client.renderPdfSync(PAGE));

    expect(error).toBeInstanceOf(DoppioAPIError);
    expect(error).toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test('lets the call options override the client maxRetries', async () => {
    const fetchMock = stubFetchSequence([
      failure(503, { 'Retry-After': '0' }),
      ok,
    ]);

    await new Doppio(API_KEY).renderPdfSync(PAGE, { maxRetries: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('waits for the Retry-After delay in seconds, capped at 30 seconds', async () => {
    vi.useFakeTimers();
    const fetchMock = stubFetchSequence([
      failure(429, { 'Retry-After': '120' }),
      ok,
    ]);
    const promise = new Doppio({
      apiKey: API_KEY,
      maxRetries: 1,
    }).renderPdfSync(PAGE);

    await vi.advanceTimersByTimeAsync(29_999);
    expect(fetchMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toEqual(SYNC_RESPONSE);
  });

  test('waits until the Retry-After date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-27T10:00:00.000Z'));
    const fetchMock = stubFetchSequence([
      failure(503, { 'Retry-After': 'Fri, 27 Nov 2026 10:00:02 GMT' }),
      ok,
    ]);
    const promise = new Doppio({
      apiKey: API_KEY,
      maxRetries: 1,
    }).renderPdfSync(PAGE);

    await vi.advanceTimersByTimeAsync(1_999);
    expect(fetchMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toEqual(SYNC_RESPONSE);
  });

  test.each([
    ['without Retry-After', {}],
    ['with an unreadable Retry-After', { 'Retry-After': 'soon' }],
  ])('backs off exponentially %s', async (_label, headers) => {
    vi.useFakeTimers();
    const fetchMock = stubFetchSequence([
      failure(503, headers),
      failure(503, headers),
      ok,
    ]);
    const promise = new Doppio({
      apiKey: API_KEY,
      maxRetries: 2,
    }).renderPdfSync(PAGE);

    await vi.advanceTimersByTimeAsync(249);
    expect(fetchMock).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(251);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1_000);
    await expect(promise).resolves.toEqual(SYNC_RESPONSE);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
