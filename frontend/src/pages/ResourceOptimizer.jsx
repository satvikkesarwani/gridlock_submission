import { BarChart3, Info, Settings2, ShieldAlert, Users, Wallet, User, Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { DiversionMap } from "../components/MockMap.jsx";
import Pill from "../components/Pill.jsx";
import { optimizerMetrics, rosterRows } from "../data/mockData.js";

const metricIcons = [ShieldAlert, Wallet, Users, User, Construction];

export default function ResourceOptimizer() {
  const navigate = useNavigate();

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
            const Icon = metricIcons[index];
            return <MetricCard key={metric.label} icon={<Icon size={22} />} label={metric.label} value={metric.value} />;
          })}
        </section>
        <ActionButton icon={<BarChart3 size={23} />} className="compact-button">Optimize Deployment</ActionButton>
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
          <div><Construction size={23} />Diversion Points: <strong>2</strong></div>
        </div>
      </Card>

      <ActionButton onClick={() => navigate("/live-control")}>Proceed to Live Corridor Control</ActionButton>
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
