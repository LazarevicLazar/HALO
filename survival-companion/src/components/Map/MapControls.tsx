import React, { useState } from "react";
import { MapMarker } from "../../data/mockMapMarkers";

interface MapControlsProps {
  onAddMarker: (marker: Omit<MapMarker, "id" | "createdAt">) => void;
  onAddArea: (area: Omit<MapMarker, "id" | "createdAt">) => void;
  onFindLocation: () => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  drawingMode: "marker" | "area" | null;
  setDrawingMode: (mode: "marker" | "area" | null) => void;
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
  setDrawingPoints,
}) => {
  // Start adding a marker
  const handleAddMarker = () => {
    if (drawingMode === "marker") {
      // Cancel if already in marker mode
      console.log("Canceling marker mode");
      setDrawingMode(null);
      setIsDrawing(false);
    } else {
      console.log("Activating marker drawing mode");
      setDrawingMode("marker");
      setIsDrawing(true);
      setDrawingPoints([]);

      // Add a small delay to ensure the state is updated before the next click
      setTimeout(() => {
        console.log(
          "Marker drawing mode should now be active. isDrawing:",
          true
        );
      }, 100);
    }
  };

  // Start adding an area
  const handleAddArea = () => {
    if (drawingMode === "area") {
      // Complete area if already in area mode
      handleCompleteArea();
    } else {
      // Set drawing mode and isDrawing state in a single update to avoid timing issues
      console.log("Activating area drawing mode");
      setDrawingMode("area");
      setIsDrawing(true);
      setDrawingPoints([]);

      // Add a small delay to ensure the state is updated before the next click
      setTimeout(() => {
        console.log("Area drawing mode should now be active. isDrawing:", true);
      }, 100);
    }
  };

  // Complete area drawing
  const handleCompleteArea = () => {
    console.log("Completing area with points:", drawingPoints.length);

    if (drawingPoints.length >= 3) {
      // Prompt for area details
      const name = prompt("Name this area:");
      if (name) {
        const description = prompt("Add a description (optional):");
        const markerType =
          prompt("Type (home, resource, danger, ally, cache, other):") ||
          "other";

        console.log("Creating area with name:", name, "type:", markerType);

        // Create new area marker
        const newArea: Omit<MapMarker, "id" | "createdAt"> = {
          name,
          description: description || "",
          type: "polygon",
          coordinates: drawingPoints,
          markerType: markerType as any,
        };

        console.log("Calling onAddArea with:", newArea);
        onAddArea(newArea);
        console.log("Area added successfully");
      }
    } else {
      console.warn(
        "Not enough points to create an area:",
        drawingPoints.length
      );
      alert("Please add at least 3 points to create an area.");
      return;
    }

    // Reset
    setDrawingMode(null);
    setIsDrawing(false);
    setDrawingPoints([]);
    console.log("Area drawing completed and reset");
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
          className={`button ${drawingMode === "marker" ? "active" : ""}`}
          onClick={handleAddMarker}
        >
          {drawingMode === "marker" ? "Cancel" : "Add Marker"}
        </button>

        <button
          className={`button ${drawingMode === "area" ? "active" : ""}`}
          onClick={handleAddArea}
          disabled={drawingMode === "area" && drawingPoints.length < 3}
        >
          {drawingMode === "area"
            ? drawingPoints.length >= 3
              ? "Complete Area"
              : `Add Points (${drawingPoints.length}/3)`
            : "Add Area"}
        </button>

        {isDrawing && (
          <button className="button" onClick={handleCancelDrawing}>
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
          {drawingMode === "marker"
            ? "Click on the map to place a marker"
            : "Click on the map to add points. Add at least 3 points to create an area."}
        </div>
      )}

      {/* Render drawing points preview */}
      {drawingMode === "area" && drawingPoints.length > 0 && (
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
