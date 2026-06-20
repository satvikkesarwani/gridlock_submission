# Feature Enhancement Report — Gridlock Intelligence System

Turns the base prediction demo into a decision-support traffic-operations platform that directly answers the problem statement: *forecast event traffic impact in advance, recommend manpower/barricading/diversion, and support post-event learning.*

All features use **only the project's own FastAPI backend + pure frontend logic — no LLM, no third-party APIs.** Map tiles and venue geocoding use the pre-existing OpenStreetMap services.

## Features added

| # | Feature | What it does | Real vs heuristic | Problem-statement mapping |
|---|---------|--------------|-------------------|---------------------------|
| A | **Gridlock Risk Score + level** | 0–100 score + Low/Moderate/High/Severe gauge | Transparent weighted heuristic over **real** model outputs | "Impact not quantified in advance" |
| B | **Why This Event Is Risky** | Weighted factor breakdown for the specific event | Rule-based, honestly labeled | Explainable decision support |
| C | **Affected impact radius** | Data-driven km ring drawn on the map + KPI tile | Heuristic from attendance + delay | "Localized traffic breakdowns" |
| D | **What-If Scenario Comparison** | Re-runs model at 0.5×/1×/1.5× attendance → officers + risk | **Real** `/api/simulate` calls | Scenario forecasting |
| E | **Operational Deployment Timeline** | T‑120 → recovery action plan with clock times | Derived from real resources + event window | Actionable deployment plan |
| F | **Pre-Event Risk Briefing** | Natural-language analyst brief (template, no LLM) | Interpolated from **real** numbers | Quantification + comms |
| G | **Resource Readiness Check** | Recommended vs available pool → shortfall warnings | Heuristic vs documented baseline | "Resource deployment is experience-driven" |
| H | **Model Drivers (Explainable AI)** | Trained LightGBM's real global feature importances | **Genuine model-derived** (`/api/explain`) | Trust / explainability |
| I | **Road Closure Impact** | Predicted delay with closure ON vs OFF | **Real** `/api/simulate` calls | Diversion/closure planning |
| J | **Export Operational Plan** | Downloads the full plan as a text file | Pure frontend (Blob) | Field-usable output |

## Backend changes
- **New `GET /api/explain`** (`backend/api/main.py`) — aggregates the trained LightGBM impact model's `feature_importances_` from one-hot/scaled columns back to human-readable factors (Time of day, Corridor, Event type, …). Genuine model explainability.
- The `event_cause` (from the event-type dropdown), `attendance`, and `hour_of_day` (from the editable start time) now flow into the existing `/api/simulate` request, so the real model output responds to user input.

## Frontend changes
- New decision-support engine `src/lib/intelligence.js` (pure, documented functions: risk, factors, radius, timeline, readiness, briefing, plan text).
- New components: `RiskIntelligence.jsx`, `ScenarioComparison.jsx`, `InterventionImpact.jsx`, `ModelDrivers.jsx`, `OpsPlan.jsx`, plus the earlier `VenuePicker`, `GeoCongestionMap`, `leafletIcons`.
- Simulator results now lead with the risk gauge + briefing, then map (with impact radius), factors, model drivers, scenario + closure analysis. Optimizer gains the readiness check, deployment timeline, and plan export.
- New stylesheet `styles/components/intelligence.css`.

## APIs
- Added: `GET /api/explain`. Unchanged contracts: `/api/simulate`, `/api/clearance-risk`, `/api/live-status`, `/api/debrief`, `/api/health`, `/api/ws/live-status`.

## Honest limitations
- The impact model does **not** use attendance as a feature (attendance drives the resource heuristic + risk score, not the delay model) — the what-if comparison therefore shows differing *officers/risk*, not delay. This is stated, not hidden.
- Map overlays (segments, impact ring, diversion routes) are illustrative geometry around the real chosen coordinates, not model-derived road geometry.
- Resource heuristic and the readiness "available pool" are documented operational baselines, not learned values.

## Remaining risks
- Low. The Live Corridor WebSocket logs a dev-only React StrictMode "closed before established" warning that does not occur in production builds; the stream itself works.
