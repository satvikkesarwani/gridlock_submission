import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Bundle Leaflet's default marker images (Vite resolves these to hashed, locally
// served asset URLs) instead of fetching them from third-party CDNs at runtime.
// Importing this module anywhere applies the default-icon fix once, app-wide.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Self-contained red "severe incident" pin (inline SVG — no network dependency,
// replaces the previous raw.githubusercontent.com image).
export const severeIcon = L.divIcon({
  className: "leaflet-severe-pin",
  html:
    '<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M13 0C5.82 0 0 5.82 0 13c0 9.1 13 25 13 25s13-15.9 13-25C26 5.82 20.18 0 13 0z" fill="#dd4a3e"/>' +
    '<circle cx="13" cy="13" r="5" fill="#fff"/></svg>',
  iconSize: [26, 38],
  iconAnchor: [13, 38],
  popupAnchor: [0, -34],
});
