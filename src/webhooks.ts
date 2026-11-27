import { DoppioError } from './errors.js';

export interface VerifyWebhookSignatureOptions {
  /** Raw request body, exactly as received. Do not parse it first. */
  payload: string | ArrayBuffer | Uint8Array;
  /** Value of the `x-doppio-payload-signature` request header. */
  signature: string | null | undefined;
  /** Webhook secret of your organization, from the Doppio dashboard. */
  secret: string;
}

/**
 * Checks that a webhook request comes from Doppio and was not altered. The
 * signature is the hex HMAC-SHA256 of the raw body, keyed with your webhook
 * secret, and is compared in constant time.
 *
 * @returns `false` when the signature is missing, malformed or wrong.
 */
export async function verifyWebhookSignature({
  payload,
  signature,
  secret,
}: VerifyWebhookSignatureOptions): Promise<boolean> {
  const expected = signature ? hexToBytes(signature) : undefined;
  if (!expected) return false;

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new DoppioError(
      'verifyWebhookSignature needs the Web Crypto API (Node.js 19 or later)'
    );
  }
  const encoder = new TextEncoder();
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const data =
    typeof payload === 'string'
      ? encoder.encode(payload)
      : new Uint8Array(payload);
  return subtle.verify('HMAC', key, expected, data);
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | undefined {
  const digits = hex.trim();
  if (digits.length === 0 || digits.length % 2 !== 0) return undefined;
  if (/[^0-9a-f]/i.test(digits)) return undefined;
  const bytes = new Uint8Array(digits.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(digits.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}
