# Deep Testing Report

## Environment
- Date: 2026-06-19
- Branch: `main`
- Python: 3.13.5
- Frontend: React 19 + Vite 7
- Backend: FastAPI + Uvicorn
- ML runtime: pandas, scikit-learn, LightGBM
- Dataset: `dataset/Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv`

## Structure And Required Files
Verified these project areas:
- `frontend/`: Vite React app, routes, page components, build config, lockfile.
- `backend/api/main.py`: FastAPI app and API routes.
- `backend/ml_components/`: model pipeline, quantile model, generated model artifacts.
- `dataset/`: source CSV and dataset utilities.

Required runtime artifacts now present:
- `backend/ml_components/impact_model.pkl`
- `backend/ml_components/quantile_model.pkl`
- `frontend/package-lock.json`
- `backend/requirements.txt`

## Commands Run
Backend setup:
```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
.venv/bin/python -m pip check
```

Fresh backend install verification:
```bash
python3 -m venv /private/tmp/gridlock_backend_fresh_venv
/private/tmp/gridlock_backend_fresh_venv/bin/python -m pip install -r backend/requirements.txt
/private/tmp/gridlock_backend_fresh_venv/bin/python -c "from backend.api.main import app, impact_model, clearance_range_model; print(app.title); print(impact_model.is_fitted, clearance_range_model.is_fitted)"
```

Frontend setup:
```bash
npm --prefix frontend ci --cache ./frontend/.npm-cache --prefer-offline
npm --prefix frontend ls --depth=0
npm --prefix frontend run build
```

Automated tests:
```bash
python3 -m pytest backend/tests -q
```

Runtime verification:
```bash
.venv/bin/python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8001
env VITE_API_BASE_URL=http://127.0.0.1:8001 VITE_WS_BASE_URL=ws://127.0.0.1:8001 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

Unavailable-backend frontend check:
```bash
env VITE_API_BASE_URL=http://127.0.0.1:8999 VITE_WS_BASE_URL=ws://127.0.0.1:8999 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5174
```

## Backend Endpoint Results
Tested endpoints:
- `GET /`
- `GET /api/live-status`
- `GET /api/debrief`
- `POST /api/simulate`
- `POST /api/clearance-risk`
- `WS /api/ws/live-status`

Direct timing checks:
- `GET /`: `200`, `0.028808s`
- `GET /api/live-status`: `200`, `0.001568s`
- `GET /api/debrief`: `200`, `0.003361s`
- `POST /api/simulate`: `200`, `0.101598s`
- `POST /api/clearance-risk`: `200`, `0.105413s`
- Invalid `hour_of_day=24`: `422`, `0.003990s`

Automated API/ML tests:
- `23 passed`
- Covered repeated endpoint calls, response schemas, JSON safety, invalid payloads, unknown categories, large attendance, model variation, resource recommendations, and WebSocket JSON shape.

## POST Test Cases Covered
For `/api/simulate` and `/api/clearance-risk`:
- Valid normal input.
- Minimum valid input without optional attendance.
- High/large attendance input.
- Extra unexpected field.
- Unknown categorical values.
- Empty JSON body.
- Missing required fields.
- `null` required fields.
- Negative hour.
- Hour above `23`.
- Very large hour.
- Repeated requests with different event hours.

Expected behavior:
- Valid/edge-but-parseable event data returns `200`.
- Invalid required fields and invalid hour ranges return `422`.
- Unknown categories do not crash the model because encoders use `handle_unknown="ignore"`.

## ML Pipeline Results
Verified:
- Both model artifacts load from the backend runtime path.
- Fresh venv can load the artifacts.
- Predictions are finite and positive.
- Different scenarios produce different predictions.
- Quantile output is ordered: `P10 <= P50 <= P90`.
- Quantile response values are plain Python `float`, not `numpy.float64`.
- Dataset-backed model regeneration works from repo-root commands.

Fresh venv sample:
- `impact_model.predict("accident", "High", 9, False, True)` returned `58.1`.
- Quantile prediction returned `{'expected_clearance_mins': 66.0, 'optimistic_p10_mins': 24.6, 'pessimistic_p90_mins': 393.7}`.

## Frontend Results
Verified:
- Clean `npm ci` from lockfile succeeds.
- `npm --prefix frontend run build` succeeds.
- App loads without blank screen.
- Simulator calls backend and displays ML delay and clearance range.
- Optimizer consumes `resources` from simulator response.
- Live Control connects to WebSocket and updates metrics.
- Debrief fetches and renders backend chart/metric data.
- Routes checked: `/`, `/simulator`, `/optimizer`, `/live-control`, `/debrief`.
- Backend-unavailable states are now visible on simulator, live feed, and debrief.

Browser happy-path result:
- Simulator: pass.
- Optimizer: pass.
- Live metrics/WebSocket: pass.
- Debrief/charts: pass.
- Console errors/warnings during happy path: none observed.

Browser error-path result with backend pointed to port `8999`:
- Simulator displayed: `Simulation failed. Check backend availability and try again.`
- Live Control displayed: `Live feed unavailable. Showing last known metrics.`
- Debrief displayed: `Debrief data unavailable. Showing cached event baseline.`

## Security And Hygiene Checks
- No `.env` files found.
- No tracked `node_modules`, `.venv`, npm cache, pycache, `.pyc`, or `.DS_Store` files found.
- No files larger than 5 MB found outside ignored dependency/cache directories.
- Secret scan found no credentials; matches were false positives in package names, comments, and dataset text.
- `pip check` passed.
- `npm audit` could not complete because DNS access to `registry.npmjs.org` failed even after network escalation. Treat this as an environment limitation; run `npm --prefix frontend audit --audit-level=high` in a normal network environment before final submission.

## Issues Found And Fixes Applied
- Backend requirements were incompatible with Python 3.13.
  - Fixed by updating runtime dependency pins in `backend/requirements.txt`.
- WebSocket route failed under Uvicorn without a WebSocket transport package.
  - Fixed by adding `websockets==15.0.1`.
- Existing `impact_model.pkl` was incompatible with the installed sklearn runtime.
  - Fixed by regenerating the model artifact from the included dataset.
- `quantile_model.pkl` was missing.
  - Fixed by training and adding the quantile model artifact.
- Quantile model returned numpy scalar values.
  - Fixed by casting response fields to Python `float`.
- `hour_of_day` invalid values could reach model code.
  - Fixed by adding Pydantic validation: `0 <= hour_of_day <= 23`.
- Frontend API URLs were hard-coded.
  - Fixed by adding `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` config.
- Frontend backend-failure states were too silent.
  - Fixed by adding visible error banners and `response.ok` checks.

## Files Changed
- `.gitignore`
- `backend/api/main.py`
- `backend/requirements.txt`
- `backend/test-requirements.txt`
- `backend/tests/test_api_contract.py`
- `backend/tests/test_ml_smoke.py`
- `backend/ml_components/impact_model.pkl`
- `backend/ml_components/quantile_model.pkl`
- `backend/ml_components/quantile_model.py`
- `frontend/src/config/api.js`
- `frontend/src/pages/PredictiveSimulator.jsx`
- `frontend/src/pages/LiveCorridorControl.jsx`
- `frontend/src/pages/PostEventDebrief.jsx`
- `frontend/src/styles/global.css`
- `frontend/dist/index.html`
- `TESTING_REPORT.md`
- `DEEP_TESTING_REPORT.md`

## Remaining Risks
- CORS is currently `allow_origins=["*"]`, acceptable for a local demo but not production-hardened.
- `npm audit` could not be completed due DNS/network failure in this environment.
- Vite reports a large JS bundle warning; this is not a runtime failure but can be optimized with code-splitting later.
- Model quality was smoke-tested for integration, finite output, and variation, not statistically revalidated beyond the existing training output.
- `scikit-survival` remains optional because it is used only by the research experiment script and is not required by the production API.

## Clean Run Instructions
Backend:
```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
.venv/bin/python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

Frontend:
```bash
npm --prefix frontend ci --cache ./frontend/.npm-cache --prefer-offline
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

If backend uses another port:
```bash
env VITE_API_BASE_URL=http://127.0.0.1:8001 VITE_WS_BASE_URL=ws://127.0.0.1:8001 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

Tests:
```bash
python3 -m pytest backend/tests -q
```

## Final Status
Pass with documented residual risks. The project is submission-ready for local demo use: frontend, backend, WebSocket, and ML prediction pipeline have been deeply verified together.
