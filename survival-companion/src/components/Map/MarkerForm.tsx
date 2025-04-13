import React, { useState, useEffect, useRef } from "react";
import "./Map.css";

interface MarkerFormProps {
  position: [number, number];
  onSubmit: (data: {
    name: string;
    description: string;
    markerType: string;
  }) => void;
  onCancel: () => void;
  isArea?: boolean;
  pointCount?: number;
}

const MarkerForm: React.FC<MarkerFormProps> = ({
  position,
  onSubmit,
  onCancel,
  isArea = false,
  pointCount = 0,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [markerType, setMarkerType] = useState("resource");
  const formRef = useRef<HTMLDivElement>(null);

  // Focus on name input when form appears
  useEffect(() => {
    const nameInput = document.getElementById("marker-name-input");
    if (nameInput) {
      nameInput.focus();
    }

    // Add click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        markerType,
      });
    }
  };

  // Get icon based on marker type
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "danger":
        return "⚠️";
      case "resource":
        return "🔋";
      case "home":
        return "🏠";
      case "ally":
        return "👥";
      case "cache":
        return "📦";
      default:
        return "📍";
    }
  };

  return (
    <div className="marker-form-overlay">
      <div className="marker-form-container" ref={formRef}>
        <div className="marker-form-header">
          <h3>{isArea ? "Add Area" : "Add Marker"}</h3>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="marker-name-input">Name:</label>
            <input
              id="marker-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter location name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="marker-description-input">Description:</label>
            <textarea
              id="marker-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Type:</label>
            <div className="marker-type-selector">
              {["resource", "danger", "home", "ally", "cache", "other"].map(
                (type) => (
                  <div
                    key={type}
                    className={`marker-type-option ${
                      markerType === type ? "selected" : ""
                    }`}
                    onClick={() => setMarkerType(type)}
                  >
                    <span className="marker-icon">{getMarkerIcon(type)}</span>
                    <span className="marker-type-label">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {isArea && (
            <div className="form-group">
              <label>Points:</label>
              <div className="area-info">
                <span>{pointCount} points added</span>
                {pointCount < 3 && (
                  <span className="warning">
                    (Need at least 3 points to create an area)
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Coordinates:</label>
            <div className="coordinates">
              <span>Lat: {position[0].toFixed(4)}</span>
              <span>Lng: {position[1].toFixed(4)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button submit-button"
              disabled={isArea && pointCount < 3}
            >
              {isArea ? "Create Area" : "Add Marker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkerForm;
