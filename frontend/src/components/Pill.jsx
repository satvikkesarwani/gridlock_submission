export default function Pill({ children, active = false, tone = "green", className = "", onClick }) {
  const classes = `pill ${active ? "active" : ""} pill-${tone} ${className}`;

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-pressed={active}>
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
