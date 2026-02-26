import path from 'path';
import * as fs from 'node:fs/promises';

import { Doppio, DoppioError } from '../dist/esm/doppio.mjs';

describe('Doppio Template Test Suite', () => {
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

  describe('Template Rendering', () => {
    test('should render a TEMPLATE (direct)', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const buffer = await doppioClient.renderTemplateDirect({
        templateId: process.env.DOPPIO_TEMPLATE_ID!,
      });

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);

      await fs.mkdir('./__tests__outputs', { recursive: true });
      const filePath = path.join(
        './__tests__outputs',
        'test-render-template-direct.pdf'
      );
      await fs.writeFile(filePath, new Uint8Array(buffer));
    });

    test('should render a TEMPLATE (sync) and return document URL', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const response = await doppioClient.renderTemplateSync({
        templateId: process.env.DOPPIO_TEMPLATE_ID!,
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

    test('should render a TEMPLATE (async) and return requestId and jobId', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const response = await doppioClient.renderTemplateAsync({
        templateId: process.env.DOPPIO_TEMPLATE_ID!,
      });

      expect(response).toHaveProperty('requestId');
      expect(response).toHaveProperty('jobId');
      expect(typeof response.requestId).toBe('string');
      expect(typeof response.jobId).toBe('string');
    });

    test('should render a TEMPLATE with templateData', async () => {
      const doppioClient = new Doppio(process.env.DOPPIO_API_KEY!);

      const buffer = await doppioClient.renderTemplateDirect({
        templateId: process.env.DOPPIO_TEMPLATE_ID!,
        templateData: {
          title: 'Test Title',
          content: 'Test Content',
        },
      });

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });
  });
});
