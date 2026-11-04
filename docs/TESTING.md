# Testing the imported app

Updated 4 November 2026. See [the import audit](GEMINI_IMPORT_AUDIT.md) for exact coverage, fixes, hosted checks, and remaining limits.

Use Node and npm; `package-lock.json` is the dependency lockfile.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build:web
npm run preview
```

The preview defaults to port 3000. The audit preview uses port 8084. Set `PREVIEW_URL` for browser tests to the running server's URL:

```powershell
$env:PREVIEW_URL = 'http://127.0.0.1:8084'
npm run test:ui
npm run test:client
npm run test:layout
npm run test:config
npm run test:backend
```

The browser suites use installed Chrome through Playwright. `test:ui` covers local storage and UI behavior; `test:client` uses controlled HTTP/Auth/media responses. `test:layout` checks 21 actual routes at 360px and does not count a redirect to onboarding as testing the intended screen.

`npm test` applies all six real migrations to PGlite with minimal Supabase-compatible scaffolding. Hosted tests are separate: `test:backend` verifies anonymous denial through the Data API and calling endpoint; `tests/hosted-features.sql` runs as the database administrator inside a rolled-back transaction. It creates no permanent test accounts.

`npm run dev:native` starts Expo development mode. Android/iOS export checks JavaScript and Hermes compatibility; `test:config` introspects native settings. Neither produces an installed, signed app or verifies real camera, microphone, email, push, or WebRTC transport.

Artifacts, screenshots, temporary reports, and exports are written to ignored `artifacts/`. The import audit records 47 unit/database tests, 19 UI scenarios, eight client scenarios, 21 route checks, and 17 hosted anonymous-access checks.
