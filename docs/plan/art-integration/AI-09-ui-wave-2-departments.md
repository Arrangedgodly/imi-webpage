# AI-09: UI wave 2: departments, shop, keepers, publisher, deals, awards, muses, media

**Read `README.md`, `coverage.md`, and AI-08 handoff notes first.** Size: L. Needs vision: yes. Depends on: AI-08 (for the helper). Touches `ops.js`: shares with later tasks; run strictly after AI-08, as one `ops.js` owner at a time, or give each surface to its own agent in sequence.

## Goal

Swap the remaining department art to the new set using the AI-08 helper. One surface at a time; each surface is a separate commit-sized unit of work an agent can finish and screenshot alone.

## Surfaces (fan out one agent per surface, in this order)

1. **Department tabs** (`ops.js` ~29-35 + `.o-tab` CSS): the 9 `TABS` icons x inactive/active + mobile "More".
2. **Shop** (`renderShop`): hold-to-type, paw metronome, double touch, writing contracts, literary agent, market analyst, barometer (2 tiers), Publisher's assistant (3 tiers), keeper upgrade cards (`Lv n/6`), restoration cards (Mk I-III emblem consistent with the new machine).
3. **Keepers** (Words page keeper strip and Keepers department): 6 keepers tinted by `DESKS[i].color`, 3 upgrade looks (Lv 0, 3, 6).
4. **Rights deals** (`DEALS` x5) and desk upgrade glyphs (`UPS`: fing, rapid, vowel, ink, practice, stock, ribbon) with level pips 0-5.
5. **Awards and Legacy** (`renderRecords`, `AWARDS`, award toast `o-ach`, `IMI.banner`): trophy tiers 0-2 (the three trophies must read as one cup in three materials), challenge badges (`CHALLENGES` x4), `LEG` upgrades, second-printing stamp.
6. **Muses** (`MUSES` x9, `MUSE_LOOK`): framed animated portraits in the Muses page and seat slots.
7. **Media** (`DIVS`): the five division machines (`songs, tv, radio, sketch, film`).
8. **Titles**: book covers by band, bookshelf spines (`shelfHTML`), SOLD stamp, edition ribbon. Keep the generated spine sizing logic; art replaces only the surface.

## Rules for every surface

- Use only slots marked `ok` in `coverage.md`. A slot marked `missing` keeps its current art and is listed in the handoff.
- Size and spacing come from the existing CSS; do not reflow layouts. No new scroll containers.
- Pixel edition only; classic markup untouched.
- Animated icon budget per screen stays bounded; off-screen panes do not animate (tabs render lazily already; keep it that way).
- After each surface: screenshots (3 sizes) in `evidence/AI-09/<surface>/`, console clean, harness identical, Train/Floor not regressed.

## Acceptance

All surfaces above either shipped behind `ART2` or listed as blocked with the missing asset ids. Owner reviews the screenshots per surface before AI-12.

## Do not

Change any cost, requirement, text of effects or award logic; rename ids; touch `economy.js`.

## Status

Not started.

## Handoff notes

(fill in per surface: done / blocked / assets used)
