# Alpha verification and release gaps

Recorded 3 November 2026. This report distinguishes local automated checks from hosted checks and device testing. A JavaScript export does not prove a native module compiles or a phone-to-phone call succeeds.

## Automated checks

| Check | Scope |
| --- | --- |
| `npm run lint` | Passed. Expo ESLint rules on application and test source. |
| `npm run typecheck` | Passed. TypeScript, including pure domain tests. Deno Edge Function source is excluded from the app TypeScript project. |
| `npm test` | 27 passing tests, including thirteen nested database scenarios. |
| `npm run test:backend` | Twelve passing checks against hosted Supabase: anonymous profile/chat/pet reads denied, anonymous pairing/chat/pet/date RPCs denied, calling endpoint returns 401 without user authentication. |
| `npm run test:ui` | Passed sixteen browser scenarios in a fresh Playwright context, at desktop and 390/360px mobile widths; no runtime errors. |
| `tests/hosted-features.sql` | Passed pairing, chat retry, care from both partners, date reconfirmation, and outsider isolation against the live schema. All temporary test identities/content rolled back. |
| Expo export | Passed for web, Android, and iOS, including Android/iOS Hermes bytecode. Native build/signing is still pending. |

The domain tests cover legal moves, vertical/horizontal/diagonal wins, a draw, wrong turns, full columns, quiz validation, date handling across time zones, text limits, and hidden answers. Two URL decoder tests cover valid Unicode and large malformed percent-encoded input.

The PGlite suite applies all four real migration files to minimal Supabase-compatible scaffolding, then exercises the `anon` and `authenticated` roles with three separate identities. It checks pair size, one-use codes, outsider isolation, author ownership, hidden answers, quiz validation, drawing ownership, legal server-side turns and immutable results, partner-only calls, SDP removal on hangup, private storage policies, and invitation attempt limits. The new cases check chat idempotency and send limits, pet adoption/duplicate rewards/next-day care, and date editing/version checks/partner confirmation. This does not emulate Supabase Auth email delivery, Storage HTTP, Realtime transport, concurrent network clients, or WebRTC media.

The browser suite covers onboarding, mood-dependent partner home, note persistence, image selection/compression, drawing and ownership-aware undo, saving artwork, a complete game and persisted winner, both quiz answers and calculated percentage, plans, truthful demo call messaging, changing distance mode, narrow-screen overflow, and browser runtime errors. New scenarios send chat messages from both partners, adopt and rename a teddy, earn a level through both partners' care, and propose/confirm/edit a date with time and place. It uses demo accounts, not hosted signup. Screenshots and a result JSON are generated in `artifacts/`.

## Hosted database privacy update

The user-approved third migration moved invitation records and internal functions into `private`, retained public invoker RPC wrappers, and added eleven foreign-key indexes. The hosted security advisor reported no warning or error findings after application. Its two informational findings are RLS-enabled private tables with no direct-access policy: `private.pair_invites` and `private.pair_attempts`. Direct access is intentionally denied; restricted definer functions perform the validated operations. Do not add permissive table policies to silence these findings. See [Supabase's RLS-without-policy advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Dependency and build limits

The chat/pet/date migration is deployed. Hosted metadata checks confirmed RLS, no anonymous reads, no direct member inserts/updates on the three new tables, and Realtime publication membership. New RPCs are public invoker wrappers with private implementations and explicit authentication/membership checks. The post-migration security advisor has no warning/error findings; the two intentional private-table informational findings above remain. The performance advisor lists unused indexes on this new project, including the history and foreign-key indexes; retain them for the implemented queries and revisit with real traffic. [Unused-index advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Expo Doctor passed 20 of 21 checks. The remaining React Native Directory finding reports `react-native-webrtc` as untested with the New Architecture. This is a compatibility warning to resolve through an actual development build and device test; a successful JS export does not dismiss it.

The online npm audit reported **30 vulnerabilities: 5 high, 23 moderate, and 2 low** in the installed dependency tree. The full result is saved in `dependency-audit.json`. Several originate in the Expo 57 build/router dependency chain, including Zod in build tooling and the URL decoder below. The offered automatic fix includes a major Expo downgrade; that was not applied. These findings remain a release blocker until reviewed with compatible upstream updates or justified mitigations. An offline audit returning zero is not evidence of a clean dependency tree.

The app's Metro resolver redirects the old `decode-uri-component` dependency reached through `query-string` to `src/lib/decode-uri.cjs`. It uses native `decodeURIComponent`, preserving malformed input verbatim instead of recursively retrying substrings. Valid links keep their normal decoding behavior; malformed links no longer receive the old decoder's partial recovery. This addresses the app-bundle path for [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) and [GHSA-qr28-fpjm-wq7f](https://github.com/advisories/GHSA-qr28-fpjm-wq7f). It does not remove the package from npm's audit or fix other build-tool dependencies. Keep this alias until the supported Expo dependency chain has a compatible fix.

## Still to validate before external testing

- Two real email/password accounts, confirmation delivery, joining the same space, and expired/self/used invitations through the UI. Custom SMTP is required for recipients outside the Supabase project team.
- Concurrent updates on separate devices: photos, reactions, mood expiry, midnight in the shared time zone, drawing retries, simultaneous moves, chat, pet care, date edits, and game history. Realtime updates currently trigger a bounded space refresh; large histories and high-frequency drawing/chat need performance testing and targeted updates.
- Real camera and library permissions, app reinstall, low storage, and interrupted photo uploads. Demo data is local; live sessions are stored using AsyncStorage.
- Android/iOS compilation and installation with WebRTC; permission denial, echo, audio routing, headphones, interruptions, and background/foreground transitions.
- Voice/video on separate networks using a TURN relay. Verify audio continues when opening the canvas/game and stops on hangup, sign-out, and permission failure.
- Accessibility with VoiceOver/TalkBack, larger system fonts, keyboard interaction, and device safe areas. Browser smoke tests alone are not a complete accessibility review.

## Product limits

Calls require both people to keep Closer open. There are no push notifications, background ringing, lock-screen widgets, password recovery UI, unpairing, account deletion/export, or store release yet. The quiz currently repeats the same five choices; the daily question rotates through fourteen prompts.

Live history reads are bounded to 200 moments, 100 plans, 60 daily answers, 200 games, 60 quiz answers, and 500 drawing strokes. They are not a full archive viewer; add pagination and a clear-canvas flow before sustained use. Drawing shares completed strokes, not a remote pointer for every movement. The photo bucket is private with expiring signed links, but the service is not end-to-end encrypted. No claim has been made that the in-sync percentage measures love or relationship health.

Chat loads the most recent 100 messages with an explicit earlier-message button and a 2,000-character message limit. The server permits up to 60 new messages per author per minute; retries with the same identifier/content are idempotent. Chat is text-only, has no read/typing receipts, attachment composer, delete UI, or automatic offline-send queue. A failed send retains its draft while the conversation stays open. Pet care reads the most recent 180 records while total growth is stored separately; missed days do not reduce growth. Date times are shown in the named shared time zone, not automatically converted to each phone's zone; calendar export/reminders and cancellation are future work.
