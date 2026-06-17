export default function Pill({ children, active = false, tone = "green", className = "" }) {
  return <span className={`pill ${active ? "active" : ""} pill-${tone} ${className}`}>{children}</span>;
}
