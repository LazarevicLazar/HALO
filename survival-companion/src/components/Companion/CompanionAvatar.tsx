import React, { useContext, useEffect, useState } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';
import { SPEECH_STATUS_EVENT } from '../../services/VoiceService';

interface CompanionAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
}

const CompanionAvatar: React.FC<CompanionAvatarProps> = ({ 
  size = 'medium', 
  showStatus = true 
}) => {
  const { state } = useContext(CompanionContext);
  const [animationPath, setAnimationPath] = useState('/assets/animations/Idle.gif');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Listen for speech status events
  useEffect(() => {
    const handleSpeechStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<{isSpeaking: boolean}>;
      setIsSpeaking(customEvent.detail.isSpeaking);
      console.log('CompanionAvatar: Speech status changed to', customEvent.detail.isSpeaking);
    };
    
    // Add event listener
    document.addEventListener(SPEECH_STATUS_EVENT, handleSpeechStatusChange);
    
    // Clean up
    return () => {
      document.removeEventListener(SPEECH_STATUS_EVENT, handleSpeechStatusChange);
    };
  }, []);
  
  // Determine avatar size
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return { width: '100px', height: '100px' };
      case 'large':
        return { width: '300px', height: '300px' };
      case 'medium':
      default:
        return { width: '200px', height: '200px' };
    }
  };
  
  // Update animation based on companion state and speech status
  useEffect(() => {
    if (isSpeaking) {
      // Always show talking animation when speech is happening
      setAnimationPath('/assets/animations/Talking.gif');
      console.log('CompanionAvatar: Setting animation to Talking.gif (speech active)');
    } else {
      // Otherwise, use the companion state to determine animation
      switch (state) {
        case 'idle':
          setAnimationPath('/assets/animations/Idle.gif');
          break;
        case 'thinking':
          setAnimationPath('/assets/animations/Listening.gif');
          break;
        case 'responding':
          // Only show talking animation when responding if not speaking
          // This covers the case when text is being generated but speech hasn't started yet
          setAnimationPath('/assets/animations/Talking.gif');
          break;
        default:
          setAnimationPath('/assets/animations/Idle.gif');
      }
      console.log('CompanionAvatar: Setting animation based on state:', state);
    }
  }, [state, isSpeaking]);
  
  // Define the pulse animation
  const pulseAnimation = `
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  
  return (
    <div className="companion-avatar" style={{ position: 'relative' }}>
      <style>{pulseAnimation}</style>
      <img 
        id="companion-avatar"
        src={animationPath}
        alt={`Companion ${state}`}
        style={{ 
          ...getAvatarSize(),
          borderRadius: '8px',
          objectFit: 'cover',
          border: '2px solid var(--accent-color)'
        }}
      />
      
      {showStatus && (
        <div 
          className="status-indicator"
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: isSpeaking
              ? 'var(--accent-color)' // Speaking - use accent color
              : state === 'idle'
                ? 'var(--success-color)' // Idle - use success color
                : state === 'thinking'
                  ? 'var(--warning-color)' // Thinking - use warning color
                  : 'var(--accent-color)', // Responding - use accent color
            border: '2px solid var(--background-color)',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
            animation: isSpeaking ? 'pulse 1.5s infinite' : 'none'
          }}
        />
      )}
    </div>
  );
};

export default CompanionAvatar;