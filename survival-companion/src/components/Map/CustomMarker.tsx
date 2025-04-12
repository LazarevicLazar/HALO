import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapMarker } from '../../data/mockMapMarkers';

// Custom marker icons for different types
const markerIcons = {
  home: new L.Icon({
    iconUrl: '/assets/icons/map/home-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  resource: new L.Icon({
    iconUrl: '/assets/icons/map/resource-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  danger: new L.Icon({
    iconUrl: '/assets/icons/map/danger-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  ally: new L.Icon({
    iconUrl: '/assets/icons/map/ally-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  cache: new L.Icon({
    iconUrl: '/assets/icons/map/cache-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  other: new L.Icon({
    iconUrl: '/assets/icons/map/other-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
};

// Fallback icon
const defaultIcon = new L.Icon({
  iconUrl: '/assets/icons/map/default-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface CustomMarkerProps {
  marker: MapMarker;
  onSelect: (marker: MapMarker) => void;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ marker, onSelect }) => {
  if (marker.type !== 'marker') return null;
  
  const position = marker.coordinates as [number, number];
  const icon = markerIcons[marker.markerType] || defaultIcon;
  
  // Format date for popup
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        click: () => onSelect(marker)
      }}
    >
      <Popup>
        <div className="map-popup">
          <h3 className="popup-title">{marker.name}</h3>
          {marker.description && <p className="popup-description">{marker.description}</p>}
          <p className="popup-meta">
            <span className="popup-type">{marker.markerType.toUpperCase()}</span>
            <span className="popup-date">Added: {formatDate(marker.createdAt)}</span>
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

export default CustomMarker;