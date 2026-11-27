# doppio-nodejs

## 1.0.0

### Major Changes

- 6eb5b7e: First stable release. It requires Node.js 22 or later, and its types reject invalid configs at compile time:
  - A page needs exactly one of `goto` and `setContent`.
  - A screenshot takes either `clip` or `fullPage`, and `quality` only with `jpg`, `jpeg` or `webp`.
  - `webhook.headers` only accepts strings, and `templateData` is a `Record<string, unknown>`.
  - `emulateMediaType`, `sameSite` and cookie `expires` only accept the values documented by the API.
  - `PagePdfConfig`, `PageScreenshotConfig` and `ScreenshotConfig` are now unions, so an `interface` can no longer extend them.
  - `MergedConfigs`, deprecated in 0.10, is removed.

  A template `doppio` config can now carry a webhook. The "Upgrading" section of the README covers the migration.

## 0.10.0

### Minor Changes

- 4ecdc2e: Modernize the SDK. Existing calls keep working.
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
