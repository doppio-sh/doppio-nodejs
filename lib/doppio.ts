'use strict';

import { DoppioError } from './doppioError';
import {
  DoppioConfig,
  LaunchConfig,
  PagePdfConfig,
  TemplateConfig,
  PageScreenshotConfig,
  DoppioResponse,
  DoppioResponseAsync,
  DoppioAsyncConfig,
} from './../types';

export class Doppio {
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
    const response = await fetch(
      'https://api.doppio.sh/v1/template/sync',
      {
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

  async renderTemplateAsync(
    TemplateConfigObject: TemplateConfig
  ): Promise<DoppioResponseAsync> {
    const response = await fetch(
      'https://api.doppio.sh/v1/template/async',
      {
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
}
