// User-facing event types for the Predictive Simulator, each mapped to a backend
// `event_cause` value the impact model was trained on (see backend dataset). The
// `cause` is what actually reaches POST /api/simulate; the `label` is display-only.
export const EVENT_TYPES = [
  { label: "Stadium / Sports Event", cause: "public_event" },
  { label: "Concert / Festival", cause: "public_event" },
  { label: "Political Rally", cause: "protest" },
  { label: "Religious Procession", cause: "procession" },
  { label: "VIP Movement", cause: "vip_movement" },
  { label: "Marathon / Parade", cause: "procession" },
];
