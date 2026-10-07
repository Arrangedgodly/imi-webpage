# 12: More typist upgrade tiers, plus coaching and rerolls for individual monkeys

**Read `README.md` first.** Size: L. Depends on 10 only for the Shop pattern. Independent of 11 and 13.

## Why

Typist upgrades stop early: the five "tier" upgrades (`vowel`, `ink`, `practice`, `stock`, `ribbon`) end at level 3 and `fing` at 10, all bought with letters and applying to the whole desk. Every hired monkey is a one-off roll (a trait and a hat) that never changes, so a late crew feels fixed. The owner wants more upgrade headroom and **per-monkey** upgrades and rerolls: small percentage bonuses on top of the monkey's initial roll.

## Part A: more tiers (desk-wide, letters)

- The five tiered upgrades go from 3 to 5 levels. Levels 4 and 5 need the desk to be restored (**Mk II** for level 4, **Mk III** for level 5, `d.mk`), which gives the Restoration purchase a second job. Costs continue the `TIER` table (add two entries, about x4 each).
- Level effects (extend the descriptions in `UPS`): `vowel` 45/65/80 then 88/92 %; `ink` 25/45/65 then 78/88 %; `practice` 75/85/95 then 97/98 % (base 65 %, capped at .98 in `roll`); `stock` 20/40/60 then 72/80 %; `ribbon` 10/20/30 then 38/45 %. `fing` stays 10 levels but its step stays 0.85 per level.
- `upMax` becomes `u.tier ? (d.mk >= 2 ? 5 : d.mk >= 1 ? 4 : 3) : u.max`; the card says what unlocks the next level.

## Part B: a roll stat on every monkey

- New hires get a hidden-then-shown **talent**: `t.talent`, an integer 0-12 meaning +0 to +12 % typing speed, rolled with a skew toward the middle (sum of two dice). `typistSpeed` multiplies by `1 + talent/100`. Existing typists (old saves) get talent 0 and keep their trait.
- **Coaching:** per monkey, up to `COACH_MAX = 10` levels, each **+2 %** speed on top of the talent (built as +2 %, not +1 %: one monkey of twelve at +1 % is worth about +0.08 % of a machine, not worth a purchase). Cost in bananas: `COACH_BASE[desk] * 1.35 ^ level` with `COACH_BASE = [18, 215, 2700, 33500, 4.2e5, 5e6]` (all ten levels of one monkey cost about half the next machine).
- **Reroll:** per monkey, re-rolls **talent and trait** (not name, hat, xp, level, shiny status). Costs bananas, `REROLL_BASE[desk] * 1.5 ^ rerolls` (counter saved per monkey), `REROLL_BASE = [20, 250, 3000, 38000, 5e5, 5.6e6]`. The previous roll is shown for one confirm step ("Keep the old roll?") so a bad reroll can be undone once.
- Coaching is **kept** across rerolls (the monkey is trained, the dice are not), which makes rerolling a trait a safe thing to do late.
- **UI:** the Train page crew cards gain a line `Talent +7% · Coached +3%` and two small buttons, **Coach** and **Reroll**, with prices. Pixel and classic, phone first (buttons min 40 px high). The crew card is already busy: collapse the new controls into an expandable row if it does not fit.
- `simulateAway` and `autoRate` must include talent and coaching (single helper `typistSpeed`).

## Files

`ops.js` (`UPS`, `TIER`, `upMax`, `newTypist`, `typistSpeed`, crew card in `renderTraining`, actions `coach` / `reroll`, `simulateAway`), `ops.css`, `tools/bot.js`, `BALANCE.md`.

## Acceptance

- Old saves load (talent 0, no coaching) and play identically. Offline progress agrees with live play (compare `autoRate` against `simulateAway` letters for a crew with talent and coaching).
- Balance bot: report the effect of unlocking tiers 4-5 and of the bot coaching its crew; milestones must stay inside targets, retune costs not the base rates. A fully coached, well-rolled crew should be at most about +40 % over an unrolled one.
- Both art styles, phone first.

## Status

Done. Train page: tiered upgrades run to level 5 (levels 4 and 5 locked behind Mk II / Mk III, with the reason shown on the card); every crew card shows `Talent +n%` and `Coached +n%` chips with **Coach** and **Reroll** buttons (and **Undo** after a reroll).

## Handoff notes

- Typist fields (all optional, old saves read them as 0): `talent` (0-12, two dice at hire), `coach` (0-10), `rerolls`, `prev` (the previous `{trait, talent}`, kept for one undo). `typistSpeed` multiplies by `1 + (talent + coach * COACH_STEP) / 100`; `simulateAway` uses the same factor (checked: offline letters x1.199 against the expected x1.2 for talent 10 + coaching 5). `coachTypist`, `rerollTypist` and `unrollTypist` are the three actions (bananas via `bananas.spend`).
- `UPV` holds the per-level chances of the five tiered upgrades (`roll` and `offlineDist` both read it), `TIER` is `[1, 2.5, 6, 24, 96]`, `upCap(u, d)` is the level the machine's restoration allows and `upMax(u)` the absolute maximum. `upLock` explains what a capped card needs.
- **Balance (bot, one seed).** Tiers 4 and 5 add a modest boost: active first division 184.7 to 167.5, first star 231.4 to 216.6, Honeycomb 355.6 to 334.1; idle Honeycomb 451.7 to 431.8. Coaching is a **poor investment compared with machines and divisions**: a bot that bought it early (one level at most 10% of the next machine's price) delayed Lagoon from 80 to 160 minutes and the first division to 474; at most 2% still moved Honeycomb from 334 to 431. As a surplus purchase (only when holding 4x the next machine's price) it never triggers inside 8 simulated hours and pacing is unchanged. So it is a late banana sink and a feel system, not a lever that reshapes progression; keep prices where they are unless it should become a real choice. The maximum bonus is +12% talent and +20% coaching on one monkey.
- Not done: no change to the floor art for talent (the name tag does not show it); rerolls cannot be undone twice.
