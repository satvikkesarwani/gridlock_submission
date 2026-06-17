from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys

# Add ml_components to path so we can import
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml_components.model_pipeline import TrafficImpactModel, ResourceOptimizer

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

class SimulationRequest(BaseModel):
    event_cause: str
    priority: str
    hour_of_day: int
    is_weekend: bool
    requires_road_closure: bool
    attendance: Optional[str] = None

@app.get("/")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
