from fastapi import FastAPI, HTTPException, WebSocket, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pydantic import BaseModel, Field
from typing import Optional
import os
import sys

# Add ml_components to path so we can import
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml_components.model_pipeline import TrafficImpactModel, ResourceOptimizer
from ml_components.quantile_model import ClearanceRangeModel

app = FastAPI(title="EventFlow AI Backend")

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

impact_model = TrafficImpactModel()
# Attempt to load model on startup
if not impact_model.load():
    print("Warning: ML model not found. Predictions will fail until trained.")

# Quantile model: returns a clearance-time RANGE (P10/P50/P90), not a single number.
clearance_range_model = ClearanceRangeModel()
if not clearance_range_model.load():
    print("Warning: quantile model not found. Run ml_components/quantile_model.py to train it.")

class SimulationRequest(BaseModel):
    event_cause: str
    priority: str
    hour_of_day: int = Field(..., ge=0, le=23)
    is_weekend: bool
    requires_road_closure: bool
    attendance: Optional[str] = None

@app.get("/api/health")
def read_root():
    return {"message": "Welcome to EventFlow AI API"}

@app.post("/api/simulate")
def simulate_event(req: SimulationRequest):
    try:
        # Predict traffic duration/delay
        predicted_delay_mins = impact_model.predict(
            req.event_cause, 
            req.priority, 
            req.hour_of_day, 
            req.is_weekend, 
            req.requires_road_closure
        )
        
        # Get resource recommendations
        resources = ResourceOptimizer.recommend(
            req.event_cause, 
            req.priority, 
            req.requires_road_closure, 
            req.attendance
        )
        
        return {
            "predicted_delay_mins": predicted_delay_mins,
            "resources": resources,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clearance-risk")
def clearance_risk(req: SimulationRequest):
    """Predict a clearance-time RANGE for an incident: optimistic / expected /
    pessimistic (P10 / P50 / P90 minutes). Useful for operator triage."""
    try:
        result = clearance_range_model.predict(
            req.event_cause,
            req.priority,
            req.hour_of_day,
            req.is_weekend,
            req.requires_road_closure,
        )
        result["status"] = "success"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/live-status")
def get_live_status():
    import random
    return {
        "travel_time_index": round(random.uniform(1.8, 2.5), 1),
        "avg_speed": random.randint(10, 20),
        "active_incidents": random.randint(1, 3),
        "dms_status": "Broadcasting",
        "dispatch_time": f"{random.randint(5, 12)} min",
        "estimated_clearance": f"{random.randint(20, 45)} min",
        "clearance_forecast": [
            {"time": "10:00", "congestion": 85},
            {"time": "10:30", "congestion": 72},
            {"time": "11:00", "congestion": 40},
            {"time": "11:30", "congestion": 15},
            {"time": "12:00", "congestion": 5},
        ]
    }

@app.get("/api/debrief")
def get_debrief():
    import random
    return {
        "target_delay": "12.0 min",
        "actual_delay": "18.5 min",
        "variance": "+6.5 min",
        "delay_hours": "780 veh-hr",
        "plan_vs_actual": [
            {"time": "16:00", "planned": 3500, "actual": 4200},
            {"time": "18:00", "planned": 5200, "actual": 8800},
            {"time": "20:00", "planned": 9000, "actual": 19500},
            {"time": "22:00", "planned": 7200, "actual": 16000},
            {"time": "00:00", "planned": 5200, "actual": 11000},
            {"time": "02:00", "planned": 3000, "actual": 5500},
        ],
        "variance_metrics": [
            {"label": "Excess Delay", "value": "+6.5 min", "tone": "red"},
            {"label": "Model R2", "value": "0.89", "tone": "green"},
            {"label": "Volume Deviation", "value": "+19%", "tone": "blue"},
            {"label": "Signal Overrides", "value": str(random.randint(10, 15)), "tone": "amber"},
        ],
        "shap_importance": [
            {"label": "Inflow Divert Rate", "value": 0.46},
            {"label": "Barricade Location", "value": 0.31},
            {"label": "Volunteer Staffing", "value": 0.18},
            {"label": "Incident Location", "value": 0.05},
        ]
    }

@app.websocket("/api/ws/live-status")
async def websocket_live_status(websocket: WebSocket):
    await websocket.accept()
    import random
    try:
        while True:
            # Simulate real-time fluctuating data
            data = {
                "travel_time_index": round(random.uniform(1.8, 2.5), 1),
                "avg_speed": random.randint(10, 20),
                "active_incidents": random.randint(1, 3),
                "dms_status": "Broadcasting",
                "dispatch_time": f"{random.randint(5, 12)} min",
                "estimated_clearance": f"{random.randint(20, 45)} min",
                "clearance_forecast": [
                    {"time": "10:00", "congestion": random.randint(80, 95)},
                    {"time": "10:30", "congestion": random.randint(65, 75)},
                    {"time": "11:00", "congestion": random.randint(35, 45)},
                    {"time": "11:30", "congestion": random.randint(10, 20)},
                    {"time": "12:00", "congestion": random.randint(0, 5)},
                ]
            }
            await websocket.send_json(data)
            await asyncio.sleep(2) # Send update every 2 seconds
    except Exception as e:
        print("WebSocket disconnected:", e)

# --- Static Files / SPA Support for Single App Deployment ---
frontend_dist_path = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist')
if os.path.isdir(frontend_dist_path):
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # Ignore API routes to let FastAPI handle 404s for them naturally if needed
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        # Serve exact file if it exists (e.g., /assets/index-*.js, /favicon.ico)
        file_path = os.path.join(frontend_dist_path, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for React Router
        index_path = os.path.join(frontend_dist_path, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
            
        raise HTTPException(status_code=404, detail="Frontend index.html not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
