# Playtest comparison, 7 October 2026

The implementation-selected candidate uses 25 bananas for every old monetary unit, a 100-letter first Bamboo hire, and a required opening that starts keeper consumption only after hiring and ten further manual taps. Nominal machine prices are `0, 3000, 30000, 375000, 5000000, 62500000`, multiplied by 25 for real prices. Other audited monetary paths use the shared scale. The second machine therefore costs **75,000**, an intentional retune from the unit-equivalent old price of 50,000.

Results compare with [the preserved PT-00 baseline](playtest-baseline.md). Dividing candidate amounts by 25 makes the units comparable; it does not remove the new introduction, hire-cost change, changed decisions, or deliberate machine-price increases. The updated bot was rerun on the preserved baseline for active/collect seed 1 and exactly reproduced its milestone sequence, held 22,895 bananas, earned 59,145, and desk letter totals 872 / 367. That check separates reporting changes from economy changes.

## Source and profile identity

The base commit is `090e1d2143f8eef5df992bd42e59d7f2169b94c5`; candidate reports come from the dirty working tree on `http://127.0.0.1:8137/tools/balance.html`, with the corrected archive pair using the same working tree on port 8139. Every candidate report records the SHA-256 of its actual loaded `ops.js`, `economy.js`, `world.js`, bot, and harness. UI and cleanup changes produced several ops hashes during collection: upgrade explanations in native details, compact Words counts, Legacy threshold text, and printing/reset cleanup. The implementation owner confirmed no monetary constants, timing, or pickup formula changed after accepting the candidate. Raw files retain those distinct hashes.

Seeds are 1, 2, and 3. Standard active profiles tap for 30 minutes and then let typists work for 30. Idle profiles tap once per second through the first hire and the required ten post-hire taps, then stop. Both continue the same selling, training, and buying policy as baseline. Collect leaves keepers on; hoard pauses at half the next hire or Quick fingers cost. Training keeps the same 20-letter reserve.

Every standard first-hour report completed 60 actual minutes with no errors. Values separated by slashes are seed 1 / seed 2 / seed 3; milestone times are minutes. `>60` means not reached within the measured window.

## First hour without optional rewards

| Profile / strategy | Train visible | First hire | Words and Titles visible | First word | First sale | Hold | Second machine |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Active / collect | 0.2 / 0.2 / 0.2 | 0.7 / 0.7 / 0.7 | 0.7 / 0.7 / 0.7 | 0.8 / 0.8 / 0.8 | 1.1 / 1.1 / 1.1 | 2.8 / 2.4 / 2.5 | 13.7 / 13.8 / 15.5 |
| Active / hoard | 0.2 / 0.2 / 0.2 | 0.7 / 0.7 / 0.7 | 0.7 / 0.7 / 0.7 | 0.8 / 0.8 / 0.8 | 1.1 / 1.1 / 1.1 | 2.9 / 2.5 / 2.9 | 16.8 / 14.9 / 17.3 |
| Idle / collect | 0.4 / 0.4 / 0.4 | 2.0 / 2.0 / 2.0 | 2.2 / 2.2 / 2.2 | 2.2 / 2.2 / 2.2 | 3.2 / 3.0 / 3.1 | 11.7 / 7.6 / 11.8 | >60 / >60 / >60 |
| Idle / hoard | 0.4 / 0.4 / 0.4 | 2.0 / 2.0 / 2.0 | 2.2 / 2.2 / 2.2 | 2.2 / 2.2 / 2.2 | 3.2 / 3.0 / 3.1 | 11.7 / 7.6 / 11.8 | >60 / >60 / >60 |

All twelve runs finished the introduction and recorded zero pickup or golden-catch income. Each idle run made exactly 130 manual taps, 120 through the hire plus ten required afterward. No first sale preceded hiring, unlike two baseline active/collect seeds. Casual first hire improved from 4.5-6.1 minutes to 2.0, and first sale from 4.5-4.6 to 3.0-3.2. The faster active bot reaches those events earlier than the proposed casual-player targets.

Active second-machine waits increased from baseline 9.8-12.6 minutes collecting and 12.1-14.2 hoarding. The selected 13.7-17.3 minute window adds a purchase wait after the faster opening. No standard idle seed bought the second machine by the first hour; baseline idle bought it in three of the six runs. The later idle measurement below is needed to assess that deliberate price increase beyond the first hour.

| Profile / strategy | Real held bananas at 60m | Real cumulative earned bananas | Held divided by 25 | Earned divided by 25 | Typists | Letters held |
| --- | --- | --- | --- | --- | --- | --- |
| Active / collect | 229,525 / 538,450 / 289,050 | 1,160,775 / 1,094,700 / 1,220,300 | 9,181 / 21,538 / 11,562 | 46,431 / 43,788 / 48,812 | 17 / 15 / 17 | 2,153 / 2,049 / 2,311 |
| Active / hoard | 428,200 / 406,050 / 425,175 | 984,450 / 962,300 / 856,425 | 17,128 / 16,242 / 17,007 | 39,378 / 38,492 / 34,257 | 20 / 21 / 21 | 23,067 / 24,956 / 19,806 |
| Idle / collect | 41,600 / 66,675 / 46,775 | 69,200 / 94,275 / 74,375 | 1,664 / 2,667 / 1,871 | 2,768 / 3,771 / 2,975 | 1 / 1 / 1 | 43 / 92 / 25 |
| Idle / hoard | 41,600 / 71,725 / 46,775 | 69,200 / 99,325 / 74,375 | 1,664 / 2,869 / 1,871 | 2,768 / 3,973 / 2,975 | 1 / 2 / 1 | 43 / 40 / 25 |

The larger displayed amounts come from real units. Normalized active/collect earnings are lower than baseline's 54,439-59,145, while normalized active/hoard earnings overlap baseline's 35,392-40,207. The new collecting runs sold 156-166 kids' titles and 3-6 library stories, compared with baseline 65-87 kids' titles and 29-40 library stories. This is a changed production and spending trajectory, not a uniform speed increase caused by more digits. Authored/pitched progression sales remained ten active and six idle at the first-hour endpoint. Third machine, publisher, division, and prestige star were not reached in the standard first-hour runs.

## Measurement limits

The seeded harness exercises the real economy with Classic bridge stubs and virtual time. It does not establish Pixel/Classic rendering, touch or keyboard acceptance, physical-device behavior, new-player comprehension, or save migration. Those require separate acceptance evidence.

Standard runs include manual presses and any combo rewards reached by the batching policy, typists and traits/XP, keepers, title sales at the automatic market, pitches, royalties, shop purchases, restoration, and available divisions. They omit ordinary and golden/rotten collection, daily crates, Muses, garden interaction, deliberate market timing, challenges, prestige action, manual word banking, and interactive coaching. The default bot does not buy the publisher unless the publisher policy is requested, so an absent publisher milestone is a policy omission. Optional reward scenarios and offline progress are reported separately below.

The runner records requested and actual duration, stop reason, errors, and final state. Failed startup asset requests were retried from fresh pages. Only complete standard reports with no recorded runtime or failed-request errors appear in these tables. Earlier reports did not separately capture HTTP error responses; the archive omission and corrected evidence are described below. A partial guarded late run supplies evidence only through its actual endpoint. Base-income `passiveWaitMin` is a stationary passive-only estimate; actual purchase waits are milestone times.

## Overnight return, same session rules

All six runs completed 15 active minutes, 480 minutes away, and 30 active minutes after return without errors. The real offline simulation counted 120 minutes at 40% effort because no Night Lamp had been bought when closing. Divisions and the publisher were absent at close, so neither paid offline. Optional pickups and golden catches were disabled. The virtual clock skipped the closed interval without executing online timers.

| Strategy / seed | Offline letters | Offline keeper words | Offline royalties, real units | Royalties divided by 25 | Wallet on return | Wallet after 30m return | Total earned after return | Earned divided by 25 | Typists after return |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Collect / 1 | 17,633 | 26 | 4,450 | 178 | 57,575 | 462,100 | 893,350 | 35,734 | 21 |
| Collect / 2 | 12,554 | 1 | 1,775 | 71 | 5,875 | 411,550 | 967,800 | 38,712 | 21 |
| Collect / 3 | 15,644 | 14 | 1,675 | 67 | 71,150 | 479,400 | 910,650 | 36,426 | 20 |
| Hoard / 1 | 25,394 | 0 | 1,600 | 64 | 60,450 | 450,450 | 881,700 | 35,268 | 19 |
| Hoard / 2 | 26,513 | 29 | 1,675 | 67 | 4,175 | 371,600 | 802,850 | 32,114 | 20 |
| Hoard / 3 | 24,307 | 38 | 1,550 | 62 | 62,800 | 379,675 | 810,925 | 32,437 | 19 |

Collect returned with one ready title in every seed. Hoard returned with zero / one / one, reflecting its keeper on/off state at close. The paused keeper in hoard seed 1 remained paused for the whole closed interval, so no words were banked. Closed time did not run the bot's sales, purchases, or resume decisions.

The faster, cheaper opening produced more typists before closing and more offline letters than baseline, which produced 8,073-9,070 collecting and 12,531-16,955 hoarding. It did not produce a matching multiplication of offline royalties: normalized collect royalties are 178 / 71 / 67 versus baseline 738 / 569 / 675, because less valuable supply had been published before close. After the return session, normalized cumulative earnings are 35,734-38,712 collecting versus baseline 40,783-52,505, and 32,114-35,268 hoarding versus baseline 28,906-32,590.

No third machine was bought during these 45 online minutes. The second machine arrived at online minute 13.7 / 13.8 / 15.0 collecting and 20.8 / 14.9 / 16.1 hoarding. Final held letters were 37,324 / 10,035 / 28,053 collecting and 79,006 / 82,638 / 72,415 hoarding. The return creates useful letter-spending opportunities even when the cash wallet is small.

The harness's first online tick after `__skip` has the game's clamped delta, so its measured `playSecs` ends near 2700.2 rather than exactly 2700. This is a 0.2-second clock-reset artifact in the fixture, present in both comparison protocols. It is not eight hours of eligible pickup growth. Optional pickups are disabled in these return runs.

## Optional pickup and golden budgets

These are additional active/collect seed-1 policies, with the same first-30-minute tapping rule and full 60-minute duration. The ordinary pickup API uses the real game reward formula and statistics. Its simulated awards are a collection schedule. Browser spawn placement and collection were checked separately by the implementation agent. Fifty seconds models aggressive full collection; sixty seconds models a slightly less frequent schedule. These one-seed checks establish a bounded measured budget, not a distribution over all players.

| Policy | Ordinary catches | Ordinary income | Ordinary share of run earnings | Golden catches | Second machine | Held bananas at 60m | Total earned at 60m |
| --- | --- | --- | --- | --- | --- | --- | --- |
| No optional collection | 0 | 0 | 0% | 0 | 13.7 | 229,525 | 1,160,775 |
| Ordinary every 60s | 59 | 26,500 | 2.39% | 0 | 13.4 | 550,775 | 1,107,025 |
| Ordinary every 50s | 71 | 31,750 | 2.95% | 0 | 13.4 | 520,000 | 1,076,250 |
| Ordinary every 60s plus golden checks every 5s | 59 | 26,500 | 2.21% | 33 | 13.0 | 266,550 | 1,197,800 |

Pickup statistics recorded by the bot match `S.stats.pickups` and `pickupEarned` in every scenario. The 60-second schedule pays 1,060 old units over the hour; aggressive collection pays 1,270. Both shortened the second-machine wait by 0.3 minutes in this seed. Total earnings need not rise by the direct pickup amount: earlier purchases alter crews, focus choices, later sales, and the seeded random sequence. The observed donation share remains below 3% of earned bananas.

The golden scenario collects only existing nonrotten buttons and does not manufacture spawn opportunities. It paid 107,575 direct golden bananas in addition to buffs and word/letter gifts, as reconciled from earned total minus title lump payouts, royalties, divisions, and ordinary pickups. Rotten catches remain omitted. Golden word gifts are excluded from the keeper-consumption counter.

## Combo cadence limitation

The existing bot batches its presses once per second. The real manual press hook calls the combo engine, but the gap between batches exceeds the 650ms continuity window. These policies do not exercise continuous 100-tap banana bonuses or repeated deliberate streak resets. The standard first-hour earnings reconcile entirely to title sales plus royalties, with no direct combo payout. This limitation applies to the preserved baseline as well as the candidate. Continuous typing and its monetary rewards require separate browser or targeted simulation evidence; these tables do not claim that coverage.

## Longer windows and archive correction

The first late runs used the existing `/tools/balance.html` fixture, where ops requested `library/books.json` and `library/archives.json` relative to `/tools/`. Those requests returned 404. The original runner's `errors` field captured page exceptions and failed requests, not HTTP status responses, so an empty field did not establish successful archive loading. Division caps fell back to 600 and income factors to the number of completed works. The real indexes contain 600 works per division but weight income by each manuscript's length, clamped from 0.7 to 1.4 times the division average. For example, the first song's factor is approximately 0.9325, and the first two songs sum to 1.6927 rather than the fallback 2. These reports remain preserved and should be read as fallback-archive evidence.

| Original fixture policy / seed | Requested online minutes | Actual online minutes | Stop | Third machine | First division | First star | Held bananas | Earned bananas | Candidate earned divided by 25 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline active / collect / 1 | 480 | 207.03 | Guard | 64.3 | 165.0 | 205.7 | 40,395 | 504,390 | n/a |
| Baseline active / collect / 2 | 480 | 225.83 | Guard | 70.5 | 152.2 | 200.2 | 111,468 | 615,463 | n/a |
| Candidate active / collect / 1 | 205 | 166.58 | Guard | 99.9 | 163.2 | Not reached | 726,125 | 9,026,000 | 361,040 |
| Candidate active / collect / 2 | 205 | 167.90 | Guard | 103.0 | Not reached | Not reached | 2,449,650 | 7,749,525 | 309,981 |
| Baseline idle / collect / 1 | 240 | 240.00 | Complete | 170.5 | Not reached | Not reached | 102,711 | 268,706 | n/a |
| Candidate idle / collect / 1 | 240 | 240.00 | Complete | 198.6 | Not reached | Not reached | 1,338,175 | 4,850,725 | 194,029 |

The complete idle measurement puts the second machine at 84.3 minutes versus baseline 62.0, and the third at 198.6 versus 170.5. It confirms eventual passive progression under this policy while showing the longer purchase waits. Neither idle run started a division, so the archive fallback did not affect its measured income. Guarded active runs are not 205- or 480-minute results; their endpoints and first-star absences refer only to actual measured time. The baseline star times above are fallback timings and are not a corrected prediction for the game.

The harness was then corrected to root the two archive fetches at `/library/`. The identical harness-only correction was applied to the preserved baseline fixture; baseline ops and archive data were unchanged. Earlier raw reports were not rewritten. The runner now records HTTP errors separately and hashes loaded index bodies. One paired seed-1 active/collect replay, tapping for the first 30 minutes with no optional rewards, completed 180 minutes in each runtime with no runtime, failed-request, or HTTP errors. Both loaded identical books and archive index hashes.

| Corrected archive metric, seed 1 | Baseline | Candidate, real units | Candidate divided by 25 where monetary |
| --- | --- | --- | --- |
| Requested / actual online minutes | 180 / 180 | 180 / 180 | n/a |
| Wall duration | 165.5 seconds | 161.8 seconds | n/a |
| Second machine | 9.8 minutes | 13.7 minutes | n/a |
| Third machine | 64.3 minutes | 99.9 minutes | n/a |
| First division | 165.0 minutes | 163.2 minutes | n/a |
| First star | Not reached by 180m | Not reached by 180m | n/a |
| Held bananas | 73,357 | 1,693,575 | 67,743 |
| Cumulative earned bananas | 399,352 | 9,993,450 | 399,738 |
| Title lump payouts | 361,357 | 9,144,475 | 365,779 |
| Cumulative royalties | 27,131 | 468,378 | 18,735.12 |
| Cumulative division income | 10,864 | 380,597 | 15,223.88 |
| Current royalties per second | 5.302 | 128.287 | 5.13148 |
| Current division income per second | 11.995 | 376.973 | 15.07892 |
| Typists / Quick fingers levels | 27 / 59 | 26 / 59 | n/a |
| Keeper words banked during run | 14,582 | 20,830 | n/a |
| Letters held by Bamboo / Rose / Blue | 776,388 / 76,527 / 26 | 696,097 / 56,342 / 40 | n/a |

At this matched endpoint, normalized cumulative earnings are almost equal despite the candidate's later third-machine purchase and different mix of title, royalty, and division income. This is one seeded policy, not evidence that all late trajectories converge. The fourth machine and first star were not reached in the corrected window, and no corrected full prestige cycle was measured. The eighteen essential first-hour/overnight reports had no divisions at their endpoints or at close, so their monetary results do not depend on the missing archive indexes.

## Reproduction and evidence

The preserved baseline directory and original source hashes are recorded in [baseline-manifest.json](playtest-evidence/baseline-manifest.json). The final configuration, per-report completion state, loaded source identities, archive-fixture version, and comparison limitations are recorded in [final-manifest.json](playtest-evidence/final-manifest.json). Every raw report retains its exact profile, seed, requested and actual duration, optional-reward cadence, and omissions.

Using the existing external Puppeteer installation, the corrected pair was run serially with `GUARD=240` and `PUPPETEER_MODULE=C:\Users\arran\AppData\Local\Temp\pp\node_modules\puppeteer-core\lib\puppeteer\puppeteer-core.js`. The command shape is `node tools/balance.mjs 180 active collect 1 30 '{}' --url <fixture URL> --commit 090e1d2143f8eef5df992bd42e59d7f2169b94c5 --output <report path>`, using port 8139 for current and 8136 for preserved baseline. Optional schedules use `BALANCE_TUNE` JSON with `BOT_PICKUP_EVERY` and, when requested, `BOT_GOLD_EVERY`. No dependency was added, and these simulations did not deploy or commit the working tree.
