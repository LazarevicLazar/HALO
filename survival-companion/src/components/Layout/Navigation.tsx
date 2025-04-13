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
          height: "50px",
          alignItems: "center",
          overflow: "auto",
          whiteSpace: "nowrap",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Emergency
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
