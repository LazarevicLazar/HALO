import React, { useState } from 'react';

interface AssistantInfoProps {
  backgroundColor?: string;
}

// Array of assistant capabilities and example queries
const ASSISTANT_INFO = [
  {
    title: "General Information",
    description: "I can provide information on a wide range of topics."
  },
  {
    title: "Answering Questions",
    description: "Ask me questions and I'll do my best to answer them."
  },
  {
    title: "Conversation",
    description: "I can engage in casual conversation on various topics."
  },
  {
    title: "Assistance",
    description: "I can help you with tasks and provide guidance."
  },
  {
    title: "Examples",
    description: "Try asking: 'What can you do?', 'Tell me about yourself', or 'Help me with...'."
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
        <p className="text-accent" style={{ fontWeight: 'bold', margin: 0 }}>Assistant Info:</p>
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