import React from "react";

interface LegendItem {
  type: string;
  color: string;
  description: string;
  icon?: string;
}

interface MapLegendProps {
  items?: LegendItem[];
}

const defaultLegendItems: LegendItem[] = [
  {
    type: "Home Base",
    color: "var(--accent-color)",
    description: "Your main shelter and storage location",
    icon: "🏠",
  },
  {
    type: "Resource",
    color: "var(--success-color)",
    description: "Areas with valuable resources to scavenge",
    icon: "🔋",
  },
  {
    type: "Danger",
    color: "var(--danger-color)",
    description: "Hazardous areas to avoid or approach with caution",
    icon: "⚠️",
  },
  {
    type: "Ally",
    color: "#6c757d",
    description: "Friendly settlements or individuals",
    icon: "👥",
  },
  {
    type: "Cache",
    color: "#ffc107",
    description: "Hidden supplies or equipment",
    icon: "📦",
  },
  {
    type: "Other",
    color: "#8b5d33",
    description: "Miscellaneous points of interest",
    icon: "📍",
  },
];

const MapLegend: React.FC<MapLegendProps> = ({
  items = defaultLegendItems,
}) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className="map-legend-horizontal">
      <div
        className="legend-header-horizontal"
        onClick={() => setExpanded(!expanded)}
      >
        <h3>Map Legend</h3>
        <span>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="legend-content-horizontal">
          <div className="legend-items-grid">
            {items.map((item, index) => (
              <div key={index} className="legend-item-horizontal">
                <div className="legend-icon-container">
                  {item.icon && (
                    <span className="legend-icon">{item.icon}</span>
                  )}
                  <div
                    className="legend-color-horizontal"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="legend-info-horizontal">
                  <div className="legend-type-horizontal">{item.type}</div>
                  <div className="legend-description-horizontal">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="legend-footer-horizontal">
            <p>Click on markers or areas for more information</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
