# gridlock_submission
For gridlock submission round 2

## System Architecture

The Gridlock Intelligence System connects a React dashboard to FastAPI services, ML model artifacts, and dataset-backed preprocessing utilities. The architecture supports both request/response prediction flows and live WebSocket corridor updates.

![Gridlock System Architecture](docs/assets/architecture-diagram.svg)

```mermaid
flowchart LR
    A[React Frontend] --> B[FastAPI Backend]
    B --> C[API Routes]
    C --> D[Impact Model]
    C --> E[Quantile Clearance Model]
    F[Dataset + Preprocessing] --> D
    F --> E
    C --> G[JSON Responses]
    B --> H[WebSocket Live Status]
    G --> A
    H --> A
```

## Application Workflow

The product workflow starts with event details entered in the dashboard, validates the payload in the backend, runs ML-backed predictions, recommends operational resources, and returns results to simulator, optimizer, live control, and debrief views.

![Gridlock Product Workflow](docs/assets/workflow-diagram.svg)

```mermaid
flowchart LR
    A[User Input] --> B[Frontend Form]
    B --> C[Backend Validation]
    C --> D[ML Prediction]
    D --> E[Resource Recommendation]
    E --> F[Live Dashboard]
    E --> G[Debrief Output]
```
