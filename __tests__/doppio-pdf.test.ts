import path from 'path';
import * as fs from 'node:fs/promises';

import { Doppio, DoppioError } from '../dist/esm/doppio.mjs';

describe('Doppio PDF Test Suite', () => {
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

    test('should throw DoppioError when API key is undefined', () => {
      expect(() => {
          new Doppio(undefined);
      }).toThrow(DoppioError);
    });
  });

  describe('Configuration', () => {
    test('should set doppio config', () => {
      const doppioClient = new Doppio('test-api-key');
      const config = {
        presignedUrl: 'https://example.com',
        contentDisposition: 'inline' as const,
      };
      doppioClient.doppio(config);
      expect(doppioClient).toBeInstanceOf(Doppio);
    });

    test('should set launch config', () => {
      const doppioClient = new Doppio('test-api-key');
      const launchConfig = {
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      };
      doppioClient.launch(launchConfig);
      expect(doppioClient).toBeInstanceOf(Doppio);
    });
  });

  describe('Validation', () => {
    test('should throw error when PagePdfConfigObject is undefined', async () => {
      const doppioClient = new Doppio(API_KEY);
      await expect(doppioClient.renderPdfDirect(undefined)).rejects.toThrow(
        DoppioError
      );
      await expect(doppioClient.renderPdfDirect(undefined)).rejects.toThrow(
        'PagePdfConfigObject must be defined.'
      );
    });

    test('should throw error when both setContent and goto are provided', async () => {
      const doppioClient = new Doppio(API_KEY);
      await expect(
        doppioClient.renderPdfDirect({
          setContent: { html: 'test' },
          goto: { url: 'https://example.com' },
        })
      ).rejects.toThrow(DoppioError);
      await expect(
        doppioClient.renderPdfDirect({
          setContent: { html: 'test' },
          goto: { url: 'https://example.com' },
        })
      ).rejects.toThrow('You cannot use setContent and goto at the same time.');
    });

    test('should throw error when neither setContent nor goto is provided', async () => {
      const doppioClient = new Doppio(API_KEY);
      await expect(
        doppioClient.renderPdfDirect({
          pdf: { printBackground: true },
        })
      ).rejects.toThrow(DoppioError);
      await expect(
        doppioClient.renderPdfDirect({
          pdf: { printBackground: true },
        })
      ).rejects.toThrow('You need to set setContent or goto');
    });

    test('should throw error when webhook is missing for async render', async () => {
      const doppioClient = new Doppio(API_KEY);

      await expect(
        doppioClient.renderPdfAsync({
          pdf: {
            printBackground: true,
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
        doppioClient.renderPdfAsync({
          pdf: {
            printBackground: true,
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

  describe('PDF Rendering', () => {
    const TEST_HTML = 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=';

    test('should render a PDF (direct) with setContent', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const buffer = await doppioClient.renderPdfDirect({
        pdf: {
          printBackground: true,
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
        'test-render-pdf-direct.pdf'
      );
      await fs.writeFile(filePath, new Uint8Array(buffer));
    });

    test('should render a PDF (direct) with goto URL', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const buffer = await doppioClient.renderPdfDirect({
        pdf: {
          printBackground: true,
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
        'test-render-pdf-direct-url.pdf'
      );
      await fs.writeFile(filePath, new Uint8Array(buffer));
    });

    test('should render a PDF (sync) and return document URL', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const response = await doppioClient.renderPdfSync({
        pdf: {
          printBackground: true,
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

    test('should render a PDF (async) with webhook', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      doppioClient.doppio({
        webhook: {
          url: process.env.DOPPIO_WEBHOOK_URL!,
          method: 'POST',
        },
      });

      const response = await doppioClient.renderPdfAsync({
        pdf: {
          printBackground: true,
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
