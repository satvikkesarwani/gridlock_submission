import { useState } from "react";
import { GitCompareArrows } from "lucide-react";
import Card from "./Card.jsx";
import ActionButton from "./ActionButton.jsx";
import { computeRisk, parseAttendance } from "../lib/intelligence.js";

const SCENARIOS = [
  { key: "low", label: "Low", factor: 0.5 },
  { key: "expected", label: "Expected", factor: 1 },
  { key: "high", label: "High", factor: 1.5 },
];

/**
 * What-if analysis: re-runs the real model at 0.5× / 1× / 1.5× attendance and
 * compares predicted delay + risk so planners can size the response to crowd
 * uncertainty. Uses the existing /api/simulate endpoint (no extra ML).
 */
export default function ScenarioComparison({ baseCtx, run }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const compare = async () => {
    setLoading(true);
    setError("");
    const base = parseAttendance(baseCtx.attendance);
    const hour = Number.parseInt(String(baseCtx.startTime).split(":")[0], 10);
    try {
      const out = await Promise.all(
        SCENARIOS.map(async (s) => {
          const attendance = Math.max(0, Math.round(base * s.factor));
          const data = await run({
            event_cause: baseCtx.eventCause,
            attendance: String(attendance),
            ...(Number.isFinite(hour) ? { hour_of_day: hour } : {}),
          });
          if (!data) throw new Error("scenario run failed");
          const ctx = {
            ...baseCtx,
            attendance,
            delay: data.predicted_delay_mins,
            p90: data.clearanceRange?.pessimistic_p90_mins,
          };
          return {
            ...s,
            attendance,
            officers: data.resources?.sworn_staff ?? 0,
            risk: computeRisk(ctx),
          };
        })
      );
      setRows(out);
    } catch (err) {
      console.error("Scenario comparison failed:", err);
      setError("Could not run the scenario comparison. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="What-If Scenario Comparison" action={<GitCompareArrows size={21} />} className="scenario-card">
      <p className="card-subtext">Re-runs the model across crowd sizes so you can plan for uncertainty.</p>

      {rows && (
        <div className="scenario-grid">
          {rows.map((r) => (
            <div key={r.key} className={`scenario-col scenario-${r.risk.level.tone}`}>
              <small>{r.label}</small>
              <span className="scenario-att">{r.attendance.toLocaleString()} ppl</span>
              <strong className="scenario-delay">{r.officers} officers</strong>
              <span className={`scenario-risk risk-${r.risk.level.tone}`}>{r.risk.level.label} · {r.risk.score}</span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      <ActionButton className="compact-button" onClick={compare}>
        {loading ? "Comparing…" : rows ? "Re-run comparison" : "Compare Low / Expected / High"}
      </ActionButton>
    </Card>
  );
}
