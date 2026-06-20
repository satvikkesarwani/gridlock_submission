import { useState } from "react";
import { simulate, clearanceRisk } from "../api/eventflow.js";
import { DEFAULT_SIMULATION_PAYLOAD, RESOURCES_STORAGE_KEY } from "../constants/simulation.js";
import { event } from "../data/mockData.js";

function buildPayload(overrides = {}) {
  return { ...DEFAULT_SIMULATION_PAYLOAD, attendance: event.attendance, ...overrides };
}

function persistResources(resources) {
  if (resources) {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
  }
}

/**
 * Shared simulation flow for the Predictive Simulator and Resource Optimizer.
 * Centralizes the request payload, resource persistence, loading + error state.
 */
export function useSimulation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /** Impact estimate + clearance range (Predictive Simulator). */
  const runSimulation = async (overrides) => {
    setIsLoading(true);
    setError("");
    try {
      const payload = buildPayload(overrides);
      const [data, range] = await Promise.all([simulate(payload), clearanceRisk(payload)]);
      persistResources(data.resources);
      return { ...data, clearanceRange: range };
    } catch (err) {
      console.error("Simulation failed:", err);
      setError(`Simulation failed: ${err.message}. Make sure the backend is running on the expected port.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /** Recommended resources only (Resource Optimizer). */
  const runOptimization = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await simulate(buildPayload());
      persistResources(data.resources);
      return data.resources;
    } catch (err) {
      console.error("Optimization failed:", err);
      setError(`Optimization failed: ${err.message}. Make sure the backend is running on the expected port.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, setError, runSimulation, runOptimization };
}
