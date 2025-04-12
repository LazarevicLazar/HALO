import React, { useContext, useState } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';

// Voice options
const VOICE_OPTIONS = [
  { id: 'rugged-male', name: 'Rugged Male', description: 'A deep, weathered voice of a survivor who has seen it all' },
  { id: 'calm-female', name: 'Calm Female', description: 'A steady, reassuring voice that brings clarity in chaos' },
  { id: 'energetic-male', name: 'Energetic Male', description: 'An alert, vigilant voice ready for action' },
  { id: 'soothing-female', name: 'Soothing Female', description: 'A gentle voice that brings comfort in harsh times' }
];

interface VoiceSelectorProps {
  onClose?: () => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onClose }) => {
  const { selectedVoice, setSelectedVoice } = useContext(CompanionContext);
  const [expanded, setExpanded] = useState(false);
  
  // Handle voice selection
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="voice-selector">
      <div 
        className="voice-selector-header"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem',
          backgroundColor: 'var(--primary-color)',
          borderRadius: expanded ? '4px 4px 0 0' : '4px',
          cursor: 'pointer'
        }}
      >
        <span>Companion Voice</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </div>
      
      {expanded && (
        <div 
          className="voice-selector-options"
          style={{
            backgroundColor: 'var(--primary-color)',
            borderRadius: '0 0 4px 4px',
            padding: '0.5rem'
          }}
        >
          {VOICE_OPTIONS.map(voice => (
            <div 
              key={voice.id}
              className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`}
              onClick={() => handleVoiceSelect(voice.id)}
              style={{
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                backgroundColor: selectedVoice === voice.id ? 'var(--accent-color)' : 'var(--secondary-color)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{voice.name}</span>
                {selectedVoice === voice.id && (
                  <span>✓</span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {voice.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;