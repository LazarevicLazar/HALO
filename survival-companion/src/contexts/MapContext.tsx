import React, { createContext, useState, useContext, ReactNode } from 'react';
import mockMapMarkers, { MapMarker } from '../data/mockMapMarkers';
import { CompanionContext } from './CompanionContext';

interface MapContextType {
  markers: MapMarker[];
  selectedMarker: MapMarker | null;
  addMarker: (marker: Omit<MapMarker, 'id' | 'createdAt'>) => void;
  updateMarker: (markerId: string, updates: Partial<MapMarker>) => void;
  removeMarker: (markerId: string) => void;
  selectMarker: (marker: MapMarker | null) => void;
}

export const MapContext = createContext<MapContextType>({
  markers: [],
  selectedMarker: null,
  addMarker: () => {},
  updateMarker: () => {},
  removeMarker: () => {},
  selectMarker: () => {}
});

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [markers, setMarkers] = useState<MapMarker[]>(mockMapMarkers);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  
  const { triggerCompanionResponse } = useContext(CompanionContext);
  
  // Add a new marker to the map
  const addMarker = (marker: Omit<MapMarker, 'id' | 'createdAt'>) => {
    const newMarker: MapMarker = {
      ...marker,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setMarkers([...markers, newMarker]);
    
    // Save markers to localStorage
    localStorage.setItem('survival-map-markers', JSON.stringify([...markers, newMarker]));
    
    // Trigger companion response
    triggerCompanionResponse(`map_marker_added:${newMarker.name}`);
    
    return newMarker;
  };
  
  // Update an existing marker
  const updateMarker = (markerId: string, updates: Partial<MapMarker>) => {
    const updatedMarkers = markers.map(marker => 
      marker.id === markerId ? { ...marker, ...updates } : marker
    );
    
    setMarkers(updatedMarkers);
    
    // Save markers to localStorage
    localStorage.setItem('survival-map-markers', JSON.stringify(updatedMarkers));
    
    // Update selected marker if it's the one being updated
    if (selectedMarker && selectedMarker.id === markerId) {
      setSelectedMarker({ ...selectedMarker, ...updates });
    }
  };
  
  // Remove a marker from the map
  const removeMarker = (markerId: string) => {
    const markerToRemove = markers.find(marker => marker.id === markerId);
    if (!markerToRemove) return;
    
    const updatedMarkers = markers.filter(marker => marker.id !== markerId);
    setMarkers(updatedMarkers);
    
    // Save markers to localStorage
    localStorage.setItem('survival-map-markers', JSON.stringify(updatedMarkers));
    
    // Clear selected marker if it's the one being removed
    if (selectedMarker && selectedMarker.id === markerId) {
      setSelectedMarker(null);
    }
  };
  
  // Select a marker
  const selectMarker = (marker: MapMarker | null) => {
    setSelectedMarker(marker);
  };
  
  return (
    <MapContext.Provider value={{
      markers,
      selectedMarker,
      addMarker,
      updateMarker,
      removeMarker,
      selectMarker
    }}>
      {children}
    </MapContext.Provider>
  );
};