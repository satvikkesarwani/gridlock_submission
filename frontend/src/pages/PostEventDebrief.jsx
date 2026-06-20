import { useState, useEffect } from "react";
import { AlertTriangle, Car, Clock, SlidersHorizontal, Target, TrendingUp, Users, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import HorizontalBarChart from "../components/HorizontalBarChart.jsx";
import MetricCard from "../components/MetricCard.jsx";
import MiniLineChart from "../components/MiniLineChart.jsx";
import { getDebrief } from "../api/eventflow.js";
import { ROUTES } from "../constants/routes.js";
import { loadEventType } from "../constants/simulation.js";
import { event, insights, planVsActual as initialPVA, shapImportance as initialSHAP, varianceMetrics as initialVM } from "../data/mockData.js";

const varianceIcons = [Clock, TrendingUp, Workflow, SlidersHorizontal];

export default function PostEventDebrief() {
  const navigate = useNavigate();
  const [debriefData, setDebriefData] = useState({
    targetDelay: "12.0 min",
    actualDelay: "18.5 min",
    variance: "+6.5 min",
    delayHours: "780 veh-hr",
    planVsActual: initialPVA,
    varianceMetrics: initialVM,
    shapImportance: initialSHAP
  });
  const [error, setError] = useState("");
  const eventType = loadEventType();

  useEffect(() => {
    const fetchDebrief = async () => {
      try {
        setError("");
        const data = await getDebrief();

        setDebriefData({
          targetDelay: data.target_delay,
          actualDelay: data.actual_delay,
          variance: data.variance,
          delayHours: data.delay_hours,
          planVsActual: data.plan_vs_actual,
          varianceMetrics: data.variance_metrics,
          shapImportance: data.shap_importance
        });
      } catch (err) {
        console.error("Failed to fetch debrief data:", err);
        setError("Debrief data unavailable. Showing cached event baseline.");
      }
    };
    
    fetchDebrief();
  }, []);

  return (
    <div className="page">
      <AppHeader title="Post-Event Debriefing Hub" subtitle="Compare planned vs actual performance and improve future response." />

      <Card
        title="After-Action Summary"
        action={<span className="review-badge">Review Mode</span>}
        className="after-card"
      >
        <div className="select-grid">
          <div className="select-box">
            <small>Select Special Event</small>
            <strong>{eventType}</strong>
            <span>⌄</span>
          </div>
          <div className="select-box">
            <small>Date</small>
            <strong>{event.date}</strong>
            <span>⌄</span>
          </div>
        </div>
        <section className="kpi-grid four">
          <MetricCard icon={<Target size={24} />} label="Target Delay" value={debriefData.targetDelay} />
          <MetricCard icon={<Clock size={24} />} label="Actual Delay" value={debriefData.actualDelay} />
          <MetricCard icon={<AlertTriangle size={24} />} label="Variance" value={debriefData.variance} tone="red" />
          <MetricCard icon={<Car size={24} />} label="Delay Hours" value={debriefData.delayHours} />
        </section>
        {error && <p className="error-banner">{error}</p>}
      </Card>

      <MiniLineChart
        title="Plan-vs-Actual Traffic Volume Performance"
        yLabel="Vol"
        data={debriefData.planVsActual}
        lines={[
          { key: "planned", name: "Planned Baseline", color: "#8a97ac", dashed: true },
          { key: "actual", name: "Actual Flow", color: "#0ba6a0" },
        ]}
      />

      <Card title="Operational Variance Metrics">
        <section className="kpi-grid four variance-grid">
          {debriefData.varianceMetrics.map((metric, index) => {
            const Icon = varianceIcons[index % varianceIcons.length];
            return <MetricCard key={metric.label} icon={<Icon size={23} />} label={metric.label} value={metric.value} tone={metric.tone} />;
          })}
        </section>
      </Card>

      <HorizontalBarChart title="SHAP Variable Importance for Predictive Error" data={debriefData.shapImportance} />

      <Card title="Learning Insights" className="insights-card">
        <div className="insight-list">
          {insights.map((insight, index) => (
            <div className="insight-row" key={insight}>
              <span className={`insight-icon tone-${index}`}>
                {index === 0 ? <TrendingUp size={22} /> : index === 1 ? <Workflow size={22} /> : <Users size={22} />}
              </span>
              <p>{insight}</p>
            </div>
          ))}
        </div>
        <ActionButton className="primary" icon={<Workflow size={20} />} onClick={() => navigate(ROUTES.simulator)}>Update Simulation Parameters</ActionButton>
      </Card>

      <ActionButton onClick={() => navigate(ROUTES.home)}>Return to Dashboard</ActionButton>
    </div>
  );
}
