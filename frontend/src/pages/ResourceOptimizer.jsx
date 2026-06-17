import { useState, useEffect } from "react";
import { BarChart3, Info, Settings2, ShieldAlert, Users, Wallet, User, Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { DiversionMap } from "../components/MockMap.jsx";
import Pill from "../components/Pill.jsx";
import { rosterRows } from "../data/mockData.js";

const metricIcons = [ShieldAlert, Wallet, Users, User, Construction];

export default function ResourceOptimizer() {
  const navigate = useNavigate();
  const [resources, setResources] = useState({
    sworn_staff: 28,
    volunteers: 12,
    barricades: 8,
    diversions: 2,
    relief_factor: 1.85,
    estimated_budget: 3450
  });

  useEffect(() => {
    const saved = localStorage.getItem("event_resources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResources(parsed);
      } catch (e) {
        console.error("Failed to parse resources");
      }
    }
  }, []);

  const optimizerMetrics = [
    { label: "Relief Factor", value: resources.relief_factor },
    { label: "Budget Estimate", value: `$${resources.estimated_budget}` },
    { label: "Sworn Staff Req", value: resources.sworn_staff },
    { label: "Volunteers Req", value: resources.volunteers },
    { label: "Barricades Req", value: resources.barricades },
  ];

  return (
    <div className="page">
      <AppHeader title="Tactical Resource Optimizer" subtitle="Convert forecasts into action-ready deployments." />

      <Card title="Optimization Controls" action={<Settings2 size={23} />}>
        <div className="slider-list">
          <SliderRow label="Cost Weight (G1)" value={30} />
          <SliderRow label="Safety Weight (G2)" value={50} />
          <SliderRow label="Auxiliary Weight (G3)" value={20} />
        </div>
        <section className="optimizer-metrics">
          {optimizerMetrics.map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length];
            return <MetricCard key={metric.label} icon={<Icon size={22} />} label={metric.label} value={metric.value} />;
          })}
        </section>
        <ActionButton icon={<BarChart3 size={23} />} className="compact-button primary">Optimize Deployment</ActionButton>
      </Card>

      <Card title="Recommended Roster Deployment Schedule" className="table-card">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Post ID</th>
              <th>Start Time</th>
              <th>Resources</th>
              <th>Assignment</th>
            </tr>
          </thead>
          <tbody>
            {rosterRows.map((row) => (
              <tr key={row.post}>
                <td><span className="post-pill">{row.post}</span></td>
                <td>{row.start}</td>
                <td>{row.resources}</td>
                <td>{row.assignment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Tactical Barricading & Diversion Plan" action={<Info size={21} />}>
        <div className="segmented-row">
          <Pill active>Barricades</Pill>
          <Pill>Signal Control</Pill>
          <Pill>Patrol Routes</Pill>
        </div>
        <DiversionMap />
        <div className="summary-strip">
          <div><ShieldAlert size={23} />High-Risk Posts: <strong>3</strong></div>
          <div><Construction size={23} />Diversion Points: <strong>{resources.diversions}</strong></div>
        </div>
      </Card>

      <ActionButton className="primary" onClick={() => navigate("/live-control")}>Proceed to Live Corridor Control</ActionButton>
    </div>
  );
}

function SliderRow({ label, value }) {
  return (
    <div className="slider-row">
      <div className="slider-head">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="fake-slider">
        <span style={{ width: `${value}%` }} />
        <i style={{ left: `${value}%` }} />
      </div>
    </div>
  );
}
