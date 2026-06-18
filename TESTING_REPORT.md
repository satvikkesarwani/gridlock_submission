# Testing Report

## Tech Stack Identified
- Frontend: React 19, Vite 7, React Router, Recharts, Leaflet, lucide-react.
- Backend: FastAPI, Uvicorn, Pydantic, CORS middleware.
- ML: pandas, scikit-learn pipelines, LightGBM regressors, pickled model artifacts.
- Dataset: `dataset/Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv`.
- Model files: `backend/ml_components/impact_model.pkl`, `backend/ml_components/quantile_model.pkl`.

## Setup Commands Used
```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
npm --prefix frontend ci --cache ./frontend/.npm-cache
.venv/bin/python backend/ml_components/model_pipeline.py
.venv/bin/python backend/ml_components/quantile_model.py
```

## Run Commands
Backend:
```bash
.venv/bin/python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000
```

Frontend:
```bash
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

For this test run, port `8000` was already occupied by existing Python listener processes, so the backend was verified on `8001` and the frontend was launched with:
```bash
env VITE_API_BASE_URL=http://127.0.0.1:8001 VITE_WS_BASE_URL=ws://127.0.0.1:8001 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

## API Endpoints Tested
- `GET /`
- `GET /api/live-status`
- `GET /api/debrief`
- `POST /api/simulate`
- `POST /api/clearance-risk`
- `WS /api/ws/live-status`

## Issues Found
- Frontend npm dependencies were not installed.
- Backend pinned dependencies were not compatible with Python 3.13; `pandas==2.1.3` failed to build.
- Existing `impact_model.pkl` could not be unpickled with the installed scikit-learn runtime.
- `quantile_model.pkl` was missing, causing `/api/clearance-risk` to fail.
- Quantile model returned `numpy.float64` values instead of plain JSON-safe Python floats.
- WebSocket endpoint failed because no WebSocket transport package was installed for Uvicorn.
- Frontend API URLs were hard-coded to `127.0.0.1:8000`, which blocked testing when that port was unavailable.

## Fixes Applied
- Updated `backend/requirements.txt` to Python 3.13-compatible runtime dependency versions.
- Added `websockets==15.0.1` for FastAPI/Uvicorn WebSocket support.
- Regenerated `impact_model.pkl` using the current runtime and included dataset.
- Generated the required `quantile_model.pkl`.
- Normalized quantile prediction response values to Python `float`.
- Added frontend API config via `VITE_API_BASE_URL` and `VITE_WS_BASE_URL`, preserving default `8000` behavior.
- Added `frontend/.npm-cache/` to `.gitignore` and allowed `quantile_model.pkl` to be tracked.

## End-to-End Verification
- `npm --prefix frontend run build` completed successfully.
- API endpoints returned `200 OK`.
- `/api/simulate` returned `predicted_delay_mins: 157.0` and resource recommendations.
- `/api/clearance-risk` returned P10/P50/P90 clearance values successfully.
- Browser flow verified:
  - Simulator displayed backend delay and clearance range.
  - Optimizer displayed backend resource recommendations.
  - Live Control connected through WebSocket and updated live metrics.
  - Debrief displayed backend response metrics and charts.
- Browser console logs were clean during verified flows.

## Final Status
The frontend, backend, and ML pipeline run together successfully end-to-end in the local test environment.

Remaining assumption: use Python 3.13-compatible dependencies from `backend/requirements.txt`. The optional `scikit-survival` research experiment is intentionally not part of the default API install.
