import { expect, type Mock, vi } from 'vitest';

import { Doppio, DoppioError } from '../src/index.js';

export const API_KEY = 'test-api-key';
export const API_URL = 'https://api.doppio.sh';
export const HTML = 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=';
export const WEBHOOK = {
  url: 'https://example.com/webhook',
  method: 'POST',
} as const;

export const SYNC_RESPONSE = {
  doppioRequestId: 'doppioreq_640d0598',
  renderStatus: 'SUCCESS',
  documentUrl: 'https://tmp.doppio.sh/doppioreq_640d0598.pdf',
  isAsync: false,
  isCustomBucket: false,
} as const;

export const ASYNC_RESPONSE = {
  requestId: 'doppioreq_640d0598',
  jobId: 'job_123',
} as const;

type MethodName = {
  [K in keyof Doppio]: K extends `render${string}` ? K : never;
}[keyof Doppio];

export interface MethodCase {
  name: MethodName;
  path: string;
  output: 'binary' | 'sync' | 'async';
  requiresWebhook: boolean;
  validArg: object;
}

export interface PageMethodCase extends MethodCase {
  pageName: 'PagePdfConfigObject' | 'PageScreenshotConfigObject';
}

const PAGE = { setContent: { html: HTML } };
const TEMPLATE = { templateId: 'tpl_123', templateData: { name: 'Ada' } };

export const PAGE_METHODS: PageMethodCase[] = [
  {
    name: 'renderPdfDirect',
    path: '/v1/render/pdf/direct',
    output: 'binary',
    requiresWebhook: false,
    validArg: PAGE,
    pageName: 'PagePdfConfigObject',
  },
  {
    name: 'renderPdfSync',
    path: '/v1/render/pdf/sync',
    output: 'sync',
    requiresWebhook: false,
    validArg: PAGE,
    pageName: 'PagePdfConfigObject',
  },
  {
    name: 'renderPdfAsync',
    path: '/v1/render/pdf/async',
    output: 'async',
    requiresWebhook: true,
    validArg: PAGE,
    pageName: 'PagePdfConfigObject',
  },
  {
    name: 'renderScreenshotDirect',
    path: '/v1/render/screenshot/direct',
    output: 'binary',
    requiresWebhook: false,
    validArg: PAGE,
    pageName: 'PageScreenshotConfigObject',
  },
  {
    name: 'renderScreenshotSync',
    path: '/v1/render/screenshot/sync',
    output: 'sync',
    requiresWebhook: false,
    validArg: PAGE,
    pageName: 'PageScreenshotConfigObject',
  },
  {
    name: 'renderScreenshotAsync',
    path: '/v1/render/screenshot/async',
    output: 'async',
    requiresWebhook: true,
    validArg: PAGE,
    pageName: 'PageScreenshotConfigObject',
  },
];

export const TEMPLATE_METHODS: MethodCase[] = [
  {
    name: 'renderTemplateDirect',
    path: '/v1/template/direct',
    output: 'binary',
    requiresWebhook: false,
    validArg: TEMPLATE,
  },
  {
    name: 'renderTemplateSync',
    path: '/v1/template/sync',
    output: 'sync',
    requiresWebhook: false,
    validArg: TEMPLATE,
  },
  {
    name: 'renderTemplateAsync',
    path: '/v1/template/async',
    output: 'async',
    requiresWebhook: false,
    validArg: TEMPLATE,
  },
];

export const ALL_METHODS: MethodCase[] = [...PAGE_METHODS, ...TEMPLATE_METHODS];

export function call(
  client: Doppio,
  method: MethodName,
  arg: unknown
): Promise<unknown> {
  const fn = client[method] as (arg: unknown) => Promise<unknown>;
  return fn.call(client, arg);
}

export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function binaryResponse(bytes: number[] = [37, 80, 68, 70]): Response {
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { 'Content-Type': 'application/pdf' },
  });
}

export function successResponse(output: MethodCase['output']): Response {
  if (output === 'binary') return binaryResponse();
  return jsonResponse(output === 'sync' ? SYNC_RESPONSE : ASYNC_RESPONSE);
}

export function stubFetch(
  respond: () => Response | Promise<Response>
): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async () => respond());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function lastRequest(fetchMock: Mock<typeof fetch>): {
  url: string;
  init: RequestInit;
  body: unknown;
} {
  const lastCall = fetchMock.mock.lastCall;
  if (!lastCall) throw new Error('fetch was not called');
  const [url, init = {}] = lastCall;
  return { url: String(url), init, body: JSON.parse(String(init.body)) };
}

export function readyClient(method: MethodCase): Doppio {
  const client = new Doppio(API_KEY);
  if (method.requiresWebhook) client.doppio({ webhook: WEBHOOK });
  return client;
}

export async function expectDoppioError(
  promise: Promise<unknown>,
  message: string
): Promise<void> {
  await expect(promise).rejects.toBeInstanceOf(DoppioError);
  await expect(promise).rejects.toHaveProperty('message', message);
}
