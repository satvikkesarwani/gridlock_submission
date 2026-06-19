import { useState } from "react";
import { Car, CheckCircle2, Clock, Info, MapPin, Play, Users, CalendarDays, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import MiniLineChart from "../components/MiniLineChart.jsx";
import { ClearanceBand } from "../components/CorridorRibbon.jsx";
import { CongestionMap } from "../components/MockMap.jsx";
import Pill from "../components/Pill.jsx";
import { useSimulation } from "../hooks/useSimulation.js";
import { ROUTES } from "../constants/routes.js";
import { event, inflowProjection } from "../data/mockData.js";

const fieldIcons = [CalendarDays, Users, MapPin, Clock];

export default function PredictiveSimulator() {
  const navigate = useNavigate();
  const { isLoading: isSimulating, error, runSimulation } = useSimulation();
  const [results, setResults] = useState(null);
  const [mitigation, setMitigation] = useState("Heatmap");

  const mitigationOptions = ["Heatmap", "Ingress Paths", "Transit Feeds"];

  const fields = [
    ["Event Type", event.type],
    ["Expected Attendance", event.attendance],
    ["Venue", event.venue],
    ["Time", event.displayTime],
  ];

  const handleSimulate = async () => {
    const data = await runSimulation();
    if (data) {
      setResults(data);
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
          {mitigationOptions.map((option) => (
            <Pill key={option} active={mitigation === option} onClick={() => setMitigation(option)}>
              {option}
            </Pill>
          ))}
        </div>
        <ActionButton 
          icon={<Play size={20} />} 
          className="compact-button primary" 
          onClick={handleSimulate}
        >
          {isSimulating ? "Simulating..." : "Run Traffic Simulation"}
        </ActionButton>
        {error && <p className="error-banner">{error}</p>}
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

          {results.clearanceRange?.status === "success" && (
            <Card title="Clearance Time Forecast" action={<Clock size={21} />} className="clearance-card">
              <p className="card-subtext">Time to clear the corridor, with P10–P90 confidence range.</p>
              <ClearanceBand
                p10={results.clearanceRange.optimistic_p10_mins}
                p50={results.clearanceRange.expected_clearance_mins}
                p90={results.clearanceRange.pessimistic_p90_mins}
              />
            </Card>
          )}

          <MiniLineChart
            title="Inflow Pressure & Bottleneck Projection"
            yLabel="Vehicles / hr"
            data={inflowProjection}
            lines={[
              { key: "projected", name: "Projected Demand", color: "#0ba6a0" },
              { key: "baseline", name: "Baseline Demand", color: "#8a97ac", dashed: true },
            ]}
          />

          <ActionButton className="primary" onClick={() => navigate(ROUTES.optimizer)}>Proceed to Resource Optimizer</ActionButton>
        </>
      )}
    </div>
  );
}
