import React, { useState, useContext, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { MapContext } from '../../contexts/MapContext';
import { CompanionContext } from '../../contexts/CompanionContext';
import mockMapMarkers from '../../data/mockMapMarkers';
import apiConfig from '../../config/apiConfig';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import MarkerDetails from './MarkerDetails';

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

// Custom marker icons for different types
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

const EnhancedMapTab: React.FC = () => {
  const { markers, selectedMarker, addMarker, updateMarker, removeMarker, selectMarker } = useContext(MapContext);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'marker' | 'area' | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [previewLayer, setPreviewLayer] = useState<L.Polygon | null>(null);
  
  // Initialize map
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
      
      // Create markers layer
      markersLayerRef.current = L.layerGroup().addTo(leafletMap.current);
      
      // Add click handler for drawing
      leafletMap.current.on('click', handleMapClick);
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  // Update markers when they change
  useEffect(() => {
    if (leafletMap.current && markersLayerRef.current) {
      // Clear existing markers
      markersLayerRef.current.clearLayers();
      
      // Add markers from state
      markers.forEach(marker => {
        if (marker.type === 'marker') {
          const coords = marker.coordinates as [number, number];
          const newMarker = L.marker(coords, {
            icon: markerIcons[marker.markerType] || DefaultIcon
          }).addTo(markersLayerRef.current!);
          
          // Add popup
          newMarker.bindPopup(`
            <div class="map-popup">
              <h3 class="popup-title">${marker.name}</h3>
              ${marker.description ? `<p class="popup-description">${marker.description}</p>` : ''}
              <p class="popup-meta">
                <span class="popup-type">${marker.markerType.toUpperCase()}</span>
              </p>
            </div>
          `);
          
          // Add click handler
          newMarker.on('click', () => {
            selectMarker(marker);
          });
        } else if (marker.type === 'polygon' || marker.type === 'rectangle') {
          const coords = marker.coordinates as [number, number][];
          
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
          
          const newPolygon = L.polygon(coords, getAreaColor()).addTo(markersLayerRef.current!);
          
          // Add popup
          newPolygon.bindPopup(`
            <div class="map-popup">
              <h3 class="popup-title">${marker.name}</h3>
              ${marker.description ? `<p class="popup-description">${marker.description}</p>` : ''}
              <p class="popup-meta">
                <span class="popup-type">${marker.markerType.toUpperCase()} AREA</span>
              </p>
            </div>
          `);
          
          // Add click handler
          newPolygon.on('click', () => {
            selectMarker(marker);
          });
        }
      });
    }
  }, [markers, selectMarker]);
  
  // Update drawing preview
  useEffect(() => {
    if (leafletMap.current) {
      // Remove existing preview
      if (previewLayer) {
        previewLayer.remove();
        setPreviewLayer(null);
      }
      
      // Add new preview if drawing area
      if (drawingMode === 'area' && drawingPoints.length >= 2) {
        const newPreview = L.polygon(drawingPoints, {
          color: '#ffc107',
          fillColor: '#ffc107',
          fillOpacity: 0.3,
          dashArray: '5, 5',
          weight: 2
        }).addTo(leafletMap.current);
        
        setPreviewLayer(newPreview);
      }
    }
  }, [drawingPoints, drawingMode]);
  
  // Update cursor based on drawing mode
  useEffect(() => {
    if (leafletMap.current) {
      if (isDrawing) {
        leafletMap.current.getContainer().style.cursor = 'crosshair';
      } else {
        leafletMap.current.getContainer().style.cursor = '';
      }
    }
  }, [isDrawing]);
  
  // Handle map click for drawing
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawing) return;
    
    if (drawingMode === 'marker') {
      // Prompt for marker details
      const name = prompt('Name this location:');
      if (name) {
        const description = prompt('Add a description (optional):');
        const markerType = prompt('Type (home, resource, danger, ally, cache, other):') || 'other';
        
        // Create new marker
        const newMarker = {
          name,
          description: description || '',
          type: 'marker' as const,
          coordinates: [e.latlng.lat, e.latlng.lng] as [number, number],
          markerType: markerType as any
        };
        
        addMarker(newMarker);
        triggerCompanionResponse(`map_marker_added:${name}`);
        
        // Reset drawing mode
        setDrawingMode(null);
        setIsDrawing(false);
      }
    } else if (drawingMode === 'area') {
      // Add point to area
      setDrawingPoints([...drawingPoints, [e.latlng.lat, e.latlng.lng]]);
    }
  };
  
  // Handle adding an area
  const handleAddArea = (area: Omit<any, 'id' | 'createdAt'>) => {
    addMarker(area);
    triggerCompanionResponse(`map_marker_added:${area.name}`);
    setDrawingMode(null);
    setIsDrawing(false);
    setDrawingPoints([]);
  };
  
  // Handle finding user location
  const handleFindLocation = () => {
    if (leafletMap.current && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          leafletMap.current?.setView(
            [position.coords.latitude, position.coords.longitude],
            15
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to find your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };
  
  return (
    <div className="card">
      <h2 className="card-title">Survival Map</h2>
      
      <div className="flex" style={{ gap: '1rem' }}>
        <div style={{ flex: '3' }}>
          <div
            ref={mapRef}
            className="map-container"
          ></div>
          
          <div className="mt-1">
            <MapControls 
              onAddMarker={() => {}}
              onAddArea={handleAddArea}
              onFindLocation={handleFindLocation}
              isDrawing={isDrawing}
              setIsDrawing={setIsDrawing}
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
              drawingPoints={drawingPoints}
              setDrawingPoints={setDrawingPoints}
            />
          </div>
        </div>
        
        <div style={{ flex: '1' }}>
          <MapLegend />
          
          {selectedMarker && (
            <MarkerDetails 
              marker={selectedMarker}
              onEdit={updateMarker}
              onDelete={removeMarker}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMapTab;