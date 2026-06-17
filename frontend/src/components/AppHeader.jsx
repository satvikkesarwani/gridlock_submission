import { ArrowLeft, Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <span className="logo-dot" />
      <span className="logo-road">A</span>
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
        <button className="icon-button" aria-label="Open menu">
          <Menu size={26} />
        </button>
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
        <button className="plain-icon-button" aria-label="Notifications">
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
