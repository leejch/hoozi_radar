# HOOZi 3.0 Web Radar

This repository contains the browser frontend for the HOOZi web radar. The
current implementation consumes the local WebSocket state stream produced by
the HOOZi 3.0 `web_radar.lua` script.

The frontend is a static site built with native browser ES modules and Tailwind
CSS v4. It has no JavaScript bundler and no production runtime dependencies.

## HOOZi 3.0 migration

The previous frontend was written around a HOOZi 2.0 transport and a monolithic
`app.js`. That design assumed port 2334, a `/ws` path, nested player positions,
numeric map identifiers, name-based local-player detection, a cropped legacy
coordinate space, roster flags, and a derived long UID.

The HOOZi 3.0 version follows the checked-in Lua script instead:

- local WebSocket endpoint: `ws://127.0.0.1:9001`
- full `state` snapshots selected by `kind`
- raw `game.world.map_name` strings with verified first-token aliases for the six numeric map assets
- flat `x`/`y` coordinates in a 1000×1000 map domain
- stable player `id` and explicit `self`
- health, shield, down/dead state, legend, UID, level, kills, damage, rank,
  squad/team, roster metadata, and an optional ring
- optional browser `ping` and Lua `pong`
- a desktop layout that keeps table columns intrinsically sized and horizontally
  scrollable while guaranteeing that the map viewport is never narrower than
  it is tall
- independent map-overlay switches and independent table columns for every
  verified non-coordinate player field
- a fixed square radar drawing surface behind a responsive observation port, with
  100%–300% button, wheel, and pinch zoom
- validated JSON import and export of the current HOOZi `state` player data

Player positions and ring geometry are interpolated between Lua snapshots for
the browser render loop. Unsupported HOOZi 2.0 fields are not synthesized.

## Data flow

```text
HOOZi 3.0 runtime game data
        ↓
web_radar.lua snapshot + map conversion
        ↓ WebSocket JSON on 127.0.0.1:9001
src/protocol/hoozi3.js validation and normalization
        ↓
src/state/store.js snapshot state and interpolation
        ↓
canvas radar, player table, focus UI, and controls
```

`web_radar.lua` binds only to loopback. If the radar is exposed through a
separate HClient relay, configure that `ws` or `wss` endpoint with Manual mode.
Relay authentication is outside this repository and outside the Lua protocol.

The exact message and field contract is documented in
[`docs/protocol/hoozi3-web-radar-protocol.md`](docs/protocol/hoozi3-web-radar-protocol.md).

## Project layout

```text
hoozi_radar/
├── index.html                    Static page and Tailwind-based UI
├── input.css                     Tailwind CSS v4 input
├── styles.css                    Generated stylesheet
├── src/
│   ├── main.js                   Bootstrap and WebSocket lifecycle
│   ├── config.js                 Constants, settings, and targets
│   ├── i18n.js                   zh-Hans, zh-Hant, and English strings
│   ├── protocol/hoozi3.js        Protocol validation and normalization
│   ├── state/store.js            Snapshots, selection, and interpolation
│   ├── render/ring.js            Map-only outside-ring filter and boundary
│   ├── render/entities.js        Player canvas rendering above map effects
│   ├── render/viewport.js        Pure zoom, anchor, resize, and follow math
│   ├── render/radar.js           Render loop, sizing, follow, pan, and zoom
│   ├── ui/layout.js              Map-first desktop column allocation
│   ├── ui/player-data.js         JSON import/export filename rules
│   ├── ui/controls.js            Controls, focus UI, and player table
│   └── assets/maps.js            CDN-first image fallback
├── static/                       Local fallback images
├── docs/protocol/                Project-owned protocol documentation
└── references/                   Read-only HOOZi 3.0 Lua reference snapshot
```

The old `app.js` monolith is removed. An inline module bootstrap in
`index.html` detects unsupported `file://` launches and otherwise imports
`./src/main.js` as the only application entry.

## Radar observation port and zoom

The responsive map panel is an observation port, not a drawing-scale input.
The drawing surface uses equal width and height and is locked after the initial
desktop column layout settles. This keeps map imagery, player coordinates, and
ring circles on one uniform scale.
Later window resizing or player-table visibility changes only alter the visible
crop; they do not resize the map image, ring canvas, or player canvas.

Radar zoom defaults to 100% and is strictly clamped to 100%–300%. The bottom-
right minus/percentage/plus control, mouse wheel, and two-pointer pinch gesture
all use the same bounded scale calculation. Free view keeps the map point under
the gesture anchor stable. Fixed follow is the page-load default and always
re-centers the selected player after zoom or observation-port resizing.

In the three-column desktop layout, the player-table panel expands toward its
current intrinsic content width, but never beyond 25% of the page content width.
The map first receives enough width to remain at least as wide as it is tall.
If the table still cannot fit within its capped panel, its intrinsic columns
scroll horizontally. The same allocation runs after window resizing, table
field changes, snapshot content changes, and player-table visibility changes.

The player-information toolbar exports the latest complete `state` JSON as the
current player data. The adjacent import control accepts `.json` files only and
runs them through the same HOOZi 3.0 protocol validator before applying them.
Invalid JSON, non-`state` messages, and malformed player arrays do not modify
the current radar state. A valid import enters offline preview, stops the active
socket and automatic retry timer, and remains stable until the user explicitly
connects again. Imported test data does not alter live WebSocket timestamp
ordering; the next valid live snapshot can take over normally.

## Running locally

Browser ES modules must be served over HTTP. Directly double-clicking
`index.html` creates a `file://` URL and browsers will block its module imports.

From the repository root, use the built-in server:

```powershell
npm start
```

This serves the project at `http://127.0.0.1:8080/` and opens it in the default
browser. To start the server without opening a browser, run `npm run serve`.

Any equivalent static HTTP server also works, for example:

```powershell
python -m http.server 8080
```

Open `http://127.0.0.1:8080/` and ensure HOOZi 3.0 has loaded
`web_radar.lua` with its server enabled. Local auto mode connects to
`ws://127.0.0.1:9001`.

When the page itself is hosted over HTTPS, browsers normally block a plain
`ws://` connection as mixed content. Use Manual mode with the authorized
`wss://` relay provided by the surrounding deployment.

## Installing tools and building CSS

Install the pinned development dependencies:

```powershell
npm install
```

Regenerate Tailwind CSS after changing utility classes in `index.html` or JavaScript:

```powershell
npx @tailwindcss/cli -i ./input.css -o ./styles.css
```

No bundling step is required. JavaScript files are served as native ES modules.

## Map and static assets

Images are loaded in this order:

1. `https://img.hoozi.net/static/`
2. local `./static/`

Known maps are classified by the first underscore-delimited token after
`mp_rr_`; later runtime suffixes such as `_mu1` and `_mu2` are ignored. The
verified asset order is `canyonlands` → `1.png`, `desertlands` → `2.png`,
`olympus` → `3.png`, `divided` → `4.png`, `tropic` → `5.png`, and `nemesis` →
`6.png`. Unknown raw names retain exact-name `<map>.png` lookup.

Legend and rank icon keys are preserved in normalized state and exported
snapshots. They are not converted into URLs until an authoritative asset-key
namespace is available.

## Development rules

- Read the root `AGENTS.md` and required reference files before changing the
  protocol or rendering semantics.
- Treat `references/hapex3-lua-script-factory/` as read-only.
- Use `web_radar.lua` as the primary source of truth; do not infer HOOZi 3.0
  semantics from the old frontend.
- Keep protocol parsing, state, canvas rendering, DOM controls, and asset
  fallback in their existing modules.
- Update Simplified Chinese, Traditional Chinese, and English strings together.
- Do not add a bundler or production dependency without explicit approval.
- Regenerate `styles.css` whenever Tailwind class usage changes.

## Known protocol limits

The checked-in Lua script does not send loot or projectile arrays, so the
frontend cannot render them. It also does not document yaw orientation, the
icon-key namespaces, the `rank_color` format, or numeric roster categories.
These values are retained or reported without invented interpretation; see the
protocol document for the full uncertainty list.

