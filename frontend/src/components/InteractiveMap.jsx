import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for severe incidents
const severeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function InteractiveMap() {
  // Center on M. Chinnaswamy Stadium, Bengaluru
  const center = [12.9788, 77.5995];

  // Mock diversion route
  const diversionRoute = [
    [12.9790, 77.5950],
    [12.9820, 77.5960],
    [12.9830, 77.6000],
    [12.9810, 77.6050],
    [12.9770, 77.6040]
  ];

  return (
    <div className="interactive-map-container" style={{ height: '330px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        {/* Dark theme map tiles from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Main Incident Location */}
        <Marker position={center} icon={severeIcon}>
          <Popup>
            <strong>M. Chinnaswamy Stadium</strong><br/>
            High Priority Corridor<br/>
            Severe Congestion
          </Popup>
        </Marker>

        {/* Stadium Buffer Zone */}
        <Circle 
          center={center} 
          pathOptions={{ fillColor: '#ef4444', color: '#ef4444', fillOpacity: 0.2 }} 
          radius={500} 
        />

        {/* Diversion Route */}
        <Polyline 
          positions={diversionRoute} 
          pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10' }} 
        />
        
        {/* Barricade Markers */}
        <Marker position={[12.9790, 77.5950]}>
          <Popup>Barricade B1</Popup>
        </Marker>
        <Marker position={[12.9770, 77.6040]}>
          <Popup>Barricade B2</Popup>
        </Marker>

      </MapContainer>
    </div>
  );
}
