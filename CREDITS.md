# Credits / Asset sources

## Music (BGM) — FreePD, CC0 / Public Domain

All background-music tracks are from **FreePD** (https://freepd.com/), obtained via the
GitHub mirror **[0lhi/FreePD](https://github.com/0lhi/FreePD)** (branch `stream`).

**License: CC0 1.0 (Public Domain dedication).**
FreePD stated: *"100% Free Music — Free for Commercial Use, Free Of Royalties,
Free Of Attribution, Creative Commons 0."*

- Commercial use: **allowed**
- Royalties: **none**
- Attribution: **not required** (this file is kept as a courtesy / internal record)
- FreePD.com is now closed, but CC0 is irrevocable — these tracks remain free to use.
- Composers vary across the FreePD catalog (e.g. Kevin MacLeod, Rafael Krux, Bryan Teoh).

Tracks used (mapped to theme styles), stored under `public/assets/audio/`:

| App file (style)        | Used for themes                         | FreePD source path                 |
|-------------------------|-----------------------------------------|------------------------------------|
| `electro.mp3`           | cyber, night                            | `Electronic/Chronos.mp3`           |
| `rock.mp3`              | game (歓楽街), festival                  | `Upbeat/Bar Brawl.mp3`             |
| `soft.mp3`              | mint, pink, simple                      | `Zoned/2017 12 01 in C Major.mp3`  |
| `corporate.mp3`         | corporate                               | `Scoring/Driving Concern.mp3`      |
| `orchestral.mp3`        | premium, wonder                         | `Epic/Adventure.mp3`               |
| `chip.mp3`              | retro                                   | `Electronic/Bit Bit Loop.mp3`      |

Mirror raw URL pattern: `https://raw.githubusercontent.com/0lhi/FreePD/stream/<genre>/<track>.mp3`

## Sound effects & fallback BGM — original (procedural)

The sound effects (DIVE, warp, save, scan, treasure, rank-up), the rare-proximity
"dowsing" scanner clicks, and the procedural fallback music are **synthesized in code**
via the Web Audio API in `src/sound.js`. They contain no third-party audio and carry
no licensing restrictions.

## Street-view / mascot / product images

Image assets under `public/assets/generated/` and `public/assets/streetview/` were
provided by the project owner. Confirm their licensing separately before public release.
