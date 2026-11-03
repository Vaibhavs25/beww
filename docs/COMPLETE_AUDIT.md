# Closer — complete application audit

Audit date: 3 November 2026. Scope: the current Expo 57 / React Native 0.86 application, all 16 routes, local persistence, Supabase database and Storage access, deployed call signaling, dependency tree, mobile layouts, and release configuration.

**Verdict: suitable for continued alpha development; not ready for a public launch or App Store / Google Play submission.** The core demo works and the tested database access boundaries hold. Native media, actual two-phone syncing, account lifecycle controls, and production infrastructure still need work. Passing browser tests and JavaScript exports do not establish native-device readiness.

The app upload was independently verified at `Vaibhavs25/beww`, `main`, commit `1a673489d1eaac0e96e32906b613918998766634`. Most fixes below were already included in that upload, which occurred during the audit. Remaining audit changes and this report are on `codex/complete-audit`. The repository's existing visibility is public; `.env`, dependencies, and build artifacts are excluded.

## Confirmed defects fixed

| Priority | Finding and consequence | Correction and evidence |
| --- | --- | --- |
| P1 | The photo-picker plugin set `microphonePermission: false`. Expo's generated Android manifest contained `android.permission.RECORD_AUDIO` with `tools:node="remove"`, blocking the microphone needed by WebRTC. | Removed the global block and supplied an explicit call permission explanation. `npm run test:config` verifies effective Android microphone/camera permissions and iOS usage descriptions after all plugins run. A native permission prompt still needs a device test. |
| P1 | A cross-tab account change retained the previous account's live cache. A delayed mutation could then add the previous account's content to the current view. | Live data is tagged with its owning account; account changes clear the cache and invalidate old requests. Account-scoped screens, drafts, and call media remount. Browser regression switches accounts while a chat send is held and checks that the old message and draft never appear in the new account. |
| P2 | After a long disconnect, merging the last 100 messages into previously loaded history could leave an invisible middle gap, sometimes with no Earlier messages button. | A full page with no overlap restarts pagination at the newest page. Regression loads 150 messages, adds 200 while disconnected, reconnects, and pages through the entire missing interval. Pure tests also check overlap and oldest-page flags. |
| P2 | A late answer RPC response could set an already-ended call back to connecting. Older asynchronous call failures could also clean up a newer attempt. | Call generation and peer identity are checked after asynchronous work. A controlled delayed-answer browser test confirms that hangup remains ended. Media/network transport is mocked in this test. |
| P2 | Invalid demo JSON could prevent a valid live session from restoring. A slow initial session read could also overwrite a newer Auth event. | Demo restoration and session restoration are independent. Auth events take precedence over the initial read. The browser test starts with corrupt demo JSON and a valid simulated live session. |
| P2 | “Sign out on this device” used Supabase's default global sign-out scope. | Explicit `scope: 'local'` matches the label. The regression asserts the actual logout request's scope. |
| P2 | The daily question and quiz could stay on yesterday's content while a submission used today's shared date. The Together summary also stayed stale over midnight. | Daily views use the shared clock; question/quiz drafts reset when the shared day changes. Browser time advances across UTC midnight and verifies a new prompt and empty draft. |
| P2 | Marking a date complete used only its ID, so an old view could complete a plan the other partner had just edited. | Completion now also matches the displayed revision and refreshes with a clear error when no matching row is updated. The database's existing edit/confirmation revision tests remain passing; simultaneous real-device edits remain unverified. |
| P2 | Maximum-length names pushed the settings, chat call, moment delete, and canvas switch controls beyond a 360px screen. | Names wrap or truncate within flexible containers; button labels can shrink/wrap. A separate browser scan now passes all 16 routes with two 30-character names. |
| P2 | A new live account defaulted to nearby mode even after choosing distance in onboarding, and could not change mode before creating its first invitation. | Unpaired accounts retain the chosen mode and can change it before pairing. The regression verifies the selected mode is sent to `create_invite`. |
| P2 | A completed mutation could be replaced by an older refresh snapshot; a recovered read could leave the connection badge stuck offline. | Mutation responses invalidate older snapshots; a successful refresh restores the live badge when its Realtime channel is subscribed. Adjacent Realtime events are coalesced for 150ms to reduce duplicate full reads. |
| P3 | Game legend colors followed unordered profile results instead of the server's player-seat order. Drawing eraser strokes used a different background color from saved previews. | The legend follows `game.players`; canvas and saved preview share the paper color. |
| P2 | The GitHub snapshot omitted the `.env.example` and `eas.json` files referenced by its setup instructions. | Restored a placeholder-only environment template and development/preview/production EAS profiles. Added Supabase CLI cache to ignore rules. |

P1 = release-blocking impact; P2 = meaningful correctness/reliability problem; P3 = presentation defect. These priorities describe impact, not a claim that anyone exploited a defect.

## Remaining release blockers

1. **Dependency advisories remain open.** The fresh online npm audit reports 30 affected package entries: 5 high, 23 moderate, 2 low, 0 critical. These include transitive entries for the same underlying advisories, not 30 independent exploitable app bugs. The installed URL decoder is reached through Expo Router; the existing Metro alias uses a bounded native decoder in app bundles. Zod 3.25.76 is in Expo CLI / lint tooling. Neither the alias nor a passing export makes the whole dependency tree clean. Automatic fixes suggest incompatible major changes, including Expo 51 or Router 58, so no forced downgrade/upgrade was applied. Resolve with supported updates and repeat relevant checks. See [the complete machine-readable audit](dependency-audit.json), [URL decoder advisory](https://github.com/advisories/GHSA-qr28-fpjm-wq7f), and [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
2. **Account recovery, deletion, and separation are missing.** There is no password-reset flow, unpair/revoke-partner workflow, account deletion, or data export. The app needs a defined policy for shared content when either partner leaves. App Store apps offering account creation must support initiating deletion in-app; Google Play also requires an external deletion-request resource. Add these flows and accurate privacy/data disclosures before submission. [Apple requirement](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion), [Google Play requirement](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
3. **Public signup email has not been established.** No real signup, confirmation delivery, password recovery, or allowed-redirect round trip was exercised. This project's Auth user count was zero during inspection. Verify a custom SMTP sender and correct Site URL/redirect settings; Supabase's default service limits recipients to project-team addresses. [Supabase SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp).
4. **Real calling and native builds remain unverified.** Expo Doctor passes 20/21 checks; `react-native-webrtc` is marked untested on the New Architecture. Do not suppress that warning to claim compatibility. Build/install Android and iOS development clients, then verify microphone/camera denial, media cleanup, audio routing, interruptions, and calls across Wi-Fi/cellular. No TURN relay deployment/working relay credentials were verified in this audit. The Edge Function can generate expiring coturn credentials, but STUN alone cannot establish all network paths. [WebRTC relay guidance](https://react-native-webrtc.github.io/handbook/guides/improving-call-reliability.html).
5. **Delivery while the app is closed is absent.** There are no push notifications, background ringing, or scheduled date reminders. Photos/chat can sync while both apps are open; the product must not promise instant closed-app delivery yet.

## Privacy and hosted backend review

- All 16 application tables in `public` and `private` have RLS enabled. None grants anonymous SELECT. Invitation secrets and attempt records have no direct authenticated SELECT.
- All 36 application functions deny anonymous execution and set an empty search path. None of the public API functions is a security definer; privileged private implementations validate the current caller and relationship.
- The four local migration names/versions match the hosted history. No schema change was necessary during this audit.
- Security advisor: no WARN or ERROR findings. The two INFO findings concern intentional RPC-only private tables with RLS and no direct-access policy. Adding permissive policies would weaken this boundary. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Performance advisor: 17 unused-index INFO findings on a project with no permanent users. Keep the relationship/history/foreign-key indexes until real workload measurements justify removing them. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Photo Storage is private, allows JPEG with a 5 MiB upload limit, and uses expiring signed URLs. Couple members can read their shared photos; only the uploader can remove their own objects. This is access control, not end-to-end encryption; administrators retain access.
- The deployed `call-ice` source explicitly calls `auth.getUser` and checks for two members. Gateway JWT verification is disabled intentionally because the function performs authentication itself; anonymous HTTP invocation returned 401. No recording implementation was found.
- Test identities in the hosted transactional integration test were rolled back. Logs sampled over the tool's 24-hour window contained two Auth configuration deprecation warnings and one Realtime lifecycle warning without diagnostic message text. This does not establish uptime, load capacity, or real-client Realtime delivery.
- Source/ignore checks found no matching server secret/private-key patterns in the checked source set; `.env` is not tracked. This limited pattern scan is not a full historical secret audit. Public project identifiers are not privileged credentials.

## Reliability, performance, and accessibility work still needed

| Area | Remaining limit / action |
| --- | --- |
| Full-space syncing | A change still triggers a bounded read of the shared space, including media URL signing. Coalescing helps bursts but does not solve heavy canvas/chat traffic. Add targeted updates, payload metrics, and concurrent device/load tests. |
| History | Moments: 200; plans: 100; daily answers: 60; games: 200; quiz answers: 60; canvas: 500 strokes; pet care: 180 rows. Only chat has earlier-page loading. Older unfinished plans can fall outside the recent-plan query. Add pagination/query separation before sustained use. |
| Drawing | Completed strokes sync when the finger lifts; there is no shared pointer, clear/new-canvas flow, or complete draft-schema recovery. Large drawings can exceed the saved-moment size limit. Unsent strokes persist locally and require retry. |
| Upload recovery | Storage upload and moment insertion/deletion are separate operations. Interrupted requests can leave unconfirmed content, orphaned objects, or a temporarily broken moment; cleanup errors are not backed by a repair job. Add idempotent media operations and reconciliation. |
| Chat | Text only; no attachment composer, message deletion, read receipts, or automatic offline-send queue. The draft survives a failed send while its screen remains open. Closing the screen discards an unsent chat draft. |
| Calls | Keep both apps open. Call signaling can be abandoned by process termination; server cleanup and timeouts are partial. A second session for the same account can treat an existing call as abandoned. Validate session ownership and durable cleanup before relying on calls. |
| Local storage | Demo content and live session tokens use AsyncStorage. Content validation/migration is incomplete for syntactically valid but malformed local records. Decide whether OS-protected native token storage and a local app lock fit the privacy requirements. |
| Dates and time | Dates use manual text fields and the named shared time zone; there is no per-phone time conversion, calendar export, cancellation workflow, or reminders. Anniversaries now validate against the shared day. |
| Accessibility | Visible controls have labels and the narrow-layout scan passes. VoiceOver/TalkBack, larger system fonts, focus order, keyboard occlusion, and color-independent game-state announcements still need device testing. Several drawing controls remain smaller than a comfortable mobile touch target. |
| Operations | No verified production alerting, backup-restore drill, upload quota/abuse controls, email-delivery monitoring, or CI workflow. No signed installable release or store listing has been produced. |

The in-sync percentage correctly describes a five-question quiz and is explicitly not a measurement of love. Pet care awards are server-controlled, limited to each partner/action/shared day, and do not punish missed days. Those product choices are preserved.

## Verification evidence

| Check | Result and scope |
| --- | --- |
| `npm run lint` / `npm run typecheck` | Passing on application/test code. The Deno Edge Function is not included in app TypeScript checking. |
| `npm test` | 29 passing tests, including 13 database scenarios applying all four actual migration files in PGlite. Covers access/ownership, answer visibility, immutable game results, call signaling, chat retry/rate limits, pet reward limits, date revision/confirmation, and chat pagination reconciliation. |
| `npm run test:ui` | 16 passing browser scenarios, including photos, moods, drawing, games, quiz, chat, pet care, and date proposals; no browser runtime errors. Uses demo identities. |
| `npm run test:client` | 8 passing browser scenarios with controlled HTTP/Auth/media doubles: corrupt-demo restoration, idempotent send retry, account-switch isolation, long chat reconnect, cancelled answer, local sign-out, pre-pairing mode, shared midnight. Not a real Supabase Auth or WebRTC media test. |
| `npm run test:layout` | 16 routes checked at 360×800 with two maximum-length names; interactive controls stay on-screen and no document horizontal overflow was found. Not a native accessibility certification. |
| `npm run test:config` | Effective Android permissions and iOS usage descriptions pass Expo config introspection. No native directories generated. |
| `npm run test:backend` | 12 checks against hosted HTTP/RPC endpoints reject unauthenticated reads/writes. |
| `tests/hosted-features.sql` | Hosted pairing, chat retry, both-partner pet care, date reconfirmation, and outsider isolation passed; all fixture writes rolled back. |
| Expo web / Android / iOS exports | All passed, including Android and iOS Hermes bytecode. These are not APK/IPA builds. Final exported bundles are under `artifacts/platform-export/`. |
| Expo Doctor | 20/21; open WebRTC/New Architecture compatibility warning. |
| Online npm audit | 30 affected package entries remain; no critical entries, five high entries. |

Screenshots and machine-readable test evidence are generated under the Git-ignored `artifacts/` directory. The browser tests launch an isolated local test browser, not the user's browsing session. Some commands required unsandboxed execution because Windows process restrictions prevented Chrome or Hermes from launching; passing results above are from successful reruns, not the blocked attempts.

## Release order

1. Resolve compatible dependency updates and add account recovery, deletion, and unpairing with clear shared-content rules.
2. Configure and verify signup email, Auth redirects, TURN, and required delivery notifications.
3. Produce signed development builds and test two distinct accounts on an Android phone and an iPhone, on separate networks, through failures and midnight transitions.
4. Test accessibility, sustained history/traffic, privacy controls, and recovery operations; then prepare accurate store disclosures and a small consent-based pilot.

No additional plugin is required to finish the audit. Remaining external work requires service configuration, signing access, and actual devices.
