import {
  AlarmClock,
  BellRing,
  Clock,
  Droplets,
  Gauge,
  Info,
  MapPin,
  RadioTower,
  Siren,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { LiveCorridorMap } from "../components/MockMap.jsx";
import Pill from "../components/Pill.jsx";
import { clearanceForecast, liveMetrics } from "../data/mockData.js";

const metricIcons = [Gauge, Gauge, Siren, RadioTower, AlarmClock, Clock];

export default function LiveCorridorControl() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <AppHeader title="Live Corridor Control Center" subtitle="Monitor real-time road conditions and coordinate response." />

      <Card className="alert-card">
        <header className="alert-header">
          <h2><Siren size={24} />Active Incident Alert</h2>
          <span>Live Now</span>
        </header>
        <div className="incident-grid">
          <InfoLine icon={<Siren size={23} />} label="Alert" value="Segment 14 Jam" tone="red" />
          <InfoLine icon={<MapPin size={23} />} label="Location" value="Whitefield Road / ITI Data Center" />
          <InfoLine icon={<BellRing size={23} />} label="ID" value="FKID000010" />
          <InfoLine icon={<Clock size={23} />} label="Est. Clear Time" value="35 min" />
          <InfoLine icon={<Droplets size={23} />} label="Type" value="Waterlogging" tone="blue" />
          <InfoLine icon={<Users size={23} />} label="Status" value="Responder Dispatched" tone="green" />
        </div>
        <div className="button-row">
          <Pill active><Users size={15} />Apply Diversion A</Pill>
          <Pill>Override Signal 12</Pill>
          <Pill><RadioTower size={15} />Broadcast DMS Alert</Pill>
        </div>
      </Card>

      <Card title="Real-Time GIS Corridor Monitoring" action={<Info size={21} />}>
        <LiveCorridorMap />
        <div className="filter-row">
          <Pill active>Speed Layers</Pill>
          <Pill active>CCTV</Pill>
          <Pill active>Incidents</Pill>
        </div>
      </Card>

      <Card title="Dynamic Corridor Metrics">
        <section className="live-metric-grid">
          {liveMetrics.map((metric, index) => {
            const Icon = metricIcons[index];
            return <MetricCard key={metric.label} icon={<Icon size={22} />} label={metric.label} value={metric.value} tone={metric.tone} />;
          })}
        </section>
      </Card>

      <Card title="Incident Clearance Forecast" action={<Info size={21} />} className="clearance-card">
        <div className="clearance-layout">
          <div className="clearance-number">
            <small>Estimated Clearance</small>
            <strong>35 <span>min</span></strong>
            <em>Confidence 78%</em>
          </div>
          <div className="clearance-chart">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={clearanceForecast} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#edf2f6" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#20304a", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#20304a", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => (value > 66 ? "High" : value > 33 ? "Med" : "Low")} />
                <Area dataKey="congestion" type="monotone" stroke="none" fill="#f8b6b6" fillOpacity={0.5} />
                <Line dataKey="congestion" type="monotone" stroke="#e53935" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="7 5" />
              </AreaChart>
            </ResponsiveContainer>
            <span className="clear-callout">Est. Clear<br />10:59 AM</span>
          </div>
        </div>
      </Card>

      <ActionButton onClick={() => navigate("/debrief")}>Proceed to Post-Event Debriefing</ActionButton>
    </div>
  );
}

function InfoLine({ icon, label, value, tone = "navy" }) {
  return (
    <div className={`info-line ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
