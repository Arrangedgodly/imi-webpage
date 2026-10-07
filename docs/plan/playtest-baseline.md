# Playtest baseline, 7 October 2026

PT-00 records the economy before the Brother playtest changes. Source commit is `090e1d2143f8eef5df992bd42e59d7f2169b94c5`. The saved runtime is `C:\Users\arran\AppData\Local\Temp\monkeyos-pt00-baseline-20261007-104001`. Its `ops.js` Git blob is `1bea925b88d666886e9a8532d884ca4e29dca643`, identical to that commit. Runtime SHA-256 values and existing external tool versions are in [the manifest](playtest-evidence/baseline-manifest.json).

Only the simulation harness changed in the snapshot. The bot records more detail, and the virtual clock has `__skip` to move the clock across offline time without running online timers. No art, manuscripts, dependencies, commits, or deployments were added. `gemini-art/` was excluded.

## Session rules

Every normal first-hour run starts fresh, requests 60 online minutes, uses default knobs `{}`, and uses seed 1, 2, or 3. Active taps three times per second, then the purchased Hold rate, for the first 30 minutes and lets typists work for the remaining 30. Idle taps once per second until the first typist and then stops tapping. Both profiles continue the existing bot's sales and buying policy each second. Collect keeps keepers on. Hoard pauses a keeper once held letters reach half the next hire or Quick fingers cost. The bot requires a 20-letter reserve when buying training.

Each first-hour report completed all 60 minutes without a simulation exception. Tables list seed 1 / seed 2 / seed 3, in that order. Milestone times are minutes, rounded to one decimal. `>60` means not reached by the measured endpoint.

| Profile / strategy | First word | First hire | First sale | Hold | Second machine |
| --- | --- | --- | --- | --- | --- |
| Active / collect | 0.1 / 0.1 / 0.1 | 1.5 / 2.0 / 2.1 | 1.6 / 1.5 / 1.2 | 3.0 / 3.2 / 2.8 | 9.8 / 12.6 / 11.9 |
| Active / hoard | 0.1 / 0.1 / 0.1 | 1.5 / 1.5 / 1.5 | 1.6 / 1.6 / 1.6 | 3.8 / 3.2 / 2.9 | 14.2 / 13.5 / 12.1 |
| Idle / collect | 0.1 / 0.2 / 0.1 | 4.5 / 6.1 / 4.6 | 4.6 / 4.6 / 4.6 | 13.9 / 16.2 / 8.0 | >60 / >60 / 44.5 |
| Idle / hoard | 0.1 / 0.2 / 0.1 | 4.5 / 4.5 / 4.5 | 4.6 / 4.5 / 4.6 | 13.9 / 12.6 / 12.9 | >60 / 47.0 / 57.6 |

Third machine, publisher purchase, first division, and first prestige star were not reached in any first-hour run. The default bot does not purchase the publisher unless `BOT_SELL: "pub"` is requested, so publisher timing is a policy omission rather than evidence of an inaccessible feature.

| Profile / strategy | Held bananas at 60m | Earned bananas at 60m | Letters held across desks | Typists | Letters consumed by keepers |
| --- | --- | --- | --- | --- | --- |
| Active / collect | 22,895 / 18,189 / 19,579 | 59,145 / 54,439 / 55,829 | 1,239 / 1,426 / 1,020 | 12 / 13 / 13 | 18,729 / 19,504 / 18,000 |
| Active / hoard | 19,142 / 17,438 / 18,957 | 35,392 / 38,688 / 40,207 | 1,896 / 6,140 / 4,629 | 16 / 16 / 16 | 19,077 / 19,081 / 19,490 |
| Idle / collect | 1,946 / 1,885 / 2,210 | 2,726 / 2,665 / 6,497 | 25 / 58 / 537 | 1 / 1 / 4 | 2,461 / 2,331 / 2,606 |
| Idle / hoard | 1,946 / 1,420 / 130 | 2,726 / 8,207 / 2,910 | 25 / 59 / 63 | 1 / 4 / 2 | 2,461 / 2,563 / 2,565 |

A small wallet does not mean little income. Idle/hoard seed 3 held only 130 bananas after buying a second machine, while active/collect seed 1 earned 59,145 but held 22,895. Active hoarding increased crew to 16 in every seed, with lower cumulative earnings than collecting. The first sale preceded the first hire in two active/collect seeds. That is direct evidence that the original keeper can consume training currency during the opening.

Raw reports are [in the evidence folder](playtest-evidence/). Each includes per-desk letter totals, keeper on/off state and upgrade level, cumulative words and keeper letter consumption, all sales versus progression-counted sales, held and earned bananas, training deficits, and the next machine price and deficit. `passiveWaitMin` divides that deficit by the current base royalty plus division rate. It is a stationary passive-only estimate; it excludes future title sales, market movement, purchases, and buffs. Actual machine waits come from milestone times.

## Overnight and longer runs

Required overnight policy is 15 active minutes, then 480 minutes away, then 30 active minutes after returning, with the same seeds and collect/hoard strategies. It calls the real `IMI.ops.simulateAway`, uses the real away cap and efficiency, and does no buying or tapping during the closed interval. Online milestone minutes exclude the closed interval; snapshots also record total elapsed minutes. Exact offline counted seconds, typed letters, banked words, royalties, division income, assistant sales, and ready titles are preserved before and after the return. Completed results follow below.

Active longer runs request 480 online minutes with the same first-30-minute active rule. One idle run requests 240 minutes. They have a wall-clock guard and may stop early. Their JSON records actual minutes, completeness, the stop reason, and a final snapshot. A guarded run is usable up to its actual endpoint and provides no evidence for later milestones.

## Tooling checks and limits

`node --check tools/balance.mjs` and `node --check tools/bot.js` pass. A deliberate three-second guard check requested 480 minutes and recorded **6.2 actual minutes**, `complete: false`, and exit status 1. It retained the final partial state instead of claiming eight hours. The runner checks between one-minute chunks and can interrupt an expensive chunk through Chrome's runtime protocol.

Several concurrent browser starts initially failed to load the bot or an asset. Those reports were retried; all twelve first-hour reports now have `complete: true` and an empty `errors` list. The runner captures failed asset requests and waits for bot readiness outside the virtual timers. Wall duration varies with concurrent load and is not an economy metric.

Included systems are real manual presses and combo rewards, typists and their traits/XP, keepers and their upgrades, title sales at the current market, pitches, royalty income, divisions, shop purchases, restoration, and offline caps/efficiency. Ordinary pickup and golden/rotten catching, daily crates, Muses, garden interaction, deliberate market timing, challenges, prestige action, manual word banking, and interactive onboarding are omitted. Generated weather and automatic market changes remain active. The harness uses a Classic bridge; these results do not establish either edition's layout, touch behavior, or player comprehension. No claim is made that omitted systems improve progression by a fixed percentage.

## Overnight measurements

All six overnight reports completed 15 + 30 online minutes and the 480-minute closed interval. Each had no Night Lamp when closing, so the intended cap counted **120 minutes at base 40% effort**. The other six hours produced no extra simulated work. Divisions and the publisher were absent, so offline division income and assistant sales were zero.

| Strategy / seed | Offline letters | Offline keeper words | Offline royalties | Wallet before close | Wallet on return | Wallet after 30m return | Cumulative earned after return | Typists after return |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Collect / 1 | 8,073 | 23 | 738 | 7,203 | 7,941 | 16,255 | 52,505 | 20 |
| Collect / 2 | 8,475 | 5 | 569 | 3,890 | 4,459 | 19,533 | 40,783 | 19 |
| Collect / 3 | 9,070 | 6 | 675 | 7,869 | 8,544 | 8,737 | 44,987 | 20 |
| Hoard / 1 | 15,901 | 0 | 52 | 310 | 362 | 12,656 | 28,906 | 19 |
| Hoard / 2 | 12,531 | 0 | 56 | 20 | 76 | 16,340 | 32,590 | 19 |
| Hoard / 3 | 16,955 | 0 | 49 | 219 | 268 | 15,258 | 31,508 | 21 |

Collect returned with one ready title in every seed. Hoard returned with none and banked no words while closed because its keepers were paused when the session ended. Letter totals after the 30-minute return were 4,713 / 2,937 / 2,503 for collect and 8,558 / 6,698 / 8,320 for hoard. A closed session cannot execute the bot's purchase, sale, or resume policy; paused keepers stay paused until return. These outcomes distinguish offline rules from ordinary online idling.

The original training snapshot fields represent the last policy check, and can retain a purchased or maxed plan in longer runs. Treat per-desk `letters` as the authoritative held-letter snapshot in those files. The subsequent bot reporting fix clears completed plans and recomputes held letters and deficits at capture. This fix changes reporting only, with no effect on typing, purchasing, RNG consumption, or milestones.

## Longer measured windows

| Profile / strategy / seed | Requested online minutes | Actual online minutes | Complete | Second machine | Third machine | First division | First prestige star | Held bananas at measured end | Earned bananas at measured end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Active / collect / 1 | 480 | 207.03 | No, 240s guard | 9.8 | 64.3 | 165.0 | 205.7 | 40,395 | 504,390 |
| Active / collect / 2 | 480 | 225.83 | No, 240s guard | 12.6 | 70.5 | 152.2 | 200.2 | 111,468 | 615,463 |
| Idle / collect / 1 | 240 | 240.00 | Yes | 62.0 | 170.5 | >240 | >240 | 102,711 | 268,706 |

None bought the fourth machine in the measured window. The active runs demonstrate the first division and star at around 2.5-3.4 hours; they provide no eight-hour evidence. The idle run demonstrates the third machine at 170.5 minutes and neither division nor star by four hours. The stopped active queue was not resumed merely to produce an eight-hour label. No further baseline simulations remain queued.

After those windows, held letters totalled 1,138,276 / 1,189,549 in the active runs and 582,972 idle. Those inventories show that late Bamboo and Hibiscus letter supply can greatly exceed spending after their training priorities finish. Increasing banana income does not resolve Lagoon's separate letter costs; the idle run ended with just 88 letters on that desk.

## Handoff for paired comparisons

Run the updated CLI against a separate live-game URL, retain the same seeds and profiles, and label additional reward policies explicitly. `--url`, `--output`, and `--commit` record the source and raw evidence. `--session 15 --away 480` with 45 requested minutes repeats the required overnight scenario.

The bot now respects department availability. On the new introduction it makes the required ten manual taps after hiring even in the idle profile, then stops manual typing. It marks `train_visible` and `words_titles_visible`; after the first sale makes Shop available it models finishing the coach through the game's existing completion hook. This is a simulation convention, not evidence that a user can follow the coach.

`BOT_PICKUP_EVERY` is zero by default. Values of 60 or 50 seconds model explicit ordinary-pickup collection schedules through `IMI.ops.pickup.eligible/value/collect`, recording count and income. The bot temporarily selects Floor for that collection attempt. These scheduled awards model the reward budget; they do not prove that physical pickups spawn in reachable positions. `BOT_GOLD_EVERY` is zero by default; a positive cadence checks only existing nonrotten golden buttons. Golden word gifts are excluded from keeper letter consumption. Run zero-collection and scheduled-collection policies separately. Both syntax checks pass; these optional pickup hooks await the finished game's API for functional verification.
