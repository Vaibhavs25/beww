# Closer

A private shared space for two partners, nearby or far apart. Built with Expo SDK 57, React Native, Expo Router, and Supabase. This is a working **alpha**, with a local demo and a configured live backend. Its cherry and lavender theme includes small teddy and heart illustrations.

## Try it

The browser preview defaults to **http://localhost:3000**. The imported app uses a seven-step local setup. Sign in from **Connect our phones** to create or redeem a live partner invitation. The audit preview runs at **http://127.0.0.1:8084**.

```sh
npm ci
npm run build:web
npm run preview
```

For Expo development, run `npm run dev:native`; `npm start` serves the exported web preview. Use `npx expo install <package>` when adding dependencies so versions match SDK 57. The web preview is not an installed Android or iPhone build.

The [GitHub import audit](docs/GEMINI_IMPORT_AUDIT.md) records the tested Gemini changes and integration fixes. Journals, adventures, relationship trivia, sticky notes, and errands currently stay on one device. Live mood history and six-digit account linking are connected to Supabase. Remote push delivery and physical-phone testing remain unfinished.

## What is built

| Experience | Behavior |
| --- | --- |
| Nearby or long-distance | Onboarding choice; change it later in Our space. |
| First dashboard tour | Two coach marks highlight Stick Note and Instant Snap, automatically scroll each button into view, and offer Next, Back, Skip, and keyboard/Android-back dismissal. Completion is remembered on this device for the account or local space. |
| Mood and support | Seven moods, a short note, and what would help. The partner's home adapts to the shared mood; it expires after 24 hours. |
| Private chat | A dedicated Chat tab with text messages, timestamps, earlier-message loading, and retry without duplicate sends. Each partner speaks as their own account. |
| A shared pet | Adopt a teddy, cat, puppy, or bunny; choose a name and raise it together. Feeding, play, and rest each earn five points once per partner per shared day. Every thirty points adds a level; no progress is lost for missed days. |
| Photos and little moments | Pick or take a photo, send a note or hug, react with a heart, and keep a shared story. Images are resized and stored in a private bucket. |
| Drawing together | Shared canvas, six colors, brush sizes, eraser, undo your own mark, and save a drawing to the story. Unsent strokes can be retried. |
| Four in a Row | Turns and wins validated on the server, with saved results and daily win counts. The demo supports passing one device between partners. |
| Daily question | Each partner answers independently; the database hides the other answer until both have contributed. |
| In-sync quiz | Five choices produce a match percentage after both answer. The percentage describes those answers, not how much someone loves their partner. |
| Dates and milestones | Nearby/long-distance ideas, date, time, place or call link, notes, partner confirmation, editing, a someday list, and completed memories. Editing a plan requires the other partner to confirm the new version. Times use the couple's shared time zone. |
| Accounts and invitations | Email/password accounts and single-use, ten-minute partner codes. Spaces have at most two members. |
| Voice and video | WebRTC signaling, accept/decline, mute, camera controls, timeout, hangup, and an in-app call banner. Device and network validation is still outstanding. |

Photos, moods, drawing strokes, game turns, and other shared content have Supabase Realtime subscriptions, with periodic refresh as a fallback. Both partners currently need the app open for calls and prompt updates. Push notifications and background ringing are not implemented.

## Backend

The existing organization contains the `closer` project in Mumbai (`ap-south-1`), project ref `qsdjhpegxarubhmzvnoa`. Six migrations and the `call-ice` Edge Function have been applied. The local `.env` is configured and ignored by Git.

For a separate checkout, copy `.env.example` to `.env` and supply the project's URL and **publishable** key. Only those public values belong in the app. Service-role keys, SMTP credentials, and TURN secrets must stay server-side. Expo inlines `EXPO_PUBLIC_*` values into the app bundle; see [Expo environment variables](https://docs.expo.dev/eas/environment-variables/).

Migration history:

- `20261103095240_closer_core.sql`: profiles, pairs, moments, private photos, answers, drawings, games, quizzes, and policies.
- `20261103095312_closer_access_games_calls.sql`: tighter access boundaries, validated game operations, and call signaling.
- `20261103102801_private_operations_and_indexes.sql`: invitation records and internal operations moved to a private schema, with foreign-key indexes. Applied with the user's approval, preserving existing data.
- `20261103134634_chat_pet_date_planning.sql`: private couple chat, shared pets and once-daily care, and date details/confirmations. Applied and verified against the hosted database; earlier data is preserved.
- `20261104033303_daily_mood_history.sql`: daily mood history, server-owned shared days, and individual streak counts.
- `20261104171203_six_digit_space_invitation.sql`: verified, rate-limited six-digit invitations and one-time account linking. Applied with the user's approval and tested with rolled-back identities.

All exposed application tables use row-level security. Anonymous requests cannot read profiles or issue pairing RPCs. Public RPCs are invoker wrappers over restricted private operations. Photo links expire. This is access-controlled storage, **not end-to-end encryption**; project administrators retain backend access.

`call-ice` explicitly validates the user's bearer token and two-person membership. Its gateway `verify_jwt` setting is false because authentication is enforced inside the function with `auth.getUser`; do not remove that check. It currently supplies STUN only. To enable a compatible coturn relay, configure server-side Edge Function secrets `TURN_URLS` (comma-separated `turn:`/`turns:` URLs) and `TURN_AUTH_SECRET`. Credentials are then generated with a one-hour expiry. [WebRTC reliability guidance](https://react-native-webrtc.github.io/handbook/guides/improving-call-reliability.html) explains why a relay is needed across restrictive networks.

## Before inviting real couples

1. **Set up signup email.** Supabase's default email service restricts recipients to project-team addresses. Configure a custom SMTP sender and test confirmations before public signup. The current app asks users to confirm by email and then return to sign in. Configure an appropriate Auth Site URL and allowed redirect destinations. See [Supabase SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp).
2. **Build and test on both phones.** WebRTC is a custom native module, so calling requires a development or preview build. Expo Go does not include it. Verify camera/mic permissions, audio routing, interruption handling, and call cleanup on actual Android and iOS devices.
3. **Configure TURN and test different networks.** Test Wi-Fi to cellular, declined/missed calls, denied permissions, reconnects, and drawing while talking. There is no background calling or call recording.
4. **Finish account controls and release preparation.** Password recovery, unpairing, account deletion/export, history pagination, push delivery, release privacy disclosures, and store submissions remain. Confirm the app name and bundle identifiers before release. Review the dependency advisories in `docs/TESTING.md`.

## Android and iPhone builds

`eas.json` has development, internal preview, and production profiles. Native projects are generated from `app.json`; do not hand-create `ios/` or `android/`.

With an Expo account and appropriate signing access:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

Configure the two public Supabase variables in the selected Expo build environment as well; ignored local `.env` files are not a substitute for cloud environment setup. The Android preview profile produces an APK. iOS distribution needs the appropriate Apple account and device/signing setup. No signed native build or store submission has been made. See [Expo's build setup](https://docs.expo.dev/build/setup/) and [custom native modules in development builds](https://docs.expo.dev/develop/development-builds/introduction/).

## Checks and project map

```sh
npm run lint
npm run typecheck
npm test
npm run test:backend
npm run build:web
npm run preview
# In another terminal while the preview is running:
npm run test:ui
```

`test:ui` uses an installed Chrome through Playwright and writes screenshots under `artifacts/`. `test:backend` makes only unauthenticated requests against the configured project. The database suite uses isolated PGlite PostgreSQL. The separate `tests/hosted-features.sql` integration check exercises real hosted policies and functions with three temporary identities in one transaction; it rolls back all test identities and content.

- `src/app/`: routes and screens; `src/components/`: shared presentation.
- `src/domain.ts`: game, quiz, date, and validation logic.
- `src/shared-features.ts`: pet progression, date details, date ideas, and chat merging.
- `src/store.tsx`: demo persistence, authenticated data, and live subscriptions.
- `src/calls.tsx`: call lifecycle; `src/lib/rtc.*`: platform adapters.
- `supabase/`: migrations and the authenticated calling endpoint.
- `docs/RESEARCH_AND_PRODUCT_PLAN.md`: research, rationale, sources, and broader roadmap.
- `docs/COUPLE_INTERVIEW_GUIDE.md`: guide for validating the concept with couples.
- `docs/TESTING.md`: verification evidence and remaining limits.

App icons are generated from the editable vector `assets/closer-mark.svg`. Run `node scripts/render-icons.mjs` to regenerate them with Chrome.
