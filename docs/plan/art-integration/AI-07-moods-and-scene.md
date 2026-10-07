# AI-07: Moods, buffs, hats, shiny, cheer, and the scene around the machine

**Read `README.md` and AI-06 handoff notes first.** Size: M. Needs vision: yes. Depends on: AI-06. Touches `ops.js`: **yes (third in order).**

## Goal

Make the new stage react to everything the rope-monkeys reacted to, and make the area around the machine match the new art. Behaviour parity first, polish second.

## Parity list (each must have an equivalent in the new stage)

| Existing behaviour (source) | New-stage behaviour |
| --- | --- |
| Rain makes monkeys wet: `--wet` CSS var dims and desaturates canvases (`mood.js`, `ops.css` line ~184) | Apply the same filter to the actors layer from `getMood().wet` (no new state). |
| Leaf hat when `Mood.hat` (rain) | A small leaf overlay on each actor's head anchor unless a game hat is worn. |
| `Mood.scared` (storm), `startle`, `shake` after rain stops | Scared expression + tremble; startle on lightning; shake-off animation when `shake` fires. |
| `buffs.frenzy` "wild": crew hops randomly | Hoppers jump with random extra hops; assistants speed their clips 1.5x. |
| `buffs.sluggish` (rotten banana) | Dizzy expression, slower clips. |
| `buffs.golden` ("Golden Keys") | Keycaps glint gold while active. |
| Night: `isNight()`, window sky (`paintWindow`, `.o-window` data-wx) | Scene window and lamp stay DOM (unchanged), restyled in CSS to sit with the new wall/desk; actors get a warm lamp tint at night. |
| `crew[p].hat` (7 hats) | Hat overlay on the head anchor (README Q3); `art-v2/assets/crew/*` or AI-08's hat set; baked bare-head strip when a hat is worn. |
| `crew[p].shiny` sparkle (`IMI.fall(... 'spark')`) | Same sparkle trigger anchored via `rectOf`; plus a 1-frame palette glint. |
| `say(t, text)` chatter and `.o-nm` name bump | DOM overlay anchored above the actor; same text, same timing, same classes. |
| `cheer(ms, text)` (new machine, awards, milestones) | Victory clip for all actors; text on the first three. |
| New hire `drop` animation | Actor drops from above into its slot with a bounce, using the existing `o-typdrop` timing. |
| Golden banana catch: `say(t,'GOLD!')`, hop | `stage.reaction` hop on a random actor. |

## Scene reskin (CSS and, if needed, small baked tiles in `art/stage/`)

Restyle `.o-wall`, `.o-prop`, `.o-desktop`, `.o-lamp` to the lab's desk themes (`gemini-art/index.html` desk switcher: mahogany etc., and `art-v2/assets/chrome/bg_*`) so the machine does not float on the old backdrop. Keep `.o-window`, `.o-embers`, `.o-drips`, `.o-flies`, `.o-speed`. Both desks' theme colours come from `DESKS[i].color`.

## Acceptance

- Every row of the parity list demonstrated with a screenshot or a short `tools/shot.mjs` script (storm, rain stop, frenzy via `IMI.ops.dev`, hat worn, shiny, cheer on buying a machine).
- Reduced motion and Low: no looping decoration beyond the rest pose; reactions still visible as single frames.
- Flag-off stage unchanged (compare to baseline).

## Do not

Change what weather, mood or buffs do; add new buffs; touch economy code.

## Status

Not started.

## Handoff notes

(fill in)
