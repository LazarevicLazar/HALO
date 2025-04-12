import React, { useContext } from 'react';
import { MapMarker } from '../../data/mockMapMarkers';
import { CompanionContext } from '../../contexts/CompanionContext';

interface MarkerDetailsProps {
  marker: MapMarker;
  onEdit: (markerId: string, updates: Partial<MapMarker>) => void;
  onDelete: (markerId: string) => void;
}

const MarkerDetails: React.FC<MarkerDetailsProps> = ({ marker, onEdit, onDelete }) => {
  const { triggerCompanionResponse } = useContext(CompanionContext);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle edit
  const handleEdit = () => {
    const newName = prompt('Location name:', marker.name);
    if (newName) {
      const newDesc = prompt('Description:', marker.description || '');
      onEdit(marker.id, { 
        name: newName, 
        description: newDesc || marker.description 
      });
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${marker.name}"?`)) {
      onDelete(marker.id);
    }
  };
  
  // Get companion advice based on marker type
  const getCompanionAdvice = () => {
    switch (marker.markerType) {
      case 'danger':
        return "Be extremely cautious in this area. Consider bringing extra supplies and weapons if you must go here.";
      case 'resource':
        return "This location has valuable resources. Consider visiting when supplies are low, but be prepared for other survivors.";
      case 'home':
        return "This is your base of operations. Keep it secure and well-stocked. Consider setting up defenses and escape routes.";
      case 'ally':
        return "Friendly territory. Maintain good relations by trading fairly and offering assistance when needed.";
      case 'cache':
        return "You've hidden supplies here. Remember to check periodically to ensure they haven't been discovered or damaged.";
      default:
        return "This location is marked on your map. Make sure to plan your route carefully and stay alert.";
    }
  };
  
  // Get icon based on marker type
  const getMarkerIcon = () => {
    switch (marker.markerType) {
      case 'danger':
        return '⚠️';
      case 'resource':
        return '🔋';
      case 'home':
        return '🏠';
      case 'ally':
        return '👥';
      case 'cache':
        return '📦';
      default:
        return '📍';
    }
  };
  
  return (
    <div className="marker-details">
      <h3 className="mt-1">Selected Location</h3>
      <div className="card" style={{ backgroundColor: 'var(--primary-color)' }}>
        <div className="marker-header">
          <span className="marker-icon">{getMarkerIcon()}</span>
          <h4 className="text-accent">{marker.name}</h4>
        </div>
        
        <div className="marker-info">
          <p><strong>Type:</strong> {marker.markerType.charAt(0).toUpperCase() + marker.markerType.slice(1)}</p>
          <p><strong>Location Type:</strong> {marker.type === 'marker' ? 'Point' : 'Area'}</p>
          {marker.description && <p><strong>Description:</strong> {marker.description}</p>}
          <p><strong>Added:</strong> {formatDate(marker.createdAt)}</p>
          
          {marker.type === 'marker' && (
            <p><strong>Coordinates:</strong> {(marker.coordinates as [number, number])[0].toFixed(4)}, {(marker.coordinates as [number, number])[1].toFixed(4)}</p>
          )}
          
          {marker.type !== 'marker' && (
            <p><strong>Area:</strong> {(marker.coordinates as [number, number][]).length} points</p>
          )}
        </div>
        
        <div className="marker-actions">
          <button
            className="button"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="button"
            style={{ backgroundColor: 'var(--danger-color)' }}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="card mt-1">
        <p className="text-accent">Companion's Advice:</p>
        <p>{getCompanionAdvice()}</p>
        <button 
          className="button mt-1" 
          style={{ width: '100%' }}
          onClick={() => triggerCompanionResponse(`map_marker_selected:${marker.name}`)}
        >
          Ask Companion About This Location
        </button>
      </div>
    </div>
  );
};

export default MarkerDetails;