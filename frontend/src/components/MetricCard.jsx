import AnimatedValue from "./AnimatedValue.jsx";

export default function MetricCard({ icon, label, value, tone = "neutral", className = "" }) {
  return (
    <div className={`metric-card metric-${tone} ${className}`}>
      {icon && <span className="metric-icon">{icon}</span>}
      <span className="metric-label">{label}</span>
      <strong>
        <AnimatedValue value={value} />
      </strong>
    </div>
  );
}
