import React from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'companion' ? 'active' : ''}`}
          onClick={() => setActiveTab('companion')}
        >
          Companion
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`tab ${activeTab === 'bartering' ? 'active' : ''}`}
          onClick={() => setActiveTab('bartering')}
        >
          Bartering
        </button>
        <button 
          className={`tab ${activeTab === 'tradeLog' ? 'active' : ''}`}
          onClick={() => setActiveTab('tradeLog')}
        >
          Trade Log
        </button>
        <button 
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map
        </button>
      </div>
    </nav>
  );
};

export default Navigation;