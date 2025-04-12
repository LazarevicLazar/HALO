import React, { useEffect, useState } from 'react';

interface SurvivalTipsProps {
  interval?: number; // Time in milliseconds between tip changes
  backgroundColor?: string;
}

// Array of survival tips
const SURVIVAL_TIPS = [
  "Always keep your inventory organized. Prioritize water, food, and medical supplies in that order.",
  "When scavenging, focus on high-calorie, non-perishable foods. Canned goods are your best friend.",
  "Water purification is essential. Boil for at least 5 minutes or use purification tablets.",
  "Avoid traveling at night. Visibility is poor and dangers increase after dark.",
  "Keep a low profile when near unknown settlements. Observe before approaching.",
  "Conserve ammunition. Use melee weapons for weaker threats and save bullets for emergencies.",
  "Learn to identify edible plants in your region. They can supplement your diet when supplies run low.",
  "Maintain your weapons and tools. A broken knife or jammed gun can mean death in a critical moment.",
  "Always have at least two escape routes planned when entering a new area.",
  "Trade fairly with other survivors. Your reputation will determine how others treat you.",
  "Shelter should be secure but have multiple exits. Never corner yourself.",
  "Keep a first aid kit accessible at all times. Infections can be deadly without proper treatment.",
  "Rain collection systems are worth the effort to build. They provide a renewable water source.",
  "Learn to read the sky. Weather patterns can help you predict storms and plan accordingly.",
  "Trust your instincts. If something feels wrong, it probably is.",
  "Smoke from fires can be seen for miles. Cook during daylight when smoke is less visible.",
  "Keep a journal of safe locations, water sources, and dangerous areas.",
  "Noise discipline is crucial. Sound travels far in open areas and can attract unwanted attention.",
  "Bartering is safer than using currency. Items with practical use retain their value.",
  "Learn basic mechanical skills. Being able to repair vehicles and generators is invaluable."
];

const SurvivalTips: React.FC<SurvivalTipsProps> = ({ 
  interval = 30000, // Default: change tip every 30 seconds
  backgroundColor = 'var(--primary-color)'
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Change tip at regular intervals unless hovered
  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentTipIndex(prevIndex => (prevIndex + 1) % SURVIVAL_TIPS.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval, isHovered]);
  
  // Get a random tip when component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SURVIVAL_TIPS.length);
    setCurrentTipIndex(randomIndex);
  }, []);
  
  return (
    <div 
      className="survival-tips"
      style={{
        padding: '0.75rem',
        backgroundColor: backgroundColor,
        borderRadius: '4px',
        fontSize: '0.9rem',
        borderLeft: '4px solid var(--accent-color)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="tip-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <p className="text-accent" style={{ fontWeight: 'bold', margin: 0 }}>Survival Tip:</p>
        <div className="tip-controls" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="tip-button"
            onClick={() => setCurrentTipIndex(prevIndex => (prevIndex - 1 + SURVIVAL_TIPS.length) % SURVIVAL_TIPS.length)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '0.8rem',
              opacity: 0.7
            }}
          >
            ◀
          </button>
          <button 
            className="tip-button"
            onClick={() => setCurrentTipIndex(prevIndex => (prevIndex + 1) % SURVIVAL_TIPS.length)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '0.8rem',
              opacity: 0.7
            }}
          >
            ▶
          </button>
        </div>
      </div>
      <p style={{ margin: 0 }}>{SURVIVAL_TIPS[currentTipIndex]}</p>
      <div className="tip-progress" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
        {SURVIVAL_TIPS.map((_, index) => (
          <div 
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: index === currentTipIndex ? 'var(--accent-color)' : 'var(--border-color)',
              transition: 'background-color 0.3s ease'
            }}
            onClick={() => setCurrentTipIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default SurvivalTips;