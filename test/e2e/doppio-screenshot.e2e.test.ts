import { describe, expect, test } from 'vitest';

import { Doppio } from '../../src/index.js';
import {
  API_KEY,
  saveOutput,
  TEST_HTML,
  TEST_URL,
  WEBHOOK_URL,
} from './helpers.js';

describe.skipIf(!API_KEY)('Screenshot Rendering', () => {
  test('should render a SCREENSHOT (direct) with setContent', async () => {
    const doppioClient = new Doppio(API_KEY);

    const buffer = await doppioClient.renderScreenshotDirect({
      screenshot: {
        fullPage: true,
      },
      setContent: {
        html: TEST_HTML,
        options: {
          waitUntil: ['networkidle0'],
        },
      },
    });

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(0);

    await saveOutput('test-render-screenshot-direct.png', buffer);
  });

  test('should render a SCREENSHOT (direct) with goto URL', async () => {
    const doppioClient = new Doppio(API_KEY);

    const buffer = await doppioClient.renderScreenshotDirect({
      screenshot: {
        fullPage: true,
      },
      goto: {
        url: TEST_URL,
        options: {
          waitUntil: ['networkidle0'],
        },
      },
    });

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(0);

    await saveOutput('test-render-screenshot-direct-url.png', buffer);
  });

  test('should render a SCREENSHOT (sync) and return document URL', async () => {
    const doppioClient = new Doppio(API_KEY);

    const response = await doppioClient.renderScreenshotSync({
      screenshot: {
        fullPage: true,
      },
      setContent: {
        html: TEST_HTML,
        options: {
          waitUntil: ['networkidle0'],
        },
      },
    });

    expect(response).toHaveProperty('doppioRequestId');
    expect(response).toHaveProperty('renderStatus');
    expect(response).toHaveProperty('documentUrl');
    expect(response).toHaveProperty('isAsync');
    expect(response).toHaveProperty('isCustomBucket');
    expect(typeof response.doppioRequestId).toBe('string');
    expect(typeof response.documentUrl).toBe('string');
    expect(response.renderStatus).toBe('SUCCESS');
    expect(response.isAsync).toBe(false);
  });

  test.skipIf(!WEBHOOK_URL)(
    'should render a SCREENSHOT (async) with webhook',
    async () => {
      const doppioClient = new Doppio(API_KEY);

      doppioClient.doppio({
        webhook: {
          url: WEBHOOK_URL,
          method: 'POST',
        },
      });

      const response = await doppioClient.renderScreenshotAsync({
        screenshot: {
          fullPage: true,
        },
        setContent: {
          html: TEST_HTML,
          options: {
            waitUntil: ['networkidle0'],
          },
        },
      });

      expect(response).toHaveProperty('requestId');
      expect(response).toHaveProperty('jobId');
      expect(typeof response.requestId).toBe('string');
      expect(typeof response.jobId).toBe('string');
    }
  );
});
