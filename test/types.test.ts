import { describe, expectTypeOf, test } from 'vitest';

import type {
  CookiesConfig,
  Doppio,
  DoppioAsyncConfig,
  DoppioResponse,
  DoppioWebhookPayload,
  GotoConfig,
  PageFormat,
  PagePdfConfig,
  PageScreenshotConfig,
  PdfConfig,
  RequestOptions,
  ScreenshotClip,
  ScreenshotConfig,
  SetContentConfig,
  SyncRequestOptions,
  TemplateConfig,
} from '../src/index.js';

describe('public types', () => {
  test('accept an API key read from an environment variable', () => {
    expectTypeOf<string | undefined>().toExtend<
      ConstructorParameters<typeof Doppio>[0]
    >();
    expectTypeOf<{ apiKey: string | undefined }>().toExtend<
      ConstructorParameters<typeof Doppio>[0]
    >();
  });

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

describe('page constraints', () => {
  test('require exactly one of goto and setContent', () => {
    expectTypeOf<{ goto: GotoConfig }>().toExtend<PagePdfConfig>();
    expectTypeOf<{ setContent: SetContentConfig }>().toExtend<PagePdfConfig>();
    expectTypeOf<{
      goto: GotoConfig;
      setContent: SetContentConfig;
    }>().not.toExtend<PagePdfConfig>();
    expectTypeOf<{ pdf: PdfConfig }>().not.toExtend<PagePdfConfig>();
    expectTypeOf<{
      goto: GotoConfig;
      setContent: SetContentConfig;
    }>().not.toExtend<PageScreenshotConfig>();
  });

  test('accept either clip or fullPage in a screenshot', () => {
    expectTypeOf<{ clip: ScreenshotClip }>().toExtend<ScreenshotConfig>();
    expectTypeOf<{ fullPage: true }>().toExtend<ScreenshotConfig>();
    expectTypeOf<{
      clip: ScreenshotClip;
      fullPage: true;
    }>().not.toExtend<ScreenshotConfig>();
  });

  test('only accept quality with jpg, jpeg or webp', () => {
    expectTypeOf<{ type: 'webp'; quality: 80 }>().toExtend<ScreenshotConfig>();
    expectTypeOf<{
      type: 'png';
      quality: 80;
    }>().not.toExtend<ScreenshotConfig>();
    expectTypeOf<{ quality: 80 }>().not.toExtend<ScreenshotConfig>();
  });

  test('only accept the values documented by the API', () => {
    expectTypeOf<{ emulateMediaType: 'tv' }>().not.toExtend<
      Partial<PagePdfConfig>
    >();
    expectTypeOf<{
      name: 'a';
      value: 'b';
      sameSite: 'strict';
    }>().not.toExtend<CookiesConfig>();
    expectTypeOf<{
      name: 'a';
      value: 'b';
      expires: '2026-01-01';
    }>().not.toExtend<CookiesConfig>();
    expectTypeOf<{
      webhook: { url: string; method: 'POST'; headers: { 'X-Count': 1 } };
    }>().not.toExtend<DoppioAsyncConfig>();
  });

  test('accept a webhook in the doppio config of a template', () => {
    expectTypeOf<{
      templateId: string;
      doppio: { webhook: { url: string; method: 'POST' } };
    }>().toExtend<TemplateConfig>();
  });
});
