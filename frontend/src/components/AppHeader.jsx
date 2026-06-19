import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5.5 19C5.5 13.5 11 13.5 11 9C11 4.5 16 5 18.5 5"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="0.2 4"
        />
        <circle cx="5.5" cy="19" r="2.1" fill="#fff" />
        <circle cx="18.5" cy="5" r="2.1" fill="#fff" />
      </svg>
    </span>
  );
}

export default function AppHeader({ title, subtitle, landing = false }) {
  const navigate = useNavigate();

  if (landing) {
    return (
      <header className="app-header landing-header">
        <div className="brand">
          <LogoMark />
          <span>EventFlow AI</span>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="app-header">
        <button className="plain-icon-button" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={28} />
        </button>
        <div className="brand small">
          <LogoMark />
          <span>EventFlow AI</span>
        </div>
        <button className="plain-icon-button" onClick={() => navigate(ROUTES.liveControl)} aria-label="View alerts">
          <Bell size={25} />
        </button>
      </header>
      <section className="page-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
    </>
  );
}
