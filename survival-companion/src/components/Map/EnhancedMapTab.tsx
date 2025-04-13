import React, { useState, useContext, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { MapContext } from "../../contexts/MapContext";
import { CompanionContext } from "../../contexts/CompanionContext";
import mockMapMarkers from "../../data/mockMapMarkers";
import apiConfig from "../../config/apiConfig";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import MarkerDetails from "./MarkerDetails";

// Fix for Leaflet's icon issues with webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons for different types
const markerIcons = {
  home: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  resource: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  danger: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  ally: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  cache: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
  other: L.icon({
    iconUrl: icon, // Replace with custom icon
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }),
};

const EnhancedMapTab: React.FC = () => {
  const {
    markers,
    selectedMarker,
    addMarker,
    updateMarker,
    removeMarker,
    selectMarker,
  } = useContext(MapContext);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<"marker" | "area" | null>(
    null
  );
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [previewLayer, setPreviewLayer] = useState<L.Polygon | null>(null);

  // User location marker reference
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  // Handle map click for drawing - defined before it's used in useEffect
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    console.log(
      "Map clicked - Drawing state:",
      isDrawing,
      "Mode:",
      drawingMode
    );

    // Force check both isDrawing and drawingMode to ensure we're in the right state
    if (!isDrawing || !drawingMode) {
      console.log("Not in active drawing mode, ignoring click");
      return;
    }

    console.log("Processing map click in drawing mode:", drawingMode);
    console.log("Click coordinates:", e.latlng.lat, e.latlng.lng);

    if (drawingMode === "marker") {
      console.log("Adding a new marker");
      // Prompt for marker details
      const name = prompt("Name this location:");
      if (name) {
        const description = prompt("Add a description (optional):");
        const markerType =
          prompt("Type (home, resource, danger, ally, cache, other):") ||
          "other";

        console.log("Creating marker:", name, "type:", markerType);

        // Create new marker
        const newMarker = {
          name,
          description: description || "",
          type: "marker" as const,
          coordinates: [e.latlng.lat, e.latlng.lng] as [number, number],
          markerType: markerType as any,
        };

        console.log("Adding marker to map:", newMarker);
        addMarker(newMarker);
        triggerCompanionResponse(`map_marker_added:${name}`);
        console.log("Marker added successfully");

        // Reset drawing mode
        setDrawingMode(null);
        setIsDrawing(false);
      }
    } else if (drawingMode === "area") {
      // Add point to area
      console.log("Adding point to area:", e.latlng.lat, e.latlng.lng);
      console.log("Current points:", drawingPoints.length);

      setDrawingPoints([...drawingPoints, [e.latlng.lat, e.latlng.lng]]);

      console.log("Point added, new total:", drawingPoints.length + 1);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      console.log("Initializing map");

      // Initialize map
      leafletMap.current = L.map(mapRef.current).setView(
        apiConfig.openStreetMap.center as [number, number],
        apiConfig.openStreetMap.defaultZoom
      );

      // Add OpenStreetMap tiles with post-apocalyptic style
      L.tileLayer(apiConfig.openStreetMap.tileUrl, {
        attribution: apiConfig.openStreetMap.attribution,
        maxZoom: apiConfig.openStreetMap.maxZoom,
        className: "map-tiles", // Apply CSS filter for post-apocalyptic look
      }).addTo(leafletMap.current);

      // Add CSS for post-apocalyptic map style
      const style = document.createElement("style");
      style.textContent = `
        .map-tiles {
          filter: grayscale(90%) sepia(30%) brightness(70%);
        }
      `;
      document.head.appendChild(style);

      // Create markers layer
      markersLayerRef.current = L.layerGroup().addTo(leafletMap.current);

      console.log("Map initialized successfully");
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Add map click handler with access to latest state
  useEffect(() => {
    if (leafletMap.current) {
      // Remove any existing click handlers to prevent duplicates
      leafletMap.current.off("click");

      // Add click handler with access to current state values
      leafletMap.current.on("click", handleMapClick);

      console.log(
        "Map click handler updated with latest state - Drawing:",
        isDrawing,
        "Mode:",
        drawingMode
      );
    }

    return () => {
      // Clean up click handler when component unmounts or dependencies change
      if (leafletMap.current) {
        leafletMap.current.off("click");
      }
    };
  }, [
    isDrawing,
    drawingMode,
    drawingPoints,
    addMarker,
    triggerCompanionResponse,
  ]); // Remove handleMapClick from dependencies to avoid circular reference

  // Update markers when they change
  useEffect(() => {
    if (leafletMap.current && markersLayerRef.current) {
      // Clear existing markers
      markersLayerRef.current.clearLayers();

      // Add markers from state
      markers.forEach((marker) => {
        if (marker.type === "marker") {
          const coords = marker.coordinates as [number, number];
          const newMarker = L.marker(coords, {
            icon: markerIcons[marker.markerType] || DefaultIcon,
          }).addTo(markersLayerRef.current!);

          // Add popup
          newMarker.bindPopup(`
            <div class="map-popup">
              <h3 class="popup-title">${marker.name}</h3>
              ${
                marker.description
                  ? `<p class="popup-description">${marker.description}</p>`
                  : ""
              }
              <p class="popup-meta">
                <span class="popup-type">${marker.markerType.toUpperCase()}</span>
              </p>
            </div>
          `);

          // Add click handler
          newMarker.on("click", () => {
            selectMarker(marker);
          });
        } else if (marker.type === "polygon" || marker.type === "rectangle") {
          const coords = marker.coordinates as [number, number][];

          // Determine color based on marker type
          const getAreaColor = () => {
            switch (marker.markerType) {
              case "danger":
                return {
                  color: "#a83232",
                  fillColor: "#a83232",
                  fillOpacity: 0.3,
                };
              case "resource":
                return {
                  color: "#32a852",
                  fillColor: "#32a852",
                  fillOpacity: 0.3,
                };
              case "home":
                return {
                  color: "#3273a8",
                  fillColor: "#3273a8",
                  fillOpacity: 0.3,
                };
              case "ally":
                return {
                  color: "#8b5d33",
                  fillColor: "#8b5d33",
                  fillOpacity: 0.3,
                };
              case "cache":
                return {
                  color: "#a87832",
                  fillColor: "#a87832",
                  fillOpacity: 0.3,
                };
              default:
                return {
                  color: "#8b5d33",
                  fillColor: "#8b5d33",
                  fillOpacity: 0.3,
                };
            }
          };

          const newPolygon = L.polygon(coords, getAreaColor()).addTo(
            markersLayerRef.current!
          );

          // Add popup
          newPolygon.bindPopup(`
            <div class="map-popup">
              <h3 class="popup-title">${marker.name}</h3>
              ${
                marker.description
                  ? `<p class="popup-description">${marker.description}</p>`
                  : ""
              }
              <p class="popup-meta">
                <span class="popup-type">${marker.markerType.toUpperCase()} AREA</span>
              </p>
            </div>
          `);

          // Add click handler
          newPolygon.on("click", () => {
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
      if (drawingMode === "area" && drawingPoints.length >= 2) {
        const newPreview = L.polygon(drawingPoints, {
          color: "#ffc107",
          fillColor: "#ffc107",
          fillOpacity: 0.3,
          dashArray: "5, 5",
          weight: 2,
        }).addTo(leafletMap.current);

        setPreviewLayer(newPreview);
      }
    }
  }, [drawingPoints, drawingMode]);

  // Update cursor based on drawing mode
  useEffect(() => {
    if (leafletMap.current) {
      if (isDrawing) {
        leafletMap.current.getContainer().style.cursor = "crosshair";
      } else {
        leafletMap.current.getContainer().style.cursor = "";
      }
    }
  }, [isDrawing]);

  // Handle adding an area
  const handleAddArea = (area: Omit<any, "id" | "createdAt">) => {
    addMarker(area);
    triggerCompanionResponse(`map_marker_added:${area.name}`);
    setDrawingMode(null);
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  // Handle finding user location
  const handleFindLocation = () => {
    if (leafletMap.current && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [
            position.coords.latitude,
            position.coords.longitude,
          ] as [number, number];

          // Set view to user location
          leafletMap.current?.setView(userCoords, 15);

          // Remove previous user location marker if it exists
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.remove();
          }

          // Create a green marker for user location
          const greenIcon = L.icon({
            iconUrl: icon,
            shadowUrl: iconShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            className: "user-location-marker", // Add a class for styling
          });

          // Add CSS for green marker
          const style = document.createElement("style");
          style.textContent = `
            .user-location-marker {
              filter: hue-rotate(100deg) brightness(1.2); /* Make the marker green */
            }
          `;
          document.head.appendChild(style);

          // Create and add the marker
          userLocationMarkerRef.current = L.marker(userCoords, {
            icon: greenIcon,
            zIndexOffset: 1000, // Make sure it's on top of other markers
          }).addTo(leafletMap.current!);

          // Add popup to the marker
          userLocationMarkerRef.current
            .bindPopup("Your current location")
            .openPopup();

          console.log("User location found:", userCoords);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to find your location. Please check your browser permissions."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Survival Map</h2>

      <div className="flex" style={{ gap: "1rem" }}>
        <div style={{ flex: "3" }}>
          <div ref={mapRef} className="map-container"></div>

          <div className="mt-1">
            <MapControls
              onAddMarker={(marker) => {
                addMarker(marker);
                triggerCompanionResponse(`map_marker_added:${marker.name}`);
              }}
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

        <div style={{ flex: "1" }}>
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
