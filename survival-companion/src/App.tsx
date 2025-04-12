import React, { useState } from 'react';
import './index.css';
import Layout from './components/Layout/Layout';
import Navigation from './components/Layout/Navigation';
import CompanionTab from './components/Companion/CompanionTab';
import InventoryTab from './components/Inventory/InventoryTab';
import BarteringTab from './components/Bartering/BarteringTab';
import TradeLogTab from './components/TradeLog/TradeLogTab';
import EnhancedMapTab from './components/Map/EnhancedMapTab';

// Context Providers
import { CompanionProvider } from './contexts/CompanionContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { BarterProvider } from './contexts/BarterContext';
import { TradeLogProvider } from './contexts/TradeLogContext';
import { MapProvider } from './contexts/MapContext';

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
        return <EnhancedMapTab />;
      default:
        return <CompanionTab />;
    }
  };

  return (
    <CompanionProvider>
      <InventoryProvider>
        <BarterProvider>
          <TradeLogProvider>
            <MapProvider>
              <Layout>
                <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                {renderTabContent()}
              </Layout>
            </MapProvider>
          </TradeLogProvider>
        </BarterProvider>
      </InventoryProvider>
    </CompanionProvider>
  );
}

export default App;
