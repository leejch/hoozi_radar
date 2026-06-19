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
2. A browser connects to `ws://127.0.0.1:9001` (no required path).
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
  "map": "mp_rr_canyonlands_64k_x_64k",
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
| `map` | string | runtime map identifier | `game.world.map_name` | Selects `<map>.png` through CDN-first asset loading. No numeric legacy alias is invented. |
| `players` | array | — | Plain-table snapshots of non-NPC `game.entities.players` | Replaces the complete player set atomically. |
| `ring` | object or absent | map pixels and game-time values | Active `game.world.ring`, converted by Lua | Drawn below entities; remaining phase time is derived as `max(0, t_end - t_now)`. |

## Player fields

| Field | JSON type | Unit/domain | Verified meaning and transformation | Frontend behavior |
| --- | --- | --- | --- | --- |
| `id` | string | — | Stable key chosen by Lua: `ix<index>`, else `uid<platform_uid>`, else `anon-<name>` | Entity identity, selection, interpolation, and keyed table updates. |
| `self` | boolean | — | Player index equals `game.localplayer.index` | Default focus and distinct local-player marker. |
| `name` | string | — | `p.name`, fallback `"?"` | Labels, selector, and table. |
| `index` | number or absent | entity index | `p.index` | Display/export metadata; `id` remains the primary browser key. |
| `team` | number | game team number | `p.team_num`, fallback `0` | Team color and teammate connection lines. |
| `squad` | number | game squad identifier | `p.squad_id`, fallback `0` | Displayed with team metadata; no extra semantics are inferred. |
| `x`, `y` | number or absent | 0–1000 map pixels | Lua calls `math.WorldToMapPixel(worldX, worldY, 1000, 1000)` and applies a two-second sticky cache | Direct square-map coordinates. Players without both values are retained in state but not plotted. |
| `yaw` | number | not specified by the checked API | `p.yaw` forwarded unchanged after finite-value validation | Retained and shown numerically. It is not converted into a map heading because the reference does not define its unit/orientation contract. |
| `hp` | number | health points | `p.health`, fallback `0` | Health bar and status/table details. |
| `max_hp` | number | health points | Literal `100` in Lua | Health ratio denominator. |
| `shield` | number | shield points | `p.shield`, fallback `0` | Shield bar and status/table details. |
| `max_shield` | number | shield points | `p.max_shield`, fallback `0` | Shield ratio denominator. |
| `distance` | number | meters | `p.distance`; API examples compare it to meter thresholds | Focus/table details. |
| `is_dead` | boolean | — | `p.is_dead` | Dead marker styling and optional visibility filter. |
| `is_down` | boolean | — | `p.is_down` | Downed marker styling and optional visibility filter. |
| `legend` | string | runtime label | `p.legend` | Label, focus, and table details. |
| `legend_icon_key` | string | opaque asset key | Forwarded from `p.legend_icon_key` | Preserved in normalized state/export. No icon URL is constructed because the reference provides no asset-key contract. |
| `uid` | string | platform UID | `p.platform_uid` | Displayed exactly as received. No HOOZi 2.0 XOR/short/long conversion is applied. |
| `level` | number | account level | `p.grade` | Focus/table/stat labels. |
| `kills` | number | count | `p.kills` | Focus/table/stat labels. |
| `damage` | number | damage count/value from runtime | `p.damage` | Focus/table/stat labels. |
| `rank` | string | runtime label | `p.rank` | Focus/table details. |
| `rank_icon_key` | string | opaque asset key | Forwarded from `p.rank_icon_key` | Preserved in state/export; no undocumented URL lookup. |
| `rank_color` | string | undocumented format | Forwarded from `p.rank_color` | Preserved in state/export but not interpreted as CSS because its format is not documented. |
| `roster` | number | undocumented category/value | `p.roster`, fallback `0` | Displayed as a numeric value only; it is not mapped to legacy “pro/black/white” tags. |

NPC entries are intentionally excluded in Lua (`if not p.is_npc`). The frontend
therefore has no NPC category to render.

## Ring fields

| Field | JSON type | Unit/domain | Verified meaning and transformation | Frontend behavior |
| --- | --- | --- | --- | --- |
| `x`, `y` | number | 0–1000 map pixels | Ring world origin converted with `WorldToMapPixel(..., 1000, 1000)` | Circle center. |
| `radius` | number | map pixels | Lua interpolates the world radius between phase endpoints, then calls `WorldRadiusToMapPixel` | Circle radius. No second radius interpolation is invented. |
| `t_start`, `t_end` | number | ring game-time clock | `ring.time_start`, `ring.time_end` | Phase timing metadata. |
| `t_now` | number | same ring clock | `time.curtime()` used by the Lua interpolation | Remaining-time display/calculation. |

The Lua script clamps the radius interpolation fraction to `[0, 1]`. If ring
origin or radius conversion fails, the entire `ring` property is omitted.

## HOOZi 2.0 migration map

| Legacy frontend assumption | HOOZi 3.0 equivalent | Migration action |
| --- | --- | --- |
| `ws://127.0.0.1:2334/ws` | `ws://127.0.0.1:9001` | Default target and path replaced. Manual `ws`/`wss` targets remain configurable for an external relay. |
| Snapshot payload accepted without a message discriminator | `kind: "state"` | Strict kind-based parsing. |
| `player.pos.x`, `player.pos.y` | Flat `player.x`, `player.y` | Normalize to a single internal `{x,y}` position. |
| Local player identified by name `"<hoozi>"` | `player.self` | Selection and focus use `self` and stable `id`. |
| Incoming coordinates interpreted inside a 1920×1080 frame with a 1015-pixel crop | Lua-produced 0–1000 square coordinates | Removed legacy offsets/crop; render directly against the square map. |
| Numeric map IDs `1`–`6`, sentinel `-1`/`0` | `game.world.map_name` string, empty string outside a known map | Use the exact non-empty string. Empty map means no active map. Numeric local assets remain legacy files and are not assigned to raw map strings without a verified mapping. |
| `uidShort` plus XOR-derived `uidLong` | Exact `uid = p.platform_uid` | Removed the undocumented XOR conversion and duplicate UID columns. |
| `pro`, `black`, `white`, `hostile` | No verified field | Removed tag/filter behavior. |
| Threshold-generated “danger/high kills/low level” protocol semantics | `level` and `kills` are plain values | Values remain displayable; the migration does not claim protocol-level suspicion semantics. |
| No ring rendering | `ring` object | Added ring rendering and phase remaining time. |
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

## Affected frontend modules

| Module | Responsibility |
| --- | --- |
| `src/protocol/hoozi3.js` | JSON parsing, message validation, and field normalization |
| `src/state/store.js` | Atomic snapshots, selection, ordering, and frame interpolation |
| `src/render/entities.js` | Ring, team links, local marker, player marker, vitals, and labels |
| `src/render/radar.js` | Canvas sizing, square coordinate transform, pan/zoom/follow behavior |
| `src/ui/controls.js` | Connection inputs, display settings, focus selector, and table |
| `src/assets/maps.js` | Exact map-name asset lookup with CDN-first and local fallback |
| `src/main.js` | WebSocket lifecycle and module wiring |

## Unconfirmed values and runtime checks

- The API reference lists `yaw` as a number but does not specify degrees,
  handedness, or its orientation relative to the generated map pixels. The
  frontend exposes the value but does not draw a directional arrow.
- The formats and asset namespaces of `legend_icon_key`, `rank_icon_key`, and
  `rank_color` are not documented. They are preserved but not interpreted.
- The semantic categories represented by numeric `roster` values are not
  documented. The value is not mapped to legacy roster tags.
- The reference snapshot provides no verified mapping between raw
  `game.world.map_name` values and legacy numeric `static/1.png`–`6.png`
  assets. Exact-name CDN/local lookup is implemented; aliases require verified
  runtime data or an authoritative map manifest.
