import { API_BASE_URL } from "../config/api.js";

async function postJSON(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Network-level failure: server down, wrong port, CORS, offline.
    throw new Error(`Cannot reach backend at ${API_BASE_URL || "this origin"}`);
  }
  // Guard parsing so a non-JSON error page (e.g. a different server on the port)
  // surfaces a clear status instead of a cryptic "Unexpected token" SyntaxError.
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(data?.detail || `Request failed with ${res.status} ${res.statusText}`);
  }
  return data;
}

/** Impact forecast + recommended resources. */
export const simulate = (payload) => postJSON("/api/simulate", payload);

/** P10 / P50 / P90 clearance-time range. */
export const clearanceRisk = (payload) => postJSON("/api/clearance-risk", payload);

/** Plan-vs-actual debrief with variance + SHAP importance. */
export async function getDebrief() {
  const res = await fetch(`${API_BASE_URL}/api/debrief`);
  if (!res.ok) {
    throw new Error(`Request failed with ${res.status}`);
  }
  return res.json();
}

/** Global model feature importance (explainable AI) from the trained impact model. */
export async function getExplain() {
  const res = await fetch(`${API_BASE_URL}/api/explain`);
  if (!res.ok) {
    throw new Error(`Request failed with ${res.status}`);
  }
  return res.json();
}
