import React, { useState } from 'react';
import { MapMarker } from '../../data/mockMapMarkers';

interface MapControlsProps {
  onAddMarker: (marker: Omit<MapMarker, 'id' | 'createdAt'>) => void;
  onAddArea: (area: Omit<MapMarker, 'id' | 'createdAt'>) => void;
  onFindLocation: () => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  drawingMode: 'marker' | 'area' | null;
  setDrawingMode: (mode: 'marker' | 'area' | null) => void;
  drawingPoints: [number, number][];
  setDrawingPoints: (points: [number, number][]) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onAddMarker,
  onAddArea,
  onFindLocation,
  isDrawing,
  setIsDrawing,
  drawingMode,
  setDrawingMode,
  drawingPoints,
  setDrawingPoints
}) => {
  // Start adding a marker
  const handleAddMarker = () => {
    if (drawingMode === 'marker') {
      // Cancel if already in marker mode
      setDrawingMode(null);
      setIsDrawing(false);
    } else {
      setDrawingMode('marker');
      setIsDrawing(true);
      setDrawingPoints([]);
    }
  };
  
  // Start adding an area
  const handleAddArea = () => {
    if (drawingMode === 'area') {
      // Complete area if already in area mode
      handleCompleteArea();
    } else {
      setDrawingMode('area');
      setIsDrawing(true);
      setDrawingPoints([]);
    }
  };
  
  // Complete area drawing
  const handleCompleteArea = () => {
    if (drawingPoints.length >= 3) {
      // Prompt for area details
      const name = prompt('Name this area:');
      if (name) {
        const description = prompt('Add a description (optional):');
        const markerType = prompt('Type (home, resource, danger, ally, cache, other):') || 'other';
        
        // Create new area marker
        const newArea: Omit<MapMarker, 'id' | 'createdAt'> = {
          name,
          description: description || '',
          type: 'polygon',
          coordinates: drawingPoints,
          markerType: markerType as any
        };
        
        onAddArea(newArea);
      }
    } else {
      alert('Please add at least 3 points to create an area.');
      return;
    }
    
    // Reset
    setDrawingMode(null);
    setIsDrawing(false);
    setDrawingPoints([]);
  };
  
  // Cancel drawing
  const handleCancelDrawing = () => {
    setDrawingMode(null);
    setIsDrawing(false);
    setDrawingPoints([]);
  };
  
  return (
    <div className="map-controls">
      <div className="control-buttons">
        <button
          className={`button ${drawingMode === 'marker' ? 'active' : ''}`}
          onClick={handleAddMarker}
        >
          {drawingMode === 'marker' ? 'Cancel' : 'Add Marker'}
        </button>
        
        <button
          className={`button ${drawingMode === 'area' ? 'active' : ''}`}
          onClick={handleAddArea}
          disabled={drawingMode === 'area' && drawingPoints.length < 3}
        >
          {drawingMode === 'area' 
            ? (drawingPoints.length >= 3 ? 'Complete Area' : `Add Points (${drawingPoints.length}/3)`) 
            : 'Add Area'
          }
        </button>
        
        {isDrawing && (
          <button 
            className="button"
            onClick={handleCancelDrawing}
          >
            Cancel
          </button>
        )}
        
        <button 
          className="button"
          onClick={onFindLocation}
          disabled={isDrawing}
        >
          Find My Location
        </button>
      </div>
      
      {isDrawing && (
        <div className="drawing-instructions">
          {drawingMode === 'marker' 
            ? 'Click on the map to place a marker' 
            : 'Click on the map to add points. Add at least 3 points to create an area.'
          }
        </div>
      )}
      
      {/* Render drawing points preview */}
      {drawingMode === 'area' && drawingPoints.length > 0 && (
        <div className="drawing-preview">
          <p>Points: {drawingPoints.length}</p>
          <ul>
            {drawingPoints.map((point, index) => (
              <li key={index}>
                Point {index + 1}: {point[0].toFixed(4)}, {point[1].toFixed(4)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapControls;