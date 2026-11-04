# Shared dashboard — 4 November 2026

The dashboard uses cherry accents, lavender paper, small teddy illustrations, and an album layout. The desktop view places check-ins beside the partner’s mood; phones put check-ins directly after the quick actions. Photos and the daily conversation remain part of the home screen.

## Memory Lane

`src/components/memory-lane.tsx` displays actual shared photo moments from the rolling last 30 days, newest first. Photo prints show a caption, author, and date in the couple’s shared time zone. Swipe or use the arrow buttons to browse; tap a print to open a larger viewer. Empty albums invite a first upload. Missing images have a visible fallback.

Live photos use their own indexed query, independent of the latest 200 story moments. Pages contain 40 photos with a timestamp/ID cursor; a lookahead row determines whether more exist. Signed private image URLs last one hour. The initial page refreshes with the space; older pages can be reloaded by reopening the app if their links expire. Account and feed changes discard the viewer and extra pages. Demo photos stay in local storage.

## Daily Question

`src/components/daily-question.tsx` links to the existing answer flow and shows whether you have answered or both answers are available. Both people use the couple’s time zone and see the same deterministic prompt. The question changes at shared midnight while the app is open; a fresh question clears the previous draft.

Fourteen lighthearted prompts start on 5 November 2026. Earlier dates retain the original prompt sequence so existing answers are not relabeled. Partner answers remain hidden by database policy until you submit your own; the demo applies the same presentation rule.

Submissions carry the day of the displayed question. If midnight passes before the UI refreshes, the old draft is rejected instead of being attached to the next question.

## Daily moods

`src/components/mood-streak.tsx` shows the last seven shared calendar days for each partner. Every mood counts equally. Updating today replaces that day’s mood. A run ending yesterday stays active while today is still open; a missed full day resets it. Empty days are neutral dots, with full date/mood accessibility labels.

The server derives the author, couple, timestamp, and shared calendar day in `log_mood`. Profile and history updates commit together, and direct history writes are denied. Only the couple can read entries. Notes and support requests are not copied into the mood history. Existing profile moods are not converted into invented historical check-ins.

`get_mood_history` returns the latest 30 calendar days plus streak counts calculated across all recorded days, so a run longer than 30 days is not truncated. Realtime changes and periodic refresh update the partner’s view. History remains stored until its couple/profile is deleted; there is no automatic retention purge or history editor in this release.

## Verification

The dedicated dashboard browser scenarios cover empty states, both partners checking in, same-day edits, reload persistence, hidden/revealed answers, the photo viewer, horizontal scrolling, the 30-day filter, desktop/mobile layouts, and shared midnight. Client tests exercise the live mood RPC and photo pagination with controlled HTTP responses. Database tests run the actual migrations and check access restrictions, server-owned dates, invalid inputs, duplicate-day updates, long streaks, gaps, and future entries.

Hosted integration checks use temporary identities inside a rolled-back transaction. Physical Android/iPhone testing remains separate from JavaScript export and browser verification; see `TESTING.md` for the wider app’s release limits.
