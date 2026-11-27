import {
  DoppioAPIError,
  DoppioConnectionError,
  DoppioError,
  DoppioTimeoutError,
} from './errors.js';
import type {
  DoppioAsyncConfig,
  DoppioClientOptions,
  DoppioConfig,
  DoppioResponse,
  DoppioResponseAsync,
  LaunchConfig,
  PagePdfConfig,
  PageScreenshotConfig,
  RequestOptions,
  TemplateConfig,
} from './types.js';

declare const __SDK_VERSION__: string;

const DEFAULT_BASE_URL = 'https://api.doppio.sh';
const USER_AGENT = `doppio-nodejs/${__SDK_VERSION__}`;
const RETRYABLE_STATUSES = new Set([429, 502, 503]);
const MAX_RETRY_DELAY_MS = 30_000;

type DoppioSection = DoppioConfig | DoppioAsyncConfig;
type PageConfigName = 'PagePdfConfigObject' | 'PageScreenshotConfigObject';

interface RenderConfig {
  doppio?: DoppioSection;
  launch?: LaunchConfig;
}

/**
 * Client for the Doppio API.
 *
 * Every render method rejects with a {@link DoppioError}: a
 * {@link DoppioAPIError} when the API answers with an error status, a
 * {@link DoppioTimeoutError} or a {@link DoppioConnectionError} when no
 * response arrives. Aborting a call through its `signal` rejects with the
 * signal's reason instead.
 *
 * @example
 * ```ts
 * const doppio = new Doppio({ apiKey: process.env.DOPPIO_API_KEY, timeout: 60_000 });
 * const pdf = await doppio.renderPdfDirect({ goto: { url: 'https://example.com' } });
 * ```
 */
export class Doppio {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #timeout: number | undefined;
  readonly #maxRetries: number;
  readonly #fetch: typeof fetch | undefined;
  #doppioConfig: DoppioSection | undefined;
  #launchConfig: LaunchConfig | undefined;

  /** @param apiKeyOrOptions - Your API key, or the full client options. */
  constructor(apiKeyOrOptions: string | DoppioClientOptions) {
    const options: DoppioClientOptions =
      typeof apiKeyOrOptions === 'object' && apiKeyOrOptions !== null
        ? apiKeyOrOptions
        : { apiKey: apiKeyOrOptions };
    if (!options.apiKey) {
      throw new DoppioError('You must set your Doppio.sh API key');
    }
    this.#apiKey = options.apiKey;
    this.#baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.#timeout = options.timeout;
    this.#maxRetries = options.maxRetries ?? 0;
    this.#fetch = options.fetch;
    this.#doppioConfig = options.doppio;
    this.#launchConfig = options.launch;
  }

  /**
   * Replaces the `doppio` config sent with every following request.
   *
   * @deprecated Pass `doppio` to the constructor for client-wide defaults, or
   * in the options of a single call.
   */
  doppio(doppioConfig: DoppioConfig | DoppioAsyncConfig): void {
    this.#doppioConfig = doppioConfig;
  }

  /**
   * Replaces the `launch` config sent with every following request.
   *
   * @deprecated Pass `launch` to the constructor for client-wide defaults, or
   * in the options of a single call.
   */
  launch(launchConfig: LaunchConfig): void {
    this.#launchConfig = launchConfig;
  }

  /** Renders a PDF and resolves with its bytes. */
  async renderPdfDirect(
    page: PagePdfConfig,
    options?: RequestOptions
  ): Promise<ArrayBuffer> {
    const body = this.#pageBody(page, 'PagePdfConfigObject', options);
    return this.#binary('/v1/render/pdf/direct', body, options);
  }

  /** Renders a screenshot and resolves with its bytes. */
  async renderScreenshotDirect(
    page: PageScreenshotConfig,
    options?: RequestOptions
  ): Promise<ArrayBuffer> {
    const body = this.#pageBody(page, 'PageScreenshotConfigObject', options);
    return this.#binary('/v1/render/screenshot/direct', body, options);
  }

  /** Renders a PDF and resolves with the URL where it is stored. */
  async renderPdfSync(
    page: PagePdfConfig,
    options?: RequestOptions
  ): Promise<DoppioResponse> {
    const body = this.#pageBody(page, 'PagePdfConfigObject', options);
    return this.#json('/v1/render/pdf/sync', body, options);
  }

  /** Renders a screenshot and resolves with the URL where it is stored. */
  async renderScreenshotSync(
    page: PageScreenshotConfig,
    options?: RequestOptions
  ): Promise<DoppioResponse> {
    const body = this.#pageBody(page, 'PageScreenshotConfigObject', options);
    return this.#json('/v1/render/screenshot/sync', body, options);
  }

  /**
   * Queues a PDF render. Doppio calls the `doppio.webhook` once it is done,
   * so a webhook is required.
   */
  async renderPdfAsync(
    page: PagePdfConfig,
    options?: RequestOptions
  ): Promise<DoppioResponseAsync> {
    const body = this.#pageBody(page, 'PagePdfConfigObject', options, true);
    return this.#json('/v1/render/pdf/async', body, options);
  }

  /**
   * Queues a screenshot render. Doppio calls the `doppio.webhook` once it is
   * done, so a webhook is required.
   */
  async renderScreenshotAsync(
    page: PageScreenshotConfig,
    options?: RequestOptions
  ): Promise<DoppioResponseAsync> {
    const body = this.#pageBody(
      page,
      'PageScreenshotConfigObject',
      options,
      true
    );
    return this.#json('/v1/render/screenshot/async', body, options);
  }

  /** Renders a stored template and resolves with the document bytes. */
  async renderTemplateDirect(
    template: TemplateConfig,
    options?: RequestOptions
  ): Promise<ArrayBuffer> {
    const body = this.#templateBody(template, options);
    return this.#binary('/v1/template/direct', body, options);
  }

  /** Renders a stored template and resolves with the URL of the document. */
  async renderTemplateSync(
    template: TemplateConfig,
    options?: RequestOptions
  ): Promise<DoppioResponse> {
    const body = this.#templateBody(template, options);
    return this.#json('/v1/template/sync', body, options);
  }

  /** Queues the render of a stored template. */
  async renderTemplateAsync(
    template: TemplateConfig,
    options?: RequestOptions
  ): Promise<DoppioResponseAsync> {
    const body = this.#templateBody(template, options);
    return this.#json('/v1/template/async', body, options);
  }

  #pageBody(
    page: PagePdfConfig | PageScreenshotConfig,
    pageName: PageConfigName,
    options: RequestOptions | undefined,
    requiresWebhook = false
  ): object {
    if (!page) {
      throw new DoppioError(`${pageName} must be defined.`);
    }
    if (page.setContent && page.goto) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }
    if (!page.setContent && !page.goto) {
      throw new DoppioError('You need to set setContent or goto');
    }
    const config = this.#config(options?.doppio, options?.launch);
    if (requiresWebhook && !hasWebhook(config.doppio)) {
      throw new DoppioError(
        'You need to set a webhook property to work with the async render method'
      );
    }
    return { ...config, page };
  }

  #templateBody(
    template: TemplateConfig,
    options: RequestOptions | undefined
  ): object {
    if (!template) {
      throw new DoppioError('TemplateConfigObject must be defined.');
    }
    if (!template.templateId) {
      throw new DoppioError('You need to set a templateId');
    }
    const { doppio, ...rest } = template;
    const config = this.#config(
      merge(options?.doppio, doppio),
      options?.launch
    );
    return { ...config, ...rest };
  }

  #config(
    doppio: DoppioSection | undefined,
    launch: LaunchConfig | undefined
  ): RenderConfig {
    const mergedDoppio = merge(this.#doppioConfig, doppio);
    const mergedLaunch = mergeLaunch(this.#launchConfig, launch);
    return {
      ...(mergedDoppio && { doppio: mergedDoppio }),
      ...(mergedLaunch && { launch: mergedLaunch }),
    };
  }

  #binary(
    path: string,
    body: object,
    options: RequestOptions | undefined
  ): Promise<ArrayBuffer> {
    return this.#request(path, body, readBinary, options);
  }

  #json<T>(
    path: string,
    body: object,
    options: RequestOptions | undefined
  ): Promise<T> {
    return this.#request(path, body, readJson<T>, options);
  }

  async #request<T>(
    path: string,
    body: object,
    read: (response: Response) => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const timeout = options.timeout ?? this.#timeout;
    const maxRetries = options.maxRetries ?? this.#maxRetries;
    const { signal } = options;
    const controller = new AbortController();
    const forwardAbort = (): void => controller.abort(signal?.reason);
    let timedOut = false;
    const timer =
      timeout === undefined
        ? undefined
        : setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, timeout);
    if (signal?.aborted) forwardAbort();
    signal?.addEventListener('abort', forwardAbort, { once: true });

    try {
      for (let attempt = 0; ; attempt++) {
        controller.signal.throwIfAborted();
        const response = await this.#send(path, body, controller.signal);
        if (response.ok) return await read(response);
        if (attempt < maxRetries && RETRYABLE_STATUSES.has(response.status)) {
          await response.body?.cancel();
          await sleep(retryDelay(response.headers, attempt), controller.signal);
          continue;
        }
        throw new DoppioAPIError(
          response.status,
          await readErrorBody(response),
          response.headers
        );
      }
    } catch (error) {
      if (error instanceof DoppioError) throw error;
      if (timedOut && timeout !== undefined) {
        throw new DoppioTimeoutError(timeout, { cause: error });
      }
      if (signal?.aborted) throw signal.reason;
      throw new DoppioConnectionError({ cause: error });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', forwardAbort);
    }
  }

  #send(path: string, body: object, signal: AbortSignal): Promise<Response> {
    const fetchFn = this.#fetch ?? globalThis.fetch;
    return fetchFn(`${this.#baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    });
  }
}

function merge<T extends object>(
  base: T | undefined,
  override: T | undefined
): T | undefined {
  if (!base && !override) return undefined;
  return { ...base, ...override } as T;
}

function mergeLaunch(
  base: LaunchConfig | undefined,
  override: LaunchConfig | undefined
): LaunchConfig | undefined {
  if (!base || !override) return merge(base, override);
  return {
    ...base,
    ...override,
    defaultViewport: { ...base.defaultViewport, ...override.defaultViewport },
  };
}

function hasWebhook(doppio: DoppioSection | undefined): boolean {
  return doppio !== undefined && 'webhook' in doppio && Boolean(doppio.webhook);
}

function readBinary(response: Response): Promise<ArrayBuffer> {
  return response.arrayBuffer();
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (cause) {
    throw new DoppioError('The Doppio API returned invalid JSON', { cause });
  }
}

async function readErrorBody(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function retryDelay(headers: Headers, attempt: number): number {
  const retryAfter = headers.get('retry-after');
  if (retryAfter !== null) {
    const seconds = Number(retryAfter);
    const delay = Number.isNaN(seconds)
      ? Date.parse(retryAfter) - Date.now()
      : seconds * 1000;
    if (!Number.isNaN(delay)) return clampDelay(delay);
  }
  const backoff = 500 * 2 ** attempt;
  return clampDelay(backoff / 2 + Math.random() * (backoff / 2));
}

function clampDelay(delay: number): number {
  return Math.min(Math.max(delay, 0), MAX_RETRY_DELAY_MS);
}

function sleep(delay: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delay);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
