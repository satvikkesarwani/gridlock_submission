import { AlertTriangle, Car, Clock, SlidersHorizontal, Target, TrendingUp, Users, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import HorizontalBarChart from "../components/HorizontalBarChart.jsx";
import MetricCard from "../components/MetricCard.jsx";
import MiniLineChart from "../components/MiniLineChart.jsx";
import { event, insights, planVsActual, shapImportance, varianceMetrics } from "../data/mockData.js";

const varianceIcons = [Clock, TrendingUp, Workflow, SlidersHorizontal];

export default function PostEventDebrief() {
  const navigate = useNavigate();

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
            <strong>{event.name}</strong>
            <span>⌄</span>
          </div>
          <div className="select-box">
            <small>Date</small>
            <strong>{event.date}</strong>
            <span>⌄</span>
          </div>
        </div>
        <section className="kpi-grid four">
          <MetricCard icon={<Target size={24} />} label="Target Delay" value="12.0 min" />
          <MetricCard icon={<Clock size={24} />} label="Actual Delay" value="18.5 min" />
          <MetricCard icon={<AlertTriangle size={24} />} label="Variance" value="+6.5 min" tone="red" />
          <MetricCard icon={<Car size={24} />} label="Delay Hours" value="780 veh-hr" />
        </section>
        <ActionButton variant="secondary" icon={<SlidersHorizontal size={20} />}>Calibrate DUA Model</ActionButton>
      </Card>

      <MiniLineChart
        title="Plan-vs-Actual Traffic Volume Performance"
        yLabel="Vol"
        data={planVsActual}
        lines={[
          { key: "planned", name: "Planned Baseline", color: "#1d73d8", dashed: true },
          { key: "actual", name: "Actual Flow", color: "#079b7a" },
        ]}
      />

      <Card title="Operational Variance Metrics">
        <section className="kpi-grid four variance-grid">
          {varianceMetrics.map((metric, index) => {
            const Icon = varianceIcons[index];
            return <MetricCard key={metric.label} icon={<Icon size={23} />} label={metric.label} value={metric.value} tone={metric.tone} />;
          })}
        </section>
      </Card>

      <HorizontalBarChart title="SHAP Variable Importance for Predictive Error" data={shapImportance} />

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
        <ActionButton variant="secondary" icon={<Workflow size={20} />}>Update Simulation Parameters</ActionButton>
      </Card>

      <ActionButton onClick={() => navigate("/")}>Return to Dashboard</ActionButton>
    </div>
  );
}
