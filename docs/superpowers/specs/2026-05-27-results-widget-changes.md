---
title: Results Widget Changes (renegades-scores)
date: 2026-05-27
status: approved
scope: renegades-scores repo (separate implementation)
related: 2026-05-27-results-page-redesign.md
---

# Results Widget Changes

## Goal

Extend `widget.html` with a `view=` parameter to support three display modes: Spielplan (enhanced existing), Tabelle (new), Live (new). Add `league-config.json` for phase metadata and extend `snapshot.json` with standings data.

## URL Parameter

```
?t={teamId}&view={mode}&color={hex}
```

| `view=` | Status | Description |
|---|---|---|
| `spielplan` | enhance existing | Chronological game list with pagination |
| `table` | new | League standings per phase |
| `live` | new | Live ticker, polls Leaguesphere directly |

`view=spielplan` is the default if omitted (backwards compatible with existing embeds).

---

## view=spielplan (Enhanced)

**Default display:**
- Last 3 Spieltage with results, ordered chronologically (oldest at top, most recent just above upcoming games)
- All upcoming Spieltage
- Current/next game visually highlighted

**Pagination:**
- "Weitere laden" button below past games
- Each click reveals the next 3 past Spieltage
- Button hidden when all past games are shown

**Visual states:**
- Past game: score displayed, team names, date
- Upcoming game: date, opponent, location (no score)
- Next game: highlighted card (accent border or badge "Nächstes Spiel")

---

## view=table (New)

**Data source:** `snapshot.json → standings[teamId]`

**Display:**
- Phase selector (tabs or dropdown) if multiple phases exist for the season (e.g. Gruppenphase + Playoffs)
- Per phase: classic league table — Rank, Team, Gespielt, S, N, Punkte
- Current team row highlighted with accent color

**Phase config:** read from `league-config.json` (see below)

---

## view=live (New)

**Data source:** Leaguesphere API, polled directly in the browser every 30 seconds. Does not use `snapshot.json`.

**Idle state:** "Kein Spiel live" message with neutral styling.

**Active state:**
- Play-by-play ticker (uses existing `parseGameLog` logic from `_gen_snapshot.js`, adapted for runtime)
- Score display (home / away with current score)
- Quarter / game clock if available
- Auto-scroll to latest event

**Live detection:** A field `isLive: true` in `snapshot.json` per team can optionally signal to the Angular host that a game is active (for tab dot styling). The widget itself always polls regardless.

---

## league-config.json (New file)

Manually maintained. Defines which gameday IDs belong to which phase per league+season combination.

```json
{
  "DFFL Süd-Ost / 2026": {
    "phases": [
      { "type": "Gruppenphase", "gameday_ids": [630, 631, 632, 633] },
      { "type": "Playoffs",     "gameday_ids": [640, 641] }
    ]
  },
  "DFFL Süd-Ost / 2025": {
    "phases": [
      { "type": "Gruppenphase", "gameday_ids": [420, 421, 422] },
      { "type": "Playoffs",     "gameday_ids": [430] }
    ]
  }
}
```

Phase types are display strings — no fixed enum, can vary per league (e.g. "Vorrunde", "Gruppenphase", "Playoffs", "Finale").

Used by:
- `_gen_snapshot.js` — tags each gameday with its phase when building standings
- `widget.html` — determines phase selector options and which table to show

---

## snapshot.json — New standings field

Added by `_gen_snapshot.js` after fetching standings from Leaguesphere:

```json
{
  "generated": "2026-05-27",
  "teams": [...],
  "standings": {
    "159": {
      "phases": [
        {
          "type": "Gruppenphase",
          "league": "DFFL Süd-Ost",
          "season": "2026",
          "table": [
            { "rank": 1, "team": "Nürnberg Renegades", "played": 4, "wins": 3, "losses": 1, "points": 6 },
            { "rank": 2, "team": "...", "played": 4, "wins": 2, "losses": 2, "points": 4 }
          ]
        }
      ]
    },
    "287": {
      "phases": [...]
    }
  }
}
```

**Open question:** Leaguesphere API endpoint for standings needs verification (see `leaguesphere-api-analysis.md`).

---

## GitHub Actions

No new workflow needed. Existing `update-snapshot.yml` (daily 3 AM UTC) extended to also fetch standings when `league-config.json` is present.

---

## Backwards Compatibility

Existing embeds without `view=` param continue to work — default is `spielplan`, which is the current behaviour enhanced.
