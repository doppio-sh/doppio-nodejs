import path from 'path';
import * as fs from 'node:fs/promises';

import { Doppio } from '../dist/esm/doppio.mjs';

describe('Doppio Template Test Suite', () => {
  test('Initialize Doppio', () => {
    const doppioClient = new Doppio('XXXXXX');
    expect(doppioClient).toEqual({});
  });

  test('ENV VAR DOPPIO_API_KEY', () => {
    expect(process.env.DOPPIO_API_KEY).toBeDefined();
  });

  test('ENV VAR DOPPIO_TEMPLATE_ID', () => {
    expect(process.env.DOPPIO_TEMPLATE_ID).toBeDefined();
  });

  test('Render a TEMPLATE (direct)', async () => {
    const doppioClient = new Doppio(`${process.env.DOPPIO_API_KEY}`);

    const buffer = await doppioClient.renderTemplateDirect({
      templateId: process.env.DOPPIO_TEMPLATE_ID!,
    });

    await fs.mkdir('./__tests__outputs', { recursive: true });
    const filePath = path.join(
      './__tests__outputs',
      'test-render-template-direct.pdf'
    );
    await fs.writeFile(filePath, Buffer.from(buffer));

    console.info(
      'Test TEMPLATE(pdf) generated. Please open __tests__outputs/test-render-template-direct.pdf for visual inspection.'
    );

    expect(buffer).toBeInstanceOf(ArrayBuffer);
  });

  test('Render a TEMPLATE (sync)', async () => {
    const doppioClient = new Doppio(`${process.env.DOPPIO_API_KEY}`);

    const response = await doppioClient.renderTemplateSync({
      templateId: process.env.DOPPIO_TEMPLATE_ID!,
    });

    expect(response).toHaveProperty('doppioRequestId');
    expect(response).toHaveProperty('renderStatus');
    expect(response).toHaveProperty('documentUrl');
    expect(response).toHaveProperty('isAsync');
    expect(response).toHaveProperty('isCustomBucket');

    expect(response.renderStatus).toBe('SUCCESS');
  });
});
