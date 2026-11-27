import { describe, expect, test } from 'vitest';

import { Doppio, DoppioError } from '../src/index.js';

describe('Doppio PDF Test Suite', () => {
  const API_KEY = 'test-api-key';

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
        // @ts-expect-error: exercises the runtime check for untyped callers
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
      // @ts-expect-error: exercises the runtime check for untyped callers
      await expect(doppioClient.renderPdfDirect(undefined)).rejects.toThrow(
        DoppioError
      );
      // @ts-expect-error: exercises the runtime check for untyped callers
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
});
