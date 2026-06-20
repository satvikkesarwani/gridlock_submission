import { useState, useEffect } from "react";
import { BarChart3, Info, Settings2, ShieldAlert, Users, Wallet, User, Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import InteractiveMap from "../components/InteractiveMap.jsx";
import Pill from "../components/Pill.jsx";
import { useSimulation } from "../hooks/useSimulation.js";
import { RESOURCES_STORAGE_KEY, loadLastSim, loadEventTime, loadEventType, loadVenue } from "../constants/simulation.js";
import { ROUTES } from "../constants/routes.js";
import { rosterRows } from "../data/mockData.js";
import { DeploymentTimeline, ReadinessReport, ExportPlanButton } from "../components/OpsPlan.jsx";

const metricIcons = [ShieldAlert, Wallet, Users, User, Construction];
const planLayers = ["Barricades", "Signal Control", "Patrol Routes"];

export default function ResourceOptimizer() {
  const navigate = useNavigate();
  const { isLoading: isOptimizing, error, runOptimization } = useSimulation();
  const [resources, setResources] = useState({
    sworn_staff: 28,
    volunteers: 12,
    barricades: 8,
    diversions: 2,
    relief_factor: 1.85,
    estimated_budget: 3450
  });
  const [planLayer, setPlanLayer] = useState("Barricades");

  const handleOptimize = async () => {
    const optimized = await runOptimization();
    if (optimized) {
      setResources(optimized);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(RESOURCES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResources(parsed);
      } catch (e) {
        console.error("Failed to parse resources");
      }
    }
  }, []);

  // Context for the timeline / readiness / export: the last simulation's event
  // window + the live (possibly re-optimized) resources shown on this page.
  const lastSim = loadLastSim();
  const time = loadEventTime();
  const planCtx = {
    eventTypeLabel: lastSim?.eventTypeLabel || loadEventType(),
    venueName: lastSim?.venueName || loadVenue().name,
    startTime: lastSim?.startTime || time.start,
    endTime: lastSim?.endTime || time.end,
    attendance: lastSim?.attendance ?? 0,
    delay: lastSim?.delay ?? 0,
    p50: lastSim?.p50 ?? 30,
    p90: lastSim?.p90 ?? 0,
    roadClosure: lastSim?.roadClosure ?? true,
    resources,
  };

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
        <ActionButton icon={<BarChart3 size={23} />} className="compact-button primary" onClick={handleOptimize}>
          {isOptimizing ? "Optimizing..." : "Optimize Deployment"}
        </ActionButton>
        {error && <p className="error-banner">{error}</p>}
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
          {planLayers.map((layer) => (
            <Pill key={layer} active={planLayer === layer} onClick={() => setPlanLayer(layer)}>
              {layer}
            </Pill>
          ))}
        </div>
        <InteractiveMap />
        <div className="summary-strip">
          <div><ShieldAlert size={23} />High-Risk Posts: <strong>3</strong></div>
          <div><Construction size={23} />Diversion Points: <strong>{resources.diversions}</strong></div>
        </div>
      </Card>

      <ReadinessReport resources={resources} />

      <DeploymentTimeline ctx={planCtx} />

      <ExportPlanButton ctx={planCtx} />

      <ActionButton className="primary" onClick={() => navigate(ROUTES.liveControl)}>Proceed to Live Corridor Control</ActionButton>
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
