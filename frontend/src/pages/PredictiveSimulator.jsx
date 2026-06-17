import { Car, CheckCircle2, Clock, Info, MapPin, Play, Users, CalendarDays, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import MiniLineChart from "../components/MiniLineChart.jsx";
import { CongestionMap } from "../components/MockMap.jsx";
import Pill from "../components/Pill.jsx";
import { event, inflowProjection } from "../data/mockData.js";

const fieldIcons = [CalendarDays, Users, MapPin, Clock];

export default function PredictiveSimulator() {
  const navigate = useNavigate();
  const fields = [
    ["Event Type", event.type],
    ["Expected Attendance", event.attendance],
    ["Venue", event.venue],
    ["Time", event.displayTime],
  ];

  return (
    <div className="page">
      <AppHeader title="Predictive Event Simulator" subtitle="Simulate event traffic before deployment." />

      <Card className="input-card">
        {fields.map(([label, value], index) => {
          const Icon = fieldIcons[index];
          return (
            <div className="input-row" key={label}>
              <span className="field-icon"><Icon size={21} /></span>
              <div>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
              <span className="select-chevron">⌄</span>
            </div>
          );
        })}
        <div className="input-label">Select Mitigation</div>
        <div className="segmented-row">
          <Pill active>Heatmap</Pill>
          <Pill>Ingress Paths</Pill>
          <Pill>Transit Feeds</Pill>
        </div>
        <ActionButton icon={<Play size={20} />} className="compact-button">Run Traffic Simulation</ActionButton>
      </Card>

      <Card title="Spatiotemporal Congestion Projection" action={<Info size={21} />}>
        <CongestionMap />
      </Card>

      <section className="kpi-grid four">
        <MetricCard icon={<CheckCircle2 size={21} />} label="Status" value="Simulation Complete" />
        <MetricCard icon={<Car size={21} />} label="Max Queue" value="1.4 km" tone="blue" />
        <MetricCard icon={<Clock size={21} />} label="Delay" value="12.4 min/veh" tone="green" />
        <MetricCard icon={<TrendingUp size={21} />} label="Peak Inflow" value="10k veh/hr" tone="green" />
      </section>

      <MiniLineChart
        title="Inflow Pressure & Bottleneck Projection"
        yLabel="Vehicles / hr"
        data={inflowProjection}
        lines={[
          { key: "projected", name: "Projected Demand", color: "#079b7a" },
          { key: "baseline", name: "Baseline Demand", color: "#1d73d8", dashed: true },
        ]}
      />

      <ActionButton onClick={() => navigate("/optimizer")}>Proceed to Resource Optimizer</ActionButton>
    </div>
  );
}
