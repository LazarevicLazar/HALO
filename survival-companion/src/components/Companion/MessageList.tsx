import React, { useContext, useEffect, useRef } from 'react';
import { CompanionContext, Message } from '../../contexts/CompanionContext';

interface MessageListProps {
  maxHeight?: string;
  backgroundColor?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  maxHeight = '300px',
  backgroundColor = 'var(--primary-color)'
}) => {
  const { messages } = useContext(CompanionContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get message style based on role
  const getMessageStyle = (role: 'user' | 'assistant') => {
    if (role === 'user') {
      return {
        alignSelf: 'flex-end',
        backgroundColor: 'var(--accent-color)',
        color: 'var(--text-color)',
        borderRadius: '12px 12px 0 12px'
      };
    } else {
      return {
        alignSelf: 'flex-start',
        backgroundColor: 'var(--secondary-color)',
        color: 'var(--text-color)',
        borderRadius: '12px 12px 12px 0'
      };
    }
  };
  
  // Render welcome message if no messages
  const renderWelcomeMessage = () => (
    <div className="welcome-message" style={{ padding: '1rem' }}>
      <p className="text-accent" style={{ fontWeight: 'bold' }}>Welcome!</p>
      <p>I'm H.A.L.O. How can I help you today?</p>
      <p>You can ask me questions or request information on various topics.</p>
    </div>
  );
  
  return (
    <div 
      className="message-list"
      style={{ 
        height: maxHeight, 
        maxHeight: maxHeight,
        overflowY: 'auto',
        backgroundColor: backgroundColor,
        borderRadius: '4px',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.length === 0 ? (
        renderWelcomeMessage()
      ) : (
        <>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '80%',
                margin: '0.5rem 0',
                ...getMessageStyle(message.role)
              }}
            >
              <div 
                className="message-content"
                style={{ 
                  padding: '0.75rem',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {message.isStreaming ? (
                  <>
                    {message.content}
                    <span
                      className="streaming-indicator"
                      style={{
                        display: 'inline-block',
                        width: '0.5rem',
                        height: '1rem',
                        backgroundColor: 'var(--accent-color)',
                        marginLeft: '0.25rem',
                        animation: 'blink 1s infinite'
                      }}
                    ></span>
                    <style>
                      {`
                        @keyframes blink {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0; }
                        }
                      `}
                    </style>
                  </>
                ) : (
                  message.content
                )}
              </div>
              <div 
                className="message-timestamp"
                style={{ 
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  padding: '0 0.75rem 0.5rem',
                  alignSelf: message.role === 'user' ? 'flex-start' : 'flex-end'
                }}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;