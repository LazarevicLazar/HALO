import React, { useState, useContext } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';
import CompanionAvatar from './CompanionAvatar';
import VoiceInteraction from './VoiceInteraction';
import MessageDisplay from './MessageDisplay';
import MessageInput from './MessageInput';
import VoiceSelector from './VoiceSelector';
import SurvivalTips from './SurvivalTips';

const CompanionTab: React.FC = () => {
  const { state } = useContext(CompanionContext);
  const [error, setError] = useState<string | null>(null);
  
  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };
  return (
    <div className="card">
      <h2 className="card-title">AI Companion</h2>
      
      {error && (
        <div className="alert alert-danger" style={{
          backgroundColor: 'var(--danger-color)',
          color: 'var(--text-color)',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <div className="flex" style={{ gap: '1rem' }}>
        <div className="companion-sidebar" style={{ flex: '0 0 200px' }}>
          <CompanionAvatar size="medium" showStatus={true} />
          
          <div className="mt-1">
            <VoiceInteraction onError={handleVoiceError} />
          </div>
          
          <div className="mt-1">
            <VoiceSelector />
          </div>
          
          <div className="companion-status mt-1" style={{
            padding: '0.5rem',
            backgroundColor: 'var(--primary-color)',
            borderRadius: '4px',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            <p>Status: <span className="text-accent">{state.charAt(0).toUpperCase() + state.slice(1)}</span></p>
          </div>
        </div>
        
        <div className="companion-main" style={{ flex: '1' }}>
          <MessageDisplay maxHeight="350px" />
          
          <div className="mt-1">
            <MessageInput />
          </div>
          
          <div className="mt-1">
            <SurvivalTips interval={20000} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionTab;