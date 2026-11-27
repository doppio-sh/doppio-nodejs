# Contributing

Thanks for helping improve the Doppio SDK.

## Setup

Use the Node.js version from `.nvmrc`, then install the dependencies:

```sh
nvm use
npm ci
```

## Scripts

| Script                  | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `npm test`              | Runs the unit tests, which mock `fetch` and need no network     |
| `npm run test:coverage` | Runs the unit tests with the coverage thresholds enforced by CI |
| `npm run test:e2e`      | Renders documents with the real API, see below                  |
| `npm run typecheck`     | Type-checks the sources and the tests                           |
| `npm run lint`          | Checks formatting and lint rules with Biome                     |
| `npm run format`        | Fixes what Biome can fix                                        |
| `npm run build`         | Builds `dist/` with tsdown                                      |
| `npm run check:package` | Builds, then checks the package with publint and attw           |

The end-to-end tests read `DOPPIO_API_KEY`, `DOPPIO_TEMPLATE_ID` and `DOPPIO_WEBHOOK_URL` from `.env`. Copy `.env.example` to start. Without a key, they are skipped. Rendered files land in `test/e2e/output/`.

## Pull requests

- Every pull request must pass CI: lint, types, package checks and unit tests on Node.js 22, 24 and 26.
- Add tests with every change of behavior.
- Write commit messages with [Conventional Commits](https://www.conventionalcommits.org/).
- Describe user-facing changes in a changeset by running `npx changeset`. It ends up in the changelog of the next release.

## Releases

A maintainer publishes releases from their machine:

1. On an up-to-date `master`, run `npx changeset version`. It bumps the version, updates `CHANGELOG.md` and deletes the changesets it used. Then run `npm install --package-lock-only` to sync the lockfile, and merge the result through a `chore: release x.y.z` pull request.
2. Optionally, run `npm run test:e2e` to render real documents with the new version.
3. Back on an up-to-date `master`, run `npm run release`. It runs every check, builds, publishes to npm (your npm account asks for its second factor), and pushes the `vx.y.z` git tag.
