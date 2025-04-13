import React from 'react';

interface SimpleAvatarProps {
  size?: 'small' | 'medium' | 'large';
  state: 'idle' | 'thinking' | 'responding';
}

const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ 
  size = 'medium', 
  state = 'idle' 
}) => {
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
  
  // Get avatar image based on state
  const getAvatarImage = () => {
    // For now, we'll use a placeholder image
    // In a real implementation, you might have different images for different states
    return 'https://via.placeholder.com/200?text=AI+Assistant';
  };
  
  return (
    <div className="companion-avatar" style={{ position: 'relative' }}>
      <img 
        src={getAvatarImage()}
        alt={`Assistant ${state}`}
        style={{ 
          ...getAvatarSize(),
          borderRadius: '8px',
          objectFit: 'cover',
          border: '2px solid var(--accent-color)'
        }}
      />
      
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
            : state === 'thinking' 
              ? 'var(--warning-color)' 
              : 'var(--accent-color)',
          border: '2px solid var(--background-color)',
          boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
        }}
      />
    </div>
  );
};

export default SimpleAvatar;