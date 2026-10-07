# Brother playtest roadmap

Date: 2026-10-07. Status: implemented and verified in the working tree. A fresh player playtest and physical-phone acceptance remain; release is a later requested step.

This batch turns the owner's playtest notes into an execution order for the main game. The packet text below records the original test proposals. The shipped values and evidence are recorded in the handoff at the end and in playtest-results.md. `gemini-art/` is outside this batch. Its contents, assets, and integration remain with the other agent.

Owner decision: clarify existing keyboard highlights first. A new targeted-key bonus is deferred to a later playtest and is not part of the current implementation batch.

## What the playtest is asking us to change

| Feedback | Intended result | Decision still to test |
| --- | --- | --- |
| Gold keyboard highlights look clickable but their meaning is unclear. | Each highlight has one understandable meaning, and the player can identify what earns a bonus. | A separate targeted-key bonus is deferred to a later playtest. |
| Falling background bananas look like rewards. | Ordinary falling bananas can be collected for a small reward that stays useful as the save grows. | Reward growth and spawn frequency. |
| The opening exposes too much at once. | First-time players learn through a required sequence, with pages appearing as they earn them. | Exact letter thresholds and when Words and Titles open together. |
| Upgrade descriptions list every possible tier. | The main card shows the current effect, and the purchase control explains the next effect. | How much supporting detail belongs in an expandable view. |
| Banana values feel small after an evening and a return visit. | Larger, readable payouts and costs, with a satisfying purchase cadence. | Monetary scale, early acceleration, and later cost growth. |

## Baseline behavior confirmed before implementation

- `ops.js`, `renderFloor()`: `.o-key.want` marks letters missing from the focused title. These are ingredient hints. Keyboard key elements are decorative `<b>` elements inside the stage; all stage pointer presses use the same random typing action. Clicking a highlighted key does not choose that letter or add a special reward.
- `ops.js`, `MILES` and `press()`: the separate Golden Keys buff already exists. At streak 50 it makes every manual tap produce an extra letter for 12 seconds. It can also arrive through other rewards. Streak bonuses should be explained before inventing another combo system.
- `app.js` and `classic.js` create looping background drifters, including bananas. Their backdrop disables pointer events. Golden and rotten bananas are a separate interactive system in `ops.js`, `spawnGold()`.
- `tour.js` already has a persisted nine-step tour, Replay, Skip, Escape-to-skip, and contextual tips. A save with at least 200 typed letters is treated as experienced when it has no tutorial record. The new first-run requirement supersedes the older skippable-tour brief in task 09.
- `ops.js`, `TAB_GATES`: Train is available immediately because it has no gate. Words opens after any hire, 60 typed letters, a banked word, or a sold title. Titles opens after a banked word, ready title, or sale. Shop can open from any positive banana balance. Keepers operate from the beginning. These independent conditions can reveal several pages before the tour teaches them.
- `ops.js`, `UPS` and `renderTraining()`: upgrade copy lists whole percentage ladders. The actual tier values already live in `UPV`; the interface can derive current and next effects from those values.
- `core.js` already abbreviates millions through quadrillions. Its narrow HUD adds thousands, while many counts and training costs in `ops.js` still use full comma-separated values. Scientific notation and consistent boundary rounding need a defined policy.
- Currency is stored separately in `imi-score`; game state is in `imi-ops-v1`; tutorial state is in `imi-tour`. Changing economic units requires coordination across them.
- `BALANCE.md` and `tools/` provide seeded simulations and historical measurements. The bot omits golden bananas and several active systems, and the simulator does not run the real onboarding or art layer. Historical results are context, not a fresh baseline for this batch.

## Execution order

| ID | Work packet | Depends on | Main files | Implementation model |
| --- | --- | --- | --- | --- |
| PT-00 | Capture the present curve and choose test targets | None | `BALANCE.md`, `tools/balance.mjs`, `tools/bot.js` | GPT 6.1 Sol, high |
| PT-01 | Clarify keyboard hints and existing combo rewards | PT-00 | `ops.js`, `ops.css`, relevant tour copy | GPT 6.1 Sol, medium |
| PT-02 | Condense upgrade cards and add current/next effects | PT-01 | `ops.js`, `ops.css` | GPT 6.1 Sol, medium |
| PT-03 | Require the first-run introduction and sequence page unlocks | PT-02 | `ops.js`, `tour.js`, `core.js`, `ops.css`, harness stub as needed | GPT 6.1 Sol, high |
| PT-04 | Standardize number display and prepare economic save migration | PT-03 | `core.js`, `ops.js`, harness formatting stub, `BALANCE.md` | GPT 6.1 Sol, high |
| PT-05 | Make ordinary background bananas collectible | PT-03, PT-04 | `ops.js`, `core.js`, `app.js`, `classic.js`, shared and edition CSS | GPT 6.1 Sol, medium or high |
| PT-06 | Increase monetary scale and tune the complete curve | PT-00 through PT-05 | `ops.js`, agreed migration location, `tools/`, `BALANCE.md` | GPT 6.1 Sol, high |
| PT-07 | Deferred targeted-key experiment | A later playtest and explicit inclusion | `ops.js`, `ops.css`, `tour.js`, balance scenarios | GPT 6.1 Sol, medium or high |
| PT-08 | Verify the complete playtest batch | Required packets above | Evidence and fixes in owned files | Independent GPT 6.1 Sol review |

The main implementation path is PT-00, PT-01, PT-02, PT-03, PT-04, PT-05, PT-06, PT-08. PT-07 is deferred by the owner's decision. If a later playtest warrants the mechanic, agree on its reward budget and repeat the affected balance scenarios before accepting it.

Most work touches the same `ops.js` IIFE. Keep one implementation owner there at a time. Future parallel work should cover independent reading, balance runs, or a specifically owned file after shared behavior is agreed. GPT 6 Luna is suitable for narrow copy, documentation, or isolated CSS follow-ups; economy migration and tutorial state should stay with Sol. Resolve exact provider/model IDs from T3's live catalog when delegation begins. The user subsequently authorized implementation with subagents. GPT 6.1 Sol workers and an independent reviewer handled the shared implementation and evidence. No PR, commit, or deployment was part of this batch.

## PT-00: Establish a useful baseline

Capture fresh-save runs for active play, mostly idle play, and a short session followed by an overnight return and another 20-30 minutes of play. Use multiple seeds for comparisons. Record first hire, first banked word, first sale, Hold to type, second and third machines, automation, first division, and first prestige star.

Record both bananas earned and bananas held. A player can have a small wallet because they are buying worthwhile upgrades; the wallet alone cannot tell us whether income or progression is too slow. Also record letters held, keeper consumption, and the next purchase's wait time. Most Train upgrades use letters, so raising banana income cannot resolve every bottleneck.

The following are proposed opening targets:

| Event | First candidate target |
| --- | --- |
| Train becomes visible | After roughly 20-30 manual taps |
| First hire | Affordable through ordinary tapping within roughly 60-120 seconds |
| Words and Titles become visible | After the first hire and a short further typing milestone |
| First sale | Roughly 2-4 minutes of casual active play |
| Second machine | Roughly 15-25 minutes of active play |

Use these as feel targets and revise them with evidence. The later curve should retain meaningful waits and purchase choices; establish those targets from the baseline before choosing new costs. Keep the user's overnight-return experience as a required comparison scenario.

Acceptance: a dated baseline table identifies the commit, knobs, seeds, play profiles, actual simulated duration, and omitted systems. Correct the existing runner's reporting if its wall-clock guard stops a run early but its summary still claims the requested duration. Do not make a full-hours claim from a partial simulation.

## PT-01: Give keyboard signals distinct meanings

Use a quiet ingredient marker for letters the focused title needs, with a short explanation such as "Needed for your current title." It should not resemble a timed bonus button. Reserve the more prominent gold treatment for the existing Golden Keys buff, paired with a timer and "2 letters per tap."

Normal typing should retain a brief pressed-key animation. During the required introduction, teach the typewriter's ordinary tap behavior once and explain a combo reward when the player first earns it. Avoid adding another permanent paragraph to Floor.

Acceptance: a new player can distinguish an ingredient hint, a pressed key, and Golden Keys. Clicking a hint behaves consistently with the stated rule; the entire typewriter remains usable by touch, Space, and Enter. Each input produces the intended number of letters once, including during a buff and Hold to type.

## PT-02: Make upgrade cards describe the current state

Use one short explanation and one prominent current value. For example, a level-two Fresh ink card can say "45% finishing-letter bias" with a brief explanation of what that bias does. A subtle preview can show "Next: 65%" beside the price or through a compact details control. Display level pips only if they help the player read progress.

Derive values from the same tables and functions the game uses. Handle level zero, the current baseline, a locked restoration tier, maxed upgrades, and x10/x100/Max purchases. A bulk purchase preview must describe the final level that the actual purchase will reach.

Do not depend on hover alone. Keyboard focus and touch need the next-effect information before purchase. Probability copy must name its condition: Vowel rhythm applies after a consonant, and some letter-selection biases are evaluated after other biases. Do not describe a configured bias as an unconditional chance when the code does not implement one. If a trait, Muse, or challenge changes an effect, show its modifier nearby or clearly label the upgrade's contribution.

Apply the same current/next pattern to keeper speed, coaching, and other upgrade screens where it removes tier lists. Keep this pass limited to upgrade information and its layout.

Acceptance: displayed values match gameplay for base, middle, locked, and maximum levels. Purchase previews are readable on phones and with keyboard focus, and updating a card preserves the existing DOM patching behavior.

## PT-03: Build a required first-run opening

Use a persisted sequence that teaches actions through play. The opening can be required without freezing the game behind a large modal.

1. Start with Floor and essential menu/settings controls. Ask the player to type; show letters accumulating.
2. After the manual-typing threshold, reveal Train with a small unlock announcement. Teach hiring. Keep enough letters available to make that hire possible.
3. After the hire and a short further milestone, reveal Words and Titles together. Teach keepers first, then show how the current title progresses and how to sell it. Both pages can open at once while the coach presents one action at a time.
4. After the first sale, reveal Shop and demonstrate what bananas purchase. Completion should not require waiting to afford the second machine.
5. Introduce later departments through their existing earned milestones and short contextual explanations.

Do not require a title sale or library growth to open the pages needed to make that first sale. For later departments, preserve the distinction between authored-title gates and extra kids/library supply unless we intentionally change it.

Resolve the current keeper conflict explicitly. Recommended first-run behavior: the keeper remains owned, but its automatic letter consumption starts when Words and Titles are introduced. This gives the opening player a visible letter pile and avoids draining the currency needed for the first hire. Normal keeper controls take over afterward. Check this in the real game and in simulation.

Use progress milestones for page availability, with persisted onboarding progress for teaching and resume. A positive balance from a pickup, daily crate, or golden reward must not reveal Shop early. Queue optional rewards and distracting popups until the relevant part of the opening is taught.

First-time players cannot permanently skip required steps through Skip or Escape. Escape must retain a reasonable settings/menu exit. On reload, resume the unfinished action. Replays for experienced players can remain dismissible and should never hide their earned pages. Preserve existing saves and earned departments, including prestige runs; do not classify an experienced player solely by the absence of `imi-tour` or the old 200-letter shortcut. Reset must clear the matching introductory state.

Acceptance: a fresh player completes the sequence without a dead end, a forced long purchase wait, or unreadable coach marks. Reload at every step works. Old saves, edition switching, and a Second Printing retain valid access. Tips and daily rewards cannot fight the opening. The tutorial can recover if its target control temporarily disappears.

## PT-04: Make large values readable and migration deliberate

Choose a shared display policy for currency, counts, prices, income rates, and reward floaters. Recommended default: commas for small values, K/M/B/T suffixes with up to three significant digits, then scientific notation above the useful suffix range. Tiny income rates still need meaningful decimals. Provide exact values in accessible details where a purchase decision needs them.

Test boundaries such as 999, 999,999, and the switch to scientific notation, along with zero and very small rates. Rounded display values must never decide affordability. Where compact values obscure a near-equal balance and price, preserve a clear enabled/disabled state and exact details.

Define one monetary-scale policy and apply it once to each income or cost path. Inventory title pay, generated and persisted pitches, royalties, divisions and premieres, shop items, restoration, coaching, rerolls, garden costs, daily crates, combo banana rewards, golden rewards, prestige seed money, and banana thresholds. Royalty income derives from title pay, so scaling both title pay and its rate constant would multiply the effect twice.

If the chosen scale changes economic units, preserve old saves' purchasing power with a versioned, one-time migration. Convert the wallet, money-valued statistics, current-run earnings, and any persisted pay fields consistently. Counts, letters, words, levels, multipliers, and Legacy stars are not money and should not be multiplied. Convert monetary prestige thresholds and starting grants along with the economy so a rescale does not accidentally award extra stars.

Because the wallet and game save are separate, plan a recoverable write order and migration marker. Test interrupted migration, repeated reloads, missing or malformed records, and Pixel/Classic switching. Avoid a broad persistence rewrite; implement only what this conversion needs.

Acceptance: compact values fit both editions at the required sizes; savings and affordability agree; a planted old save migrates once and buys the equivalent things afterward. Numeric-range checks cover the planned progression. Scientific display does not by itself solve arithmetic precision; add a larger-number representation only if the measured range requires it.

## PT-05: Turn background bananas into small pickups

Use game-owned pickups that reuse the existing art adapters. Do not make every generic banana particle award money. Reward bursts and currency floaters already contain banana art, so collecting those could feed new rewards back into themselves. Remove or replace ambiguous noninteractive banana drifters during gameplay; leaves, motes, and other decoration can stay decorative. Menu decoration can remain separate.

Ordinary bananas should have a clear tap response and quieter appearance than golden bananas. Rotten bananas remain visually distinct hazards. Give ordinary pickups a usable touch target, a keyboard action, and a brief reward floater. Spawn only over visible background space; avoid the typewriter, purchase controls, reading panes, tutorial targets, and modal dialogs.

Start at 5 bananas as the owner suggested. For the first test, let the reward increase with saved visible playtime in small steps, and apply the chosen monetary scale when the economy is converted. Later pickups should also have a measured progress-based floor, such as a small number of seconds of sustained income. Keep temporary buffs and current wallet balance out of that calculation so spending or briefly triggering a buff does not produce erratic rewards.

Test two curves before fixing a formula: time-only growth, and time growth with an income or progression floor. Cap spawn frequency and simultaneous pickups; measure total pickup income across a session. They should be useful to catch while remaining a supplement to typing and publishing. Idle time with a closed game should not generate collectible rewards. `stats.secs` is a starting point for the timer, but currently counts visible runtime, including the title menu; use a clock that actually matches the chosen gameplay rule.

Low effects and reduced motion must preserve the reward opportunity. Offer a stationary or slower equivalent instead of deleting pickups with their decorative animation. Remove each pickup and its handlers/timers after collection, expiry, screen changes, reset, or a relevant transition. One pickup can pay once.

Acceptance: the initial reward is 5 in the initial economy; progression raises it visibly; it survives ordinary save/reload behavior; it cannot be collected twice or trigger an underlying action. Existing golden and rotten effects still work. A sustained-play check shows bounded elements and timers, and supported effects modes provide comparable opportunities.

## PT-06: Raise the banana scale, then tune progression

First compare a few paired income/cost scale candidates, for example x10, x25, and x100. A first 150-banana sale becomes 1,500, 3,750, or 15,000; scaling its target purchases equally retains their initial wait times. These are candidate experiments, not a recommendation to blindly multiply every value.

Then tune purchase cadence as a separate pass. Increase early rewards relative to selected early costs where the baseline shows a stall, and raise later cost growth where the new active rewards would otherwise skip meaningful purchases. The existing game already has escalating hire and upgrade costs; extend those deliberately instead of adding unrelated progression systems.

Evaluate held balance, cumulative earned bananas, visible payout size, time to the next purchase, and useful purchases per session. More digits should come from real economic amounts. Keep letter-cost training and recipe quantities in their own units initially. If that loop feels slow, tune production and its letter costs together as a separate measured change; inflating exact word recipes would undermine their purpose.

Include normal pickups, golden rewards, combo bonuses, daily crates, royalties, market timing, automation, offline caps/efficiency, and prestige in the audit. Extend the bot only for the interactions needed to compare this batch, and walk the remaining cases in the actual game. Neither a bot that catches everything nor one that never catches anything is enough by itself.

Acceptance: record final multi-seed results for active, idle, collect, and hoard profiles and the overnight-return scenario. Compare the same profiles, seeds, and session rules against PT-00. Explain changes to major milestones and existing saves. The first hour should deliver larger visible rewards and repeated useful decisions; later machines and prestige should retain agreed effort. Reconcile online and offline payouts using the game's intended efficiency rather than expecting them to be identical.

## PT-07: Deferred targeted-key experiment

Owner decision: revisit after the clarified keyboard has been playtested. The first question is whether the confusion disappears once the signals have distinct meanings. This packet is not required to complete the current batch.

If included, try one occasional, clearly marked bonus key with an adequate touch target. A successful direct press grants one small bonus, such as an extra needed letter or a limited combo extension. Keep ordinary typing useful and missing a bonus harmless. Separate this target visually from ingredient hints and the Golden Keys buff. A dedicated key action must consume its input once instead of also triggering the stage handler.

Freely choosing every missing letter would change the random-letter production loop and weaken several existing upgrades. Keep that out of the first prototype unless the owner deliberately chooses a larger redesign. Do not start the experiment during the mandatory opening or expose tiny precision targets on phones.

Acceptance: players recognize the target, explain its reward, and can collect it with touch or keyboard. Check reward frequency, letter completion speed, combo interactions, cooldowns, and Hold to type. Keep the mechanic only if playtesting shows it adds a useful action.

## PT-08: Verify the whole batch

Use the T3 collaborative preview for browser acceptance when available. Balance tooling remains a separate seeded simulation, with its external Puppeteer prerequisite checked before installing anything. There is no framework build or npm test script in this repository.

- Check both Pixel and Classic at 1280x800, 390x700, and 360x560. Confirm no page scroll or horizontal overflow, usable touch targets, visible focus, readable compact numbers, and coach marks that leave their target exposed.
- Walk a fresh save from Floor through its first sale and Shop. Repeat with reloads at introduction boundaries, menu/settings exits, low effects, and reduced motion.
- Exercise a mid-game save, an overnight return, a high-value save, edition switching, reset, and Second Printing. Verify migration and tutorial rules together.
- Check keyboard/stage inputs and pickups for duplicate actions, including rapid taps and held typing. Verify existing golden and rotten behavior alongside ordinary pickups.
- Run syntax checks for changed JavaScript and the relevant balance scenarios. Test bounded DOM/timer behavior during sustained play.
- Ask a new player to explain key highlights, an upgrade's current effect and next effect, the difference between banana types, and which action unlocks the next page. Watch whether they can act on those explanations without coaching.

Keep simulation, browser emulation, physical-device testing, and player feedback as distinct evidence. Physical-phone acceptance requires a real device; do not claim it from a resized browser. Update `BALANCE.md` with measured values and this file with completed packet IDs and remaining issues. A release is a later execution step when requested.

## Boundaries and implementation discipline

Keep both editions, the existing monkey/typewriter world, local saves, and the current plain HTML/CSS/JavaScript setup. Avoid unrelated restructuring, new dependencies, and a general dashboard redesign. Every added function, state field, and element should satisfy a named requirement above. Remove obsolete UI copy and contradictory conditions when replacing their behavior.

Task 09's historical Skip and immediate-Train requirements are superseded by this owner's new first-run direction. The earlier plan remains useful implementation context; these new requirements take priority for this batch. Future art integration gets its own plan after the other agent's deliverables are ready.


## Completed handoff

PT-00 through PT-06 are implemented. PT-08 automated and source acceptance is complete. PT-07 remains deferred by the owner; new-player comprehension and a real-device phone session are follow-up playtests.

- PT-00: preserved the pre-change runtime and captured twelve first-hour plus six overnight baselines. The runner reports actual duration and guard cuts honestly. See [baseline](playtest-baseline.md).
- PT-01: missing ingredients use blue underlines; gold fill belongs only to Golden Keys. The Key guide explains random typing, existing streak rewards and the two-letter buff. Hold stops on release, focus loss, screen and page changes.
- PT-02: cards show the current effect, a quiet next/bulk result, and native expandable How it works. Configured biases keep their conditional explanations. Keeper speed and coaching show current/next effects too.
- PT-03: first-run introduction is required. Train opens at 25 manual taps, the first hire costs 100 letters with keeper consumption held back, and Words plus Titles open ten manual taps after hiring. The first sale opens Shop. Experienced old saves stay experienced; Replay is dismissible and Second Printing retains learned pages. Title-filter recovery and resize-aware coach scrolling keep the first sale reachable.
- PT-04: Economy owns real x25 monetary units, compact K/M/B/T/Qa values and scientific notation. Exact values remain available on prices and HUD. Independently versioned wallet/game records convert old monetary fields once, preserving counts, stars, books and typists; a raw backup is retained. Five storage/format tests cover repeated and interrupted conversion.
- PT-05: ordinary room bananas start at 125 in the new units (the proposed five old units). Every ten minutes of visible gameplay adds another 125; a floor of two seconds of sustained royalties/division income keeps late catches useful. Only Floor spawns them after the introduction, at most one at once, for 14 seconds every 40-60 seconds. They avoid controls, offer 48px touch/keyboard targets, stay stationary for low/reduced effects and cannot pay twice. Screen/page/reset/printing transitions clear them; offline time creates no catches.
- PT-06: machine prices are 0, 75K, 750K, 9.375M, 125M and 1.5625B. Monetary income, rewards, other costs and prestige thresholds scale consistently; training still spends letters. The separate higher machine prices preserve meaningful waits. Compare held and earned amounts in [measured results](playtest-results.md).
- PT-08: independent source review resolved its material findings. Browser checks cover the required sequence, reload, hidden ready-title recovery, keyboard Hold, banana collection, stale callbacks, reset, Second Printing, both editions at 1280x800/390x700/360x560, and a scientific-notation HUD. See [browser acceptance](playtest-evidence/browser-acceptance.json), [normal-effects pickup acceptance](playtest-evidence/pickup-acceptance.json), [offline/edition migration acceptance](playtest-evidence/offline-acceptance.json) and [screenshots](playtest-evidence/screens/).

The T3 preview was used first. It later explicitly reported no automation host; final acceptance used the already-installed Puppeteer/Chrome fallback against an isolated local server. No dependency was installed. Screenshots and resized browser geometry are browser evidence, not physical-phone or new-player evidence. The temporary acceptance drivers remain at `%TEMP%/monkeyos-playtest-acceptance.mjs`, `%TEMP%/monkeyos-playtest-pickups.mjs`, and `%TEMP%/monkeyos-playtest-offline.mjs`. The former passed 23 checks; the latter passed nine, including real keyboard Enter collection, bounded repeated catches, 14-second expiry, old-pickup rejection across prestige, the 25K Seed Money grant and the scaled 1.25K existing 100-tap reward. Expanding upgrade details also repositions the coach promptly. Four additional browser checks confirm the v6 offline shell contains the new assets, an actual legacy save converts wallet 2,000 to 50,000 and run earnings 500,000 to 12.5M while retaining one star, and Classic boots offline without converting the save again.

Both large-number and monetary migration tests pass. A 1e21 display fixture demonstrates layout and RAF convergence; the game continues to use JavaScript Number, so exact single-banana integer precision above Number.MAX_SAFE_INTEGER is not a promise of this batch. Measured gameplay values remain well below that range.
