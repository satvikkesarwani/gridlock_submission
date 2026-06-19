/**
 * Default request body for /api/simulate and /api/clearance-risk.
 * Previously duplicated inline in PredictiveSimulator and ResourceOptimizer.
 */
export const DEFAULT_SIMULATION_PAYLOAD = {
  event_cause: "public_event",
  priority: "High",
  hour_of_day: 20,
  is_weekend: true,
  requires_road_closure: true,
};

/** localStorage key the simulator/optimizer use to share recommended resources. */
export const RESOURCES_STORAGE_KEY = "event_resources";
