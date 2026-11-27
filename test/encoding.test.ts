import { Buffer } from 'node:buffer';
import { describe, expect, test } from 'vitest';

import { encodeBase64 } from '../src/index.js';

describe('encodeBase64', () => {
  test.each([
    ['empty text', ''],
    ['ASCII HTML', '<html><p>test</p></html>'],
    ['accented text', '<h1>Été à Paris</h1>'],
    ['emoji', '<p>Ready 🚀</p>'],
  ])('encodes %s as UTF-8', (_label, text) => {
    expect(encodeBase64(text)).toBe(
      Buffer.from(text, 'utf8').toString('base64')
    );
  });

  test('encodes documents larger than one chunk', () => {
    const html = `<p>${'é'.repeat(50_000)}</p>`;

    expect(encodeBase64(html)).toBe(
      Buffer.from(html, 'utf8').toString('base64')
    );
  });

  test('matches the example of the README', () => {
    expect(encodeBase64('<html>\n<p>test</p>\n</html>')).toBe(
      'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4='
    );
  });
});
