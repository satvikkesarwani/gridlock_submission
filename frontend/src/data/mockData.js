export const event = {
  id: "FKID000008",
  name: "Cricket Match",
  type: "Stadium Event",
  category: "Stadium Event / Planned Event",
  venue: "M. Chinnaswamy Stadium",
  location: "Queens Statue Circle near M. Chinnaswamy Stadium",
  coordinates: "12.97883573, 77.59953728",
  attendance: "45,000",
  date: "2026-06-20",
  startTime: "20:00",
  endTime: "00:00",
  displayTime: "20:00 - 00:00",
  longDisplayTime: "8:00 PM - 12:00 AM",
  corridorClass: "CBD 2 Corridor, High Priority",
  status: "Planning Active",
};

export const landingMetrics = [
  { label: "Active Corridors", value: "3", tone: "green" },
  { label: "Live Incidents", value: "1", tone: "red" },
  { label: "Staff Planned", value: "28", tone: "blue" },
  { label: "Predicted Delay", value: "12.4 min", tone: "amber" },
];

export const inflowProjection = [
  { time: "16:00", projected: 4000, baseline: 3000 },
  { time: "18:00", projected: 7000, baseline: 4500 },
  { time: "20:00", projected: 15000, baseline: 7000 },
  { time: "22:00", projected: 21000, baseline: 8500 },
  { time: "00:00", projected: 17000, baseline: 6500 },
  { time: "02:00", projected: 6000, baseline: 3500 },
];

export const optimizerMetrics = [
  { label: "Relief Factor", value: "1.85" },
  { label: "Budget Estimate", value: "$3,450" },
  { label: "Sworn Staff Req", value: "28" },
  { label: "Volunteers Req", value: "12" },
  { label: "Barricades Req", value: "8" },
];

export const rosterRows = [
  { post: "P_01", start: "18:30", resources: "1 Sgt, 3 Cst", assignment: "Main Gate Control" },
  { post: "P_02", start: "19:00", resources: "2 Cst, 4 Vol", assignment: "Junction Divert" },
  { post: "P_03", start: "20:00", resources: "1 ASI, 2 Cst", assignment: "Parking Ingress" },
  { post: "P_04", start: "23:30", resources: "2 Cst", assignment: "Exit Flow Control" },
];

export const liveMetrics = [
  { label: "Travel Time Index", value: "2.1", tone: "red" },
  { label: "Avg Corridor Speed", value: "14 km/h", tone: "red" },
  { label: "Active Incidents", value: "1", tone: "red" },
  { label: "DMS Status", value: "Broadcasting", tone: "green" },
  { label: "Responder Dispatch Time", value: "8 min", tone: "green" },
  { label: "Estimated Clearance Time", value: "35 min", tone: "red" },
];

export const clearanceForecast = [
  { time: "10:00", congestion: 82 },
  { time: "10:30", congestion: 76 },
  { time: "11:00", congestion: 38 },
  { time: "11:30", congestion: 20 },
  { time: "12:00", congestion: 10 },
];

export const planVsActual = [
  { time: "16:00", planned: 3500, actual: 4500 },
  { time: "18:00", planned: 5200, actual: 9000 },
  { time: "20:00", planned: 9000, actual: 19000 },
  { time: "22:00", planned: 7200, actual: 15500 },
  { time: "00:00", planned: 5200, actual: 10500 },
  { time: "02:00", planned: 3000, actual: 6000 },
];

export const varianceMetrics = [
  { label: "Excess Delay", value: "+6.5 min", tone: "red" },
  { label: "Model R2", value: "0.87", tone: "green" },
  { label: "Volume Deviation", value: "+18%", tone: "blue" },
  { label: "Signal Overrides", value: "12", tone: "amber" },
];

export const shapImportance = [
  { label: "Inflow Divert Rate", value: 0.44 },
  { label: "Barricade Location", value: 0.32 },
  { label: "Volunteer Staffing", value: 0.2 },
  { label: "Incident Location", value: 0.1 },
];

export const insights = [
  "Actual inflow exceeded planned baseline during peak exit window.",
  "Barricade placement at Junction B2 likely reduced diversion efficiency.",
  "Volunteer staffing was slightly below recommended level for outer routes.",
];
