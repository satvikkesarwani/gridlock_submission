import { useState } from "react";
import { Split } from "lucide-react";
import Card from "./Card.jsx";
import ActionButton from "./ActionButton.jsx";

/**
 * Before/after intervention: re-runs the real impact model with the planned road
 * closure ON vs OFF to quantify how much the closure changes predicted delay.
 * Uses the existing /api/simulate endpoint (no extra ML, no external API).
 */
export default function InterventionImpact({ baseCtx, run }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyse = async () => {
    setLoading(true);
    setError("");
    const hour = Number.parseInt(String(baseCtx.startTime).split(":")[0], 10);
    const base = {
      event_cause: baseCtx.eventCause,
      attendance: String(baseCtx.attendance),
      ...(Number.isFinite(hour) ? { hour_of_day: hour } : {}),
    };
    try {
      const [withClosure, without] = await Promise.all([
        run({ ...base, requires_road_closure: true }),
        run({ ...base, requires_road_closure: false }),
      ]);
      if (!withClosure || !without) throw new Error("intervention run failed");
      setData({
        with: Math.round(withClosure.predicted_delay_mins),
        without: Math.round(without.predicted_delay_mins),
      });
    } catch (err) {
      console.error("Intervention analysis failed:", err);
      setError("Could not run the intervention analysis. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const delta = data ? data.with - data.without : 0;

  return (
    <Card title="Road Closure Impact" action={<Split size={21} />} className="intervention-card">
      <p className="card-subtext">Model-predicted delay with the planned closure vs without it.</p>

      {data && (
        <div className="intervention-grid">
          <div className="intervention-col">
            <small>Without closure</small>
            <strong>{data.without} min</strong>
          </div>
          <div className="intervention-col">
            <small>With closure</small>
            <strong>{data.with} min</strong>
          </div>
          <div className={`intervention-col intervention-delta ${delta >= 0 ? "up" : "down"}`}>
            <small>Difference</small>
            <strong>{delta >= 0 ? "+" : ""}{delta} min</strong>
          </div>
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      <ActionButton className="compact-button" onClick={analyse}>
        {loading ? "Analysing…" : data ? "Re-run analysis" : "Compare closure on / off"}
      </ActionButton>
    </Card>
  );
}
