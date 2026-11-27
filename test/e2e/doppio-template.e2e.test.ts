import { describe, expect, test } from 'vitest';

import { Doppio } from '../../src/index.js';
import { API_KEY, saveOutput, TEMPLATE_ID } from './helpers.js';

describe.skipIf(!API_KEY || !TEMPLATE_ID)('Template Rendering', () => {
  test('should render a TEMPLATE (direct)', async () => {
    const doppioClient = new Doppio(API_KEY);

    const buffer = await doppioClient.renderTemplateDirect({
      templateId: TEMPLATE_ID,
    });

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(0);

    await saveOutput('test-render-template-direct.pdf', buffer);
  });

  test('should render a TEMPLATE (sync) and return document URL', async () => {
    const doppioClient = new Doppio(API_KEY);

    const response = await doppioClient.renderTemplateSync({
      templateId: TEMPLATE_ID,
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
    const doppioClient = new Doppio(API_KEY);

    const response = await doppioClient.renderTemplateAsync({
      templateId: TEMPLATE_ID,
    });

    expect(response).toHaveProperty('requestId');
    expect(response).toHaveProperty('jobId');
    expect(typeof response.requestId).toBe('string');
    expect(typeof response.jobId).toBe('string');
  });

  test('should render a TEMPLATE with templateData', async () => {
    const doppioClient = new Doppio(API_KEY);

    const buffer = await doppioClient.renderTemplateDirect({
      templateId: TEMPLATE_ID,
      templateData: {
        title: 'Test Title',
        content: 'Test Content',
      },
    });

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
