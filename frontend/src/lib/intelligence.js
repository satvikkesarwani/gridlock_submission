/**
 * Event traffic "intelligence" layer.
 *
 * Pure, deterministic functions that turn the backend's real ML outputs
 * (predicted delay + P10/P50/P90 clearance) and the operator's inputs into
 * decision-support artefacts: a gridlock risk score, a factor breakdown, an
 * impact radius, a deployment timeline, a readiness check, a natural-language
 * briefing and an exportable plan.
 *
 * These are transparent operational heuristics layered on top of the model —
 * NOT additional ML and NOT an LLM. The weights below are documented so the
 * output is explainable rather than a black box.
 */

const RUSH_HOURS = [7, 8, 9, 10, 17, 18, 19, 20];

/** Parse a possibly-formatted attendance string ("45,000") to a number. */
export function parseAttendance(value) {
  const n = Number.parseInt(String(value ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function startHour(startTime) {
  const h = Number.parseInt(String(startTime || "").split(":")[0], 10);
  return Number.isFinite(h) ? h : 20;
}

/**
 * Gridlock Risk Score (0–100) + level, composed of transparent weighted
 * components over the real model outputs and event inputs.
 */
export function computeRisk(ctx) {
  const attendance = parseAttendance(ctx.attendance);
  const delay = Number(ctx.delay) || 0;
  const p90 = Number(ctx.p90) || 0;
  const rush = RUSH_HOURS.includes(startHour(ctx.startTime));

  const components = [
    {
      key: "delay",
      label: "Predicted peak delay",
      detail: `${Math.round(delay)} min forecast by the impact model`,
      points: Math.round(clamp(delay / 240, 0, 1) * 35),
      max: 35,
    },
    {
      key: "clearance",
      label: "Worst-case clearance window",
      detail: `P90 clearance ≈ ${Math.round(p90)} min`,
      points: Math.round(clamp(p90 / 480, 0, 1) * 20),
      max: 20,
    },
    {
      key: "attendance",
      label: "Expected attendance",
      detail: `${attendance.toLocaleString()} people converging on one area`,
      points: Math.round(clamp(attendance / 80000, 0, 1) * 25),
      max: 25,
    },
    {
      key: "closure",
      label: "Road closure required",
      detail: ctx.roadClosure ? "A corridor closure removes capacity" : "No closure planned",
      points: ctx.roadClosure ? 12 : 0,
      max: 12,
    },
    {
      key: "peak",
      label: "Peak-hour start",
      detail: rush ? "Event starts during a rush-hour window" : "Off-peak start time",
      points: rush ? 8 : 0,
      max: 8,
    },
  ];

  const score = clamp(Math.round(components.reduce((s, c) => s + c.points, 0)), 0, 100);
  return { score, level: riskLevel(score), components };
}

/** Map a 0–100 score to an operational severity level + tone. */
export function riskLevel(score) {
  if (score >= 78) return { label: "Severe", tone: "red" };
  if (score >= 55) return { label: "High", tone: "red" };
  if (score >= 30) return { label: "Moderate", tone: "amber" };
  return { label: "Low", tone: "green" };
}

/** Top contributing risk factors (non-zero components, strongest first). */
export function riskFactors(ctx, risk = computeRisk(ctx)) {
  return risk.components
    .filter((c) => c.points > 0)
    .sort((a, b) => b.points - a.points);
}

/**
 * Estimated affected radius (km) around the venue — scales with crowd size and
 * predicted delay. Used to draw the impact zone on the map.
 */
export function impactRadiusKm(ctx) {
  const attendance = parseAttendance(ctx.attendance);
  const delay = Number(ctx.delay) || 0;
  const km = 0.4 + (attendance / 50000) * 1.2 + (delay / 300) * 0.8;
  return Math.round(clamp(km, 0.5, 4) * 10) / 10;
}

function addMinutes(hhmm, mins) {
  const [h, m] = String(hhmm || "20:00").split(":").map((x) => Number.parseInt(x, 10));
  const total = ((h * 60 + m + mins) % 1440 + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Operational deployment timeline keyed to the event window. Returns phases
 * with a clock time, label and recommended action drawn from the resources.
 */
export function deploymentTimeline(ctx) {
  const r = ctx.resources || {};
  const p50 = Math.round(Number(ctx.p50) || 30);
  return [
    {
      t: "T‑120",
      time: addMinutes(ctx.startTime, -120),
      title: "Stage & marshal",
      action: `Muster ${r.sworn_staff ?? 0} officers and ${r.volunteers ?? 0} volunteers; pre-position ${r.barricades ?? 0} barricades.`,
    },
    {
      t: "T‑60",
      time: addMinutes(ctx.startTime, -60),
      title: "Lock down corridor",
      action: `Erect barricades, activate ${r.diversions ?? 0} diversion points, brief signal operators.`,
    },
    {
      t: "T‑0",
      time: ctx.startTime || "20:00",
      title: "Event start — inflow peak",
      action: "Manage ingress, hold diversions, monitor live corridor speeds.",
    },
    {
      t: "Dispersal",
      time: ctx.endTime || "00:00",
      title: "Outflow surge",
      action: "Reverse diversions for outbound flow; stagger exits to avoid a clearance spike.",
    },
    {
      t: "Recovery",
      time: addMinutes(ctx.endTime, p50),
      title: "Corridor recovery",
      action: `Expected clear ~${p50} min after dispersal; stand down posts as speeds normalise.`,
    },
  ];
}

/** Baseline pool a mid-size city traffic division can field for one event. */
export const DEFAULT_AVAILABLE = { sworn_staff: 30, volunteers: 20, barricades: 12, diversions: 3 };

/**
 * Compare recommended resources against the available pool and flag shortfalls.
 * `available` defaults to a documented demo baseline.
 */
export function readinessReport(resources = {}, available = DEFAULT_AVAILABLE) {
  const rows = [
    { key: "sworn_staff", label: "Officers" },
    { key: "volunteers", label: "Volunteers" },
    { key: "barricades", label: "Barricades" },
    { key: "diversions", label: "Diversion points" },
  ].map(({ key, label }) => {
    const need = Number(resources[key]) || 0;
    const have = Number(available[key]) || 0;
    const gap = need - have;
    return { key, label, need, have, gap, short: gap > 0 };
  });
  const shortfalls = rows.filter((r) => r.short);
  return { rows, shortfalls, ready: shortfalls.length === 0 };
}

/** Natural-language pre-event risk briefing, interpolated from real numbers. */
export function buildBriefing(ctx, risk = computeRisk(ctx)) {
  const attendance = parseAttendance(ctx.attendance);
  const factors = riskFactors(ctx, risk).slice(0, 2).map((f) => f.label.toLowerCase());
  const r = ctx.resources || {};
  const driverText = factors.length ? factors.join(" and ") : "the combined event profile";
  return (
    `A ${ctx.eventTypeLabel || "planned event"} drawing ~${attendance.toLocaleString()} people ` +
    `near ${ctx.venueName || "the venue"} from ${ctx.startTime}–${ctx.endTime} is forecast to cause ` +
    `≈${Math.round(Number(ctx.delay) || 0)} min of peak delay, with corridor clearance around ` +
    `${Math.round(Number(ctx.p50) || 0)} min (worst-case ${Math.round(Number(ctx.p90) || 0)} min). ` +
    `Overall gridlock risk is ${risk.level.label} (${risk.score}/100), driven primarily by ${driverText}. ` +
    `Recommended deployment: ${r.sworn_staff ?? 0} officers, ${r.volunteers ?? 0} volunteers, ` +
    `${r.barricades ?? 0} barricades and ${r.diversions ?? 0} diversion points.`
  );
}

/** Plain-text operational plan suitable for download / printing. */
export function buildPlanText(ctx) {
  const risk = computeRisk(ctx);
  const r = ctx.resources || {};
  const timeline = deploymentTimeline(ctx);
  const readiness = readinessReport(r);
  const lines = [
    "GRIDLOCK INTELLIGENCE — EVENT OPERATIONAL PLAN",
    "=".repeat(48),
    `Event       : ${ctx.eventTypeLabel}`,
    `Venue       : ${ctx.venueName}`,
    `Window      : ${ctx.startTime} - ${ctx.endTime}`,
    `Attendance  : ${parseAttendance(ctx.attendance).toLocaleString()}`,
    "",
    `GRIDLOCK RISK: ${risk.level.label} (${risk.score}/100)`,
    `Predicted peak delay : ${Math.round(Number(ctx.delay) || 0)} min`,
    `Clearance (P50 / P90): ${Math.round(Number(ctx.p50) || 0)} / ${Math.round(Number(ctx.p90) || 0)} min`,
    `Impact radius        : ~${impactRadiusKm(ctx)} km`,
    "",
    "TOP RISK FACTORS",
    ...riskFactors(ctx, risk).map((f) => `  - ${f.label} (+${f.points}): ${f.detail}`),
    "",
    "RECOMMENDED RESOURCES",
    `  Officers   : ${r.sworn_staff ?? 0}`,
    `  Volunteers : ${r.volunteers ?? 0}`,
    `  Barricades : ${r.barricades ?? 0}`,
    `  Diversions : ${r.diversions ?? 0}`,
    `  Est. budget: $${(r.estimated_budget ?? 0).toLocaleString()}`,
    "",
    "READINESS" + (readiness.ready ? " : READY" : ` : SHORTFALL (${readiness.shortfalls.length})`),
    ...readiness.rows.map((row) => `  ${row.label}: need ${row.need} / have ${row.have}${row.short ? `  ⚠ short ${row.gap}` : ""}`),
    "",
    "DEPLOYMENT TIMELINE",
    ...timeline.map((p) => `  ${p.time}  [${p.t}] ${p.title} — ${p.action}`),
    "",
    "Generated by Gridlock Intelligence System.",
  ];
  return lines.join("\n");
}
