import { API_BASE_URL } from "../config/api.js";

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Request failed with ${res.status}`);
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
