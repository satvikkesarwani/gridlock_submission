import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { loadVenue } from '../constants/simulation.js';
import { severeIcon } from './leafletIcons.js';

export default function InteractiveMap() {
  // Center on the venue chosen in the simulator (falls back to the default stadium).
  const venue = loadVenue();
  const center = [venue.lat, venue.lng];

  // Corridor features are drawn as offsets (in degrees) from the chosen centre,
  // so the GIS overlay follows whatever location the operator picked.
  const off = (dLat, dLng) => [center[0] + dLat, center[1] + dLng];
  const diversionRoute = [
    off(0.0002, -0.0045),
    off(0.0032, -0.0035),
    off(0.0042, 0.0005),
    off(0.0022, 0.0055),
    off(-0.0018, 0.0045),
  ];
  const barricade1 = off(0.0002, -0.0045);
  const barricade2 = off(-0.0018, 0.0045);

  return (
    <div className="interactive-map-container">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        {/* Light theme map tiles from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Main Incident Location */}
        <Marker position={center} icon={severeIcon}>
          <Popup>
            <strong>{venue.name}</strong><br/>
            High Priority Corridor<br/>
            Severe Congestion
          </Popup>
        </Marker>

        {/* Incident Buffer Zone */}
        <Circle
          center={center}
          pathOptions={{ fillColor: '#dd4a3e', color: '#dd4a3e', fillOpacity: 0.12, weight: 1.5 }}
          radius={500}
        />

        {/* Diversion Route */}
        <Polyline
          positions={diversionRoute}
          pathOptions={{ color: '#1f9d6b', weight: 4, dashArray: '10, 10' }}
        />

        {/* Barricade Markers */}
        <Marker position={barricade1}>
          <Popup>Barricade B1</Popup>
        </Marker>
        <Marker position={barricade2}>
          <Popup>Barricade B2</Popup>
        </Marker>

      </MapContainer>
    </div>
  );
}
