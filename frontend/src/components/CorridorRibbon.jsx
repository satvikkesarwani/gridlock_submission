/**
 * Corridor Ribbon — the signature element. Renders congestion as a living
 * quantity flowing along a route: a segmented green/amber/red severity band
 * with km ticks and a gliding "pressure" marker.
 */
export function CorridorRibbon({
  road,
  eyebrow = "Active Corridor",
  status = "moderate",
  statusLabel,
  segments = [],
  ticks = [],
  pressure,
}) {
  const total = segments.reduce((sum, seg) => sum + (seg.weight ?? 1), 0) || 1;

  return (
    <div className="corridor-ribbon">
      <div className="ribbon-head">
        <span className="ribbon-eyebrow">
          {eyebrow}
          {road && (
            <>
              {" · "}
              <b>{road}</b>
            </>
          )}
        </span>
        {statusLabel && <span className={`ribbon-status ${status}`}>{statusLabel}</span>}
      </div>

      <div className="ribbon-track">
        <div className="ribbon-band" role="img" aria-label={`${road || "Corridor"} severity profile: ${statusLabel || status}`}>
          {segments.map((seg, i) => (
            <span
              key={i}
              className={`ribbon-seg ${seg.severity}`}
              style={{ flex: `${(seg.weight ?? 1) / total} 1 0%` }}
            />
          ))}
        </div>
        {typeof pressure === "number" && (
          <span
            className="ribbon-marker"
            style={{ left: `${Math.min(Math.max(pressure, 0), 1) * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      {ticks.length > 0 && (
        <div className="ribbon-ticks" aria-hidden="true">
          {ticks.map((tick, i) => (
            <span key={i}>{tick}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Clearance Band — the ribbon idiom applied to the P10–P50–P90 clearance
 * forecast: a range expressed as a corridor of time.
 */
export function ClearanceBand({ p10, p50, p90, unit = "min" }) {
  const span = p90 - p10 || 1;
  const markerPct = Math.min(Math.max((p50 - p10) / span, 0), 1) * 100;

  return (
    <div className="clearance-band">
      <div className="cb-track">
        <span className="cb-range" />
        <span className="cb-marker" style={{ left: `${markerPct}%` }} aria-hidden="true" />
      </div>
      <div className="cb-scale">
        <div className="cb-point clear">
          <small>P10 · Optimistic</small>
          <strong>
            {p10}
            <span className="cb-unit"> {unit}</span>
          </strong>
        </div>
        <div className="cb-point moderate">
          <small>P50 · Expected</small>
          <strong>
            {p50}
            <span className="cb-unit"> {unit}</span>
          </strong>
        </div>
        <div className="cb-point severe">
          <small>P90 · Pessimistic</small>
          <strong>
            {p90}
            <span className="cb-unit"> {unit}</span>
          </strong>
        </div>
      </div>
    </div>
  );
}
