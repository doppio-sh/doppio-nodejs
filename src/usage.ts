import type { DoppioUsage } from './types.js';

const USAGE_HEADERS: Record<keyof DoppioUsage, string> = {
  rateLimit: 'x-ratelimit-limit',
  rateLimitRemaining: 'x-ratelimit-remaining',
  rateLimitReset: 'x-ratelimit-reset',
  retryAfter: 'retry-after',
  monthlyLimit: 'x-doppio-subscription-limit',
  monthlyUsage: 'x-doppio-current-month-usage',
  monthlyRemaining: 'x-doppio-remaining-usage',
};

/**
 * Reads the rate-limit and quota headers that Doppio sends with every
 * response. Missing or non-numeric headers are left out.
 *
 * @example
 * ```ts
 * await doppio.renderPdfSync(page, {
 *   onResponse: ({ headers }) => console.log(parseUsageHeaders(headers).monthlyRemaining),
 * });
 * ```
 */
export function parseUsageHeaders(headers: Headers): DoppioUsage {
  const usage: DoppioUsage = {};
  for (const key of Object.keys(USAGE_HEADERS) as Array<keyof DoppioUsage>) {
    const value = headers.get(USAGE_HEADERS[key])?.trim();
    if (!value) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) usage[key] = parsed;
  }
  return usage;
}
