# 01: Settings button in the game (Pixel/Classic switch, sound, reset)

**Read `README.md` first.** Size: small. No dependencies.

## Why

The owner could not find a way to switch between the pixel and classic art styles. It was not removed for performance: during the screen redesign the switch (`#styleSwap`, handled by `style-swap.js`) was only kept on the **menu** screen, and the game header has no room for another button. Both styles must stay switchable from inside the game, and the swap must keep the player on the game screen (the `#play` hash is already preserved by `style-swap.js`).

## What to build

A **settings** button in the game header that opens a small popover with:

1. **Art style**: a two-option segmented control "Pixel | Classic" (current one pressed). Pressing the other one triggers the existing bar-wipe swap.
2. **Sound**: on/off toggle (same behaviour as the current sound button).
3. **Reset game**: the existing "Reset Typewriter Ops" action, moved out of the Shop page (it is currently the last paragraph in `renderShop()` in `ops.js`, `data-act="reset"`, handler `ACTIONS.reset`). Keep the `confirm()`. Expose it to the shell as `IMI.ops.reset` (add to the `IMI.ops = {...}` object near `perk`) so `core.js` can call it.
4. A placeholder slot for **"Replay tutorial"**: render the row only if `IMI.tour && IMI.tour.replay` exists (task 09 adds it). Do not build the tutorial now.

## Where things are

- `core.js`: `boot(art)` wires `[data-sound]` buttons (search `soundBtns`) and builds the header toys from the `TOYS` table. The game header markup in `index.html` / `classic.html` currently has a `<button class="toy" data-sound ...>` after `#toyDock`. **Replace that header sound button with a settings button** (same `.toy` look) so the header keeps the same width on phones (360px is already tight: back + bananas + 4 toys + 1 button). The **menu** keeps its own sound button (`.menu-corner`) and its style switch; do not touch those.
- `style-swap.js`: the swap logic is the private function `swap()` bound to `#styleSwap` on `DOMContentLoaded`. Expose it as `window.StyleSwap = { swap, current }` (keep the `#styleSwap` binding working for the menu) so `core.js` can call it.
- Icon: pixel edition has no gear sprite. Draw a simple CSS "three bars" icon (like `.o-dots` in `ops.css`) or add a tiny sprite with the `reg(name, make(w, h, px => {...}))` helper in `pixel.js` (see how `'drum-on'` is made). Classic: use the ⚙️ emoji. `art.paintSound` in `app.js`/`classic.js` currently paints `[data-sound]` buttons; keep it for the menu button and for the sound row inside the popover.
- Popover styling: put shared layout in `styles.css`/`classic.css` next to the `.toy` rules (pixel: dark `border-image: var(--frame-dark)` plate with `--font-px` labels; classic: rounded dark pill panel). Anchor it under the header, right-aligned, `z-index` above `.topbar` (20) but below `.o-modal` (500). Close on outside click, on `Escape` (note `core.js` already maps `Escape` to "back to menu" when no modal is open; make the popover swallow Escape first), and when a choice is made (except sound).
- Accessibility: the settings button gets `aria-haspopup="dialog"`, `aria-expanded`; segmented control buttons use `aria-pressed`.

## Acceptance checklist

- Pixel and classic: header shows back, bananas, snack, coconut, weather, night, settings; nothing wraps at 360px width.
- Open settings, switch style: bars wipe, page reloads in the other edition **still on the game screen**, bananas/save intact.
- Sound toggle in the popover and on the menu stay in sync (both read `localStorage['imi-sound']`).
- Reset asks for confirmation, then restarts the floor (bananas kept, as today) and the Shop page no longer shows the reset row.
- Screenshots at 1280x800 and 390x700 in both editions with the popover open.

## Status

Not started.

## Handoff notes

(none yet)
