import React, { useState, useEffect } from "react";
import "./index.css";
import Layout from "./components/Layout/Layout";
import Navigation from "./components/Layout/Navigation";
import CompanionTab from "./components/Companion/CompanionTab";
import InventoryTab from "./components/Inventory/InventoryTab";
import BarteringTab from "./components/Bartering/BarteringTab";
import TradeLogTab from "./components/TradeLog/TradeLogTab";
import EnhancedMapTab from "./components/Map/EnhancedMapTab";
import EncyclopediaTab from "./components/Encyclopedia/EncyclopediaTab";
import EmergencyBeaconTab from "./components/EmergencyBeacon/EmergencyBeaconTab";
import CreatorsTab from "./components/Creators/CreatorsTab";
import SplashScreen from "./components/SplashScreen/SplashScreen";

// Context Providers
import { CompanionProvider } from "./contexts/CompanionContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { BarterProvider } from "./contexts/BarterContext";
import { TradeLogProvider } from "./contexts/TradeLogContext";
import { MapProvider } from "./contexts/MapContext";

function App() {
  const [activeTab, setActiveTab] = useState("companion");

  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Preload the background image
  useEffect(() => {
    const img = new Image();
    img.src = `${process.env.PUBLIC_URL}/assets/images/Backdrop_Evening_03.png`;
    img.onload = () => {
      setBackgroundLoaded(true);
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "companion":
        return <CompanionTab />;
      case "inventory":
        return <InventoryTab />;
      case "bartering":
        return <BarteringTab />;
      case "tradeLog":
        return <TradeLogTab />;
      case "map":
        return <EnhancedMapTab />;
      case "encyclopedia":
        return <EncyclopediaTab />;
      case "emergencyBeacon":
        return <EmergencyBeaconTab />;
      case "creators":
        return <CreatorsTab />;
      default:
        return <CompanionTab />;
    }
  };

  // Apply background style to the body
  useEffect(() => {
    if (backgroundLoaded) {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${process.env.PUBLIC_URL}/assets/images/Backdrop_Evening_03.png')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
    }

    return () => {
      // Clean up
      document.body.style.backgroundImage = "";
    };
  }, [backgroundLoaded]);

  return (
    <CompanionProvider>
      <InventoryProvider>
        <TradeLogProvider>
          <BarterProvider>
            <MapProvider>
              <Layout>
                <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                <div
                  className="tab-content-container"
                  style={{
                    width: "1200px", // Updated from 1000px to 1200px to match the navigation bar
                    maxWidth: "100%",
                    margin: "0 auto",
                    minHeight: "600px", // Set a minimum height for all tab content
                    position: "relative",
                    transition: "all 0.3s ease",
                  }}
                >
                  {renderTabContent()}
                </div>
              </Layout>
            </MapProvider>
          </BarterProvider>
        </TradeLogProvider>
      </InventoryProvider>
    </CompanionProvider>
  );
}

export default App;
