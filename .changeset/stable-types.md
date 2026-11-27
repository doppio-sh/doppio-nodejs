---
"doppio-nodejs": major
---

First stable release. It requires Node.js 22 or later, and its types reject invalid configs at compile time:

- A page needs exactly one of `goto` and `setContent`.
- A screenshot takes either `clip` or `fullPage`, and `quality` only with `jpg`, `jpeg` or `webp`.
- `webhook.headers` only accepts strings, and `templateData` is a `Record<string, unknown>`.
- `emulateMediaType`, `sameSite` and cookie `expires` only accept the values documented by the API.
- `MergedConfigs`, deprecated in 0.10, is removed.

A template `doppio` config can now carry a webhook. The "Upgrading" section of the README covers the migration.
