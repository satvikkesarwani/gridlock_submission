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

/** localStorage key holding the full context of the last run (for timeline/plan/debrief). */
export const LAST_SIM_STORAGE_KEY = "event_last_sim";

/** Read the last simulation context, or null if none has run this session. */
export function loadLastSim() {
  try {
    return JSON.parse(localStorage.getItem(LAST_SIM_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

/** localStorage key the simulator uses to share the chosen venue with the maps. */
export const VENUE_STORAGE_KEY = "event_venue";

/** localStorage key for the chosen event type label (shared with the home page). */
export const EVENT_TYPE_STORAGE_KEY = "event_type_label";

/** localStorage key for the chosen event window (start/end time). */
export const TIME_STORAGE_KEY = "event_time";

/** Default event window shown before the planning page changes it. */
export const DEFAULT_TIME = { start: "20:00", end: "00:00" };

/** Read the chosen event window { start, end } from localStorage. */
export function loadEventTime() {
  try {
    const saved = JSON.parse(localStorage.getItem(TIME_STORAGE_KEY));
    if (saved && saved.start && saved.end) return { start: saved.start, end: saved.end };
  } catch {
    // ignore malformed/absent storage and use the default below
  }
  return DEFAULT_TIME;
}

/** Format an event window as "HH:MM - HH:MM" for display. */
export function formatEventTime(time = loadEventTime()) {
  return `${time.start} - ${time.end}`;
}

/** Default event type label shown before the planning page makes a selection. */
export const DEFAULT_EVENT_TYPE = "Stadium / Sports Event";

/** Read the chosen event type label, falling back to the default. */
export function loadEventType() {
  return localStorage.getItem(EVENT_TYPE_STORAGE_KEY) || DEFAULT_EVENT_TYPE;
}

/** Default map center (M. Chinnaswamy Stadium, Bengaluru) when no venue is chosen. */
export const DEFAULT_VENUE = { name: "M. Chinnaswamy Stadium", lat: 12.97883573, lng: 77.59953728 };

/** Read the chosen venue from localStorage, falling back to the default center. */
export function loadVenue() {
  try {
    const saved = JSON.parse(localStorage.getItem(VENUE_STORAGE_KEY));
    if (saved && Number.isFinite(saved.lat) && Number.isFinite(saved.lng)) {
      return { name: saved.name || DEFAULT_VENUE.name, lat: saved.lat, lng: saved.lng };
    }
  } catch {
    // ignore malformed/absent storage and use the default below
  }
  return DEFAULT_VENUE;
}
