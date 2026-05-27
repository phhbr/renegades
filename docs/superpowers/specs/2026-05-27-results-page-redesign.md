---
title: Results Page Redesign
date: 2026-05-27
status: approved
scope: Angular (renegades-website)
related: renegades-scores widget changes (separate spec)
---

# Results Page Redesign

## Goal

Replace the current single results page (two stacked iframes) with a tabbed, team-specific results section. Each team gets its own sub-route with three tabs: Spielplan, Tabelle, Live.

## Routing

New child routes under `/ergebnisse`:

```
/ergebnisse                            → redirect → /ergebnisse/1-mannschaft/spielplan
/ergebnisse/1-mannschaft               → redirect → /ergebnisse/1-mannschaft/spielplan
/ergebnisse/2-mannschaft               → redirect → /ergebnisse/2-mannschaft/spielplan
/ergebnisse/:team/:tab                 → ResultsComponent
```

`:team` = `1-mannschaft` | `2-mannschaft`  
`:tab` = `spielplan` | `tabelle` | `live`

All 6 routes are added to `app.config.server.ts` for SSR prerendering.

## Component Structure

`ResultsComponent` handles the full page. It reads `:team` and `:tab` from the active route and renders:

1. **Team selector** — two pills (1. Mannschaft / 2. Mannschaft). Clicking navigates to `/ergebnisse/:team/spielplan`.
2. **Tab bar** — three tabs. Clicking navigates to `/ergebnisse/:team/:tab`. Active tab derived from route.
3. **Tab content** — one iframe or placeholder rendered based on active tab.

Only one iframe is mounted at a time (the active tab). Height is driven by postMessage from the widget, same mechanism as today. Minimum height: 400px (reduced from current 1454px since Spielplan replaces the combined view).

## Tab Behaviour

### Spielplan (default)
- Renders iframe: `https://claudiost.github.io/renegades-scores/widget.html?t={teamId}&view=spielplan&color=ffab00`
- This reuses the existing widget. The `view=spielplan` param is new in the widget repo but the current widget behaviour (all games, chronological) is the baseline.

### Tabelle
- Placeholder for now: centered text "Demnächst verfügbar" with a small icon.
- No iframe loaded.
- When widget is ready: `?view=table`

### Live
- Always visible. Idle state: grey dot in tab label, centered text "Aktuell kein Spiel live".
- No iframe loaded in idle state.
- When widget is ready: `?view=live` — red dot in tab label, iframe with live ticker.
- The live/idle state is determined by a field in `snapshot.json` (to be defined in widget spec). For now always idle.

## Team IDs

| Team | Leaguesphere ID |
|---|---|
| 1. Mannschaft | 159 |
| 2. Mannschaft | 287 |

## i18n Keys (DE + EN)

New keys required:

```
results.team1          = "1. Mannschaft" / "1st Team"
results.team2          = "2. Mannschaft" / "2nd Team"
results.tab.spielplan  = "Spielplan"     / "Schedule"
results.tab.tabelle    = "Tabelle"       / "Standings"
results.tab.live       = "Live"          / "Live"
results.placeholder    = "Demnächst verfügbar" / "Coming soon"
results.noLiveGame     = "Aktuell kein Spiel live" / "No live game right now"
```

Existing `results.title`, `results.firstTeam`, `results.secondTeam` keys can be removed or repurposed.

## Prerender Routes

Add to `app.config.server.ts`:

```
/ergebnisse/1-mannschaft/spielplan
/ergebnisse/1-mannschaft/tabelle
/ergebnisse/1-mannschaft/live
/ergebnisse/2-mannschaft/spielplan
/ergebnisse/2-mannschaft/tabelle
/ergebnisse/2-mannschaft/live
```

Remove old `/ergebnisse` prerender entry (now a redirect).

## Navbar

No change. The navbar link points to `/ergebnisse` which redirects automatically.

## Out of Scope (this spec)

- `view=table` widget implementation → see `renegades-scores` widget spec
- `view=live` widget implementation → see `renegades-scores` widget spec
- Live game detection (active/idle state) → depends on widget spec
- `league-config.json` and standings fetching → widget spec
