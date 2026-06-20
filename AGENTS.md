# Agent Guidelines for hoozi_radar

## Project scope

This repository is the HOOZi web radar frontend. The active implementation
targets the HOOZi 3.0 Lua data bridge in
`references/hapex3-lua-script-factory/scripts/web_radar.lua`; it is not a
generic WebSocket radar client and must not silently restore HOOZi 2.0 field
assumptions.

The Lua script runs in the HOOZi 3.0 client/backend environment, starts a
loopback WebSocket server, converts runtime game data into JSON-safe tables,
and broadcasts state snapshots to the browser.

## Read-only reference snapshot

Everything below `references/hapex3-lua-script-factory/` is a copied,
read-only reference snapshot. Do not edit it unless the user explicitly asks
to refresh that snapshot.

Before changing protocol parsing, field mapping, state handling, entity
rendering, map/radar behavior, or HOOZi 3.0 compatibility logic, read all of:

1. `references/hapex3-lua-script-factory/AGENTS.md`
2. `references/hapex3-lua-script-factory/README.md`
3. `references/hapex3-lua-script-factory/scripts/web_radar.lua`
4. `references/hapex3-lua-script-factory/references/api-reference.md`

Read these when lifecycle, timing, cross-script behavior, or complete Lua
examples matter:

- `references/hapex3-lua-script-factory/references/guide.md`
- `references/hapex3-lua-script-factory/references/examples.md`

## Source-of-truth precedence

Resolve conflicts in this order:

1. `references/hapex3-lua-script-factory/scripts/web_radar.lua`
2. `references/hapex3-lua-script-factory/references/api-reference.md`
3. `references/hapex3-lua-script-factory/references/guide.md`
4. `references/hapex3-lua-script-factory/references/examples.md`
5. Existing frontend behavior

Never invent field meanings, units, enum mappings, asset-key formats, or map
aliases. When meaning cannot be verified, retain the raw value only if useful,
document the uncertainty in `docs/protocol/hoozi3-web-radar-protocol.md`, and
avoid interpretive UI behavior.

## Implemented HOOZi 3.0 protocol

The checked-in Lua script listens on `ws://127.0.0.1:9001` with no required
path. It sends:

- `state`: `kind`, `ts`, `map`, `players`, and optional `ring`
- `pong`: response to the optional browser `ping` control message

The player payload uses flat `x`/`y` map coordinates in a 1000×1000 domain and
contains `id`, `self`, name/team/squad data, health/shield, status, legend,
platform UID, level/combat/rank metadata, and opaque icon/color/roster values.
See `docs/protocol/hoozi3-web-radar-protocol.md` for the exact contract.

Important limits:

- `web_radar.lua` does not serialize loot or projectiles, even though the Lua
  API exposes them. The browser cannot implement those entities without a Lua
  protocol change.
- `yaw` orientation/units, icon-key namespaces, `rank_color` format, and
  numeric `roster` semantics are not fully documented. Do not guess.
- `game.world.map_name` is a raw string. Do not map it to legacy numeric local
  assets without an authoritative manifest.
- HOOZi 2.0 `pro`, `black`, `white`, `hostile`, nested `pos`, numeric map
  sentinel, UID XOR conversion, 1920×1080 crop, port 2334, and `/ws` defaults
  are legacy-only behavior.

## Active frontend structure

The page uses one native ES-module application entry. Its small inline module
bootstrap prevents an unsupported `file://` launch from attempting imports and
shows the local-server command instead. Under HTTP it imports:

```html
import('./src/main.js')
```

Do not add a bundler or unordered classic script tags without explicit user
approval. `app.js` was the HOOZi 2.0 monolith and is no longer part of the
active project.

Module responsibilities:

- `scripts/dev-server.mjs`: dependency-free local HTTP server used by
  `npm start` / `npm run serve`; it must serve `.js`/`.mjs` with JavaScript MIME
  types and `nosniff`.
- `src/main.js`: application bootstrap, WebSocket lifecycle, ping/reconnect, and module
  wiring. Keep parsing and DOM details out of this file.
- `src/config.js`: constants, defaults, persisted settings, connection target
  construction, team colors, and shared numeric helpers.
- `src/i18n.js`: Simplified Chinese, Traditional Chinese, and English strings,
  language selection, and DOM translation.
- `src/protocol/hoozi3.js`: HOOZi 3.0 JSON parsing, validation, and pure field
  normalization. It must not manipulate DOM or canvas state.
- `src/state/store.js`: atomic snapshots, timestamp ordering, selection, and
  render-frame interpolation. It must remain independent of DOM APIs.
- `src/render/ring.js`: the map-only outside-ring filter and thin boundary on a
  canvas between the map image and player overlays.
- `src/render/entities.js`: pure canvas drawing for player entities above the
  ring effect so map filters never alter player information.
- `src/render/viewport.js`: pure, DOM-free zoom bounds, anchor, observation-port,
  and fixed-follow transform calculations.
- `src/render/radar.js`: fixed drawing-surface sizing, the 1000×1000 transform,
  render loop, observation-port clipping, follow/free view, pan, pinch, and zoom.
- `src/ui/layout.js`: pure desktop column allocation that gives width to the map
  before the horizontally scrollable player-table viewport.
- `src/ui/player-data.js`: pure JSON filename checks and export filename creation.
- `src/ui/controls.js`: DOM lookup, localized status/overlay updates, settings
  controls, player selector, focus metadata, validated JSON import/export, and
  player table.
- `src/assets/maps.js`: CDN-first image loading with local fallback and exact
  map asset naming.
- `docs/protocol/hoozi3-web-radar-protocol.md`: implemented protocol, verified
  mappings, legacy removals, and uncertainties.
- `static/`: local fallback assets.

Keep protocol parsing separate from rendering, state normalization separate
from DOM manipulation, UI events separate from WebSocket decoding, and asset
fallback separate from map state.

## Static assets

The required source order is:

1. `https://img.hoozi.net/static/`
2. local `./static/`

Do not reverse the order based on page protocol. Map lookup currently uses the
exact `game.world.map_name` plus `.png`. Opaque legend/rank icon keys must not
be turned into URLs until their namespace and file contract are documented.

## Localization

Top-level UI supports:

- Simplified Chinese (`zh-Hans`)
- Traditional Chinese (`zh-Hant`)
- English (`en`)

Update all three variants whenever user-visible text changes. Write natural
localized phrasing; do not translate protocol keys, API identifiers, runtime
strings, or code identifiers.

## Tailwind CSS v4 and styling

`input.css` remains the Tailwind CSS v4 input and `styles.css` is generated:

```powershell
npx @tailwindcss/cli -i ./input.css -o ./styles.css
```

Prefer Tailwind utility classes for page and control layout. Direct CSS is
acceptable for canvas/map transforms, interaction states, and radar-specific
effects. Regenerate `styles.css` after changing classes in HTML or JavaScript.
Preserve the existing dark glass-panel visual language unless a UI redesign is
explicitly requested.

## Coding conventions

- Use native browser ES modules and explicit relative import paths.
- Use `const` unless a binding is reassigned.
- Prefer small pure functions and dependency injection over cross-module
  globals.
- Validate external data at the protocol boundary.
- Treat each `state` payload as a full snapshot, not a partial patch.
- Use stable player `id` for identity and `self` for local-player selection;
  player names are not unique IDs.
- Preserve players whose `x`/`y` are absent in state and tables, but do not plot
  them.
- Do not add production dependencies without explicit approval.
- Never commit `node_modules/` or other external/generated dependency folders.

## Documentation

Keep these files aligned with implementation:

- `docs/protocol/hoozi3-web-radar-protocol.md`
- `README.md` (native English)
- `README_CN.md` (Simplified Chinese version of the English document)

The protocol document must state message flow, payload shapes, verified types
and meanings, transformations, frontend effects, HOOZi 2.0 replacements,
unsupported fields, and uncertainties.

## Verification workflow

Inspect `package.json` before assuming scripts. For migration changes, run at
least:

```powershell
npm install
npx @tailwindcss/cli -i ./input.css -o ./styles.css
Get-ChildItem -Recurse -Filter *.js src | ForEach-Object { node --check $_.FullName }
```

Also verify in a browser served over HTTP (`file://` cannot load this native
module graph):

- `index.html` reports the `npm start` instruction under `file://` and imports
  only `src/main.js` as the application entry under HTTP;
- every module import returns successfully;
- the default WebSocket target is `ws://127.0.0.1:9001`;
- a valid `state` fixture updates map/player/ring UI;
- malformed and unknown messages fail without applying partial state;
- map assets try CDN first and local fallback second;
- pan/zoom/follow, table toggles, selection, and localization remain usable;
- no file under `references/hapex3-lua-script-factory/` changed.

## Completion criteria

A HOOZi 3.0 migration change is complete only when:

- the active page uses the ES-module entry and no legacy monolith;
- parsing and normalization live in `src/protocol/hoozi3.js`;
- verified Lua fields are implemented or explicitly documented as raw-only or
  intentionally unsupported;
- legacy HOOZi 2.0 assumptions are removed or isolated in documentation;
- CDN-first/local-fallback behavior and Tailwind CSS v4 remain intact;
- protocol and both README files match the final code and directory layout;
- applicable syntax, CSS, and browser checks pass;
- the final report lists changed/added files, module split, field effects,
  deprecated/uncertain fields, commands run, and unresolved runtime questions.
