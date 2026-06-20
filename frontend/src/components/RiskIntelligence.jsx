import { Activity, FileText, ShieldAlert } from "lucide-react";
import Card from "./Card.jsx";

const TONE_VAR = { red: "var(--severe)", amber: "var(--moderate)", green: "var(--clear)" };

/** Big circular gauge showing the 0–100 gridlock risk score + level. */
export function RiskBadge({ risk }) {
  const color = TONE_VAR[risk.level.tone] || "var(--accent)";
  const R = 34;
  const C = 2 * Math.PI * R;
  const dash = (risk.score / 100) * C;

  return (
    <Card className="risk-badge-card">
      <div className="risk-badge">
        <svg viewBox="0 0 80 80" className="risk-gauge" role="img" aria-label={`Gridlock risk ${risk.score} of 100`}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="var(--hairline-2)" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={R} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`} transform="rotate(-90 40 40)"
          />
          <text x="40" y="38" textAnchor="middle" className="risk-gauge-score">{risk.score}</text>
          <text x="40" y="52" textAnchor="middle" className="risk-gauge-of">/ 100</text>
        </svg>
        <div className="risk-badge-meta">
          <small>Gridlock Risk</small>
          <strong className={`risk-level risk-${risk.level.tone}`}>{risk.level.label}</strong>
          <p>Composite of predicted delay, clearance window, crowd size, road closure and start time.</p>
        </div>
      </div>
    </Card>
  );
}

/** Natural-language pre-event briefing. */
export function RiskBriefing({ text }) {
  return (
    <Card title="Pre-Event Risk Briefing" action={<FileText size={21} />} className="briefing-card">
      <p className="briefing-text">{text}</p>
    </Card>
  );
}

/** "Why this event is risky" — weighted factor breakdown (rule-based, explainable). */
export function RiskFactors({ factors }) {
  return (
    <Card title="Why This Event Is Risky" action={<ShieldAlert size={21} />} className="factors-card">
      <p className="card-subtext">Rule-based breakdown of what drives the risk score for this specific event.</p>
      <ul className="factor-list">
        {factors.map((f) => (
          <li key={f.key} className="factor-row">
            <div className="factor-head">
              <span className="factor-label">{f.label}</span>
              <span className="factor-points">+{f.points}</span>
            </div>
            <div className="factor-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((f.points / f.max) * 100)}%` }} />
            </div>
            <small className="factor-detail">{f.detail}</small>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Compact model-vitals strip (kept for future reuse). */
export function RiskPulse({ label, value }) {
  return (
    <span className="risk-pulse"><Activity size={14} />{label}: <strong>{value}</strong></span>
  );
}
