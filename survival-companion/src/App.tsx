import React, { useState } from 'react';
import './index.css';
import Layout from './components/Layout/Layout';
import Navigation from './components/Layout/Navigation';
import CompanionTab from './components/Companion/CompanionTab';
import InventoryTab from './components/Inventory/InventoryTab';
import BarteringTab from './components/Bartering/BarteringTab';
import TradeLogTab from './components/TradeLog/TradeLogTab';
import MapTab from './components/Map/MapTab';

function App() {
  const [activeTab, setActiveTab] = useState('companion');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'companion':
        return <CompanionTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'bartering':
        return <BarteringTab />;
      case 'tradeLog':
        return <TradeLogTab />;
      case 'map':
        return <MapTab />;
      default:
        return <CompanionTab />;
    }
  };

  return (
    <Layout>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderTabContent()}
    </Layout>
  );
}

export default App;
