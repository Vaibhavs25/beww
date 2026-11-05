# Profile language settings

Added 5 November 2026. Open **Us → Language / भाषा** and choose **English** or **हिन्दी**.

The selector immediately updates the translated interface after a successful save. Translation coverage includes navigation, connection labels, settings controls, the home greeting/date, and dashboard coach marks. Relationship clock, notifications/monitoring panels, other feature screens, legal text, and onboarding currently use English. User-authored names, notes, photos, answers, and messages are preserved as written. The settings card describes this scope in both languages.

## Persistence

Signed-in preferences are stored as `public.profiles.language`, restricted to `en` or `hi` with an English default. Updates use only the authenticated user's profile ID, require exactly one returned row, and use existing owner-only RLS. The new migration grants update permission for this column without broadening other profile permissions. Partner languages are independent.

Profile reads restore the language after reload, sign-in, or use on another device. Existing profile Realtime subscriptions and foreground/poll refreshes also retrieve changes. No shared device preference overrides a signed-in profile, so switching accounts switches the active language. A late save response for a previous account cannot update the current account's interface.

Unsigned local spaces store the language on their local profile in AsyncStorage. This does not claim a Supabase save; the settings copy explains that sign-in is needed for cross-device persistence. Storage failures leave the current language selected. Repeated toggles are disabled while saving, and rejected server writes show a localized retryable error. Existing unsaved settings drafts survive language changes.

The browser's document language is updated for assistive technology. Both selector options keep their native names, so switching back remains recognizable. Hindi uses the platform's font fallback where the app's Latin fonts have no Devanagari glyphs.

## Verification

- `npm test`: translation catalog parity/interpolation, fallback behavior, and actual migrated database default/validation/permissions checks, alongside the existing suite.
- `npm run test:language`: local persistence, settings draft preservation, Hindi navigation/home/tour, narrow and desktop layout, rejected saves, profile reads on reload and a separate browser session, independent partner preferences, saving controls, and stale-response isolation during an account change. Server behavior in this browser suite is represented by controlled HTTP/Auth responses.
- Hosted Supabase rollback check: temporary paired users save different preferences; a partner and outsider cannot update another profile. Fixture accounts/content are rolled back.
- Existing feature, coach-mark, client-session, and 21-route layout suites verify English regressions; TypeScript, ESLint, web export, and Android/iOS Hermes export check implementation compatibility. Physical-device and screen-reader testing remain separate.

The applied migration is `20261105034850_profile_language_preference.sql`. Hosted security advisor results remain free of warnings/errors; two existing private-table informational notices are intentional. See [the advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
