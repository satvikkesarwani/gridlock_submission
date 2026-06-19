# EventFlow AI — CLAUDE.md

Event-traffic management prototype. A **React (mobile-prototype) frontend** talks to a
**FastAPI + ML backend** that predicts traffic-impact and clearance-time for planned events.

```
backend/    FastAPI app + ML models (XGBoost/LightGBM/MLP stacked ensemble, quantile + survival)
frontend/   React 19 + Vite 7 SPA, rendered inside a faux-phone shell
dataset/    training data + weather cache
```

## UI / design tooling (installed for this repo)

Three plugins are enabled in [.claude/settings.json](.claude/settings.json) (project scope).
**They load on a new session** — MCP servers also prompt for trust on first use — so restart
Claude Code before relying on them.

- **`frontend-design`** *(skill, primary)* — design-lead guidance for distinctive, production-grade
  UI: palette/type/layout token systems, self-critique passes, copy. **Invoke it for any
  "improve/redesign the UI" work** before writing CSS/JSX.
- **`playwright`** *(MCP)* — the visual feedback loop: open the running app, screenshot, click,
  inspect the DOM, iterate. Use it to *see* what you build and self-critique (a screenshot is
  worth 1000 tokens). Point it at the Vite dev URL.
- **`context7`** *(MCP)* — version-specific docs for React 19 / Vite 7 / recharts / react-leaflet
  so you don't reach for stale APIs.

## Running the app

**Fast UI iteration (recommended for design work):** Vite dev server with HMR.
```bash
cd frontend && npm install && npm run dev      # http://localhost:5173
```
Pages render with mock-data fallbacks, so the dev server alone is enough for pure visual work.
Only Simulate / Optimize / Live / Debrief need the backend (dev API base is `http://127.0.0.1:8000`).

**Backend** (needed for live data). xgboost/lightgbm can't find `libomp.dylib` on this Mac, so
prefix with sklearn's bundled copy:
```bash
cd backend
export DYLD_LIBRARY_PATH="$(pwd)/venv/lib/python3.9/site-packages/sklearn/.dylibs"
./venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000
pkill -f uvicorn      # kill stale servers first — they hold :8000 and serve an old model
```

**Single-app / deploy mode:** the backend serves `frontend/dist` at `:8000`. After UI changes,
`cd frontend && npm run build` to refresh `dist` (in PROD the API base is same-origin `""`).

## Frontend architecture

- **Entry:** [main.jsx](frontend/src/main.jsx) → `BrowserRouter` → [App.jsx](frontend/src/App.jsx)
  (routes) → every page wrapped in [PhoneFrame](frontend/src/components/PhoneFrame.jsx).
- **The whole UI is a mobile mockup**: `.desktop-stage` (dark backdrop) → `.phone-shell` (device
  bezel) → `.phone-screen` → `.scroll-area` (the page) + fixed `BottomNav`. Design for the narrow
  phone viewport, not desktop width.
- **Routes / pages:** `/` Landing · `/simulator` PredictiveSimulator · `/optimizer`
  ResourceOptimizer · `/live-control` LiveCorridorControl · `/debrief` PostEventDebrief.
- **Libraries:** `lucide-react` (icons), `recharts` (charts), `react-leaflet`/`leaflet` (live map),
  `react-router-dom` v7. SVG "mock maps" live in [MockMap.jsx](frontend/src/components/MockMap.jsx).
- **Styling:** one global stylesheet, [global.css](frontend/src/styles/global.css) — no CSS modules,
  no Tailwind. Add/extend classes there. Watch selector specificity (type vs element selectors can
  cancel each other's padding/margins).

### Design tokens (`:root` in global.css)
```
--primary #00d2ff   --primary-dark #3a7bd5   --blue #3b82f6
--danger  #ef4444   --warning      #f59e0b
--bg #0b0f19  --screen #0f172a  (dark device shell; in-screen cards are light/#fff surfaces)
font-family: Inter
```
Tone words used across components: `green | amber | red | blue | navy` (drive metric/pill colors).

### Component primitives (compose these; match their idiom)
- [Card](frontend/src/components/Card.jsx) — titled surface (`title`, optional `action` slot).
- [ActionButton](frontend/src/components/ActionButton.jsx) — primary/secondary CTA; `primary`
  shows a chevron. Pass `onClick`.
- [Pill](frontend/src/components/Pill.jsx) — chip/tag. **Renders a `<span>` by default, but a real
  `<button>` (with `aria-pressed`) when given `onClick`.** Use `onClick` for any interactive
  chip/toggle; leave it off for pure labels.
- [MetricCard](frontend/src/components/MetricCard.jsx), [MiniLineChart](frontend/src/components/MiniLineChart.jsx),
  [HorizontalBarChart](frontend/src/components/HorizontalBarChart.jsx),
  [AppHeader](frontend/src/components/AppHeader.jsx), [BottomNav](frontend/src/components/BottomNav.jsx).

### Conventions
- **No dead CTAs.** Every button/chip must do something: hit the backend, navigate, or toggle real
  state. If a control implies a capability the backend doesn't have, don't ship it.
- Active-voice, consistent copy: a control names what it does and keeps that name through the flow.
- Keep the keyboard/focus + reduced-motion floor; the app is a demo, so polish reads.

## Backend API (what data the UI can use)
- `POST /api/simulate` → `{ predicted_delay_mins, resources{…} }` (impact + resource recs)
- `POST /api/clearance-risk` → P10/P50/P90 clearance-time range
- `GET  /api/live-status` and `WS /api/ws/live-status` → live corridor metrics + forecast
- `GET  /api/debrief` → plan-vs-actual, variance, SHAP importance
- `GET  /api/health`
Request shape for the POST endpoints: `event_cause, priority, hour_of_day(0-23), is_weekend,
requires_road_closure, attendance?` (see [main.py](backend/api/main.py)).
