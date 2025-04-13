import React, { useState, useContext, useEffect } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';
import CompanionAvatar from './CompanionAvatar';
import MessageList from './MessageList';
import TextInput from './TextInput';
import AssistantInfo from './AssistantInfo';
import VoiceTest from './VoiceTest';
import speechRecognitionService from '../../services/SpeechRecognitionService';

const CompanionTab: React.FC = () => {
  const { state, isVoiceEnabled, setIsVoiceEnabled, sendMessage } = useContext(CompanionContext);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Check if speech recognition is supported
  useEffect(() => {
    setIsSpeechSupported(speechRecognitionService.isSupported());
    
    // Set up speech recognition event handlers
    speechRecognitionService.setOnResult((text) => {
      sendMessage(text);
      setIsListening(false);
    });
    
    speechRecognitionService.setOnStart(() => {
      setIsListening(true);
    });
    
    speechRecognitionService.setOnEnd(() => {
      setIsListening(false);
    });
    
    speechRecognitionService.setOnError((errorMsg) => {
      setError(errorMsg);
      setIsListening(false);
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    });
  }, [sendMessage]);
  
  // Toggle voice features
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };
  
  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
    } else {
      const success = speechRecognitionService.startListening();
      if (!success) {
        setError('Failed to start speech recognition. Please try again.');
        setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
      }
    }
  };
  
  return (
    <div className="card">
      <div style={{ textAlign: 'center' }}>
        {/* <h2 className="card-title">H.A.L.O</h2>
        <h3 className="card-subtitle" style={{
          fontSize: '0.9rem',
          marginTop: '-0.5rem',
          marginBottom: '1rem',
          color: 'var(--text-secondary-color)',
          fontWeight: 'normal'
        }}>
          Human Assistance Logistics Operator
        </h3> */}
      </div>
      
      {error && (
        <div className="alert alert-danger" style={{
          backgroundColor: 'var(--danger-color)',
          color: 'var(--text-color)',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
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
            
            <button
              className="button mt-1"
              onClick={toggleVoice}
              style={{
                backgroundColor: isVoiceEnabled ? 'var(--accent-color)' : 'var(--primary-color)',
                border: isVoiceEnabled ? 'none' : '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              {isVoiceEnabled ? 'Voice: ON' : 'Voice: OFF'}
            </button>
            
            {isSpeechSupported && (
              <button
                className="button mt-1"
                onClick={toggleSpeechRecognition}
                style={{
                  backgroundColor: isListening ? 'var(--danger-color)' : 'var(--accent-color)',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isListening ? (
                  <>
                    <span style={{ marginRight: '0.5rem' }}>Listening...</span>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '0.5rem',
                        height: '0.5rem',
                        backgroundColor: 'var(--text-color)',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite'
                      }}
                    ></span>
                    <style>
                      {`
                        @keyframes pulse {
                          0% { transform: scale(0.8); opacity: 0.8; }
                          50% { transform: scale(1.2); opacity: 1; }
                          100% { transform: scale(0.8); opacity: 0.8; }
                        }
                      `}
                    </style>
                  </>
                ) : (
                  'Start Conversation'
                )}
              </button>
            )}
            
            {/* Debug button */}
            <button
              className="button mt-1"
              onClick={() => setShowDebug(!showDebug)}
              style={{
                backgroundColor: showDebug ? 'var(--danger-color)' : 'var(--primary-color)',
                border: '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              {showDebug ? 'Hide Debug' : 'Debug'}
            </button>
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
          
          {/* Voice test component - only shown in debug mode */}
          {showDebug && (
            <div className="mt-1">
              <h3 style={{
                fontSize: '1rem',
                marginBottom: '0.5rem',
                backgroundColor: 'var(--danger-color)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px'
              }}>
                Debug: Voice Test Panel
              </h3>
              <VoiceTest />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanionTab;