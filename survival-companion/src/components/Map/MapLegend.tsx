import React from 'react';

interface LegendItem {
  type: string;
  color: string;
  description: string;
}

interface MapLegendProps {
  items?: LegendItem[];
}

const defaultLegendItems: LegendItem[] = [
  { type: 'Home Base', color: 'var(--accent-color)', description: 'Your main shelter and storage location' },
  { type: 'Resource', color: 'var(--success-color)', description: 'Areas with valuable resources to scavenge' },
  { type: 'Danger', color: 'var(--danger-color)', description: 'Hazardous areas to avoid or approach with caution' },
  { type: 'Ally', color: '#6c757d', description: 'Friendly settlements or individuals' },
  { type: 'Cache', color: '#ffc107', description: 'Hidden supplies or equipment' },
  { type: 'Other', color: '#8b5d33', description: 'Miscellaneous points of interest' }
];

const MapLegend: React.FC<MapLegendProps> = ({ items = defaultLegendItems }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  return (
    <div className="map-legend">
      <div 
        className="legend-header"
        style={{
          borderBottom: expanded ? '1px solid var(--border-color)' : 'none'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <h3>Map Legend</h3>
        <span>{expanded ? '▲' : '▼'}</span>
      </div>
      
      {expanded && (
        <div className="legend-content">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="legend-item" 
              style={{
                marginBottom: index < items.length - 1 ? '0.5rem' : 0
              }}
            >
              <div 
                className="legend-color" 
                style={{
                  backgroundColor: item.color
                }}
              />
              <div className="legend-info">
                <div className="legend-type">{item.type}</div>
                <div className="legend-description">{item.description}</div>
              </div>
            </div>
          ))}
          
          <div className="legend-footer">
            <p>Click on markers or areas for more information</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;