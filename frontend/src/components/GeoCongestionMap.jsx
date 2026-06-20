import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leafletIcons.js"; // applies the bundled default-marker icons (side effect)

// Congestion "segments" drawn relative to the chosen venue. Offsets are in degrees
// (~0.004° ≈ 400 m), so the projection looks the same around any point on the map.
// Values (TTI / severity) are illustrative and kept fixed per the product spec.
const SEGMENTS = [
  { key: "Seg_1", tti: "2.8", label: "Severe", color: "var(--severe)", dLat: 0.0016, dLng: -0.0042, radius: 320 },
  { key: "Seg_2", tti: "1.4", label: "Moderate", color: "var(--moderate)", dLat: 0.0044, dLng: 0.0040, radius: 260 },
  { key: "Seg_3", tti: "1.0", label: "Normal", color: "var(--clear)", dLat: -0.0042, dLng: 0.0032, radius: 260 },
];

// Resolve a CSS custom property to a concrete colour Leaflet can use for SVG paths.
function cssVar(name) {
  if (typeof window === "undefined") return "#888";
  const raw = name.replace("var(", "").replace(")", "").trim();
  return getComputedStyle(document.documentElement).getPropertyValue(raw).trim() || "#888";
}

// Keep the map centred on the venue when it changes (e.g. after picking a new place).
function Recenter({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

/**
 * Spatiotemporal congestion projection rendered on a real map, centred on the
 * user-chosen venue with severity zones drawn around it.
 */
export default function GeoCongestionMap({ center, name, impactRadiusKm }) {
  const [lat, lng] = center;

  return (
    <div className="geo-congestion-map">
      <div className="interactive-map-container">
        <MapContainer center={center} zoom={15} zoomControl={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <Recenter center={center} />

          {/* Estimated affected radius around the venue (km → metres). */}
          {impactRadiusKm > 0 && (
            <Circle
              center={center}
              radius={impactRadiusKm * 1000}
              pathOptions={{ color: "#dd4a3e", fillColor: "#dd4a3e", fillOpacity: 0.05, weight: 1.5, dashArray: "6 6" }}
            >
              <Tooltip direction="bottom" className="geo-seg-tooltip">Impact radius ≈ {impactRadiusKm} km</Tooltip>
            </Circle>
          )}

          {/* Venue at the centre of the projection. */}
          <Marker position={center}>
            <Popup>
              <strong>{name}</strong>
              <br />
              Event epicentre
            </Popup>
          </Marker>

          {/* Severity zones around the venue. */}
          {SEGMENTS.map((s) => {
            const color = cssVar(s.color);
            const pos = [lat + s.dLat, lng + s.dLng];
            return (
              <Circle
                key={s.key}
                center={pos}
                radius={s.radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.18, weight: 2 }}
              >
                <Tooltip permanent direction="top" className="geo-seg-tooltip">
                  <strong>{s.key}</strong> · TTI {s.tti} · {s.label}
                </Tooltip>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      <div className="map-legend geo-legend">
        <span><i className="dot red-dot" />Severe (TTI &gt; 2.0)</span>
        <span><i className="dot amber-dot" />Moderate (1.2 - 2.0)</span>
        <span><i className="dot green-dot" />Normal (TTI &lt; 1.2)</span>
      </div>
    </div>
  );
}
