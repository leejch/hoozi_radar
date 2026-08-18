# HOOZi 3.0 Web Radar Protocol

## Scope and sources

This document describes the payload accepted by the active browser frontend.
The current serialized player shape is verified from the real captures under
`tests/fixtures/`. The copied Lua reference at
`references/hapex3-lua-script-factory/scripts/web_radar.lua` still shows an
earlier, wider payload and is intentionally not edited in this repository.

When the reference snapshot and current captures disagree about serialized
fields, the current captures define the frontend boundary.

## Message flow

The frontend opens the automatic target `ws://127.0.0.1:9001/ws` when served
over HTTP. HTTPS pages use `wss://<page-host>/ws`. A manual target can be chosen
from the connection menu.

Server to browser:

- `state`: one complete state snapshot
- `pong`: optional response to the browser's `ping`

Browser to server:

```json
{ "kind": "ping" }
```

Unknown message kinds, invalid JSON, or a `state` whose `players` value is not
an array are rejected without applying partial state.

## State message

```json
{
    "kind": "state",
    "ts": 5989.88,
    "map": "mp_rr_tropic_island_mu2_landscape",
    "players": [
        {
            "damage": 2,
            "distance": 342,
            "id": "ix34",
            "index": 34,
            "is_dead": false,
            "kills": 2,
            "legend": "Loba",
            "legend_icon_key": "icon_legends/30px-Portrait_Loba_square",
            "level": 277,
            "name": "Yuuki",
            "rank": "Diamond 2",
            "rank_color": "#358DE6",
            "rank_icon_key": "icon_rank/diamond2",
            "roster": 0,
            "self": false,
            "team": 3,
            "uid": "1018566565842",
            "x": 333.08,
            "y": 677.11,
            "yaw": -101.95
        }
    ],
    "ring": {
        "x": 339.22,
        "y": 707.45,
        "radius": 122.19,
        "t_start": 789.15,
        "t_end": 847.48,
        "t_now": 809.9
    }
}
```

`ring` may be absent, `null`, or unusable. The frontend normalizes those cases
to no active ring.

### Top-level fields

| Field | Type | Frontend behavior |
| --- | --- | --- |
| `kind` | string | Must be `state`. |
| `ts` | number | Orders live snapshots; older live timestamps are rejected. |
| `map` | string | Raw runtime map name used for map classification and display. |
| `players` | array | Full replacement player snapshot. |
| `ring` | object or null | Optional map-space ring. |

### Player fields

| Field | Type | Normalization and effect |
| --- | --- | --- |
| `id` | string | Stable entity key within a match; fallback `snapshot-<index>`. Used for rows and focus matching. |
| `index` | number | Preserved raw entity index. |
| `self` | boolean | Identifies the current automatic focus/observation target for this snapshot. |
| `name` | string | Selector, focus, table, map label, and export. Empty becomes `?`. |
| `team` | number | Team color, ordering, links, labels, and UID-anchored local-team privacy. Missing becomes `0`. |
| `x`, `y` | number | Map coordinates in the 1000 by 1000 domain. If either is absent, the player remains in state/table but is not plotted. |
| `yaw` | number | Degrees normalized to `(-180, 180]`. Observed map axes use `0` as east and positive values turning toward north. |
| `distance` | number | Non-negative display/status value. |
| `is_dead` | boolean | Dead players remain in state/table but are not plotted on the map. |
| `legend` | string | Legend label; `pilot_medium_empty` becomes empty. |
| `legend_icon_key` | string | Resolved through the documented legend icon source order. |
| `uid` | string | Platform UID. It is also the identity anchor for determining the actual local team. |
| `level` | number | Non-negative level value. |
| `kills` | number | Non-negative focus/table/map-label value. |
| `damage` | number | Non-negative focus/table/map-label value. |
| `rank` | string | Rank label; `None` becomes empty. |
| `rank_icon_key` | string | Resolved through the documented rank icon source order. |
| `rank_color` | string | Preserved raw metadata; not rendered as a table field. |
| `roster` | number | Opaque bit markers used by the existing localized roster tags. |

The frontend also derives:

- `position`: `{x, y}` when both coordinates are finite, otherwise `null`
- `uid_long`: the existing browser-derived long UID string

Each player object is immutable after protocol normalization.

### Removed player fields

The current backend no longer sends these fields, and the frontend neither
normalizes nor synthesizes them:

- `hp`
- `is_down`
- `max_hp`
- `max_shield`
- `shield`
- `squad`

Consequently there are no health/shield bars, downed marker, vitals table
column, downed table column, health/shield focus values, or related settings.
If an older payload still contains these keys, the protocol boundary ignores
them.

## Yaw and map heading

Yaw values are treated as degrees. Normalization maps arbitrary finite input to
`(-180, 180]`, including `-180` to `180`. The heading vector is:

```text
dx = cos(yaw)
dy = -sin(yaw)
```

This makes `0` point right/east, `90` point up/north, `180` point left/west,
and `-90` point down/south. This axis mapping incorporates the observed correction
where a player facing south previously rendered as facing west. A white needle with a dark outline is drawn from
each live player marker. Between snapshots, yaw follows the shortest angular
path so crossing the `180/-180` boundary does not spin the long way around.

## Focus and local-player identity

Focus and privacy use separate concepts:

- Automatic focus is resolved from the current snapshot's `self: true` player.
  This can legitimately be another team's player while spectating.
- A manually selected non-self player overrides automatic focus while the same
  `id` plus UID/name identity remains present.
- With no `self: true` player, automatic focus is empty. It never falls back to
  the first player.
- When `self` returns in the next match, automatic focus follows it again.

For local-team identity, the store captures the first non-empty UID belonging
to `self` and keeps that UID separate from later observation-target changes.
The UID is retained in browser `sessionStorage`, so a reload in the same tab
while spectating can still identify the real local team. On every snapshot,
the team is looked up from the player whose UID matches that anchor. Therefore:

- when the local team dies and `self` moves to an enemy, that enemy team is not
  treated as local;
- when the same UID appears with a new entity `id` or team in the next match,
  the local-team mapping updates automatically;
- when the known UID is temporarily absent, the local team is unknown instead
  of falling back to the spectated `self` team.

If a page is opened for the first time only after spectating has already begun,
the payload contains no independent flag that can distinguish the account UID
from the observation target. The frontend can only anchor an identity it has
already observed or restored in that browser session.

## Optional local-team anonymity

The menu option `Anonymize local team` / `本队前端匿名` is off by default.
When enabled, the UID-anchored local team uses this display/export projection:

- `name` becomes `HOOZi3.0`;
- `legend`, `rank`, `level`, `uid`, and derived `uid_long` display as `-`;
- legend/rank icon keys become empty so their images are not requested;
- exported private fields become empty strings.

The normalized snapshot remains unchanged. The projection applies only at
selector, focus, map-label, table, and export boundaries. A spectated enemy
whose `self` value is true remains visible unless that player's team actually
matches the anchored local UID's team.

## Map identifiers and assets

For raw names beginning with `mp_rr_`, classification uses only the first token
after that prefix; later suffixes are variants of the same base map.

| Token | Base runtime name | Asset |
| --- | --- | --- |
| `canyonlands` | `mp_rr_canyonlands` | `mp_rr_canyonlands.png` |
| `desertlands` | `mp_rr_desertlands` | `mp_rr_desertlands.png` |
| `olympus` | `mp_rr_olympus` | `mp_rr_olympus.png` |
| `divided` | `mp_rr_divided_moon` | `mp_rr_divided_moon.png` |
| `tropic` | `mp_rr_tropic_island` | `mp_rr_tropic_island.png` |
| `nemesis` | `mp_rr_nemesis` | `mp_rr_district.png` |

Image sources follow the location-aware order implemented in `src/config.js`:
local first for non-HTTPS pages and HOOZi R2 first for HTTPS pages.

## Ring fields

| Field | Type | Meaning |
| --- | --- | --- |
| `x`, `y` | number | Ring center in map coordinates. |
| `radius` | number | Non-negative map radius. |
| `t_start`, `t_end`, `t_now` | number | Preserved timing metadata. |

An invalid center or radius disables the ring for that snapshot.

## HOOZi 2.0 and earlier payload removals

The active frontend does not restore legacy assumptions such as nested `pos`,
`pro`, `black`, `white`, `hostile`, a numeric map sentinel, a 1920 by 1080 crop,
port 2334, or partial-patch messages. The six fields removed by the current
HOOZi 3.0 backend are also not emulated in the browser.

## Unsupported data and remaining uncertainties

The active state payload does not contain loot or projectiles, so the browser
cannot render them. Icon-key namespaces are implemented only for the observed
legend and rank prefixes. The detailed semantic contract of `rank_color` and
numeric `roster` values remains partly opaque; those raw values are not given
new inferred meanings.

## Main implementation points

| File | Responsibility |
| --- | --- |
| `src/protocol/hoozi3.js` | Decode, validate, remove old fields, normalize yaw, derive pure fields. |
| `src/state/store.js` | Timestamp ordering, interpolation, focus state, UID identity anchor. |
| `src/player-display.js` | Opt-in local-team privacy projection. |
| `src/render/entities.js` | Player markers, yaw needles, links, and labels. |
| `src/ui/controls.js` | Menu, selector, focus, table, import/export wiring. |
| `src/ui/player-data.js` | Sorted JSON export and optional privacy projection. |
| `tests/fixtures/` | Current real backend captures defining the player shape. |
