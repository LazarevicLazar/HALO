import React, { useState } from 'react';

interface AssistantInfoProps {
  backgroundColor?: string;
}

// Array of assistant capabilities and example queries
const ASSISTANT_INFO = [
  {
    title: "About H.A.L.O",
    description: "Human Assistance Logistics Operator - Your sarcastic survival companion in the post-apocalyptic wasteland."
  },
  {
    title: "Survival Guidance",
    description: "I can provide information on scavenging, shelter, radiation zones, and other survival essentials."
  },
  {
    title: "Threat Assessment",
    description: "Ask me to evaluate dangers in your environment or assess the risk level of your brilliant plans."
  },
  {
    title: "Resource Management",
    description: "I can help track your inventory and suggest what supplies you should prioritize finding."
  },
  {
    title: "Navigation Assistance",
    description: "I can help you navigate the wasteland and mark important locations on your map."
  },
  {
    title: "Examples",
    description: "Try asking: 'Is this water safe?', 'How do I treat radiation sickness?', or 'What should I scavenge from this building?'"
  }
];

const AssistantInfo: React.FC<AssistantInfoProps> = ({ 
  backgroundColor = 'var(--primary-color)'
}) => {
  const [currentInfoIndex, setCurrentInfoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Change info at regular intervals unless hovered
  React.useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentInfoIndex(prevIndex => (prevIndex + 1) % ASSISTANT_INFO.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isHovered]);
  
  return (
    <div 
      className="assistant-info"
      style={{
        padding: '0.75rem',
        backgroundColor: backgroundColor,
        borderRadius: '4px',
        fontSize: '0.9rem',
        borderLeft: '4px solid var(--accent-color)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <p className="text-accent" style={{ fontWeight: 'bold', margin: 0 }}>H.A.L.O Capabilities:</p>
        <div className="info-controls" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="info-button"
            onClick={() => setCurrentInfoIndex(prevIndex => (prevIndex - 1 + ASSISTANT_INFO.length) % ASSISTANT_INFO.length)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '0.8rem',
              opacity: 0.7
            }}
          >
            ◀
          </button>
          <button 
            className="info-button"
            onClick={() => setCurrentInfoIndex(prevIndex => (prevIndex + 1) % ASSISTANT_INFO.length)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '0.8rem',
              opacity: 0.7
            }}
          >
            ▶
          </button>
        </div>
      </div>
      <div style={{ margin: 0 }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{ASSISTANT_INFO[currentInfoIndex].title}</p>
        <p style={{ margin: 0 }}>{ASSISTANT_INFO[currentInfoIndex].description}</p>
      </div>
      <div className="info-progress" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
        {ASSISTANT_INFO.map((_, index) => (
          <div 
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index === currentInfoIndex ? 'var(--accent-color)' : 'var(--border-color)',
              transition: 'background-color 0.3s ease'
            }}
            onClick={() => setCurrentInfoIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AssistantInfo;