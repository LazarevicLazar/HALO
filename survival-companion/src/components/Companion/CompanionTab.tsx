import React, { useState, useContext } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';

const CompanionTab: React.FC = () => {
  const { state, messages, startVoiceInput, stopVoiceInput, sendTextMessage } = useContext(CompanionContext);
  const [inputMessage, setInputMessage] = useState('');
  
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendTextMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="card">
      <h2 className="card-title">AI Companion</h2>
      <div className="flex">
        <div className="p-1" style={{ flex: '0 0 200px' }}>
          <img
            id="companion-avatar"
            src={`/assets/animations/${state.charAt(0).toUpperCase() + state.slice(1)}.gif`}
            alt="AI Companion"
            style={{ width: '100%', borderRadius: '4px' }}
          />
          <button
            className="button mt-1"
            style={{ width: '100%' }}
            onClick={state === 'listening' ? stopVoiceInput : startVoiceInput}
            disabled={state === 'talking'}
          >
            {state === 'listening' ? 'Stop Listening' : 'Start Voice Interaction'}
          </button>
        </div>
        <div className="p-1" style={{ flex: '1' }}>
          <div
            className="card"
            style={{
              height: '300px',
              overflowY: 'auto',
              backgroundColor: 'var(--primary-color)',
              padding: '0.5rem'
            }}
          >
            {messages.length === 0 ? (
              <>
                <p className="text-accent">Welcome, survivor.</p>
                <p>I'm your post-apocalyptic companion. I'm here to help you survive in this harsh world.</p>
                <p>You can ask me about survival skills, resource management, or use the tabs to manage your inventory, trade with other survivors, and navigate the wasteland.</p>
              </>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-1 ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <div
                    className="card"
                    style={{
                      display: 'inline-block',
                      maxWidth: '80%',
                      backgroundColor: message.role === 'user' ? 'var(--accent-color)' : 'var(--secondary-color)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      textAlign: 'left'
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex mt-1">
            <input
              type="text"
              className="input"
              placeholder="Type a message to your companion..."
              style={{ flex: '1' }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={state === 'talking' || state === 'listening'}
            />
            <button
              className="button"
              style={{ marginLeft: '0.5rem' }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || state === 'talking' || state === 'listening'}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionTab;