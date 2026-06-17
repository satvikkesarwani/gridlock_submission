import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  ClipboardList,
  MapPin,
  Route,
  Siren,
  TrafficCone,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Pill from "../components/Pill.jsx";
import { event, landingMetrics } from "../data/mockData.js";

const features = [
  {
    title: "Predictive Event Simulator",
    description: "Forecast traffic impact and congestion hotspots.",
    path: "/simulator",
    icon: TrendingUp,
  },
  {
    title: "Tactical Resource Optimizer",
    description: "Optimize personnel, assets and deployments.",
    path: "/optimizer",
    icon: Users,
  },
  {
    title: "Live Corridor Control",
    description: "Monitor corridors and act in real time.",
    path: "/live-control",
    icon: Route,
  },
  {
    title: "Post-Event Debriefing",
    description: "Analyze outcomes and improve performance.",
    path: "/debrief",
    icon: ClipboardList,
  },
];

const metricIcons = {
  "Active Corridors": <TrafficCone size={25} />,
  "Live Incidents": <Siren size={25} />,
  "Staff Planned": <Users size={25} />,
  "Predicted Delay": <Clock size={25} />,
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page landing-page">
      <AppHeader landing />
      <section className="hero">
        <div>
          <h1>Manage event traffic smarter</h1>
          <p>Predict. Prepare. Perform.</p>
        </div>
        <HeroIllustration />
      </section>

      <Card className="event-summary-card">
        <div className="timeline-icons">
          <span><CalendarDays size={22} /></span>
          <i />
          <span><MapPin size={22} /></span>
          <i />
          <span><Clock size={22} /></span>
        </div>
        <div className="event-summary-content">
          <div>
            <small>Event</small>
            <strong>{event.name}</strong>
          </div>
          <div>
            <small>Venue</small>
            <strong>{event.venue}</strong>
          </div>
          <div className="summary-row">
            <div>
              <small>Time</small>
              <strong>{event.displayTime}</strong>
            </div>
            <Pill active>{event.status}</Pill>
          </div>
        </div>
      </Card>

      <div className="chip-tabs">
        <Pill active><CalendarDays size={16} />Planning</Pill>
        <Pill><Users size={16} />Operations</Pill>
        <Pill><Siren size={16} />Live</Pill>
        <Pill><ClipboardList size={16} />Debrief</Pill>
      </div>

      <section className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button className="feature-card" key={feature.title} onClick={() => navigate(feature.path)}>
              <span className="feature-icon"><Icon size={28} /></span>
              <strong>{feature.title}</strong>
              <p>{feature.description}</p>
              <ChevronRight className="feature-arrow" size={25} />
            </button>
          );
        })}
      </section>

      <Card className="metrics-strip">
        {landingMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            icon={metricIcons[metric.label]}
            label={metric.label}
            value={metric.value}
            tone={metric.tone}
          />
        ))}
      </Card>

      <ActionButton icon={<BarChart3 size={25} />} onClick={() => navigate("/simulator")}>
        Open Dashboard
      </ActionButton>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      <svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="roadGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#eef7fb" />
            <stop offset="1" stopColor="#cfe8f4" />
          </linearGradient>
          <linearGradient id="cityGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#b7dbef" />
            <stop offset="1" stopColor="#eef8fc" />
          </linearGradient>
        </defs>
        <path d="M0 250 C100 190 155 206 238 170 C356 120 462 165 640 78 L640 300 L0 300Z" fill="url(#roadGrad)" />
        <g fill="url(#cityGrad)" opacity=".88">
          <rect x="288" y="42" width="30" height="118" />
          <rect x="334" y="70" width="42" height="90" />
          <rect x="392" y="28" width="36" height="132" />
          <rect x="446" y="84" width="30" height="76" />
          <rect x="495" y="58" width="45" height="102" />
          <rect x="565" y="93" width="25" height="67" />
        </g>
        <g transform="translate(275 115)">
          <ellipse cx="124" cy="74" rx="120" ry="42" fill="#dfeff8" stroke="#92b3c5" strokeWidth="4" />
          <ellipse cx="124" cy="66" rx="88" ry="24" fill="#fff" stroke="#b9ceda" strokeWidth="2" />
          <ellipse cx="124" cy="66" rx="61" ry="14" fill="#049b77" />
          <path d="M18 85 C68 125 178 125 232 85" fill="none" stroke="#6d96aa" strokeWidth="7" />
        </g>
        <path d="M0 244 C122 180 239 184 341 205 C450 228 532 162 640 128" fill="none" stroke="#fff" strokeWidth="34" />
        <path d="M0 244 C122 180 239 184 341 205 C450 228 532 162 640 128" fill="none" stroke="#8095a5" strokeWidth="3" strokeDasharray="20 20" opacity=".4" />
        <path d="M0 284 C130 231 265 240 360 248 C482 260 540 209 640 180" fill="none" stroke="#fff" strokeWidth="28" />
        <g fill="#06324f">
          <rect x="104" y="202" width="36" height="14" rx="5" />
          <rect x="134" y="224" width="42" height="16" rx="6" />
          <rect x="472" y="167" width="40" height="15" rx="6" />
        </g>
        <g fill="#079b7a">
          <rect x="332" y="226" width="46" height="17" rx="6" />
          <rect x="248" y="185" width="36" height="14" rx="5" />
        </g>
        <g fill="#0b8f6d">
          <circle cx="74" cy="263" r="14" />
          <circle cx="589" cy="186" r="13" />
          <circle cx="535" cy="199" r="10" />
        </g>
      </svg>
    </div>
  );
}
