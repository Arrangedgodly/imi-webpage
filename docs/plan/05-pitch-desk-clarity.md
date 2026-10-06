# 05: Pitch desk: make commissions understandable

**Read `README.md` first.** Size: medium. Depends on **04** (Pitches is now a sub-tab; reuse `subTabs`, the title card renderer and the "NOW WRITING" tag).

## Why

The owner tried commissioning a pitch and could not find where the commissioned title appears or how to fulfil it. Mechanically: `ACTIONS.commission` (ops.js, search `commission:`) pushes the generated pitch into `S.pitches`, registers it as a recipe with `registerPitch(p)` (flag `gen: true`) and generates a replacement offer. The commissioned title then silently joins the *same* title list as the authored books, marked only by a tiny `pitch` tag. Nothing tells the player "go here, get these words, press Write & sell". The pitch generator itself (`genPitch(band)`, `newOffers()`, `pitchHTML()`) works and should not be redesigned; the **flow and feedback** need to be.

## What to build

1. **Pitches sub-tab layout** (inside the Titles department, from 04):
   - **"Your commissions"** section first: every unsold pitched title (`RECIPES.filter(r => r.gen && !S.written[r.id])`) as the standard title card (same renderer as the Titles list: progress bar, word chips, `Read`, `Focus`, `Write & sell`), with a `COMMISSIONED` tag. Empty state: "No commissions yet. Pick a pitch below; it will show up here, and in Titles under the Pitched filter."
   - **"New pitches"** section: the 3 offers (`S.offers`), each with its band tag, word count, rights price and teaser, a **Commission** button, and a **New pitches · cost** reroll button as today.
   - A two-line explainer at the top: "Agents pitch endless parody titles built from words your typewriters can type. Commission one, then bank its words and write it to sell the rights. Each pitched title you sell makes the next ones pay 2% more."
   - Keep the `PITCH_MAX = 8` cap message ("Sell some titles first"), shown as `n/8 commissions open`.
2. **Immediate feedback on commissioning** (in `ACTIONS.commission`):
   - Toast via `IMI.say('Commissioned “Title”. Find it under Pitches > Your commissions.')`, a floating `+1 COMMISSION` text (use `floatText`), the existing ding/news line.
   - Animate the new card appearing in "Your commissions" (reuse the `.o-book.fresh` flash class via `ui.fresh = p.id` for ~2s) and, if the player is on the Pitches sub-tab, scroll the pane so the new card is visible.
   - **Auto-focus it** if `S.autoFocus` is on and nothing better is focused (03's `pickAutoFocus()`), so the keepers start working on it without another click.
   - A pitch the player can't make yet (its words need a desk they don't own) should say so on the card ("Needs Honeycomb Ledger") and the **Commission** button on the offer should warn before spending (offers are generated from owned bands via `pickPitchBand`, so this mostly applies after prestige; verify and handle gracefully).
3. **Discoverability:** the Titles department tab and the **Pitches** sub-tab get a "!" while there is an open pitch slot and the player has never commissioned (`S.stats.pitched === 0` and `soldCount() >= 1`). After the first commission the "!" appears on **Titles** (via the existing ready-count badge) only when a commissioned title becomes ready to write.
4. **Ready-to-write moments for commissions** use the same `cheer(1100,'READY!')` path as authored titles (already in `render()`); confirm it fires.
5. Titles list (04): the `Pitched` filter chip must show commissioned titles; also show `COMMISSIONED` in place of the old tiny `pitch` tag.

## Where things are

`pitchHTML()`, `newOffers()`, `genPitch`, `pickPitchBand`, `pitchActive()`, `repitchCost()`, `registerPitch`, `PITCH_MAX` are all within ops.js lines ~460-520. Sold pitched titles keep their recipe (`S.pitches` is never trimmed), which matters for performance: see 04's pagination and task 08's note about capping stored sold pitches.

## Acceptance checklist

- Fresh player sells a title, opens Pitches, commissions one: toast appears, the card shows under "Your commissions" with a flash, the floor HUD shows it as the goal (auto focus), the keepers start banking its words; when its words are all banked the card gets the READY look and `Write & sell` pays out and the book drops on the shelf.
- Commission 8 pitches: the cap message shows, no exception.
- Planted old save with several `S.pitches`: they appear under "Your commissions" (unsold) or on the shelf (sold).
- Screenshots (both editions, 390x700 and 1280x800): Pitches sub-tab empty state, with 2 commissions, right after commissioning (toast visible).

## Status

Not started.

## Handoff notes

(none yet)
