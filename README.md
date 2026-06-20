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
- raw `game.world.map_name` strings
- flat `x`/`y` coordinates in a 1000×1000 map domain
- stable player `id` and explicit `self`
- health, shield, down/dead state, legend, UID, level, kills, damage, rank,
  squad/team, roster metadata, and an optional ring
- optional browser `ping` and Lua `pong`
- a desktop layout that keeps table columns intrinsic and scrollable while the
  map consumes the remaining width and height
- independent map-overlay switches and independent table columns for every
  verified non-coordinate player field

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
│   ├── render/radar.js           Render loop, sizing, follow, pan, and zoom
│   ├── ui/controls.js            Controls, focus UI, and player table
│   └── assets/maps.js            CDN-first image fallback
├── static/                       Local fallback images
├── docs/protocol/                Project-owned protocol documentation
└── references/                   Read-only HOOZi 3.0 Lua reference snapshot
```

The old `app.js` monolith is removed. An inline module bootstrap in
`index.html` detects unsupported `file://` launches and otherwise imports
`./src/main.js` as the only application entry.

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

For a Lua map value such as `mp_rr_example`, the frontend requests
`mp_rr_example.png`. The repository still contains legacy numeric local map
files, but no numeric-to-runtime map alias is applied because the checked
references do not define one.

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
icon-key namespaces, the `rank_color` format, numeric roster categories, or a
raw-map-name to legacy numeric-asset mapping. These values are retained or
reported without invented interpretation; see the protocol document for the
full uncertainty list.

