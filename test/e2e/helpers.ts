import { mkdir, writeFile } from 'node:fs/promises';

export const API_KEY: string = process.env.DOPPIO_API_KEY ?? '';
export const TEMPLATE_ID: string = process.env.DOPPIO_TEMPLATE_ID ?? '';
export const WEBHOOK_URL: string = process.env.DOPPIO_WEBHOOK_URL ?? '';

export const TEST_HTML = 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=';
export const TEST_URL = 'https://example.doppio.sh/information-booklet.html';

const OUTPUT_DIR = new URL('./output/', import.meta.url);

export async function saveOutput(
  fileName: string,
  buffer: ArrayBuffer
): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(new URL(fileName, OUTPUT_DIR), new Uint8Array(buffer));
}
