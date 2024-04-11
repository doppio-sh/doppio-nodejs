import path from 'path';
import * as fs from 'node:fs/promises';

import { Doppio } from '../dist/esm/doppio';

describe('Doppio PDF Test Suite', () => {
  test('Initialize Doppio', () => {
    const doppioClient = new Doppio('XXXXXX');
    expect(doppioClient).toEqual({});
  });

  test('ENV VAR DOPPIO_API_KEY', () => {
    expect(process.env.DOPPIO_API_KEY).toBeDefined();
  });

  test('Render a PDF (direct)', async () => {
    const doppioClient = new Doppio(`${process.env.DOPPIO_API_KEY}`);

    const buffer = await doppioClient.renderPdfDirect({
      pdf: {
        printBackground: true,
      },
      setContent: {
        html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
        options: {
          waitUntil: ['networkidle0'],
        },
      },
    });

    await fs.mkdir('./__tests__outputs', { recursive: true });
    const filePath = path.join(
      './__tests__outputs',
      'test-render-pdf-direct.pdf'
    );
    await fs.writeFile(filePath, Buffer.from(buffer));

    console.info(
      'Test PDF generated. Please open __tests__outputs/test-render-pdf-direct.pdf for visual inspection.'
    );

    expect(buffer).toBeInstanceOf(ArrayBuffer);
    expect(buffer.byteLength).toBe(6333); //PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=
  });

  test('Render a PDF (direct, with url)', async () => {
    const doppioClient = new Doppio(`${process.env.DOPPIO_API_KEY}`);

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

    await fs.mkdir('./__tests__outputs', { recursive: true });
    const filePath = path.join(
      './__tests__outputs',
      'test-render-pdf-direct-url.pdf'
    );
    await fs.writeFile(filePath, Buffer.from(buffer));

    console.info(
      'Test PDF generated. Please open __tests__outputs/test-render-pdf-direct-url.pdf for visual inspection.'
    );

    expect(buffer).toBeInstanceOf(ArrayBuffer);
  });

  test('Render a PDF (sync)', async () => {
    const doppioClient = new Doppio(`${process.env.DOPPIO_API_KEY}`);

    const response = await doppioClient.renderPdfSync({
      pdf: {
        printBackground: true,
      },
      setContent: {
        html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
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

    expect(response.renderStatus).toBe('SUCCESS');
  });

  test('Render a PDF (async)', async () => {
    const doppioClient = new Doppio(`${process.env.DOPPIO_API_KEY}`);

    doppioClient.doppio({
      webhook: {
        url: 'https://webhook.site/4260a515-90ee-4d8b-abc4-1b0fe9dd0574',
        method: 'POST',
      },
    });

    const response = await doppioClient.renderPdfAsync({
      pdf: {
        printBackground: true,
      },
      setContent: {
        html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
        options: {
          waitUntil: ['networkidle0'],
        },
      },
    });

    console.info(
      'Please manually check the callback url: https://webhook.site/#!/view/4260a515-90ee-4d8b-abc4-1b0fe9dd0574/4cd5aee3-15ef-41a8-a0ea-52dc09333c32/1'
    );

    expect(response).toHaveProperty('requestId');
    expect(response).toHaveProperty('jobId');
  });
});
