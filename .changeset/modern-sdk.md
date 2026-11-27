---
"doppio-nodejs": minor
---

Modernize the SDK. Existing calls keep working.

- Typed errors that all extend `DoppioError`:
  - `DoppioAPIError` exposes `status`, `code`, `messages`, `body` and `headers`;
  - `DoppioConnectionError` wraps network failures;
  - `DoppioTimeoutError` reports an exceeded timeout.
- `new Doppio({ apiKey, baseUrl, timeout, maxRetries, fetch, doppio, launch, onResponse })`, plus an optional second argument on every call with `signal`, `timeout`, `maxRetries`, `doppio`, `launch` and `onResponse`.
- Opt-in retries on 429, 502 and 503 responses, honoring `Retry-After`.
- New helpers: `getStatistics()`, the `debug` option of sync renders, `parseUsageHeaders()`, `verifyWebhookSignature()` and `encodeBase64()`.
- Types aligned with the API documentation: `Tabloid`, `emulateTimezone`, `referer`, cookies identified by `url`, and more.
- Type declarations now resolve correctly with `node16`, `nodenext` and `bundler` module resolution. The builds are unminified and ship source maps.
- A template `doppio` config is merged with the client config instead of replacing it, and a missing `templateId` is rejected before any request.

API errors other than 400 now carry the API message instead of `HTTP error! status: N`. `doppio()` and `launch()` are deprecated: pass these configs to the constructor or to a single call instead.
