'use strict';

export type WaitUntilOption =
  | 'domcontentloaded'
  | 'networkidle0'
  | 'networkidle2'
  | 'load';
export type HttpMethodOption = 'POST' | 'PUT' | 'GET' | 'DELETE' | 'PATCH';
export type PageFormat =
  | 'Letter'
  | 'Legal'
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
    headers?: Record<string, any>;
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
  html: string;
  options?: {
    waitUntil: WaitUntilOption[];
  };
}

export interface GotoConfig {
  url: string;
  options?: {
    waitUntil: WaitUntilOption[];
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

export interface CookiesConfig {
  name: string;
  value: string;
  domain: string;
  url?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  expires?: string;
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

export interface PagePdfConfig {
  goto?: GotoConfig;
  setContent?: SetContentConfig;
  setJavaScriptEnabled?: boolean;
  emulateMediaType?: string;
  setExtraHTTPHeaders?: Record<string, string>;
  authenticate?: AuthenticateConfig;
  pdf?: PdfConfig;
  setCookies?: CookiesConfig[];
  setLocalStorageItems?: LocalStorageConfig[];
  waitForFunction?: WaitForFunctionConfig;
  waitForSelector?: WaitForSelectorConfig;
  setUserAgent?: string;
}

export interface ScreenshotConfig {
  captureBeyondViewport?: boolean;
  clip?: ScreenshotClip;
  fullPage?: boolean;
  omitBackground?: boolean;
  quality?: number;
  type?: ScreenshotType;
}

export interface PageScreenshotConfig extends Omit<PagePdfConfig, 'pdf'> {
  screenshot?: ScreenshotConfig;
}

export interface DoppioResponse {
  doppioRequestId: string;
  renderStatus: string;
  documentUrl: string;
  isAsync: boolean;
  isCustomBucket: boolean;
}

export interface DoppioResponseAsync {
  requestId: string;
  jobId: string;
}

export interface TemplateConfig {
  templateId: string;
  templateData?: Record<any, any>;
  doppio?: DoppioConfig;
}

export { Doppio };
export default class Doppio {
  #apiKey;
  #doppioConfig: DoppioConfig | DoppioAsyncConfig | null;
  #launchConfig: LaunchConfig | null;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new DoppioError('You must set your Doppio.sh API key');
    }
    this.#apiKey = apiKey;
    this.#doppioConfig = null;
    this.#launchConfig = null;
  }

  private mergedConfigs() {
    let config = {};

    if (this.#doppioConfig) {
      config = {
        ...config,
        doppio: { ...this.#doppioConfig },
      };
    }
    if (this.#launchConfig) {
      config = {
        ...config,
        launch: { ...this.#launchConfig },
      };
    }

    return config;
  }

  doppio(doppioConfigObject: DoppioConfig | DoppioAsyncConfig) {
    this.#doppioConfig = doppioConfigObject;
  }

  launch(launchConfigObject: LaunchConfig) {
    this.#launchConfig = launchConfigObject;
  }

  async renderPdfDirect(
    PagePdfConfigObject: PagePdfConfig
  ): Promise<ArrayBuffer> {
    if (!PagePdfConfigObject) {
      throw new DoppioError('PagePdfConfigObject must be defined.');
    }

    if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }

    if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
      throw new DoppioError('You need to set setContent or goto');
    }

    const response = await fetch('https://api.doppio.sh/v1/render/pdf/direct', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': 'Doppio/0.0.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.mergedConfigs(),
        page: PagePdfConfigObject,
      }),
    });

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    return buffer;
  }

  async renderScreenshotDirect(
    PageScreenshotConfigObject: PageScreenshotConfig
  ): Promise<ArrayBuffer> {
    if (!PageScreenshotConfigObject) {
      throw new DoppioError('PageScreenshotConfigObject must be defined.');
    }

    if (
      PageScreenshotConfigObject.setContent &&
      PageScreenshotConfigObject.goto
    ) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }

    if (
      !PageScreenshotConfigObject.setContent &&
      !PageScreenshotConfigObject.goto
    ) {
      throw new DoppioError('You need to set setContent or goto');
    }

    const response = await fetch(
      'https://api.doppio.sh/v1/render/screenshot/direct',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          'User-Agent': 'Doppio/0.0.1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.mergedConfigs(),
          page: PageScreenshotConfigObject,
        }),
      }
    );

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    return buffer;
  }

  async renderPdfSync(
    PagePdfConfigObject: PagePdfConfig
  ): Promise<DoppioResponse> {
    if (!PagePdfConfigObject) {
      throw new DoppioError('PagePdfConfigObject must be defined.');
    }

    if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }

    if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
      throw new DoppioError('You need to set setContent or goto');
    }

    const response = await fetch('https://api.doppio.sh/v1/render/pdf/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': 'Doppio/0.0.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.mergedConfigs(),
        page: PagePdfConfigObject,
      }),
    });

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const parsedBody = await response.json();

    return parsedBody;
  }

  async renderScreenshotSync(
    PageScreenshotConfigObject: PageScreenshotConfig
  ): Promise<DoppioResponse> {
    if (!PageScreenshotConfigObject) {
      throw new DoppioError('PageScreenshotConfigObject must be defined.');
    }

    if (
      PageScreenshotConfigObject.setContent &&
      PageScreenshotConfigObject.goto
    ) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }

    if (
      !PageScreenshotConfigObject.setContent &&
      !PageScreenshotConfigObject.goto
    ) {
      throw new DoppioError('You need to set setContent or goto');
    }

    const response = await fetch(
      'https://api.doppio.sh/v1/render/screenshot/sync',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          'User-Agent': 'Doppio/0.0.1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.mergedConfigs(),
          page: PageScreenshotConfigObject,
        }),
      }
    );

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const parsedBody = await response.json();

    return parsedBody;
  }

  async renderPdfAsync(
    PagePdfConfigObject: PagePdfConfig
  ): Promise<DoppioResponseAsync> {
    if (!PagePdfConfigObject) {
      throw new DoppioError('PagePdfConfigObject must be defined.');
    }

    if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }

    if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
      throw new DoppioError('You need to set setContent or goto');
    }

    if (!(this.#doppioConfig as DoppioAsyncConfig).webhook) {
      throw new DoppioError(
        'You need to set a webhook property to work with the async render method'
      );
    }

    const response = await fetch('https://api.doppio.sh/v1/render/pdf/async', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': 'Doppio/0.0.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.mergedConfigs(),
        page: PagePdfConfigObject,
      }),
    });

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const parsedBody = await response.json();

    return parsedBody;
  }

  async renderScreenshotAsync(
    PageScreenshotConfigObject: PageScreenshotConfig
  ): Promise<DoppioResponseAsync> {
    if (!PageScreenshotConfigObject) {
      throw new DoppioError('PageScreenshotConfigObject must be defined.');
    }

    if (
      PageScreenshotConfigObject.setContent &&
      PageScreenshotConfigObject.goto
    ) {
      throw new DoppioError(
        'You cannot use setContent and goto at the same time.'
      );
    }

    if (
      !PageScreenshotConfigObject.setContent &&
      !PageScreenshotConfigObject.goto
    ) {
      throw new DoppioError('You need to set setContent or goto');
    }

    if (!(this.#doppioConfig as DoppioAsyncConfig).webhook) {
      throw new DoppioError(
        'You need to set a webhook property to work with the async render method'
      );
    }

    const response = await fetch(
      'https://api.doppio.sh/v1/render/screenshot/async',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          'User-Agent': 'Doppio/0.0.1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.mergedConfigs(),
          page: PageScreenshotConfigObject,
        }),
      }
    );

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const parsedBody = await response.json();

    return parsedBody;
  }

  async renderTemplateDirect(
    TemplateConfigObject: TemplateConfig
  ): Promise<ArrayBuffer> {
    const response = await fetch('https://api.doppio.sh/v1/template/direct', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': 'Doppio/0.0.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.mergedConfigs(),
        ...TemplateConfigObject,
      }),
    });

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    return buffer;
  }

  async renderTemplateSync(
    TemplateConfigObject: TemplateConfig
  ): Promise<DoppioResponse> {
    const response = await fetch('https://api.doppio.sh/v1/template/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': 'Doppio/0.0.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.mergedConfigs(),
        ...TemplateConfigObject,
      }),
    });

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const parsedBody = await response.json();

    return parsedBody;
  }

  async renderTemplateAsync(
    TemplateConfigObject: TemplateConfig
  ): Promise<DoppioResponseAsync> {
    const response = await fetch('https://api.doppio.sh/v1/template/async', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        'User-Agent': 'Doppio/0.0.1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.mergedConfigs(),
        ...TemplateConfigObject,
      }),
    });

    if (response.status === 400) {
      const errorBody = await response.json();
      throw new DoppioError(`${errorBody.message}`);
    }

    if (!response.ok) {
      throw new DoppioError(`HTTP error! status: ${response.status}`);
    }

    const parsedBody = await response.json();

    return parsedBody;
  }
}

export class DoppioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DoppioError';
  }
}
