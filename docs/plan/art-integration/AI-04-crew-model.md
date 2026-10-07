# AI-04: Crew look and role model

**Read `README.md` first** (section "Crew model"). Size: S. Needs vision: no. Depends on: AI-00 (Q1-Q3 answered). Touches `ops.js`: **yes, first of the ordered `ops.js` tasks.** Runs in parallel with AI-02 and AI-03 (disjoint files otherwise).

## Goal

Give every typist a persistent monkey *look* and give every crew slot a *role*, as pure data, so the renderer (AI-05/06) has something to ask. **No visible change in the game.** No change to any number.

## Changes

1. `ops.js` crew section (near `newTypist`, `ensureCrew`, `NAMES`, `HATS`):
   - `const STATION_ORDER = ['carriage', 'platen', 'ribbon', 'escapement']` (Q1).
   - `roleOf(p)` and `slotOf(p)` exactly as in the README. Pure functions, exported on `IMI.ops.dev`.
   - `LOOKS`: the 30 variant slugs with archetype, copied as plain data from `gemini-art/monkey-variants.js` header (slug, archetype id 1-5, display name). Do not `require` the lab.
   - `pickLook(d, p)`: from a per-desk shuffled bag (`d.lookBag`, optional, not required in old saves) preferring the role's archetype; deterministic fallback `hash(name) % 30` for typists that have none.
   - `newTypist` sets `look`. `ensureCrew` and the load path fill `look` for old typists **lazily and without altering any other field**. Do not bump the save version; old saves must open and play identically.
2. `lookOf(t)` accessor used by the renderer and the Train card.
3. Dev handles on `IMI.ops.dev`: `roleOf`, `slotOf`, `lookOf`, `LOOKS`.
4. Update the harness stub only if a missing global breaks it (`tools/balance.html`), and add a tiny check to `tools/balance.mjs`: roles for p = 0..11 equal `[stomper, carriage, platen, ribbon, escapement, stomper x7]`.

## Acceptance

- `node --check ops.js`; balance harness output **byte-identical** to `evidence/AI-00/balance-before.txt` (looks must not consume the game's RNG stream; use a separate hash-based pick or a private seeded generator, never `rand()` from the gameplay stream).
- Load a pre-change save: no console errors, every typist now has a `look` after the next save, no other field changed (diff the JSON).
- Two typists on one desk never share a look until the bag is exhausted; unit check in the harness script.
- Reroll, coaching and hat changes leave `look` unchanged.

## Do not

Touch `buildStage`, `syncTypists`, rendering, CSS, or the display cap of 8 (AI-06).

## Status

Not started.

## Handoff notes

(fill in: field names added, where `look` is saved, RNG isolation)
