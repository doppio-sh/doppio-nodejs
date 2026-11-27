export type WaitUntilOption =
  | 'domcontentloaded'
  | 'networkidle0'
  | 'networkidle2'
  | 'load';
export type HttpMethodOption = 'POST' | 'PUT' | 'GET' | 'DELETE' | 'PATCH';
export type PageFormat =
  | 'Letter'
  | 'Legal'
  | 'Tabloid'
  | 'Ledger'
  | 'A0'
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6';
export type ScreenshotType = 'png' | 'jpg' | 'jpeg' | 'webp';
export type ContentDisposition = 'inline' | 'attachment';

export type ScreenshotClip = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export interface DoppioConfig {
  presignedUrl?: string;
  contentDisposition?: ContentDisposition;
}

export interface DoppioAsyncConfig extends DoppioConfig {
  webhook: {
    url: string;
    method: HttpMethodOption;
    headers?: Record<string, string>;
  };
}

export interface LaunchConfig {
  defaultViewport: {
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
}

export interface SetContentConfig {
  /** Page HTML, encoded in base64. See {@link encodeBase64}. */
  html: string;
  options?: {
    waitUntil?: WaitUntilOption[];
  };
}

export interface GotoConfig {
  /** URL to render, scheme included. */
  url: string;
  options?: {
    waitUntil?: WaitUntilOption[];
    /** Overrides the `Referer` header set by `setExtraHTTPHeaders`. */
    referer?: string;
  };
}

export interface MarginConfig {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

export interface PdfConfig {
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  landscape?: boolean;
  pageRanges?: string;
  format?: PageFormat;
  width?: string | number;
  height?: string | number;
  preferCSSPageSize?: boolean;
  omitBackground?: boolean;
  margin?: MarginConfig;
}

export interface AuthenticateConfig {
  username: string;
  password: string;
}

/** Follows the Chrome DevTools Protocol `Network.CookieParam` type. */
export interface CookiesConfig {
  name: string;
  value: string;
  /** Set either `domain` or `url`. */
  domain?: string;
  url?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  /** Expiration date, in seconds since the Unix epoch. */
  expires?: number;
}

export interface LocalStorageConfig {
  key: string;
  value: string;
}

export interface WaitForFunctionConfig {
  pageFunction: string;
  options?: {
    polling?: string | number;
    timeout?: number;
  };
}

export interface WaitForSelectorConfig {
  selector: string;
  options?: {
    hidden?: boolean;
    timeout?: number;
    visible?: boolean;
  };
}

/** A page comes either from a URL (`goto`) or from HTML (`setContent`). */
export type PageSource =
  | { goto: GotoConfig; setContent?: never }
  | { setContent: SetContentConfig; goto?: never };

/** Options shared by PDF and screenshot renders. */
export interface PageOptions {
  setJavaScriptEnabled?: boolean;
  /** CSS media type to emulate. `null` disables the emulation. */
  emulateMediaType?: 'screen' | 'print' | null;
  /** Timezone ID used by the page, such as `Europe/Paris`. */
  emulateTimezone?: string;
  setExtraHTTPHeaders?: Record<string, string>;
  authenticate?: AuthenticateConfig;
  setCookies?: CookiesConfig[];
  setLocalStorageItems?: LocalStorageConfig[];
  waitForFunction?: WaitForFunctionConfig;
  waitForSelector?: WaitForSelectorConfig;
  setUserAgent?: string;
}

export type PagePdfConfig = PageSource & PageOptions & { pdf?: PdfConfig };

/** Captures either a region (`clip`) or the full page (`fullPage`). */
export type ScreenshotArea =
  | { clip?: ScreenshotClip; fullPage?: never }
  | { fullPage?: boolean; clip?: never };

/** `quality` only applies to the lossy formats. */
export type ScreenshotFormat =
  | { type?: 'png'; quality?: never }
  | { type: Exclude<ScreenshotType, 'png'>; quality?: number };

export type ScreenshotConfig = ScreenshotArea &
  ScreenshotFormat & {
    captureBeyondViewport?: boolean;
    omitBackground?: boolean;
  };

export type PageScreenshotConfig = PageSource &
  PageOptions & { screenshot?: ScreenshotConfig };

export interface DoppioResponse {
  doppioRequestId: string;
  renderStatus: 'SUCCESS' | 'ERROR';
  documentUrl: string;
  isAsync: boolean;
  isCustomBucket: boolean;
  /** Browser console output, sent back when the call used `debug: true`. */
  consoleOutput?: DoppioConsoleMessage[];
}

export interface DoppioConsoleMessage {
  /** Console method that produced the message, such as `log` or `error`. */
  type: string;
  text: string;
  location?: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
}

/** Body that Doppio sends to your webhook once an async render is done. */
export interface DoppioWebhookPayload {
  /** Same ID as the `requestId` returned by the async render call. */
  doppioRequestId: string;
  renderStatus: 'SUCCESS' | 'ERROR';
  documentUrl: string;
  isAsync: true;
  isCustomBucket: boolean;
}

/** Monthly usage of your organization, as returned by `getStatistics()`. */
export interface DoppioStatistics {
  data: {
    month: string;
    year: string;
    totalCallCount: string;
    successCount: string;
    failureCount: string;
  };
}

/** Rate-limit and quota headers of a response. See `parseUsageHeaders()`. */
export interface DoppioUsage {
  /** Requests allowed per minute. */
  rateLimit?: number;
  /** Requests left in the current minute. */
  rateLimitRemaining?: number;
  /** Seconds until the rate limit resets. */
  rateLimitReset?: number;
  /** Seconds to wait before retrying, sent with 429 responses. */
  retryAfter?: number;
  /** Renders included in the subscription for the current month. */
  monthlyLimit?: number;
  /** Renders made during the current month. */
  monthlyUsage?: number;
  /** Renders left for the current month. */
  monthlyRemaining?: number;
}

/** Status and headers of an HTTP response, passed to `onResponse`. */
export interface ResponseInfo {
  status: number;
  headers: Headers;
}

export interface DoppioResponseAsync {
  requestId: string;
  jobId: string;
}

export interface TemplateConfig {
  templateId: string;
  /** Values injected in the `{* DOP_xxx *}` tags of the template. */
  templateData?: Record<string, unknown>;
  /** Merged over the client and call `doppio` configs. */
  doppio?: DoppioConfig | DoppioAsyncConfig;
}

export interface DoppioClientOptions {
  /**
   * API key of your organization, from the Doppio dashboard. The constructor
   * throws a `DoppioError` when it is missing.
   */
  apiKey: string | undefined;
  /** @defaultValue `'https://api.doppio.sh'` */
  baseUrl?: string;
  /**
   * Maximum duration of a call in milliseconds, retries included.
   * @defaultValue no timeout
   */
  timeout?: number;
  /**
   * Number of retries after a 429, 502 or 503 response. Waits for the
   * `Retry-After` delay when the API sends one.
   * @defaultValue `0`
   */
  maxRetries?: number;
  /** Custom `fetch`, e.g. to go through a proxy. Defaults to the global one. */
  fetch?: typeof fetch;
  /** `doppio` config sent with every request. */
  doppio?: DoppioConfig | DoppioAsyncConfig;
  /** `launch` config sent with every request. */
  launch?: LaunchConfig;
  /**
   * Called with the status and headers of every HTTP response, retries
   * included. Use {@link parseUsageHeaders} to read the quota headers.
   */
  onResponse?: (response: ResponseInfo) => void;
}

export interface RequestOptions {
  /** Cancels the call. The promise then rejects with the signal's reason. */
  signal?: AbortSignal;
  /** Overrides the client `timeout` for this call. */
  timeout?: number;
  /** Overrides the client `maxRetries` for this call. */
  maxRetries?: number;
  /** Merged over the client `doppio` config for this call only. */
  doppio?: DoppioConfig | DoppioAsyncConfig;
  /** Merged over the client `launch` config for this call only. */
  launch?: LaunchConfig;
  /** Overrides the client `onResponse` for this call. */
  onResponse?: (response: ResponseInfo) => void;
}

export interface SyncRequestOptions extends RequestOptions {
  /** Sends the browser console output back in `consoleOutput`. */
  debug?: boolean;
}
