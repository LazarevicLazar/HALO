import React from "react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="container">
      <div
        className="tabs"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "4px",
          padding: "0.5rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
          display: "flex",
          height: "60px", // Increased height to accommodate larger text
          width: "1200px", // Increased width from 1000px to 1200px
          maxWidth: "100%", // Ensures it doesn't overflow on smaller screens
          margin: "0 auto", // Center the navigation bar
          alignItems: "center",
          overflow: "hidden", // Changed from 'auto' to 'hidden' to remove scroll bar
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            minWidth: "700px", // Ensures tabs don't get too compressed
          }}
        >
          <button
            className={`tab ${activeTab === "companion" ? "active" : ""}`}
            onClick={() => setActiveTab("companion")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Companion
          </button>
          <button
            className={`tab ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Inventory
          </button>
          <button
            className={`tab ${activeTab === "bartering" ? "active" : ""}`}
            onClick={() => setActiveTab("bartering")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Bartering
          </button>
          <button
            className={`tab ${activeTab === "tradeLog" ? "active" : ""}`}
            onClick={() => setActiveTab("tradeLog")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Trade Log
          </button>
          <button
            className={`tab ${activeTab === "map" ? "active" : ""}`}
            onClick={() => setActiveTab("map")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Map
          </button>
          <button
            className={`tab ${activeTab === "encyclopedia" ? "active" : ""}`}
            onClick={() => setActiveTab("encyclopedia")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Encyclopedia
          </button>
          <button
            className={`tab ${activeTab === "emergencyBeacon" ? "active" : ""}`}
            onClick={() => setActiveTab("emergencyBeacon")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Emergency
          </button>
          <button
            className={`tab ${activeTab === "creators" ? "active" : ""}`}
            onClick={() => setActiveTab("creators")}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
              flex: "1",
              textAlign: "center",
              height: "46px", // Increased height
              width: "150px", // Increased width from 125px to 150px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem", // Increased font size
              fontWeight: "500", // Added medium font weight
              letterSpacing: "0.5px", // Added letter spacing for better readability
            }}
          >
            Creators
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
