# Closer: couples app research and product plan

Research window: 2–3 November 2026. Working name only; brand and trademark availability have not been checked.

**Status: first alpha implemented, 3 November 2026.** The user approved starting the build after this research. A working Expo app and Supabase backend now exist. This document remains the broader product plan; see `../README.md` and `TESTING.md` for what is implemented, verified, and still required before release.

## 1. Product direction

Build a private shared space where two partners can notice each other's day, understand what support would help, and enjoy doing things together. Make it useful both during a short work break and during a longer evening together.

Suggested promise: **“Your little world, together.”**

The defining experience should be this sequence:

1. See what your partner has chosen to share about their day and mood.
2. Respond with something personal: a photo, a note, a doodle, or an invitation.
3. When you both have time, call, draw, or play together.
4. Keep the things you want to remember in your shared story.

This is a product hypothesis, not a demonstrated market gap. Many existing apps already offer parts of this experience. We need to prove that the combination is easier and more enjoyable than the tools a couple already uses.

### Decisions already supplied by the user

- Build for Android and iPhone.
- Serve nearby and long-distance couples equally.
- Ask which situation applies during onboarding.
- Include instant photos and a home screen that responds to the partner's shared mood.
- Include calls, shared games, daily win history, and drawing together.
- Explore an entertaining percentage feature.
- Research and agree on the plan before continuing implementation.

### Recommendations still to validate

- A mood plus a support preference is more useful than a mood alone.
- Live drawing should also work without a game or call.
- A small number of polished activities will be preferable to a large game catalog at launch.
- The percentage should describe a clear activity or quiz result, not purport to measure love.
- Names, moods, language, and visual style should be inclusive and customizable without a long personality assessment.

## 2. What the research can and cannot tell us

This is desk research across ten relevant products: Cupie, Cozy Couples, Paired, Locket, noteit, Between, Cupla, Lovewick, SumOne, and Love8. Sources include official product and support pages, visible App Store/Google Play reviews, firsthand public discussion, and relationship research. Technical documentation was checked for one important promise: widget freshness.

We have **not** interviewed couples, installed and independently tested every competitor, measured market demand, or run a representative review scrape. Store excerpts are selected by the store and can include older reviews. They reveal concrete experiences, not how common those experiences are. Product descriptions establish advertised features, not verified quality or security. Promotional comments and third-party app-ranking claims were not treated as evidence of demand.

The feature specifications below are our recommendations. They are not claimed as research findings unless accompanied by a source.

### Evidence that most affects the design

| Observed signal | Evidence and limitation | Product implication — our inference |
| --- | --- | --- |
| Small personal exchanges have appeal | Locket is built around everyday photos; a firsthand LDR commenter describes using its widget to feel included in their partner's day. This is a qualitative signal, not a retention statistic. [Locket](https://help.locket.com/en/articles/14225418-my-teen-asked-me-to-get-locket-what-is-it), [discussion](https://www.reddit.com/r/LongDistance/comments/1kqytk9/good_couples_apps/) | Make a spontaneous photo or note possible in a few taps, without completing a daily assignment first. |
| Drawing is a meaningful feature, not just decoration | A Cozy Couples review asks for more drawing freedom; a noteit reviewer describes drawing for a deployed spouse and frustration with lost work. Some reviews are historical. [Cozy Couples](https://apps.apple.com/us/app/cozy-couples-relationship-app/id6463766369), [noteit](https://play.google.com/store/apps/details?id=me.bukovitz.noteit) | Offer free drawing, saved drafts, reliable undo, and a lasting gallery. |
| Questions can open conversations people otherwise avoid | A 2025 mixed-methods Paired evaluation describes regular discussions and a useful mixture of light and serious prompts. Its convenience sample and observational design limit causal conclusions. [Study](https://mhealth.jmir.org/2025/1/e55433/) | Offer one optional prompt and a way to reply to the answer. |
| Nearby couples also use playful asynchronous features | A July 2026 Love8 reviewer describes enjoying a shared virtual pet and screen drawing with a spouse who works long shifts. It is one household's account. [Review](https://play.google.com/store/apps/details?id=ltd.love8.couples.relationship) | “Nearby” should still include photos, doodles, and games. Distance is a personalization choice, not a feature barrier. |
| Coordination is another established product category | Cupla's official feature set centers on shared calendars, dates, lists, and countdowns. This demonstrates a competing approach, not proof that all users want it. [Cupla](https://cupla.app/help/en/articles/15162036-what-are-cupla-s-features) | Start with date ideas, a simple shared plan, and countdowns; defer a full household organizer. |
| Reliability matters because the content becomes personal history | Visible Between reviews describe long use and affection for its features, alongside notification and delivery problems. Cozy Couples reviews also describe login/sync failures. [Between](https://play.google.com/store/apps/details?hl=en&id=kr.co.vcnc.android.couple), [Cozy Couples](https://play.google.com/store/apps/details?id=com.clarity.cozycouples) | Account recovery, drafts, clear delivery states, and data preservation belong in the first release. |
| Pressure and aggressive monetization can spoil the experience | noteit reviews object to streak graphics obscuring drawings; Paired reviews object to subscription pressure and limited free use. These reports should not be read as universal opinions or current price verification. [noteit](https://apps.apple.com/us/app/noteit-bff-widget/id1570369625), [Paired](https://play.google.com/store/apps/details?hl=en&id=com.getpaired.app) | Avoid guilt-based reminders, expiring affection, and paywalls that block an already-sent personal message. |

### What research does not justify

The Paired study used a 745-person survey, longitudinal data from 440 individuals, and 20 interviews. It suggests potential benefits from regular communication; it does not establish that our proposed app will improve relationships. Its much-publicized 35.5% figure compares groups of users and should not be advertised as a guaranteed improvement. The paper also discusses how app indicators may become interpreted as commitment signals. [Paired evaluation](https://mhealth.jmir.org/2025/1/e55433/)

A 647-person study of emerging adults found different communication patterns and associations for nearby and long-distance relationships. Video-call frequency was not significantly associated with satisfaction in either group in that study. This supports testing different experiences; it does not show that video calls are useless or that more minutes mean more affection. [Holtzman et al., 2021](https://pubmed.ncbi.nlm.nih.gov/34924671/)

## 3. Competitive position

| Product | Relevant advertised strength or observed signal | Lesson for Closer |
| --- | --- | --- |
| [Cupie](https://apps.apple.com/us/app/cupie-call-games-for-couples/id6774291368) | Calls and synchronized games; an October 2026 release added drawing during calls. | “Calls plus games plus drawing” alone is already present in the market. |
| [Cozy Couples](https://play.google.com/store/apps/details?id=com.clarity.cozycouples) | Moods, notes, questions, games, and a shared virtual home. | Warm presentation and multiple small rituals can coexist; test whether a virtual home adds value for our audience. |
| [Paired](https://www.paired.com/frequently-asked-questions) | Short question-based activities and conversation topics; a subscription can cover both partners. | Make participation easy for both people and treat the couple as the purchasing unit. |
| [Locket](https://help.locket.com/en/articles/14225418-my-teen-asked-me-to-get-locket-what-is-it) | Photos delivered to close friends' home-screen widgets. | The low-effort presence experience is a strong reference. |
| [noteit](https://play.google.com/store/apps/details?id=me.bukovitz.noteit) | Drawn notes on a partner's home screen. | A personal mark can be more meaningful than a large feature catalog. |
| [Between](https://between.us/?lang=en) | Couple chat, media, anniversaries, and shared planning. | A shared archive is an established use case; design its continuity carefully. |
| [Cupla](https://cupla.app/help/en/articles/15162036-what-are-cupla-s-features) | Schedules, planning, wishlists, and date coordination. | Support making time together without recreating a whole calendar suite initially. |
| [Lovewick](https://play.google.com/store/apps/details?id=com.lovewick.app) | Questions, date ideas, reminders, and relationship memories. | Give users ideas that lead to an experience outside the app, too. |
| [SumOne](https://sumone.co/faq-en/) | A recurring shared question, with progression dependent on both answers. | A joint ritual is understandable; test how it feels when only one partner participates. |
| [Love8](https://play.google.com/store/apps/details?id=ltd.love8.couples.relationship) | Playful couple features; visible reviews mention pets, drawing, notification frustration, and reward issues. | Keep delight voluntary and make notification controls clear. |

**Positioning to test:** a calm, playful home that helps you respond to your partner's present needs and keep the moments you create together. The advantage must come from the complete experience and reliability. A checklist of features is easy for competitors to match.

## 4. Onboarding: nearby or long-distance

Keep the first session short. Show value before asking for detailed profiles.

1. Introduce the promise with a photo, mood card, and shared doodle example.
2. Ask: **“Are you usually nearby or long-distance?”** Offer Nearby and Long-distance, with Skip. Explain that this can be changed later.
3. Ask optionally: **“What would you like more of?”** Pick up to two: everyday connection, play and laughter, meaningful conversations, or time together.
4. Create an account and choose a display name. Make recovery work independently of the partner's phone.
5. Link the two accounts with an expiring invite link or code and an explicit partner confirmation.
6. Encourage one immediate action: share a mood, send a photo, or leave a doodle.
7. Ask for notifications when explaining what the partner will send. Request camera and microphone access only when used.

Allow solo exploration while an invite is pending. Do not show invented messages, statuses, or activity from the real partner. Sample content, if used, must be labeled as a preview.

| Experience | Nearby default | Long-distance default |
| --- | --- | --- |
| Home suggestions | A small date, tonight's plan, an after-work check-in | Partner's local time, a shared moment, a call invitation |
| Countdown | Next date, anniversary, trip | Next visit or reunion, if the couple adds one |
| Playing | Two phones together; selected games can have a clearly labeled pass-and-play mode | Synchronized remote play with optional voice/video |
| Shared time | A short offline activity or walk | An online activity with a mutually suitable time |
| Core tools | Photos, moods, notes, drawing, calls, games, memories | The same tools |

Nearby and long-distance can change with travel, work, or moving. Preserve the same couple space and memories when the preference changes. Neither setting requires GPS; time zone and city can be chosen manually if needed.

## 5. The daily experience

### Mood sharing that leads to a useful response

Ask two distinct questions:

- **“How are you feeling?”** Happy, loved, calm, tired, low, overwhelmed, missing you, or prefer not to share. Test the labels with users.
- **“What would help?”** A hug, listening, something fun, help with a task, quiet time, or nothing right now.

The partner chooses what to share. Do not infer mood from typing, photos, call recordings, menstrual cycles, or response time. A short note is optional. Show when the mood was shared, and offer an expiry so yesterday's difficult moment does not become today's assumed state.

| Shared state | Home response | Suggested action |
| --- | --- | --- |
| Happy and playful | Warm, lively accents | Invite to a short game or co-drawing |
| Low and wants comfort | Softer visuals and calm language | Write a reassuring note or offer to listen |
| Overwhelmed and wants quiet | Low-stimulation presentation | Send a no-reply-needed note; respect quiet hours |
| Missing their partner | A familiar shared memory | Invite to a call or send a spontaneous photo |
| Tired | Restful accents | A brief goodnight note or a plan for later |
| Unshared or expired | Neutral home | A simple greeting without guessing how they feel |

Change accents, illustrations, and suggestions while keeping navigation consistent and accessible. Avoid alarming red screens, automatic sad music, or messages implying that the viewer caused the mood. A support preference should outweigh a generic suggestion based on mood.

### Photos, notes, and quick replies

Offer a camera-first photo action, gallery selection, a short caption, reactions, and a reply attached to the moment. Separate sending from saving so users understand where a photo goes. Show pending, sent, and failed states; retry without creating duplicate moments. A failed connection must not look like the partner ignored the message.

Use private storage and a clear retention policy. Do not promise that deleting a shared image can remove copies a partner already downloaded or captured.

### Daily question

Offer one fresh, optional question with light, thoughtful, and playful categories. Let couples skip or choose another. Reveal answers after both respond, and allow a conversation on the answer itself. Avoid interpreting different answers as incompatibility. Preserve drafts and let an unfinished question wait without blocking every other feature.

### Moments and plans

Create a shared story of selected photos, notes, drawings, and game memories. Include a relationship date, meaningful countdowns, a simple upcoming date, and a someday list. Do not automatically post every interaction into a noisy feed. A weekly recap can collect the moments the couple chose to keep.

## 6. The Play room: calls, drawing, and games

### Calls

Support audio and video calls between the linked pair, with clear ringing, connecting, connected, reconnecting, declined, and ended states. Let people mute, change camera, turn video off, and leave without losing their game or drawing. Keep call controls accessible while an activity is open.

Audio should remain a first-class option for limited data, poor connections, or someone who does not want to be on camera. For nearby users, games and drawing should work without initiating a call.

Use a small in-app call panel while playing. Full phone-level picture-in-picture and reliable background ringing need separate platform work and testing; do not confuse an in-app floating tile with OS picture-in-picture support.

The proposed first version does not transcribe, summarize, or analyze calls. Some Cupie reviewers objected to unexpected AI participation or summaries; other reviewers liked reminders. This is evidence of differing preferences, not an independent finding about its implementation. [Cupie reviews](https://apps.apple.com/us/app/cupie-call-games-for-couples/id6774291368)

### Drawing together — a first-release feature

Offer three related experiences, with free drawing built first:

| Experience | Interaction | Why test it |
| --- | --- | --- |
| Our canvas | Both draw on the same board live, with optional voice/video | A shared activity without requiring a competition or a difficult conversation |
| A doodle for you | One person draws and sends it for the other to see later | Works during work breaks and across time zones |
| Draw & Guess | Short rounds where one draws and the other guesses | Adds a repeatable game using the same drawing foundation |

Initial tools: a useful color palette, a few brush sizes, eraser, undo/redo, and save. Give each person an identifiable cursor or ink indicator. Provide original prompts such as “draw our dream weekend,” “finish my doodle,” or “draw our first date badly.” Do not require artistic ability.

Preserve local drafts, reconnect without losing completed strokes, and allow undo of the user's own strokes. A full shared-board clear needs a distinct confirmation flow. Save finished pictures to the story by choice. Do not erase drawings because a day ended or someone missed a streak.

### Games and daily wins

Start with **Draw & Guess** and **Four in a Row**, plus an unscored This-or-That activity if content testing supports it. More complex games such as pool or minigolf can wait. The first two should have original visual designs and content.

Keep competitive outcomes separate from relationship feedback. A win is a game outcome; agreement in a personal conversation is not a victory.

Daily history should show:

- Date and game.
- Each partner's wins, plus draws.
- Completed matches and rematch access.
- Weekly and all-time totals within the couple only.
- A separate label for local pass-and-play results if that mode exists.

Use one agreed couple time zone for daily groupings and retain the original timestamps. A dropped connection should pause the match; a timeout should produce the published game outcome, not silently award a win. Record a completed result once, and keep scores unchanged by reconnects or duplicate requests. Either partner should be able to hide competitive totals in their own view.

## 7. The percentage feature

Keep the entertaining number, but be precise about what it means. No source reviewed validates converting app usage into a measure of how much partners love one another.

### Recommended first experiment: quiz match percentage

For a light This-or-That quiz, show **“You matched on 8 of 10 choices — 80%.”** Compute it only from the completed, comparable answers in that round. If there are no comparable answers, show no score. Frame differences as conversation starters, without “good couple” or “bad couple” labels.

### Optional second experiment: a shared connection jar

Partners can choose a few small activities for the week, including offline time. Show **“4 of your 5 little moments — 80% complete.”** The formula is completed chosen activities divided by the chosen total, capped at 100%. With no chosen activities, show an invitation to set a goal rather than 0%.

The couple chooses the activities; there is no requirement to complete every feature. Let them record offline time themselves. The display is optional and labeled as progress for a defined week. Starting a new week must not be described as love falling.

### Boundaries for either design

- Do not reward positive moods or penalize difficult moods.
- Do not grade reply speed, number of messages, location access, or hours on calls.
- Do not score one partner against the other.
- Do not sell score boosts or send “your love is dropping” notifications.
- Do not calculate a love verdict from names, birthdays, photos, or hidden AI analysis.
- If a heart-shaped “Love meter” is retained as a visual name, explain the actual calculation immediately. Prefer the clearer labels above in testing.

These are product design recommendations. Test whether the number is enjoyable and correctly understood before making it prominent.

## 8. App structure and first-session flow

Keep four main destinations:

| Destination | Primary job |
| --- | --- |
| Today | Partner mood, latest personal moment, quick response, next shared plan |
| Together | Calls, shared drawing, games, and the daily question |
| Our story | Saved photos, drawings, notes, milestones, and game history |
| Us | Profiles, nearby/long-distance preference, invitations, quiet hours, privacy, and account controls |

Make camera, note, and doodle accessible as quick actions from Today. Show a persistent in-app call panel when moving between Together activities. Keep decorative progress secondary to a real message from the partner.

Example first shared experience: one person selects long-distance, pairs with their partner, and sends a doodle. The other reacts and shares “missing you — would like a call.” The first sees a fitting call invitation, and the couple opens the same canvas while talking. They save the drawing. Every step creates something the other person can recognize as personal.

## 9. Release scope and build order

The first public release should contain the core requested experiences. Build and validate them in stages instead of implementing a large catalog at once.

| Stage | Deliverable | Exit condition |
| --- | --- | --- |
| A — Validate the concept | Interview couples and test onboarding, mood responses, drawing, Play room, and percentage mockups | Both audience groups understand the product and can identify a recurring reason to return |
| B — Private asynchronous alpha | Accounts and recovery, pairing, photos, moods, notes/replies, saved doodles, story, quiet hours | Two real phones exchange and recover content reliably |
| C — Shared-session beta | Live canvas, audio/video calls, two games, daily result history | Cross-platform sessions survive ordinary reconnects and preserve results and artwork |
| D — Release candidate | Polished mode-based home, simple plans/countdowns, optional tested percentage, accessibility and account controls | Product tests and release checks pass; operating costs are understood |
| Later | Widgets, extra games, themed rooms/pets, voice postcards, richer date planning, optional recap formats | Add according to observed repeated use and support burden |

Widgets are attractive but should not block the core app. Promise fast in-app delivery; do not guarantee instant widget refresh. iOS schedules widget refreshes within system budgets, while Android also controls periodic updates. Event-driven updates can help, but are not a universal timing guarantee. [Apple WidgetKit](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date), [Android widgets](https://developer.android.com/develop/ui/views/appwidgets/advanced)

Defer public feeds, strangers, GPS tracking, automatic call analysis, AI relationship verdicts, a large household-management suite, and a large game catalog. They would expand scope without testing the central experience first.

## 10. Trust and operating quality

Because the product contains personal photos and conversations, make the controls understandable:

- Separate user accounts, one mutually confirmed couple space, and revocable invitations.
- Restore an account on a replacement phone without requiring the partner to recreate the relationship.
- Keep content belonging to one couple inaccessible to any other couple.
- Offer per-feature notifications, quiet hours, and discreet lock-screen previews.
- Make location sharing unnecessary for the proposed features.
- Explain saving, exporting, deleting, and unpairing before users need those controls.
- Unpairing must stop future sharing and prevent a new pairing from inheriting a previous couple's content. Define treatment of existing shared memories before launch.
- Do not promise end-to-end encryption until the complete design actually implements and verifies it. Private database permissions and encryption in transit alone do not establish that claim.
- Distinguish app bugs from human behavior: “waiting to send” is different from “your partner has not replied.”

These requirements are part of product quality, not optional premium benefits.

## 11. Monetization hypothesis

First prove repeat use. Then test one subscription per couple, with a genuinely useful free experience. Paired already uses shared entitlement across the pair, demonstrating that users can encounter this model elsewhere. [Paired FAQ](https://www.paired.com/frequently-asked-questions)

Candidate paid value: additional game packs, optional visual themes, enhanced scrapbook layouts, and additional storage. Do not block opening a partner's existing message, basic mood sharing, account recovery, deletion, or a standard data export.

Calls and media storage have ongoing costs. Define any limits clearly before people start using them. Do not promise unlimited video indefinitely or choose a price before estimating actual usage. Test willingness to pay in the launch market; a US competitor's price does not establish an appropriate Indian or global price.

Basic cost model to investigate later: connected couples × active days × media usage, plus call participant-minutes, storage growth, notifications, support, and store fees. A two-person ten-minute call produces twenty participant-minutes under a per-participant pricing model; confirm the selected provider's billing rules before budgeting.

No additional plugin is needed to complete this research. For implementation, Supabase is relevant to accounts, permissions, storage, and syncing. Calls still require a deliberate media-service and mobile-platform decision; a database connection alone does not provide reliable video calls or background ringing.

## 12. Validation before a full build

Recruit **12 couples for initial discovery**, split evenly between nearby and long-distance. Include some mixed Android/iPhone pairs, different relationship lengths, shift workers, and people who previously stopped using a couple app. This is a proposed research sample, not research already performed.

Conduct short individual interviews first so one partner does not answer for both, then observe a shared prototype task. Do not require participants to reveal private chats, photos, arguments, or account credentials. A detailed script is in [COUPLE_INTERVIEW_GUIDE.md](./COUPLE_INTERVIEW_GUIDE.md).

Then run a **two-week beta with 20 couples**, ten in each mode. The numbers are a practical learning proposal, not a statistically representative sample or an industry benchmark. Review nearby and long-distance results separately.

| Question to answer | What to observe |
| --- | --- |
| Can both people get started? | Invite creation, acceptance, first mutual interaction, pairing failures |
| Is there a reason to return? | Activities repeated voluntarily after the first few days |
| Does the mood feature help? | Whether the recipient understands the support preference and finds a useful response |
| Is drawing a lasting use case? | Repeat canvas sessions, saved drawings, asynchronous doodles, lost drafts |
| Are calls and games worth combining? | Activities used during calls, join failures, reconnects, switching friction |
| Does the score feel playful? | Correct understanding of its formula, enjoyment, pressure, and requests to hide it |
| Does one partner carry the app? | Participation by both people and reasons for one-sided use |
| Would people pay? | Tradeoffs against current tools and response to concrete pricing concepts |

Use a pair-level measure of success: couples returning to have a mutually wanted interaction. Downloads and one highly active partner are insufficient. Collect only the event metadata needed for the test; do not analyze private message contents or recordings to manufacture an engagement metric.

Do not set a public launch date from this document alone. The next concrete deliverable is a small set of tested screen flows and a revised feature specification, followed by a build estimate grounded in the call/drawing architecture.

## 13. Open decisions

1. Launch market and languages; India-specific affordability and Hinglish should be tested if India is the initial market.
2. Preferred visual tone: calm/minimal, cute/playful, or a choice of the two.
3. Whether the quiz percentage or connection jar earns a place in the first release.
4. Which two games couples actually repeat after a week.
5. Acceptable media retention, storage limits, and pricing.
6. Call provider, native ringing/background behavior, and encryption design.
7. Name and brand availability.

## 14. Workspace handoff

Before the request to plan first, an Expo scaffold and preliminary domain/state code were created in this folder. They are incomplete and should not be treated as a finished app, validated backend, or approved final architecture. The dependency installation already in progress completed; implementation has otherwise been paused.

Supabase tool availability appeared during the session, but project discovery returned an unknown-tool error. No project was successfully inspected, created, migrated, or connected. Recheck the connection when implementation resumes instead of assuming the backend is live.

This research plan supersedes the earlier speculative feature implementation. Resume with validation and the agreed specification.
