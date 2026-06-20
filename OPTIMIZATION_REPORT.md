# Optimization Report — Gridlock Intelligence System

Date: 2026-06-20. Scope: performance, reliability, deployment-readiness, and polish — **no feature/behavior changes to APIs or models.**

## What was inspected
Repository structure, frontend source (31 files, ~1.9k LOC), backend (`backend/api/main.py` + ML components), ML artifacts (`impact_model.pkl`, `quantile_model.pkl`), dataset, tests, `Dockerfile`/`.dockerignore`/`.gitignore`, bundle output, and package sizes.

## Issues found
| # | Issue | Severity |
|---|-------|----------|
| 1 | Single 822 KB / 240 KB-gzip JS chunk; no code-splitting (Landing shipped Leaflet+Recharts it never uses) | High |
| 2 | `favicon.ico` 404 on every page load | Medium |
| 3 | Leaflet marker icons fetched from external CDNs (cloudflare + `raw.githubusercontent.com`) at runtime | Medium |
| 4 | Leaflet icon setup duplicated across 3 components | Low |
| 5 | CORS `allow_origins=["*"]` + `allow_credentials=True` — invalid per spec | Medium |
| 6 | Tests only collectable from repo root (no pytest config) | Low |
| 7 | `import random` inside 3 request handlers; duplicated live-status payload | Low |
| 8 | `weather_cache.csv` (3.2 MB) tracked despite being `.gitignore`d | Low |

## Optimizations applied
**Frontend**
- **Route-level code-splitting** (`React.lazy` + `Suspense`) in `App.jsx` + **manual vendor chunks** (`react` / `router` / `maps` / `charts` / `vendor`) in `vite.config.js`. Landing initial JS dropped from **240 KB → ~110 KB gzip**; the 81 KB charts and 45 KB maps chunks now load only on the pages that use them.
- **Bundled Leaflet marker icons locally** via new `src/components/leafletIcons.js` (images imported from the `leaflet` npm package); replaced the red incident pin with a self-contained inline-SVG `divIcon`. Removed all 3 external-CDN icon blocks → zero third-party image requests at runtime.
- **Added `public/favicon.svg`** (brand-matched) + `<link>` in `index.html` → favicon 404 gone.
- **Accessibility:** `name` + `aria-label` on all form controls; `Suspense` fallback with `role="status"`; reduced-motion handling on the loader.

**Backend** (`backend/api/main.py`)
- Set `allow_credentials=False` so the wildcard CORS origin is spec-valid.
- Hoisted `import random` to module scope; extracted `_live_status_metrics()` shared by the REST snapshot and the WebSocket stream (removed duplication; behavior preserved).

**Tooling / hygiene**
- Added root `pytest.ini` (`pythonpath = .`) so tests run from any directory and warnings are filtered.
- `git rm --cached dataset/weather_cache.csv` (already `.gitignore`d; file kept on disk).

## Commands run & results
- `npm run build` → clean; bundle split into per-route + vendor chunks.
- `python -m pytest` (repo root **and** `backend/`) → **23 passed** both ways.
- Backend restart → startup OK; `POST /api/simulate` CORS header now `access-control-allow-origin: *` with no credentials header.
- ML sanity (`hour_of_day` 3/8/20) → delay 96.5 / 166.6 / 157.0 min — distinct, finite, JSON-safe.
- All endpoints (`/api/health`, `/api/live-status`, `/api/debrief`, `/api/clearance-risk`) → 200.
- Browser: home, simulator (incl. new editable time inputs + maps), optimizer, live corridor, debrief — no console errors; backend-down path shows a diagnostic message.

## Performance / reliability improvements
- ~55% smaller initial JS payload on first paint (Landing).
- No runtime dependency on third-party image CDNs (markers render offline/air-gapped).
- Spec-valid CORS; tests runnable from anywhere; lighter repo.

## Remaining risks
- Low. Charts vendor chunk is still ~81 KB gzip (Recharts) but now lazy-loaded only where used.
- Geographic map overlays remain illustrative offsets (documented), not model-derived geometry.

## Final status
All builds and tests pass; no API contract, model, dataset, or dependency-manifest changes. Safe to review and commit.

## Before committing — manual checks
1. `cd frontend && npm run build` → expect clean multi-chunk output.
2. `python -m pytest` from repo root → expect 23 passed.
3. `./run.sh` → open the app, run a simulation, confirm maps + editable time work.
