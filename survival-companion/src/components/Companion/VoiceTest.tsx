import React, { useState } from 'react';
import voiceService from '../../services/VoiceService';

const VoiceTest: React.FC = () => {
  const [testText, setTestText] = useState('Hello, this is a test of the voice service.');
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  
  // First-person emotion examples
  const emotionExamples = {
    sarcasm: "That's exactly what we need. More radiation. Because your day wasn't going poorly enough already.",
    deadpan: "I calculate your survival chances at 32%. Not great. Not terrible. Just... underwhelming.",
    urgency: "We need to move—now! Radiation levels are spiking in this sector and I'd prefer not to be carrying your melting body back to camp.",
    amusement: "Your plan to use a spoon as your primary weapon is both innovative and suicidal. Mostly suicidal.",
    concern: "I feel compelled to point out that drinking from that puddle has a 97% chance of introducing parasites to your already fragile immune system."
  };
  
  // Handle selecting an example
  const selectExample = (type: string) => {
    if (type in emotionExamples) {
      const example = emotionExamples[type as keyof typeof emotionExamples];
      setTestText(example);
      setSelectedExample(type);
      addLog(`Selected ${type} example`);
    }
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversationId, setConversationId] = useState(`test_${Date.now()}`);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const playVoice = async () => {
    if (!testText.trim()) return;
    
    setIsPlaying(true);
    addLog(`Playing: "${testText}" (Conversation ID: ${conversationId})`);
    
    // Log the text for debugging
    console.log('Original text:', testText);
    
    try {
      await voiceService.streamSentence(testText, conversationId);
      addLog('Voice playback started');
    } catch (error) {
      addLog(`Error: ${error}`);
    } finally {
      setIsPlaying(false);
    }
  };
  
  const generateNewConversationId = () => {
    const newId = `test_${Date.now()}`;
    setConversationId(newId);
    addLog(`Generated new conversation ID: ${newId}`);
  };

  const stopVoice = () => {
    voiceService.stopSpeaking();
    addLog('Voice playback stopped');
    setIsPlaying(false);
  };

  return (
    <div className="voice-test" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
      <h3>Voice Test</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)'
          }}
          rows={3}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={playVoice}
            disabled={isPlaying}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isPlaying ? 'var(--primary-color)' : 'var(--accent-color)',
              color: 'var(--text-color)',
              border: 'none',
              borderRadius: '4px',
              cursor: isPlaying ? 'not-allowed' : 'pointer'
            }}
          >
            Play
          </button>
          
          <button
            onClick={stopVoice}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--danger-color)',
              color: 'var(--text-color)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Stop
          </button>
          
          <button
            onClick={() => {
              // Play the same text 3 times with the same conversation ID to test for overlapping speech
              addLog(`Testing multiple plays with same conversation ID: ${conversationId}`);
              
              const playMultiple = async () => {
                for (let i = 0; i < 3; i++) {
                  await voiceService.streamSentence(testText, conversationId);
                  addLog(`Played iteration ${i+1}`);
                  // Wait a short time between plays
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              };
              
              playMultiple();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-color)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Multiple
          </button>
        </div>
        
        {/* TARS Emotion Examples */}
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>TARS Emotion Examples:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.keys(emotionExamples).map((type) => (
              <button
                key={type}
                onClick={() => selectExample(type)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: selectedExample === type ? 'var(--accent-color)' : 'var(--primary-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem' }}>Conversation ID: {conversationId}</span>
          <button
            onClick={generateNewConversationId}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            New ID
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <h4>Logs:</h4>
        <div
          style={{
            maxHeight: '150px',
            overflowY: 'auto',
            padding: '0.5rem',
            backgroundColor: 'var(--primary-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}
        >
          {logs.length === 0 ? (
            <p>No logs yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;