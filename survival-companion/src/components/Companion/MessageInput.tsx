import React, { useContext, useState, KeyboardEvent } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';

interface MessageInputProps {
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  placeholder = 'Type a message to your companion...',
  disabled = false
}) => {
  const { state, sendTextMessage } = useContext(CompanionContext);
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isSubmitting && state !== 'talking') {
      setIsSubmitting(true);
      
      try {
        await sendTextMessage(inputMessage);
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Determine if input should be disabled
  const isInputDisabled = disabled || isSubmitting || state === 'talking' || state === 'listening';
  
  return (
    <div 
      className="message-input"
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}
    >
      <input
        type="text"
        className="input"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isInputDisabled}
        style={{
          flex: '1',
          padding: '0.75rem',
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
          backgroundColor: isInputDisabled ? 'var(--disabled-color)' : 'var(--input-background)',
          color: 'var(--text-color)',
          fontSize: '1rem'
        }}
      />
      
      <button
        className="button"
        onClick={handleSendMessage}
        disabled={!inputMessage.trim() || isInputDisabled}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          backgroundColor: !inputMessage.trim() || isInputDisabled ? 'var(--disabled-color)' : 'var(--accent-color)',
          color: 'var(--text-color)',
          border: 'none',
          cursor: !inputMessage.trim() || isInputDisabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {isSubmitting ? (
          <span className="loading-spinner" style={{
            width: '16px',
            height: '16px',
            border: '2px solid var(--text-color)',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></span>
        ) : (
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
        <span>Send</span>
      </button>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default MessageInput;