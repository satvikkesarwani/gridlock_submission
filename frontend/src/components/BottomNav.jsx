import { Bell, BarChart3, Home, Map, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { label: "Home", path: "/", icon: Home },
  { label: "Planning", path: "/simulator", icon: Map },
  { label: "Alerts", path: "/live-control", icon: Bell, badge: "1" },
  { label: "Reports", path: "/debrief", icon: BarChart3 },
  { label: "Settings", path: "/", icon: Settings },
];

export default function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.label === active;

        return (
          <Link key={item.label} to={item.path} className={`nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon-wrap">
              <Icon size={26} strokeWidth={isActive ? 2.8 : 2.2} />
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
