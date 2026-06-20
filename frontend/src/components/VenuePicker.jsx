import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPin } from "lucide-react";
import "./leafletIcons.js"; // applies the bundled default-marker icons (side effect)

// Bias geocoding toward Bengaluru so local area names ("Koramangala") rank first.
const NOMINATIM = "https://nominatim.openstreetmap.org";
const BLR_VIEWBOX = "77.45,13.14,77.78,12.83"; // left,top,right,bottom

// Small inline map that follows the selected coordinates.
function VenueMiniMap({ lat, lng }) {
  const mapRef = useRef(null);
  return (
    <div className="venue-mini-map">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Recenter lat={lat} lng={lng} mapRef={mapRef} />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}

// Imperatively pans the map when lat/lng change.
function Recenter({ lat, lng, mapRef }) {
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng, mapRef]);
  return null;
}

/**
 * Uber-like venue picker: type an area name for live suggestions (OpenStreetMap
 * Nominatim, no API key) or use the current location. Selecting a place expands
 * an inline map. Calls onChange with { name, lat, lng }.
 */
export default function VenuePicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [status, setStatus] = useState(""); // transient hint (searching / errors)
  const debounceRef = useRef(null);
  const blurTimerRef = useRef(null);

  // Debounced Nominatim search (respects the ~1 req/sec usage policy).
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setStatus("");
      return;
    }
    // `ignore` discards a stale response if the query changed (or the component
    // unmounted) before this request resolved — prevents out-of-order results.
    let ignore = false;
    setStatus("Searching…");
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `${NOMINATIM}/search?format=json&addressdetails=1&limit=5&countrycodes=in&viewbox=${BLR_VIEWBOX}&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        const list = Array.isArray(data) ? data : [];
        setSuggestions(list);
        setStatus(list.length ? "" : "No matches found.");
      } catch (err) {
        if (ignore) return;
        console.error("Venue search failed:", err);
        setSuggestions([]);
        setStatus("Search unavailable. Check your connection.");
      }
    }, 350);
    return () => {
      ignore = true;
      clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Clear the blur timer on unmount to avoid a setState-after-unmount warning.
  useEffect(() => () => clearTimeout(blurTimerRef.current), []);

  const selectPlace = (name, lat, lng) => {
    onChange({ name, lat, lng });
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setStatus("");
    setShowMap(true);
  };

  const handleSuggestion = (s) => {
    selectPlace(s.display_name.split(",")[0], parseFloat(s.lat), parseFloat(s.lon));
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation isn't supported on this device.");
      return;
    }
    setStatus("Locating you…");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const url = `${NOMINATIM}/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          const data = await res.json();
          const name = data?.display_name?.split(",").slice(0, 2).join(",") || "Current location";
          selectPlace(name, latitude, longitude);
        } catch {
          selectPlace("Current location", latitude, longitude);
        }
      },
      (err) => {
        console.error("Geolocation failed:", err);
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied."
            : "Couldn't get your location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="input-row venue-row">
      <span className="field-icon"><MapPin size={21} /></span>
      <div className="venue-picker">
        <small>Venue</small>
        <div className="venue-input-wrap">
          <input
            className="row-input"
            type="text"
            name="venueSearch"
            aria-label="Search venue or area"
            autoComplete="off"
            placeholder={value?.name || "Search area or venue"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Delay so a suggestion click registers before the list closes.
              blurTimerRef.current = setTimeout(() => setOpen(false), 150);
            }}
          />
          <button type="button" className="venue-locate-btn" onClick={handleLocate} title="Use current location">
            <LocateFixed size={16} />
          </button>
        </div>
        {value?.name && !query && <span className="venue-selected">{value.name}</span>}

        {open && (suggestions.length > 0 || status) && (
          <ul className="venue-suggestions">
            {status && <li className="venue-status">{status}</li>}
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                className="venue-suggestion"
                onMouseDown={() => handleSuggestion(s)}
              >
                <MapPin size={14} />
                <span>{s.display_name}</span>
              </li>
            ))}
          </ul>
        )}

        {showMap && value?.lat != null && (
          <VenueMiniMap lat={value.lat} lng={value.lng} />
        )}
      </div>
      <span className="select-chevron" aria-hidden="true" />
    </div>
  );
}
