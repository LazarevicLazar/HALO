import React, { useEffect, useRef, useContext } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MapMarker } from '../../data/mockMapMarkers';
import apiConfig from '../../config/apiConfig';
import { MapContext } from '../../contexts/MapContext';
import { CompanionContext } from '../../contexts/CompanionContext';

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
  const { markers, selectedMarker, addMarker, updateMarker, removeMarker, selectMarker } = useContext(MapContext);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const drawnItems = useRef<L.FeatureGroup | null>(null);
  
  // Initialize map and draw controls
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
      
      // Initialize draw controls
      drawnItems.current = new L.FeatureGroup();
      leafletMap.current.addLayer(drawnItems.current);
      
      // Initialize Leaflet.Draw control
      const DrawControl = (L.Control as any).Draw;
      const drawControl = new DrawControl({
        draw: {
          polyline: false,
          circle: false,
          circlemarker: false,
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Warning:</strong> shape edges cannot cross!'
            },
            shapeOptions: {
              color: '#ff7800'
            }
          },
          rectangle: {
            shapeOptions: {
              color: '#ff7800'
            }
          },
          marker: {
            icon: DefaultIcon
          }
        },
        edit: {
          featureGroup: drawnItems.current
        }
      });
      
      leafletMap.current.addControl(drawControl);
      
      // Handle draw events
      leafletMap.current.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        drawnItems.current?.addLayer(layer);
        
        // Prompt for location name and description
        const locationName = prompt('Name this location:');
        if (locationName) {
          const locationDesc = prompt('Add a description (optional):');
          const markerType = prompt('Type (home, resource, danger, ally, cache, other):') || 'other';
          
          const newMarker: Omit<MapMarker, 'id' | 'createdAt'> = {
            name: locationName,
            description: locationDesc || '',
            type: (event as any).layerType,
            coordinates: (event as any).layerType === 'marker'
              ? [layer.getLatLng().lat, layer.getLatLng().lng] as [number, number]
              : layer.getLatLngs() as any,
            markerType: markerType as any
          };
          
          const createdMarker = addMarker(newMarker);
          
          // Trigger companion response
          triggerCompanionResponse(`map_marker_added:${locationName}`);
          
          // Add popup to the layer
          layer.bindPopup(`<strong>${locationName}</strong><br>${locationDesc || ''}`);
        } else {
          drawnItems.current?.removeLayer(layer);
        }
      });
      
      // Handle delete events
      leafletMap.current.on(L.Draw.Event.DELETED, (event) => {
        const layers = (event as any).layers;
        layers.eachLayer((layer: any) => {
          // In a real implementation, we would find and remove the corresponding marker
          console.log('Layer deleted:', layer);
        });
      });
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [addMarker, triggerCompanionResponse]);
  
  // Update markers when they change
  useEffect(() => {
    if (leafletMap.current) {
      // Clear existing markers
      leafletMap.current.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polygon) {
          leafletMap.current?.removeLayer(layer);
        }
      });
      
      // Add base tile layer back if needed
      let hasBaseLayer = false;
      leafletMap.current.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          hasBaseLayer = true;
        }
      });
      
      if (!hasBaseLayer) {
        L.tileLayer(apiConfig.openStreetMap.tileUrl, {
          attribution: apiConfig.openStreetMap.attribution,
          maxZoom: apiConfig.openStreetMap.maxZoom,
          className: 'map-tiles'
        }).addTo(leafletMap.current);
      }
      
      // Add markers from context
      markers.forEach(marker => {
        if (marker.type === 'marker') {
          const coords = marker.coordinates as [number, number];
          const newMarker = L.marker(coords, {
            icon: markerIcons[marker.markerType] || DefaultIcon
          }).addTo(leafletMap.current!);
          
          newMarker.bindPopup(`<strong>${marker.name}</strong><br>${marker.description || ''}`);
          
          newMarker.on('click', () => {
            selectMarker(marker);
          });
        } else if (marker.type === 'polygon' || marker.type === 'rectangle') {
          const coords = marker.coordinates as [number, number][];
          const newPolygon = L.polygon(coords, {
            color: marker.markerType === 'danger' ? '#a83232' : '#8b5d33'
          }).addTo(leafletMap.current!);
          
          newPolygon.bindPopup(`<strong>${marker.name}</strong><br>${marker.description || ''}`);
          
          newPolygon.on('click', () => {
            selectMarker(marker);
          });
        }
      });
    }
  }, [markers, selectMarker, leafletMap]);
  
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
            <button
              className="button"
              onClick={() => {
                if (leafletMap.current) {
                  const Draw = (L as any).Draw;
                  new Draw.Marker(leafletMap.current).enable();
                }
              }}
            >
              Add Marker
            </button>
            <button
              className="button"
              onClick={() => {
                if (leafletMap.current) {
                  const Draw = (L as any).Draw;
                  new Draw.Polygon(leafletMap.current).enable();
                }
              }}
            >
              Add Area
            </button>
            <button
              className="button"
              onClick={() => {
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
              }}
            >
              Find My Location
            </button>
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
                  <button
                    className="button"
                    onClick={() => {
                      const newName = prompt('Location name:', selectedMarker.name);
                      if (newName) {
                        const newDesc = prompt('Description:', selectedMarker.description || '');
                        updateMarker(selectedMarker.id, {
                          name: newName,
                          description: newDesc || selectedMarker.description
                        });
                      }
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="button"
                    style={{ backgroundColor: 'var(--danger-color)' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${selectedMarker.name}"?`)) {
                        removeMarker(selectedMarker.id);
                      }
                    }}
                  >
                    Delete
                  </button>
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