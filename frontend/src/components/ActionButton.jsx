import { ChevronRight } from "lucide-react";

export default function ActionButton({ children, onClick, icon, variant = "primary", className = "" }) {
  return (
    <button className={`action-button ${variant} ${className}`} onClick={onClick}>
      {icon && <span className="button-icon">{icon}</span>}
      <span>{children}</span>
      {variant === "primary" && (
        <span className="button-arrow">
          <ChevronRight size={23} />
        </span>
      )}
    </button>
  );
}
