[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nuraliana/velvet-otter-52/rank.svg?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nuraliana/velvet-otter-52/reward.svg?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Twin Peeks — Spot the Difference

Two near-identical pictures side by side. Seven differences hide in the right
one. Click a difference on either picture to mark it — a green ring and a check
appear on both panels. Find all seven before the timer runs out.

## How to play

- **Click** a difference on either picture: +100 points, and a combo bonus of
  +15 for each find in a row without a miss.
- **Wrong click**: the combo resets and the clock loses 2 seconds.
- **H** (or the Hint button): a gold ring pulses on an unfound difference.
  Costs 25 points, 3 hints per level.
- **R**: restart the level. **P** or **Esc**: pause. **M**: mute.
- Clearing a level pays a time bonus of +10 per second left. Three stars need
  30+ seconds left with no hint; two stars need 12+ seconds and at most one hint.

## The six scenes

1. **Harbor at Dawn** (100s) — lighthouse, pier, sailboat, buoy
2. **Jungle Temple** (95s) — stepped temple, torches, statue, waterfall
3. **Space Station** (90s) — ringed planet, solar wings, astronaut, satellite
4. **Cozy Library** (85s) — bookshelves, wall clock, sleeping cat, teapot
5. **Autumn Park** (80s) — fountain, pond ducks, squirrel, kite
6. **Candy Kitchen** (75s) — cupcakes, candy jars, oven, balloons

All art is drawn with canvas 2D primitives and all sound is synthesised with
WebAudio — no images, audio files, libraries or network requests.

## Files

- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library.
- `serve.ts` — a tiny static server for local play (`node serve.ts`).
- `game/index.html` — the page; loads `./src/main.js` as a module.
- `game/src/config.js` — field, panels, scoring, palette.
- `game/src/random.js` — seeded RNG (mulberry32).
- `game/src/draw.js` — canvas drawing primitives.
- `game/src/audio.js` — WebAudio synth (find / miss / hint / win / tick).
- `game/src/scenes.js` — the six scenes and their 42 differences.
- `game/src/world.js` — state and rules (screens, combo, hints, timer).
- `game/src/render.js` — the frame: header, panels, markers, overlays.
- `game/src/input.js` — keyboard actions and pointer input.
- `game/src/shots.js` — staged screenshot poses (`?shot=`).
- `game/src/main.js` — boot and the fixed-step loop.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — four real renders of the game (the first is the cover).

## License

MIT — see [LICENSE](LICENSE).
