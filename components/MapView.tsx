import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { CityUpdate, Coordinates, CATEGORY_COLORS } from '../types';

interface MapViewProps {
  center: Coordinates;
  zoom: number;
  updates: CityUpdate[];
  onMarkerClick: (update: CityUpdate) => void;
}

// Helper to update map view when center changes
const RecenterMap: React.FC<{ center: Coordinates }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ center, zoom, updates, onMarkerClick }) => {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <RecenterMap center={center} />

      {/* User Location Pulse */}
      <CircleMarker 
        center={[center.lat, center.lng]}
        radius={8}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}
      >
      </CircleMarker>
      <CircleMarker 
        center={[center.lat, center.lng]}
        radius={20}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, stroke: false }}
      />

      {updates.map((update) => (
        <CircleMarker
          key={update.id}
          center={[update.location.lat, update.location.lng]}
          radius={10}
          pathOptions={{ 
            color: 'white', 
            weight: 2,
            fillColor: CATEGORY_COLORS[update.category], 
            fillOpacity: 1 
          }}
          eventHandlers={{
            click: () => onMarkerClick(update),
          }}
        >
          <Popup>
            <div className="p-1">
              <strong style={{ color: CATEGORY_COLORS[update.category] }}>
                {update.category}
              </strong>
              <p className="m-0 text-sm mt-1">{update.description}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default MapView;