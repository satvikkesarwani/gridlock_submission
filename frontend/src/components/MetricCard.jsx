export default function MetricCard({ icon, label, value, tone = "green", className = "" }) {
  return (
    <div className={`metric-card metric-${tone} ${className}`}>
      {icon && <span className="metric-icon">{icon}</span>}
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
