import React from 'react';
import { Polygon, Popup } from 'react-leaflet';
import { MapMarker } from '../../data/mockMapMarkers';

interface CustomAreaProps {
  marker: MapMarker;
  onSelect: (marker: MapMarker) => void;
}

const CustomArea: React.FC<CustomAreaProps> = ({ marker, onSelect }) => {
  if (marker.type !== 'polygon' && marker.type !== 'rectangle') return null;
  
  const positions = marker.coordinates as [number, number][];
  
  // Determine color based on marker type
  const getAreaColor = () => {
    switch (marker.markerType) {
      case 'danger':
        return { color: '#a83232', fillColor: '#a83232', fillOpacity: 0.3 };
      case 'resource':
        return { color: '#32a852', fillColor: '#32a852', fillOpacity: 0.3 };
      case 'home':
        return { color: '#3273a8', fillColor: '#3273a8', fillOpacity: 0.3 };
      case 'ally':
        return { color: '#8b5d33', fillColor: '#8b5d33', fillOpacity: 0.3 };
      case 'cache':
        return { color: '#a87832', fillColor: '#a87832', fillOpacity: 0.3 };
      default:
        return { color: '#8b5d33', fillColor: '#8b5d33', fillOpacity: 0.3 };
    }
  };
  
  // Format date for popup
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Polygon 
      positions={positions}
      pathOptions={getAreaColor()}
      eventHandlers={{
        click: () => onSelect(marker)
      }}
    >
      <Popup>
        <div className="map-popup">
          <h3 className="popup-title">{marker.name}</h3>
          {marker.description && <p className="popup-description">{marker.description}</p>}
          <p className="popup-meta">
            <span className="popup-type">{marker.markerType.toUpperCase()} AREA</span>
            <span className="popup-date">Added: {formatDate(marker.createdAt)}</span>
          </p>
        </div>
      </Popup>
    </Polygon>
  );
};

export default CustomArea;