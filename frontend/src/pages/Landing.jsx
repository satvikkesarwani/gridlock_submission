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
import { CorridorRibbon } from "../components/CorridorRibbon.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Pill from "../components/Pill.jsx";
import { ROUTES } from "../constants/routes.js";
import { formatEventTime, loadEventType, loadVenue } from "../constants/simulation.js";
import { activeCorridor, event, landingMetrics } from "../data/mockData.js";

const features = [
  {
    title: "Predictive Event Simulator",
    description: "Forecast traffic impact and congestion hotspots.",
    path: ROUTES.simulator,
    icon: TrendingUp,
  },
  {
    title: "Tactical Resource Optimizer",
    description: "Optimize personnel, assets and deployments.",
    path: ROUTES.optimizer,
    icon: Users,
  },
  {
    title: "Live Corridor Control",
    description: "Monitor corridors and act in real time.",
    path: ROUTES.liveControl,
    icon: Route,
  },
  {
    title: "Post-Event Debriefing",
    description: "Analyze outcomes and improve performance.",
    path: ROUTES.debrief,
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
  // Mirror the planning page's chosen event type + venue for app-wide consistency.
  const eventType = loadEventType();
  const venue = loadVenue();
  const eventTime = formatEventTime();

  return (
    <div className="page landing-page">
      <AppHeader landing />
      <section className="hero">
        <h1>Command event traffic before it builds</h1>
        <p>
          Predict the corridor. Stage the response. <b>Hold the flow.</b>
        </p>
      </section>

      <Card className="hero-corridor">
        <CorridorRibbon
          road={activeCorridor.road}
          status={activeCorridor.status}
          statusLabel={activeCorridor.statusLabel}
          segments={activeCorridor.segments}
          ticks={activeCorridor.ticks}
          pressure={activeCorridor.pressure}
        />
      </Card>

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
            <strong>{eventType}</strong>
          </div>
          <div>
            <small>Venue</small>
            <strong>{venue.name}</strong>
          </div>
          <div className="summary-row">
            <div>
              <small>Time</small>
              <strong>{eventTime}</strong>
            </div>
            <Pill active>{event.status}</Pill>
          </div>
        </div>
      </Card>

      <div className="chip-tabs">
        <Pill active onClick={() => navigate(ROUTES.simulator)}><CalendarDays size={16} />Planning</Pill>
        <Pill onClick={() => navigate(ROUTES.optimizer)}><Users size={16} />Operations</Pill>
        <Pill onClick={() => navigate(ROUTES.liveControl)}><Siren size={16} />Live</Pill>
        <Pill onClick={() => navigate(ROUTES.debrief)}><ClipboardList size={16} />Debrief</Pill>
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

      <ActionButton icon={<BarChart3 size={25} />} onClick={() => navigate(ROUTES.simulator)}>
        Open Dashboard
      </ActionButton>
    </div>
  );
}
