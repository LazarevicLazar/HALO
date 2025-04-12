import React, { useContext, useEffect, useState } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';

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
  
  // Update animation based on companion state
  useEffect(() => {
    switch (state) {
      case 'idle':
        setAnimationPath('/assets/animations/Idle.gif');
        break;
      case 'listening':
        setAnimationPath('/assets/animations/Listening.gif');
        break;
      case 'talking':
        setAnimationPath('/assets/animations/Talking.gif');
        break;
      default:
        setAnimationPath('/assets/animations/Idle.gif');
    }
  }, [state]);
  
  return (
    <div className="companion-avatar" style={{ position: 'relative' }}>
      <img 
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
            backgroundColor: state === 'idle' 
              ? 'var(--success-color)' 
              : state === 'listening' 
                ? 'var(--warning-color)' 
                : 'var(--accent-color)',
            border: '2px solid var(--background-color)',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}
    </div>
  );
};

export default CompanionAvatar;