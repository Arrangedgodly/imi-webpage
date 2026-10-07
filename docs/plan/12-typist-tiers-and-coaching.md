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
- **Coaching:** per monkey, up to `COACH_MAX = 10` levels, each +1 % speed on top of the talent. Cost in bananas: `COACH_BASE[desk] * 1.6 ^ level` with `COACH_BASE = [60, 600, 6000, 70000, 8e5, 9e6]`.
- **Reroll:** per monkey, re-rolls **talent and trait** (not name, hat, xp, level, shiny status). Costs bananas, `REROLL_BASE[desk] * 1.5 ^ rerolls` (counter saved per monkey, shared by the monkey's lifetime), `REROLL_BASE = [40, 400, 4000, 45000, 5e5, 6e6]`. The previous roll is shown for one confirm step ("Keep the old roll?") so a bad reroll can be undone once.
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

Not started.

## Handoff notes

(none yet)
