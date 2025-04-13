import React, { useState, useContext } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';
import CompanionAvatar from './CompanionAvatar';
import MessageList from './MessageList';
import TextInput from './TextInput';
import AssistantInfo from './AssistantInfo';

const CompanionTab: React.FC = () => {
  const { state } = useContext(CompanionContext);
  const [error, setError] = useState<string | null>(null);
  
  return (
    <div className="card">
      <h2 className="card-title">AI Assistant</h2>
      
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
          <MessageList maxHeight="350px" />
          
          <div className="mt-1">
            <TextInput />
          </div>
          
          <div className="mt-1">
            <AssistantInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionTab;