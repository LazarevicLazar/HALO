import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mockMapMarkers, { MapMarker } from '../../data/mockMapMarkers';
import apiConfig from '../../config/apiConfig';

// Fix for Leaflet's icon issues with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different marker types
const markerIcons = {
  home: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  resource: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  danger: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  ally: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  cache: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }),
  other: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
};

const MapTab: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarker[]>(mockMapMarkers);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map
      leafletMap.current = L.map(mapRef.current).setView(
        apiConfig.openStreetMap.center as [number, number],
        apiConfig.openStreetMap.defaultZoom
      );
      
      // Add OpenStreetMap tiles with post-apocalyptic style
      L.tileLayer(apiConfig.openStreetMap.tileUrl, {
        attribution: apiConfig.openStreetMap.attribution,
        maxZoom: apiConfig.openStreetMap.maxZoom,
        className: 'map-tiles' // Apply CSS filter for post-apocalyptic look
      }).addTo(leafletMap.current);
      
      // Add CSS for post-apocalyptic map style
      const style = document.createElement('style');
      style.textContent = `
        .map-tiles {
          filter: grayscale(90%) sepia(30%) brightness(70%);
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  // Add markers to map
  useEffect(() => {
    if (leafletMap.current) {
      // Clear existing markers
      leafletMap.current.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polygon) {
          leafletMap.current?.removeLayer(layer);
        }
      });
      
      // Add markers from state
      markers.forEach(marker => {
        if (marker.type === 'marker') {
          const coords = marker.coordinates as [number, number];
          const newMarker = L.marker(coords, {
            icon: markerIcons[marker.markerType] || DefaultIcon
          }).addTo(leafletMap.current!);
          
          newMarker.bindPopup(`<strong>${marker.name}</strong><br>${marker.description || ''}`);
          
          newMarker.on('click', () => {
            setSelectedMarker(marker);
          });
        } else if (marker.type === 'polygon') {
          const coords = marker.coordinates as [number, number][];
          const newPolygon = L.polygon(coords, {
            color: marker.markerType === 'danger' ? '#a83232' : '#8b5d33'
          }).addTo(leafletMap.current!);
          
          newPolygon.bindPopup(`<strong>${marker.name}</strong><br>${marker.description || ''}`);
          
          newPolygon.on('click', () => {
            setSelectedMarker(marker);
          });
        } else if (marker.type === 'rectangle') {
          const coords = marker.coordinates as [number, number][];
          const newRectangle = L.polygon(coords, {
            color: marker.markerType === 'danger' ? '#a83232' : '#8b5d33'
          }).addTo(leafletMap.current!);
          
          newRectangle.bindPopup(`<strong>${marker.name}</strong><br>${marker.description || ''}`);
          
          newRectangle.on('click', () => {
            setSelectedMarker(marker);
          });
        }
      });
    }
  }, [markers, leafletMap.current]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="card">
      <h2 className="card-title">Survival Map</h2>
      
      <div className="flex" style={{ gap: '1rem' }}>
        <div style={{ flex: '3' }}>
          <div 
            ref={mapRef} 
            style={{ 
              height: '500px', 
              width: '100%', 
              borderRadius: '4px',
              border: '1px solid var(--border-color)'
            }}
          ></div>
          
          <div className="flex justify-between mt-1">
            <button className="button">Add Marker</button>
            <button className="button">Add Area</button>
            <button className="button">Find My Location</button>
          </div>
        </div>
        
        <div style={{ flex: '1' }}>
          <h3>Map Legend</h3>
          <div className="card" style={{ backgroundColor: 'var(--primary-color)' }}>
            <div className="flex align-center mb-1">
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--accent-color)', borderRadius: '50%', marginRight: '0.5rem' }}></div>
              <span>Home Base</span>
            </div>
            <div className="flex align-center mb-1">
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--success-color)', borderRadius: '50%', marginRight: '0.5rem' }}></div>
              <span>Resource</span>
            </div>
            <div className="flex align-center mb-1">
              <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--danger-color)', borderRadius: '50%', marginRight: '0.5rem' }}></div>
              <span>Danger</span>
            </div>
            <div className="flex align-center mb-1">
              <div style={{ width: '20px', height: '20px', backgroundColor: '#6c757d', borderRadius: '50%', marginRight: '0.5rem' }}></div>
              <span>Ally</span>
            </div>
            <div className="flex align-center">
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ffc107', borderRadius: '50%', marginRight: '0.5rem' }}></div>
              <span>Cache</span>
            </div>
          </div>
          
          {selectedMarker && (
            <>
              <h3 className="mt-1">Selected Location</h3>
              <div className="card" style={{ backgroundColor: 'var(--primary-color)' }}>
                <h4 className="text-accent">{selectedMarker.name}</h4>
                <p><strong>Type:</strong> {selectedMarker.markerType}</p>
                {selectedMarker.description && <p><strong>Description:</strong> {selectedMarker.description}</p>}
                <p><strong>Added:</strong> {formatDate(selectedMarker.createdAt)}</p>
                
                <div className="flex justify-between mt-1">
                  <button className="button">Edit</button>
                  <button className="button" style={{ backgroundColor: 'var(--danger-color)' }}>Delete</button>
                </div>
              </div>
              
              <div className="card mt-1">
                <p className="text-accent">Companion's Advice:</p>
                <p>
                  {selectedMarker.markerType === 'danger' 
                    ? "Be extremely cautious in this area. Consider bringing extra supplies and weapons if you must go here."
                    : selectedMarker.markerType === 'resource'
                    ? "This location has valuable resources. Consider visiting when supplies are low, but be prepared for other survivors."
                    : "This location is marked on your map. Make sure to plan your route carefully and stay alert."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapTab;