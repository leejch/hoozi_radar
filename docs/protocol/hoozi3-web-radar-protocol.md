# HOOZi 3.0 Web Radar Protocol

## Scope and sources

This document describes the browser protocol implemented by
`references/hapex3-lua-script-factory/scripts/web_radar.lua`. The Lua file is
the primary source of truth. Field types exposed by `game.*` are cross-checked
against `references/hapex3-lua-script-factory/references/api-reference.md`.

The reference snapshot is read-only. This document describes the checked-in
Lua script, not a hypothetical server or the older HOOZi 2.0 transport.

## Message flow

1. `web_radar.lua` listens on `127.0.0.1:9001` with `net.ws_server`.
2. After the page `load` event, browser auto mode attempts one target. On
   non-HTTPS pages, including local HTTP and `file://` launch detection, the
   automatic target is `ws://127.0.0.1:9001/ws`. On HTTPS pages, the automatic
   target is `wss://<current-hostname>/ws` with no explicit port. The checked-in
   Lua server listens on the loopback port and does not define
   application-level path routing, so `/ws` is a frontend connection target path
   used by local and Cloudflare deployments rather than a different payload
   protocol. Failure or later closure does not schedule another attempt;
   further attempts require an explicit connection/reconnect action.
3. On each configured broadcast interval, the script snapshots the current
   game state, JSON-encodes it, and broadcasts it to every connected client.
   The menu interval is 16–500 ms and defaults to 30 ms.
4. The browser may send `{"kind":"ping"}`. The Lua server answers only that
   recognized control message; malformed JSON and other message kinds are
   ignored.
5. The Lua server binds only to loopback. Public access and authentication are
   explicitly delegated by the Lua comments to the surrounding HClient relay.
   They are not part of this WebSocket protocol.

## Server-to-client messages

### State snapshot

```json
{
  "kind": "state",
  "ts": 123.456,
  "map": "mp_rr_divided_moon_mu1",
  "players": [
    {
      "id": "ix7",
      "self": true,
      "name": "Player",
      "index": 7,
      "team": 1,
      "squad": 0,
      "x": 512.2,
      "y": 481.8,
      "yaw": 90,
      "hp": 100,
      "max_hp": 100,
      "shield": 50,
      "max_shield": 100,
      "distance": 0,
      "is_dead": false,
      "is_down": false,
      "legend": "",
      "legend_icon_key": "",
      "uid": "",
      "level": 0,
      "kills": 0,
      "damage": 0,
      "rank": "",
      "rank_icon_key": "",
      "rank_color": "",
      "roster": 0
    }
  ],
  "ring": {
    "x": 500,
    "y": 500,
    "radius": 250,
    "t_start": 100,
    "t_end": 160,
    "t_now": 123.456
  }
}
```

`ring`, `index`, `x`, and `y` may be absent because assigning `nil` to a Lua
table does not create a JSON property. The browser accepts an absent or explicit
`null` ring as “no active/convertible ring”. A self player is retained even
when its map position is unavailable.

### Pong

```json
{"kind":"pong","ts":123.456}
```

`ts` is generated with `time.now()`.

## Client-to-server messages

```json
{"kind":"ping"}
```

No other browser command is implemented by `web_radar.lua`.

## State fields

| Field | JSON type | Unit/domain | Verified meaning and source | Frontend behavior |
| --- | --- | --- | --- | --- |
| `kind` | string | — | Literal `"state"` in `snapshot()` | Selects the state parser. Other kinds are not treated as snapshots. |
| `ts` | number | `time.now()` seconds | Snapshot wall-clock value from Lua | Stored for ordering, diagnostics, and interpolation cadence. |
| `map` | string | runtime map identifier | `game.world.map_name` | Classifies known maps by the first underscore-delimited token after `mp_rr_`, loads the verified asset through the page-protocol-dependent static fallback order, and shows the localized map name. The raw value remains in the badge title for debugging. Unknown names retain exact-name `.png` lookup. `mp_lobby*` uses the lobby mode described below. |
| `players` | array | — | Plain-table snapshots of non-NPC `game.entities.players` | Replaces the complete player set atomically; non-dead entries determine the live-player badge. |
| `ring` | object or absent | map pixels and game-time values | Active `game.world.ring`, converted by Lua | Drives a thin sky-blue boundary and a dark, warm-tinted map-only filter outside the boundary. The effect layer sits below every player overlay. |

### Verified map identifiers and assets

Later underscore-delimited suffixes are variants and do not change the base
map. For example, `mp_rr_canyonlands_mu1` and `mp_rr_canyonlands_mu2` both use
`1.png`.

| First token after `mp_rr_` | Base runtime name | Asset | Simplified Chinese | Traditional Chinese | English |
| --- | --- | --- | --- | --- | --- |
| `canyonlands` | `mp_rr_canyonlands` | `1.png` | 诸王峡谷 | 王者峽谷 | Kings Canyon |
| `desertlands` | `mp_rr_desertlands` | `2.png` | 世界尽头 | 世界邊緣 | World's Edge |
| `olympus` | `mp_rr_olympus` | `3.png` | 奥林匹斯 | 奧林匹斯 | Olympus |
| `divided` | `mp_rr_divided_moon` | `4.png` | 残月 | 殘月 | Broken Moon |
| `tropic` | `mp_rr_tropic_island` | `5.png` | 风暴点 | 暴風點 | Storm Point |
| `nemesis` | `mp_rr_nemesis` | `6.png` | 电气区 | 電流區 | E-District |

`mp_lobby` and any raw map name beginning with `mp_lobby` use `mp_lobby.png`.
Lobby mode is not a coordinate radar: the map image is centered inside the map
observation area, rendered with `object-fit: contain`, and never exceeds the
available width or height. The ring and player canvases are cleared and hidden,
so player coordinates from a lobby snapshot are retained in state/table data
but are not plotted.

Static map/logo assets have two base URLs:

- `https://img.hoozi.net/static/`
- `static/`

Non-HTTPS access, including local HTTP and the `file://` guard page, tries
`static/` first and falls back to the R2 URL. HTTPS access tries the R2 URL
first and falls back to `static/`. Browser image requests set
`referrerPolicy = "origin"`, which is the browser-supported way to send the
current page origin as the cross-origin image request referrer.

## Player fields

| Field | JSON type | Unit/domain | Verified meaning and transformation | Frontend behavior |
| --- | --- | --- | --- | --- |
| `id` | string | — | Stable key chosen by Lua: `ix<index>`, else `uid<platform_uid>`, else `anon-<name>` | Entity identity, selection, interpolation, and keyed table updates. It is retained in exports but is not shown in the player table. |
| `self` | boolean | — | Player index equals `game.localplayer.index` | Default focus and local-player marker styling. It is retained in exports but is not shown in the player table. |
| `name` | string | — | `p.name`, fallback `"?"` | Labels, selector, and table. |
| `index` | number or absent | entity index | `p.index` | Raw export metadata only; `id` remains the primary browser key. |
| `team` | number | game team number | `p.team_num`, fallback `0` | Team color, teammate connection lines, selector/table sorting, and a table column with a team-colored dot before the numeric value. |
| `squad` | number | teammate flag / squad identifier | `p.squad_id`, fallback `0` | Raw export metadata only; no table column is shown. |
| `x`, `y` | number or absent | 0–1000 map pixels | Lua calls `math.WorldToMapPixel(worldX, worldY, 1000, 1000)` and applies a two-second sticky cache | Uniformly mapped onto a square drawing surface inside the observation port. Players without both values are retained in state but not plotted; coordinates are intentionally omitted from table controls. |
| `yaw` | number | not specified by the checked API | `p.yaw` forwarded unchanged after finite-value validation | Retained in state/export only. It is not converted into a map heading because the reference does not define its unit/orientation contract. |
| `hp` | number | health points | `p.health`, fallback `0` | Independently controlled health bar, focus value, and table column. |
| `max_hp` | number | health points | Literal `100` in Lua | Health ratio denominator; hidden from table controls because it is always 100 in observed backend data. |
| `shield` | number | shield points | `p.shield`, fallback `0` | Independently controlled shield bar, focus value, and table column. When `max_shield` is `0`, the table shield field is displayed as empty and the map shield bar is omitted. |
| `max_shield` | number | shield points | `p.max_shield`, fallback `0` | Shield ratio denominator and shield-quality table column. The table does not show the raw number; it shows a black-bordered square filled with the same tier color used by the map shield bar. A zero value displays an empty shield-quality field and omits the map shield bar. |
| `distance` | number | meters | `p.distance`; API examples compare it to meter thresholds | Focus/table details. |
| `is_dead` | boolean | — | `p.is_dead` | Dead marker styling and optional visibility filter. |
| `is_down` | boolean | — | `p.is_down` | Downed marker styling and optional visibility filter. |
| `legend` | string | runtime label | `p.legend` | Map label and merged player-table legend column. The frontend displays `pilot_medium_empty` as an empty value. |
| `legend_icon_key` | string | local asset key | Forwarded from `p.legend_icon_key`; observed keys use paths such as `icon_legends/30px-Portrait_Lifeline_square` | Preserved in state/export. The player table resolves non-empty keys to `./res/<legend_icon_key>.png` and displays the transparent PNG directly in the merged legend column. |
| `uid` | string | short platform UID | `p.platform_uid` | Displayed exactly as received in the short-UID column. The normalized state also derives `uid_long` for display only by XORing the short UID with `0xDEADBEEF1B4DF00D` as an unsigned 64-bit value. The raw exported server message still contains only the backend `uid` field. |
| `level` | number | account level | `p.grade` | Focus/table/stat labels. |
| `kills` | number | count | `p.kills` | Focus/table/stat labels. |
| `damage` | number | damage count/value from runtime | `p.damage` | Focus/table/stat labels. |
| `rank` | string | runtime label | `p.rank` | Map label and merged player-table rank column. The frontend displays `None` as an empty value. |
| `rank_color` | string | CSS hex color in observed backend data | Forwarded from `p.rank_color` | Preserved in state/export only. It is not exposed as a visible table field and is not used to style the merged rank column. |
| `rank_icon_key` | string | local asset key | Forwarded from `p.rank_icon_key`; observed keys use paths such as `icon_rank/rookie1` | Preserved in state/export. The player table resolves non-empty keys to `./res/<rank_icon_key>.png` and displays the transparent PNG directly in the merged rank column. |
| `roster` | number | four-bit marker mask | `p.roster`, fallback `0`; `rosters` is accepted as a compatibility alias in the frontend normalizer | Displayed as zero to four localized bracket tags by bit mask: friend `8`, cheater `4`, celebrity `2`, and pro/permission `1`. The map label uses a single-line text sequence such as `[Friend][Cheater]`; the table renders the same one-line sequence with per-tag colors. |

NPC entries are intentionally excluded in Lua (`if not p.is_npc`). The frontend
therefore has no NPC category to render.

Roster tag labels and table colors:

| Bit | Simplified Chinese | Traditional Chinese | English | Table color |
| --- | --- | --- | --- | --- |
| `8` | `[友]` | `[友]` | `[Friend]` | `#63B5FFCC` |
| `4` | `[作弊]` | `[作弊]` | `[Cheater]` | `#FF0000CC` |
| `2` | `[名人]` | `[名人]` | `[Celebrity]` | `#FFE633CC` |
| `1` | `[权]` | `[權]` | `[Pro]` | `#B300FFCC` |

### Frontend-derived player fields

The normalized browser state adds `uid_long` for UI display only. It is
computed from the backend `uid` string with:

```js
BigInt.asUintN(64, BigInt(uid) ^ BigInt('0xDEADBEEF1B4DF00D')).toString()
```

This value is not sent by `web_radar.lua`, is not written back to the raw
exported server message, and is not used as player identity.

The visible player table columns default to the user-facing order: `team`,
`name`, `level`, merged `legend`/`legend_icon_key`, merged
`rank`/`rank_icon_key`, `damage`, `kills`, `roster`, `max_shield`, `shield`,
`hp`, `is_dead`, `is_down`, `distance`, `uid`, and derived `uid_long`. Raw
`id`, `index`, `self`, `squad`, `x`, `y`, `yaw`, `max_hp`, and `rank_color`
remain normalized and exported but are intentionally hidden from the controls
and table. The `roster` column displays localized bracket tags instead of the
raw number; zero means no tags and displays as empty. The table itself uses intrinsic, non-shrinking column widths inside a
horizontally scrollable viewport. Viewport ratios of at least `1.12`
automatically select landscape layout, while ratios at or below `0.893`
automatically select portrait layout; ratios between those thresholds keep the
user-selected header-button orientation. In landscape layout, the desktop table
panel expands toward the current intrinsic content width but is capped at 25%
of the page content width. The map first receives enough width to remain at
least as wide as it is tall. In portrait layout, the map stage uses a `1:1.12`
width-to-height ratio unless it is the only visible body panel, and the player
table expands vertically so every row is shown without an internal vertical
scrollbar. Content beyond the table panel scrolls horizontally. This allocation
is repeated after table content, field visibility, table visibility, menu
visibility, or page dimensions change.

Map overlay defaults start with nickname, legend, level, rank, kills/damage,
dead-player visibility, and downed-player visibility turned off. Health,
shield, roster tags, team links, and ring display remain independently
toggleable.

Player markers use the same four-pixel radius for local and remote players.
Normal remote marker outlines are one-pixel dark lines. The local-player marker
keeps a one-pixel `rgb(255, 0, 0)` outline. The selected focus player gets a
white one-pixel ring outside the normal marker border, with a one-pixel visual
gap, and a white crosshair line pair through that selected position. Team links
connect the selected focus player to players on the same team. The shield bar
is drawn directly above the health bar with a shared edge; the stacked bars sit
immediately above the player marker. Entity labels are placed immediately below
the marker. Both
bars use a 0.5-pixel dark border. Shield bar
width is 50%, 75%, 100%, or 125% of the health-bar width for maximum shield
values 50, 75, 100, or 125. Their fill colors are respectively
`rgb(224, 224, 224)`, `rgb(50, 133, 205)`, `rgb(135, 65, 177)`, and
`rgb(209, 17, 15)`. Missing or zero maximum shield omits the bar and displays
empty shield-quality/shield fields in the table; actual shield fill is capped
at its maximum. Health fill is white. Entity labels
default to a 10-pixel font with a one-pixel dark outline.

The responsive map stage is only an observation port. Its initial square
drawing-surface side is the smaller observation-port dimension. At 100%, one
map dimension exactly reaches the corresponding port edge while the complete
square remains visible; the longer observation axis may contain empty space.
The surface is then retained when browser width, landscape/portrait layout,
menu visibility, or player-table visibility changes, preventing map images,
circles, and player geometry from being stretched. User-controlled zoom is
clamped to 50%–300%
for buttons, wheel input, and two-pointer pinch input. Page load defaults to
fixed follow at 150%. Selecting free view resets to a centered 100%; selecting
fixed follow resets to 150% and re-centers the selected player.

The map image has no initial `src` and stays hidden until one of the configured
static asset sources loads successfully. Empty, loading, and missing-map states
cannot expose a browser broken-image placeholder.

## Ring fields

| Field | JSON type | Unit/domain | Verified meaning and transformation | Frontend behavior |
| --- | --- | --- | --- | --- |
| `x`, `y` | number | 0–1000 map pixels | Ring world origin converted with `WorldToMapPixel(..., 1000, 1000)` | Circle center. |
| `radius` | number | map pixels | Lua interpolates the world radius between phase endpoints, then calls `WorldRadiusToMapPixel` | Circle radius. No second radius interpolation is invented. |
| `t_start`, `t_end` | number | ring game-time clock | `ring.time_start`, `ring.time_end` | Preserved phase timing metadata. |
| `t_now` | number | same ring clock | `time.curtime()` used by the Lua interpolation | Preserved in normalized state. |

The Lua script clamps the radius interpolation fraction to `[0, 1]`. If ring
origin or radius conversion fails, the entire `ring` property is omitted.

## HOOZi 2.0 migration map

| Legacy frontend assumption | HOOZi 3.0 equivalent | Migration action |
| --- | --- | --- |
| `ws://127.0.0.1:2334/ws` | `ws://127.0.0.1:9001/ws` locally, `wss://<hostname>/ws` on HTTPS | Default port replaced while auto mode now uses `/ws` as the frontend connection path. Full manual `ws`/`wss` targets remain configurable for local LAN devices or an external relay. |
| Snapshot payload accepted without a message discriminator | `kind: "state"` | Strict kind-based parsing. |
| `player.pos.x`, `player.pos.y` | Flat `player.x`, `player.y` | Normalize to a single internal `{x,y}` position. |
| Local player identified by name `"<hoozi>"` | `player.self` | Selection and focus use `self` and stable `id`. |
| Incoming coordinates interpreted inside a 1920×1080 frame with a 1015-pixel crop | Lua-produced 0–1000 square coordinates | Removed legacy offsets/crop; render directly against the square map. |
| Numeric map IDs `1`–`6`, sentinel `-1`/`0` | `game.world.map_name` string, empty string outside a known map | Preserve the raw string, classify its verified first token, and select `1.png`–`6.png` using the table above. `mp_lobby*` selects `mp_lobby.png` and disables coordinate plotting. Empty map means no active map; unknown names keep exact-name lookup. |
| `uidShort` plus XOR-derived `uidLong` | Exact backend `uid = p.platform_uid`, plus frontend-derived display-only `uid_long` | The backend UID is preserved unchanged. The long UID conversion is restored only as an explicit table display requirement and is not added to raw exports or player identity. |
| `pro`, `black`, `white`, `hostile` | No verified field | Removed tag/filter behavior. |
| Threshold-generated “danger/high kills/low level” protocol semantics | `level` and `kills` are plain values | Values remain displayable; the migration does not claim protocol-level suspicion semantics. |
| No ring rendering | `ring` object | Added a thin sky-blue boundary plus an outside-only map filter on a dedicated canvas below all player graphics. |
| Static snapshots rendered immediately | Lua default broadcast is ~33 Hz | State store interpolates positions between the previous and latest normalized snapshots for render-frame updates. |

## Data not sent by this Lua script

The API reference exposes `game.entities.loots` and
`game.entities.projectiles`, but `web_radar.lua` never reads or serializes
them. The frontend cannot render loot or projectiles from this protocol. Adding
such behavior requires a future, explicit Lua protocol revision.

Likewise, the API exposes fields such as player weapon and visibility that are
not serialized by `web_radar.lua`. They are intentionally unsupported here.

## Validation and failure behavior

The browser parser:

- requires valid JSON and an object message;
- accepts only `state` and `pong` kinds;
- requires `players` to be an array for a state snapshot;
- replaces invalid or missing optional scalar values with documented neutral
  defaults without introducing legacy fields;
- rejects a state snapshot whose `ts` is older than the latest applied server
  timestamp;
- keeps a player in lists when coordinates are absent, but does not plot it;
- treats an incomplete or non-finite ring as absent.

The player-information toolbar exports the latest complete raw `state` message
as JSON. The export recursively orders object keys by dictionary order, uses
four spaces per indentation level, and orders players by ascending numeric
`team` followed by dictionary-ordered `name`. Imported files must use a `.json`
filename and must parse as a `state`
message through this same boundary; `pong`, unknown kinds, invalid JSON, and a
non-array `players` value are rejected without changing frontend state. An
accepted imported snapshot enters offline preview: the active connection and
ping timer are stopped, and a pending initial connection attempt is cancelled
until the user explicitly uses a connection/reconnect control. It also remains display-only with respect
to server ordering: it does not replace the last accepted live timestamp, and
the next valid live snapshot resumes without interpolation from test data.

## Affected frontend modules

| Module | Responsibility |
| --- | --- |
| `src/protocol/hoozi3.js` | JSON parsing, message validation, and field normalization |
| `src/state/store.js` | Atomic snapshots, selection, ordering, and frame interpolation |
| `src/render/ring.js` | Map-only outside-zone filter and thin sky-blue ring boundary |
| `src/render/entities.js` | Team links, local marker, player marker, vitals, and labels on the unaffected top canvas |
| `src/render/viewport.js` | Pure zoom bounds, gesture anchors, observation-port resize, and fixed-follow transform math |
| `src/render/radar.js` | Fixed drawing-surface sizing, observation-port clipping, coordinate transform, and pan/zoom/follow behavior |
| `src/ui/layout.js` | Pure map-first landscape column allocation with menu/player-list visibility |
| `src/ui/player-data.js` | JSON import/export filename validation, creation, formatting, and deterministic ordering |
| `src/ui/roster.js` | Pure roster bit-mask labels and table colors |
| `src/ui/controls.js` | Connection inputs, display settings, focus selector, and table |
| `src/assets/maps.js` | Verified raw-map token mapping, localized labels, lobby detection, and page-protocol-dependent R2/local asset fallback |
| `src/main.js` | WebSocket lifecycle and module wiring |

## Unconfirmed values and runtime checks

- The API reference lists `yaw` as a number but does not specify degrees,
  handedness, or its orientation relative to the generated map pixels. The
  frontend exposes the value but does not draw a directional arrow.
- `legend_icon_key` and `rank_icon_key` are resolved only through the observed
  local `./res/<key>.png` contract. No CDN or fallback namespace is inferred.
- `rank_color` is preserved in state/export only. Its visual meaning is not
  used by the current table or map rendering.
