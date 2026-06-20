import { useEffect, useMemo, useState } from "react";
import { Car, CheckCircle2, Clock, Info, Play, Users, CalendarDays, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/ActionButton.jsx";
import AppHeader from "../components/AppHeader.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import MiniLineChart from "../components/MiniLineChart.jsx";
import { ClearanceBand } from "../components/CorridorRibbon.jsx";
import GeoCongestionMap from "../components/GeoCongestionMap.jsx";
import Pill from "../components/Pill.jsx";
import { useSimulation } from "../hooks/useSimulation.js";
import { ROUTES } from "../constants/routes.js";
import { VENUE_STORAGE_KEY, EVENT_TYPE_STORAGE_KEY, TIME_STORAGE_KEY, DEFAULT_TIME, LAST_SIM_STORAGE_KEY } from "../constants/simulation.js";
import { event, inflowProjection } from "../data/mockData.js";
import { EVENT_TYPES } from "../constants/eventTypes.js";
import VenuePicker from "../components/VenuePicker.jsx";
import { computeRisk, riskFactors, buildBriefing, impactRadiusKm } from "../lib/intelligence.js";
import { RiskBadge, RiskBriefing, RiskFactors } from "../components/RiskIntelligence.jsx";
import ScenarioComparison from "../components/ScenarioComparison.jsx";
import InterventionImpact from "../components/InterventionImpact.jsx";
import ModelDrivers from "../components/ModelDrivers.jsx";

export default function PredictiveSimulator() {
  const navigate = useNavigate();
  const { isLoading: isSimulating, error, runSimulation } = useSimulation();
  const [results, setResults] = useState(null);
  const [runMeta, setRunMeta] = useState(null);
  const [mitigation, setMitigation] = useState("Heatmap");

  const [eventType, setEventType] = useState(EVENT_TYPES[0].label);
  const [attendance, setAttendance] = useState("45000");
  const [venue, setVenue] = useState({ name: event.venue, lat: 12.97883573, lng: 77.59953728 });
  const [startTime, setStartTime] = useState(DEFAULT_TIME.start);
  const [endTime, setEndTime] = useState(DEFAULT_TIME.end);

  // Share the chosen venue with the map components (incl. the Live Corridor GIS map).
  useEffect(() => {
    localStorage.setItem(VENUE_STORAGE_KEY, JSON.stringify(venue));
  }, [venue]);

  // Share the chosen event type with the home page event summary.
  useEffect(() => {
    localStorage.setItem(EVENT_TYPE_STORAGE_KEY, eventType);
  }, [eventType]);

  // Share the chosen event window so the home page stays consistent.
  useEffect(() => {
    localStorage.setItem(TIME_STORAGE_KEY, JSON.stringify({ start: startTime, end: endTime }));
  }, [startTime, endTime]);

  const mitigationOptions = ["Heatmap", "Ingress Paths", "Transit Feeds"];

  const cause = EVENT_TYPES.find((t) => t.label === eventType)?.cause ?? "public_event";

  const handleSimulate = async () => {
    // Derive the model's hour-of-day from the chosen start time so it influences the forecast.
    const hour = Number.parseInt(startTime.split(":")[0], 10);
    const data = await runSimulation({
      event_cause: cause,
      attendance: String(attendance),
      ...(Number.isFinite(hour) ? { hour_of_day: hour } : {}),
    });
    if (data) {
      setResults(data);
      setRunMeta({
        eventTypeLabel: eventType,
        eventCause: cause,
        attendance,
        venueName: venue.name,
        startTime,
        endTime,
        roadClosure: true,
      });
    }
  };

  // Build the decision-support context from the run inputs + real model outputs.
  const ctx = useMemo(() => {
    if (!results || !runMeta) return null;
    return {
      ...runMeta,
      delay: results.predicted_delay_mins,
      p10: results.clearanceRange?.optimistic_p10_mins,
      p50: results.clearanceRange?.expected_clearance_mins,
      p90: results.clearanceRange?.pessimistic_p90_mins,
      resources: results.resources,
    };
  }, [results, runMeta]);

  const risk = useMemo(() => (ctx ? computeRisk(ctx) : null), [ctx]);

  // Persist the full run context so the Optimizer and Debrief can build the
  // deployment timeline, readiness check and exportable plan from it.
  useEffect(() => {
    if (ctx) localStorage.setItem(LAST_SIM_STORAGE_KEY, JSON.stringify(ctx));
  }, [ctx]);

  return (
    <div className="page">
      <AppHeader title="Predictive Event Simulator" subtitle="Simulate event traffic before deployment." />

      <Card className="input-card">
        <div className="input-row">
          <span className="field-icon"><CalendarDays size={21} /></span>
          <div>
            <small>Event Type</small>
            <select
              className="row-select"
              name="eventType"
              aria-label="Event type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>
          <span className="select-chevron">⌄</span>
        </div>

        <div className="input-row">
          <span className="field-icon"><Users size={21} /></span>
          <div>
            <small>Expected Attendance</small>
            <input
              className="row-input"
              type="text"
              name="attendance"
              aria-label="Expected attendance"
              inputMode="numeric"
              placeholder="e.g. 45000"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <span className="select-chevron" aria-hidden="true" />
        </div>

        <VenuePicker value={venue} onChange={setVenue} />

        <div className="input-row">
          <span className="field-icon"><Clock size={21} /></span>
          <div>
            <small>Time</small>
            <div className="time-range">
              <input
                className="row-input time-input"
                type="time"
                name="startTime"
                aria-label="Event start time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <span className="time-dash" aria-hidden="true">–</span>
              <input
                className="row-input time-input"
                type="time"
                name="endTime"
                aria-label="Event end time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <span className="select-chevron" aria-hidden="true" />
        </div>

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

      {results && ctx && risk && (
        <>
          <RiskBadge risk={risk} />
          <RiskBriefing text={buildBriefing(ctx, risk)} />

          <Card title="Spatiotemporal Congestion Projection" action={<Info size={21} />}>
            <GeoCongestionMap
              center={[venue.lat, venue.lng]}
              name={venue.name}
              impactRadiusKm={impactRadiusKm(ctx)}
            />
          </Card>

          <section className="kpi-grid four">
            <MetricCard icon={<CheckCircle2 size={21} />} label="Status" value="Complete" />
            <MetricCard icon={<Car size={21} />} label="Impact Radius" value={`~${impactRadiusKm(ctx)} km`} tone="amber" />
            <MetricCard icon={<Clock size={21} />} label="Delay" value={`${results.predicted_delay_mins} min`} tone="red" />
            <MetricCard icon={<TrendingUp size={21} />} label="Peak Inflow" value="12k v/h" tone="amber" />
          </section>

          <RiskFactors factors={riskFactors(ctx, risk)} />

          <ModelDrivers />

          <ScenarioComparison baseCtx={ctx} run={runSimulation} />

          <InterventionImpact baseCtx={ctx} run={runSimulation} />

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
