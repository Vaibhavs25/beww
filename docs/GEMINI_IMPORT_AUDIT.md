# GitHub import and full app verification

Recorded 4 November 2026.

## Imported version

Imported `Vaibhavs25/beww` main at `f9f94e2` (including the Gemini dashboard overhaul at `d15e566`) into `C:\Users\DELL\Downloads\flat-407`. Work continues on `codex/gemini-import-audit`. The previous app remains on `codex/shared-moments-dashboard` at `261a4fa`. The working tree was clean before import, and a final fetch found no additional main-branch changes.

The new onboarding, dashboard, relationship clock, milestones, adventures, journal, relationship trivia, sticky notes, errands, legal screens, image helpers, notification code, and monitoring code are present. Their UI was retained while fixing the integration problems below.

## Confirmed fixes

- Installed the imported notification dependency and restored an npm lockfile. Removed the competing Bun lockfile (a copy is in ignored `artifacts/imported-bun.lock`) and renamed the conflicting `expo` npm script to `dev:native`. Lint now runs ESLint directly and cannot silently succeed after failing to invoke Bun.
- Preserved older local demo storage instead of deleting it at startup. A corrupt local onboarding save no longer prevents restoration of a valid authenticated account.
- Local code entry no longer claims successful account linking. Actual linking requires authentication and server verification. Preview codes are labeled, and unsigned users are directed to sign in before sharing a live invitation.
- Deployed and verified six-digit invitation functions with explicit grants, server identity, single-use codes, and rate limits. Code generation uses a cryptographic UUID source. Joining another space cannot silently delete an existing space containing plans, chat, moods, games, drawings, answers, or a pet.
- Restored the previously deployed daily mood migration and connected the redesigned app to `log_mood` and `get_mood_history`. Live mood history now comes from the server rather than this phone's cache. Long individual streak counts use server results. Initial profile defaults no longer invent historical check-ins, and local mood history is no longer truncated after 120 combined entries.
- Daily questions and daily quiz packs stay consistent between partners. Removed independent shuffle controls because answers had no prompt/pack identifier. Answer and quiz submission reject a stale displayed day after shared midnight. The home question composer resets when its day changes.
- Notification history is stored per account, hidden during account changes, and does not import the old global private inbox. Saving a local journal or sticky note no longer claims that another phone was notified. Notification text describes foreground device notifications rather than an unimplemented push service.
- Unsigned local spaces do not poll live calls or request camera/microphone access for a live call. Sign-in is required before calling.
- Memory Lane excludes future-dated photos, updates its clock when new data arrives, and exposes an accessible photo-viewer button. The same clock refresh avoids briefly hiding just-received moods.
- Long journal author filters fit narrow phones. The layout audit now verifies actual app routes, checks new routes, and distinguishes horizontal carousels from controls clipped by a broken layout.

## Verification results

| Check | Result and scope |
| --- | --- |
| TypeScript and ESLint | Passed with zero errors/warnings. |
| `npm test` | 47 passing tests, including actual SQL migrations, author/couple access restrictions, daily moods, invitation linking, domain logic, images, and malformed URLs. |
| `npm run test:ui` | 19 passing browser scenarios: all seven onboarding steps, mandatory agreement, false-link prevention, moods, notes, photo upload/viewer, chat, hidden daily answers, consistent quiz packs, adventures, journal, trivia, sticky notes, errands, pet care, dates, drawing, a complete game, call availability, and responsive dashboard. No browser runtime errors. |
| `npm run test:client` | Eight passing browser scenarios with controlled Auth/HTTP/media: session restoration with corrupt local data, send retry, account switching and late responses, notification isolation, reconnect pagination, cancelled call cleanup, device sign-out, and shared midnight. |
| `npm run test:layout` | 21 actual routes pass at 360px with maximum-length partner names. |
| `npm run test:backend` | 17 hosted anonymous-access checks pass, including mood history and both new invitation functions. |
| `tests/hosted-features.sql` | Live six-digit pairing, daily moods, chat retry, pet care, date confirmation, and outsider isolation pass. Temporary identities and content are rolled back. |
| `npm run test:config` | Android camera/microphone permissions and iOS usage descriptions pass Expo introspection. |
| Web export | Passed; final preview is served locally on port 8084. |
| Android/iOS export | Both platforms produce Hermes bundles. These are JavaScript exports, not installable signed native builds. |
| Expo Doctor | 20/21 checks pass. The remaining check flags `react-native-webrtc` as untested on the New Architecture; this warning is retained. |
| Hosted security advisor | No warning/error findings. Two intentional private tables have RLS with no direct-access policy. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). |
| Dependency audit | 30 affected dependency entries: 5 high, 23 moderate, 2 low, zero critical. A forced major-version upgrade was not applied. Exact output: ignored `artifacts/gemini-dependency-audit.json`. |

Test screenshots and result JSON are in ignored `artifacts/`. Local UI tests deliberately use local fixture accounts; changing fixture identity does not claim that device-only features synchronize between phones. Auth/HTTP browser tests use controlled responses, while the SQL checks run on the actual hosted database.

## Confirmed limits

**Journals, adventures, relationship trivia, sticky notes, errands, and most origin-story details remain device-local.** Their persistence is verified on one device. They have no shared Supabase tables or Realtime transport. Photos sent through the main composer, chat, latest mood/history, daily answers, quiz choices, drawings, games, pets, and date plans have backend paths; their access boundaries are tested, but simultaneous physical-phone use remains unverified.

The notification code presents local notifications when activity is received while Closer is open. There is no registered remote-push token/backend delivery pipeline, background calling, or background ringing. A dedicated image CDN and Sentry service are optional configuration; neither external service was provisioned or verified in this audit.

The live Memory Lane currently uses the latest 200 story moments. In a busy space, older photos inside the last 30 days can fall outside that feed. Individual live mood streaks use full server counts, while the combined timeline uses the returned recent history window. Local photos/metadata can hit device storage limits; some imported local feature saves still swallow storage errors.

Actual Android/iPhone installation, email confirmation delivery, phone camera/library permissions, VoiceOver/TalkBack, WebRTC audio/video across separate networks, TURN relay behavior, background/foreground transitions, and real push delivery require devices and service configuration. No physical-device or store-release claim is made. Password recovery, unpairing, account deletion, and a complete server archive/export flow remain unfinished. The app is an alpha.

## Database history

The local migration filenames match the hosted history, including restored `20261104033303_daily_mood_history.sql` and newly applied `20261104171203_six_digit_space_invitation.sql`. The invitation SQL was tested locally before application, approved by the user, then verified against hosted Supabase without keeping fixture data.
