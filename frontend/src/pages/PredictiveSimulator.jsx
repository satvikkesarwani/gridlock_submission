import { useState } from "react";
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  
  const fields = [
    ["Event Type", event.type],
    ["Expected Attendance", event.attendance],
    ["Venue", event.venue],
    ["Time", event.displayTime],
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_cause: "public_event",
          priority: "High",
          hour_of_day: 20,
          is_weekend: true,
          requires_road_closure: true,
          attendance: event.attendance
        })
      });
      const data = await response.json();
      setResults(data);
      // Store resources for the optimizer page
      localStorage.setItem("event_resources", JSON.stringify(data.resources));
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

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
        <ActionButton 
          icon={<Play size={20} />} 
          className="compact-button primary" 
          onClick={handleSimulate}
        >
          {isSimulating ? "Simulating..." : "Run Traffic Simulation"}
        </ActionButton>
      </Card>

      {results && (
        <>
          <Card title="Spatiotemporal Congestion Projection" action={<Info size={21} />}>
            <CongestionMap />
          </Card>

          <section className="kpi-grid four">
            <MetricCard icon={<CheckCircle2 size={21} />} label="Status" value="Complete" />
            <MetricCard icon={<Car size={21} />} label="Max Queue" value="2.1 km" tone="amber" />
            <MetricCard icon={<Clock size={21} />} label="Delay" value={`${results.predicted_delay_mins} min`} tone="red" />
            <MetricCard icon={<TrendingUp size={21} />} label="Peak Inflow" value="12k v/h" tone="amber" />
          </section>

          <MiniLineChart
            title="Inflow Pressure & Bottleneck Projection"
            yLabel="Vehicles / hr"
            data={inflowProjection}
            lines={[
              { key: "projected", name: "Projected Demand", color: "#00d2ff" },
              { key: "baseline", name: "Baseline Demand", color: "#3a7bd5", dashed: true },
            ]}
          />

          <ActionButton className="primary" onClick={() => navigate("/optimizer")}>Proceed to Resource Optimizer</ActionButton>
        </>
      )}
    </div>
  );
}
