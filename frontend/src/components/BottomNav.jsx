import { Link } from "react-router-dom";
import { NAV_ITEMS } from "../constants/nav.js";

export default function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.label === active;

        return (
          <Link
            key={item.label}
            to={item.path}
            className={`nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon-wrap">
              <Icon size={24} strokeWidth={isActive ? 2.6 : 2} />
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
      <span className="home-indicator" />
    </nav>
  );
}
