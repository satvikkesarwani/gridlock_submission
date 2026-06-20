import { AlertTriangle, CheckCircle2, Clock3, Download } from "lucide-react";
import Card from "./Card.jsx";
import ActionButton from "./ActionButton.jsx";
import { deploymentTimeline, readinessReport, buildPlanText } from "../lib/intelligence.js";

/** Vertical operational timeline (T‑120 → recovery) keyed to the event window. */
export function DeploymentTimeline({ ctx }) {
  const phases = deploymentTimeline(ctx);
  return (
    <Card title="Operational Deployment Timeline" action={<Clock3 size={21} />} className="timeline-card">
      <p className="card-subtext">Recommended action phases anchored to the event window.</p>
      <ol className="ops-timeline">
        {phases.map((p) => (
          <li key={p.t} className="ops-phase">
            <div className="ops-phase-marker"><span /></div>
            <div className="ops-phase-body">
              <div className="ops-phase-head">
                <strong>{p.title}</strong>
                <span className="ops-phase-time">{p.time} · {p.t}</span>
              </div>
              <p>{p.action}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** Recommended-vs-available readiness check with shortfall warnings. */
export function ReadinessReport({ resources }) {
  const report = readinessReport(resources);
  return (
    <Card title="Resource Readiness Check" action={report.ready ? <CheckCircle2 size={21} /> : <AlertTriangle size={21} />} className="readiness-card">
      <p className="card-subtext">Recommended deployment vs the division's available pool (demo baseline).</p>
      <div className={`readiness-banner ${report.ready ? "ok" : "short"}`}>
        {report.ready
          ? "All resource needs are within available capacity."
          : `Shortfall in ${report.shortfalls.length} resource type${report.shortfalls.length > 1 ? "s" : ""} — request mutual aid.`}
      </div>
      <ul className="readiness-list">
        {report.rows.map((r) => (
          <li key={r.key} className={`readiness-row ${r.short ? "short" : ""}`}>
            <span className="readiness-label">{r.label}</span>
            <span className="readiness-nums">need <strong>{r.need}</strong> / have <strong>{r.have}</strong></span>
            {r.short
              ? <span className="readiness-flag"><AlertTriangle size={13} />short {r.gap}</span>
              : <span className="readiness-ok"><CheckCircle2 size={13} />ok</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Download the full operational plan as a plain-text file (no backend/LLM). */
export function downloadPlan(ctx) {
  const text = buildPlanText(ctx);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gridlock-plan-${String(ctx.venueName || "event").replace(/\s+/g, "-").toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Button that exports the operational plan. */
export function ExportPlanButton({ ctx }) {
  return (
    <ActionButton icon={<Download size={20} />} className="compact-button" onClick={() => downloadPlan(ctx)}>
      Export Operational Plan
    </ActionButton>
  );
}
