import { useState, useEffect } from "react";
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
import { CorridorRibbon } from "../components/CorridorRibbon.jsx";
import InteractiveMap from "../components/InteractiveMap.jsx";
import { WS_BASE_URL } from "../config/api.js";
import Pill from "../components/Pill.jsx";
import { ROUTES } from "../constants/routes.js";
import { loadVenue } from "../constants/simulation.js";
import { activeCorridor, clearanceForecast as initialForecast, liveMetrics as initialMetrics } from "../data/mockData.js";

const metricIcons = [Gauge, Gauge, Siren, RadioTower, AlarmClock, Clock];

export default function LiveCorridorControl() {
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState({
    metrics: initialMetrics,
    forecast: initialForecast,
    estimatedClearance: "35 min"
  });
  const [connectionError, setConnectionError] = useState("");
  const [layers, setLayers] = useState({ "Speed Layers": true, CCTV: true, Incidents: true });
  const venue = loadVenue();

  const toggleLayer = (name) => setLayers((prev) => ({ ...prev, [name]: !prev[name] }));

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`${WS_BASE_URL}/api/ws/live-status`);

    ws.onopen = () => setConnectionError("");
    ws.onerror = () => setConnectionError("Live feed unavailable. Showing last known metrics.");
    ws.onclose = () => setConnectionError((current) => current || "Live feed disconnected.");
    
    ws.onmessage = (event) => {
      try {
        setConnectionError("");
        const data = JSON.parse(event.data);
        setLiveData({
          metrics: [
            { label: "Travel Time Index", value: String(data.travel_time_index), tone: data.travel_time_index > 2 ? "red" : "amber" },
            { label: "Avg Corridor Speed", value: `${data.avg_speed} km/h`, tone: data.avg_speed < 15 ? "red" : "amber" },
            { label: "Active Incidents", value: String(data.active_incidents), tone: "red" },
            { label: "DMS Status", value: data.dms_status, tone: "green" },
            { label: "Responder Dispatch Time", value: data.dispatch_time, tone: "green" },
            { label: "Estimated Clearance Time", value: data.estimated_clearance, tone: "red" },
          ],
          forecast: data.clearance_forecast,
          estimatedClearance: data.estimated_clearance
        });
      } catch (err) {
        console.error("Error parsing WS message:", err);
        setConnectionError("Live feed returned malformed data.");
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="page">
      <AppHeader title="Live Corridor Control Center" subtitle="Monitor real-time road conditions and coordinate response." />

      <Card className="alert-card">
        <header className="alert-header">
          <h2><Siren size={24} />Active Incident Alert</h2>
          <span className="live-badge">Live WS</span>
        </header>
        <div className="incident-grid">
          <InfoLine icon={<Siren size={23} />} label="Alert" value="Segment 14 Jam" tone="red" />
          <InfoLine icon={<MapPin size={23} />} label="Location" value={venue.name} />
          <InfoLine icon={<BellRing size={23} />} label="ID" value="FKID000010" />
          <InfoLine icon={<Clock size={23} />} label="Est. Clear Time" value={liveData.estimatedClearance} />
          <InfoLine icon={<Droplets size={23} />} label="Type" value="Waterlogging" tone="blue" />
          <InfoLine icon={<Users size={23} />} label="Status" value="Responder Dispatched" tone="green" />
        </div>
        {connectionError && <p className="error-banner">{connectionError}</p>}
      </Card>

      <Card title="Real-Time GIS Corridor Monitoring" action={<Info size={21} />}>
        <div className="live-ribbon">
          <CorridorRibbon
            eyebrow="Live Corridor"
            road={venue.name}
            status={activeCorridor.status}
            statusLabel={activeCorridor.statusLabel}
            segments={activeCorridor.segments}
            ticks={activeCorridor.ticks}
            pressure={activeCorridor.pressure}
          />
        </div>
        <InteractiveMap />
        <div className="filter-row">
          {["Speed Layers", "CCTV", "Incidents"].map((name) => (
            <Pill key={name} active={layers[name]} onClick={() => toggleLayer(name)}>
              {name}
            </Pill>
          ))}
        </div>
      </Card>

      <Card title="Dynamic Corridor Metrics">
        <section className="live-metric-grid">
          {liveData.metrics.map((metric, index) => {
            const Icon = metricIcons[index];
            return <MetricCard key={metric.label} icon={<Icon size={22} />} label={metric.label} value={metric.value} tone={metric.tone} />;
          })}
        </section>
      </Card>

      <Card title="Incident Clearance Forecast" action={<Info size={21} />} className="clearance-card">
        <div className="clearance-layout">
          <div className="clearance-number">
            <small>Estimated Clearance</small>
            <strong>{liveData.estimatedClearance.split(" ")[0]} <span>min</span></strong>
            <em>Confidence 78%</em>
          </div>
          <div className="clearance-chart">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={liveData.forecast} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#edf1f6" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#5c6b82", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#e3e9f1" }} />
                <YAxis tick={{ fill: "#5c6b82", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => (value > 66 ? "High" : value > 33 ? "Med" : "Low")} />
                <Area dataKey="congestion" type="monotone" stroke="none" fill="#dd4a3e" fillOpacity={0.12} animationDuration={700} animationEasing="ease-out" />
                <Line dataKey="congestion" type="monotone" stroke="#dd4a3e" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: "#dd4a3e" }} strokeDasharray="6 5" animationDuration={700} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
            <span className="clear-callout">Est. Clear<br />10:59 AM</span>
          </div>
        </div>
      </Card>

      <ActionButton className="primary" onClick={() => navigate(ROUTES.debrief)}>Proceed to Post-Event Debriefing</ActionButton>
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
