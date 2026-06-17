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
import InteractiveMap from "../components/InteractiveMap.jsx";
import Pill from "../components/Pill.jsx";
import { clearanceForecast as initialForecast, liveMetrics as initialMetrics } from "../data/mockData.js";

const metricIcons = [Gauge, Gauge, Siren, RadioTower, AlarmClock, Clock];

export default function LiveCorridorControl() {
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState({
    metrics: initialMetrics,
    forecast: initialForecast,
    estimatedClearance: "35 min"
  });

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket("ws://127.0.0.1:8000/api/ws/live-status");
    
    ws.onmessage = (event) => {
      try {
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
          <InfoLine icon={<MapPin size={23} />} label="Location" value="Whitefield Road / ITI Data Center" />
          <InfoLine icon={<BellRing size={23} />} label="ID" value="FKID000010" />
          <InfoLine icon={<Clock size={23} />} label="Est. Clear Time" value={liveData.estimatedClearance} />
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
        <InteractiveMap />
        <div className="filter-row">
          <Pill active>Speed Layers</Pill>
          <Pill active>CCTV</Pill>
          <Pill active>Incidents</Pill>
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

      <ActionButton className="primary" onClick={() => navigate("/debrief")}>Proceed to Post-Event Debriefing</ActionButton>
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
