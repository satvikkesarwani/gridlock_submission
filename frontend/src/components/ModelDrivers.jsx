import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import Card from "./Card.jsx";
import { getExplain } from "../api/eventflow.js";

/**
 * Explainable-AI panel: shows the trained LightGBM impact model's real global
 * feature importances (from /api/explain) so operators see what the model
 * actually weighs most. Fetched once when results appear.
 */
export default function ModelDrivers() {
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getExplain()
      .then((data) => {
        if (!ignore) setDrivers(data.drivers || []);
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Explainability fetch failed:", err);
          setError("Model drivers unavailable.");
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) return null; // fail quietly — this panel is supplementary
  if (!drivers) return null;

  const max = Math.max(...drivers.map((d) => d.importance), 0.0001);

  return (
    <Card title="Model Drivers — Explainable AI" action={<Brain size={21} />} className="drivers-card">
      <p className="card-subtext">What the trained impact model weighs most, from its real feature importances.</p>
      <ul className="factor-list">
        {drivers.map((d) => (
          <li key={d.factor} className="factor-row">
            <div className="factor-head">
              <span className="factor-label">{d.factor}</span>
              <span className="factor-points">{Math.round(d.importance * 100)}%</span>
            </div>
            <div className="factor-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((d.importance / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
