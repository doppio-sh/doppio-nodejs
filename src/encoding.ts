// Spreading a whole document into String.fromCharCode would overflow the stack.
const CHUNK_SIZE = 0x8000;

/**
 * Encodes text in base64, as expected by `setContent.html`,
 * `pdf.headerTemplate` and `pdf.footerTemplate`. Supports any Unicode text.
 *
 * @example
 * ```ts
 * await doppio.renderPdfDirect({ setContent: { html: encodeBase64('<h1>Été</h1>') } });
 * ```
 */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + CHUNK_SIZE)
    );
  }
  return btoa(binary);
}
