import path from 'path';
import * as fs from 'node:fs/promises';

import { Doppio, DoppioError } from '../dist/esm/doppio.mjs';

describe('Doppio Screenshot Test Suite', () => {
  const API_KEY = process.env.DOPPIO_API_KEY || 'test-api-key';

  describe('Initialization', () => {
    test('should create a Doppio instance with valid API key', () => {
      const doppioClient = new Doppio('test-api-key');
      expect(doppioClient).toBeInstanceOf(Doppio);
    });

    test('should throw DoppioError when API key is missing', () => {
      expect(() => {
        new Doppio('');
      }).toThrow(DoppioError);
      expect(() => {
        new Doppio('');
      }).toThrow('You must set your Doppio.sh API key');
    });
  });

  describe('Validation', () => {
    test('should throw error when PageScreenshotConfigObject is undefined', async () => {
      const doppioClient = new Doppio(API_KEY);
      await expect(
        doppioClient.renderScreenshotDirect(undefined)
      ).rejects.toThrow(DoppioError);
      await expect(
        doppioClient.renderScreenshotDirect(undefined)
      ).rejects.toThrow('PageScreenshotConfigObject must be defined.');
    });

    test('should throw error when both setContent and goto are provided', async () => {
      const doppioClient = new Doppio(API_KEY);
      await expect(
        doppioClient.renderScreenshotDirect({
          setContent: { html: 'test' },
          goto: { url: 'https://example.com' },
        })
      ).rejects.toThrow(DoppioError);
      await expect(
        doppioClient.renderScreenshotDirect({
          setContent: { html: 'test' },
          goto: { url: 'https://example.com' },
        })
      ).rejects.toThrow('You cannot use setContent and goto at the same time.');
    });

    test('should throw error when neither setContent nor goto is provided', async () => {
      const doppioClient = new Doppio(API_KEY);
      await expect(
        doppioClient.renderScreenshotDirect({
          screenshot: { fullPage: true },
        })
      ).rejects.toThrow(DoppioError);
      await expect(
        doppioClient.renderScreenshotDirect({
          screenshot: { fullPage: true },
        })
      ).rejects.toThrow('You need to set setContent or goto');
    });

    test('should throw error when webhook is missing for async render', async () => {
      const doppioClient = new Doppio(API_KEY);

      await expect(
        doppioClient.renderScreenshotAsync({
          screenshot: {
            fullPage: true,
          },
          setContent: {
            html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
            options: {
              waitUntil: ['networkidle0'],
            },
          },
        })
      ).rejects.toThrow(DoppioError);
      await expect(
        doppioClient.renderScreenshotAsync({
          screenshot: {
            fullPage: true,
          },
          setContent: {
            html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
            options: {
              waitUntil: ['networkidle0'],
            },
          },
        })
      ).rejects.toThrow(
        'You need to set a webhook property to work with the async render method'
      );
    });
  });

  describe('Screenshot Rendering', () => {
    const TEST_HTML = 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=';

    test('should render a SCREENSHOT (direct) with setContent', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

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

      await fs.mkdir('./__tests__outputs', { recursive: true });
      const filePath = path.join(
        './__tests__outputs',
        'test-render-screenshot-direct.png'
      );
      await fs.writeFile(filePath, new Uint8Array(buffer));
    });

    test('should render a SCREENSHOT (direct) with goto URL', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const buffer = await doppioClient.renderScreenshotDirect({
        screenshot: {
          fullPage: true,
        },
        goto: {
          url: 'https://www.wikipedia.org',
          options: {
            waitUntil: ['networkidle0'],
          },
        },
      });

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);

      await fs.mkdir('./__tests__outputs', { recursive: true });
      const filePath = path.join(
        './__tests__outputs',
        'test-render-screenshot-direct-url.png'
      );
      await fs.writeFile(filePath, new Uint8Array(buffer));
    });

    test('should render a SCREENSHOT (sync) and return document URL', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

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

    test('should render a SCREENSHOT (async) with webhook', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      doppioClient.doppio({
        webhook: {
          url: process.env.DOPPIO_WEBHOOK_URL!,
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
    });
  });
});
