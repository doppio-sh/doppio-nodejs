import { createHmac } from 'node:crypto';
import { describe, expect, test, vi } from 'vitest';

import { DoppioError, verifyWebhookSignature } from '../src/index.js';

const SECRET = 'whsec_test_secret';
const PAYLOAD = JSON.stringify({
  doppioRequestId: 'doppioreq_640d0598',
  renderStatus: 'SUCCESS',
  documentUrl: 'https://tmp.doppio.sh/doppioreq_640d0598.pdf',
  isAsync: true,
  isCustomBucket: false,
});
const SIGNATURE = createHmac('sha256', SECRET).update(PAYLOAD).digest('hex');

describe('verifyWebhookSignature', () => {
  test('accepts the signature of the raw payload', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signature: SIGNATURE,
        secret: SECRET,
      })
    ).resolves.toBe(true);
  });

  test.each([
    ['a Uint8Array', new TextEncoder().encode(PAYLOAD)],
    ['an ArrayBuffer', new TextEncoder().encode(PAYLOAD).buffer],
  ])('accepts the payload as %s', async (_label, payload) => {
    await expect(
      verifyWebhookSignature({ payload, signature: SIGNATURE, secret: SECRET })
    ).resolves.toBe(true);
  });

  test('accepts an uppercase signature', async () => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signature: SIGNATURE.toUpperCase(),
        secret: SECRET,
      })
    ).resolves.toBe(true);
  });

  test.each([
    ['another secret', { secret: 'whsec_other' }],
    ['an altered payload', { payload: PAYLOAD.replace('SUCCESS', 'ERROR') }],
    ['a missing signature', { signature: null }],
    ['an empty signature', { signature: '' }],
    ['an odd-length signature', { signature: SIGNATURE.slice(1) }],
    ['a non-hex signature', { signature: `${SIGNATURE.slice(2)}zz` }],
    ['a truncated signature', { signature: SIGNATURE.slice(2) }],
  ])('rejects %s', async (_label, override) => {
    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signature: SIGNATURE,
        secret: SECRET,
        ...override,
      })
    ).resolves.toBe(false);
  });

  test('throws a DoppioError when the Web Crypto API is missing', async () => {
    vi.stubGlobal('crypto', undefined);

    await expect(
      verifyWebhookSignature({
        payload: PAYLOAD,
        signature: SIGNATURE,
        secret: SECRET,
      })
    ).rejects.toBeInstanceOf(DoppioError);
  });
});
