import { describe, expectTypeOf, test } from 'vitest';

import type {
  CookiesConfig,
  Doppio,
  DoppioResponse,
  DoppioWebhookPayload,
  PageFormat,
  PagePdfConfig,
  RequestOptions,
  SyncRequestOptions,
} from '../src/index.js';

describe('public types', () => {
  test('accept every paper format documented by the API', () => {
    expectTypeOf<'Tabloid'>().toExtend<PageFormat>();
  });

  test('accept the page options documented by the API', () => {
    expectTypeOf({
      goto: {
        url: 'https://example.com',
        options: { referer: 'https://example.com/from' },
      },
      emulateTimezone: 'Europe/Paris',
      emulateMediaType: null,
    }).toExtend<PagePdfConfig>();
  });

  test('accept CDP cookies identified by URL with a numeric expiry', () => {
    expectTypeOf({
      name: 'session',
      value: 'abc',
      url: 'https://example.com',
      sameSite: 'Lax',
      expires: 1_800_000_000,
    } as const).toExtend<CookiesConfig>();
  });

  test('describe the render status as SUCCESS or ERROR', () => {
    expectTypeOf<DoppioResponse['renderStatus']>().toEqualTypeOf<
      'SUCCESS' | 'ERROR'
    >();
    expectTypeOf<DoppioWebhookPayload['isAsync']>().toEqualTypeOf<true>();
  });

  test('only offer debug to the sync page renders', () => {
    expectTypeOf<Parameters<Doppio['renderPdfSync']>[1]>().toEqualTypeOf<
      SyncRequestOptions | undefined
    >();
    expectTypeOf<Parameters<Doppio['renderPdfDirect']>[1]>().toEqualTypeOf<
      RequestOptions | undefined
    >();
    expectTypeOf<RequestOptions>().not.toHaveProperty('debug');
  });
});
