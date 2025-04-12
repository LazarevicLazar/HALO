import React from 'react';

const CompanionTab: React.FC = () => {
  return (
    <div className="card">
      <h2 className="card-title">AI Companion</h2>
      <div className="flex">
        <div className="p-1" style={{ flex: '0 0 200px' }}>
          <img 
            id="companion-avatar"
            src="/assets/animations/Idle.gif" 
            alt="AI Companion" 
            style={{ width: '100%', borderRadius: '4px' }}
          />
          <button className="button mt-1" style={{ width: '100%' }}>
            Start Voice Interaction
          </button>
        </div>
        <div className="p-1" style={{ flex: '1' }}>
          <div 
            className="card" 
            style={{ 
              height: '300px', 
              overflowY: 'auto',
              backgroundColor: 'var(--primary-color)'
            }}
          >
            <p className="text-accent">Welcome, survivor.</p>
            <p>I'm your post-apocalyptic companion. I'm here to help you survive in this harsh world.</p>
            <p>You can ask me about survival skills, resource management, or use the tabs to manage your inventory, trade with other survivors, and navigate the wasteland.</p>
          </div>
          <div className="flex mt-1">
            <input 
              type="text" 
              className="input" 
              placeholder="Type a message to your companion..." 
              style={{ flex: '1' }}
            />
            <button className="button" style={{ marginLeft: '0.5rem' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionTab;