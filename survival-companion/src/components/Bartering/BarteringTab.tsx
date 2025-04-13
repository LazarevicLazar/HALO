import React, { useContext, useState } from "react";
import { InventoryContext } from "../../contexts/InventoryContext";
import { BarterContext } from "../../contexts/BarterContext";
import { InventoryItem } from "../../data/mockInventory";

// CSS for the NPC cards
const npcCardStyle = {
  cursor: "pointer",
  display: "flex",
  flexDirection: "column" as const,
  height: "380px",
  transition: "all 0.3s ease",
  position: "relative" as const,
  overflow: "hidden",
  border: "1px solid var(--border-color)",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const npcCardHoverStyle = {
  transform: "translateY(-5px)",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
  borderColor: "var(--accent-color)",
};

const portraitContainerStyle = {
  height: "220px",
  overflow: "hidden",
  position: "relative" as const,
  borderBottom: "1px solid var(--border-color)",
};

const portraitImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  transition: "transform 0.5s ease",
};

const portraitImageHoverStyle = {
  transform: "scale(1.05)",
};

const npcInfoStyle = {
  padding: "1rem",
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  position: "relative" as const,
  zIndex: 1,
};

const specialtyBadgeStyle = {
  position: "absolute" as const,
  top: "-15px",
  right: "10px",
  backgroundColor: "var(--accent-color)",
  color: "#fff",
  padding: "0.25rem 0.5rem",
  borderRadius: "4px",
  fontSize: "0.8rem",
  fontWeight: "bold",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
};

const relationshipBarContainerStyle = {
  height: "6px",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "3px",
  overflow: "hidden",
  marginTop: "0.5rem",
};

const relationshipBarStyle = (level: number) => ({
  height: "100%",
  width: `${level}%`,
  backgroundColor: level > 70 ? "#4CAF50" : level > 40 ? "#FFC107" : "#F44336",
  transition: "width 0.3s ease",
});

const BarteringTab: React.FC = () => {
  const { inventory } = useContext(InventoryContext);
  const {
    // NPC trading state and methods
    npcs,
    selectedNPC,
    playerOffers,
    npcOffers,
    selectNPC,
    addToPlayerOffer,
    removeFromPlayerOffer,
    addToNPCOffer,
    removeFromNPCOffer,
    executeTrade,
    clearOffers,

    // Bluetooth trading state and methods
    isBluetoothSupported,
    isScanning,
    isConnected,
    connectedDeviceName,
    incomingTradeRequest,
    incomingTradeOffer,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    sendTradeRequest,
    acceptTradeRequest,
    rejectTradeRequest,
    sendTradeOffer,
    acceptTradeOffer,
    rejectTradeOffer,
  } = useContext(BarterContext);

  // Local state for trading mode and hover state
  const [tradingMode, setTradingMode] = useState<"npc" | "bluetooth">("npc");
  const [hoveredNPC, setHoveredNPC] = useState<string | null>(null);

  // Render the Bluetooth device discovery and connection UI
  const renderBluetoothDiscovery = () => {
    if (!isBluetoothSupported) {
      return (
        <div className="card">
          <p className="text-accent">
            Bluetooth is not supported on this device.
          </p>
          <p>
            Your device or browser does not support the Web Bluetooth API, which
            is required for peer-to-peer trading.
          </p>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="card">
          <div className="flex justify-between align-center mb-1">
            <h3>Connected to: {connectedDeviceName}</h3>
            <button className="button" onClick={disconnectDevice}>
              Disconnect
            </button>
          </div>

          {incomingTradeRequest ? (
            <div
              className="card"
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              <h4>Trade Request</h4>
              <p>{incomingTradeRequest.fromName} wants to trade with you.</p>
              <div className="flex" style={{ gap: "1rem" }}>
                <button className="button" onClick={acceptTradeRequest}>
                  Accept
                </button>
                <button className="button" onClick={rejectTradeRequest}>
                  Decline
                </button>
              </div>
            </div>
          ) : (
            <button
              className="button mb-1"
              onClick={sendTradeRequest}
              disabled={isScanning}
            >
              Initiate Trade
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="card">
        <h3>Nearby Traders</h3>
        <p>Scan for nearby traders to initiate bartering.</p>
        <button
          className="button"
          onClick={scanForDevices}
          disabled={isScanning}
        >
          {isScanning ? "Scanning..." : "Scan for Traders"}
        </button>
      </div>
    );
  };

  // Render the Bluetooth trading UI
  const renderBluetoothTrading = () => {
    if (!isConnected) {
      return renderBluetoothDiscovery();
    }

    if (incomingTradeOffer) {
      return (
        <div>
          <div className="flex justify-between align-center mb-1">
            <h3>Trade Offer from {incomingTradeOffer.fromName}</h3>
            <button className="button" onClick={disconnectDevice}>
              Cancel Trade
            </button>
          </div>

          <div className="flex" style={{ gap: "1rem" }}>
            <div style={{ flex: "1" }}>
              <h4>Your Offer</h4>
              <div
                className="card"
                style={{
                  backgroundColor: "var(--primary-color)",
                  minHeight: "200px",
                }}
              >
                {playerOffers.length === 0 ? (
                  <p className="text-accent">
                    Add items from your inventory to offer
                  </p>
                ) : (
                  <div>
                    {playerOffers.map((item, index) => (
                      <div key={index} className="flex justify-between p-1">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h4 className="mt-1">Your Inventory</h4>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between p-1"
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                    onClick={() => addToPlayerOffer(item)}
                  >
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="text-accent">⇄</div>
            </div>

            <div style={{ flex: "1" }}>
              <h4>{incomingTradeOffer.fromName}'s Offer</h4>
              <div
                className="card"
                style={{
                  backgroundColor: "var(--primary-color)",
                  minHeight: "200px",
                }}
              >
                {incomingTradeOffer.items.length === 0 ? (
                  <p className="text-accent">No items offered</p>
                ) : (
                  <div>
                    {incomingTradeOffer.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-1">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex mt-1" style={{ gap: "1rem" }}>
                <button
                  className="button"
                  style={{ flex: 1 }}
                  onClick={acceptTradeOffer}
                >
                  Accept Offer
                </button>
                <button
                  className="button"
                  style={{ flex: 1 }}
                  onClick={rejectTradeOffer}
                >
                  Decline Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between align-center mb-1">
          <h3>Trading with {connectedDeviceName}</h3>
          <button className="button" onClick={disconnectDevice}>
            Cancel Trade
          </button>
        </div>

        <div className="flex" style={{ gap: "1rem" }}>
          <div style={{ flex: "1" }}>
            <h4>Your Offer</h4>
            <div
              className="card"
              style={{
                backgroundColor: "var(--primary-color)",
                minHeight: "200px",
              }}
            >
              {playerOffers.length === 0 ? (
                <p className="text-accent">
                  Add items from your inventory to offer
                </p>
              ) : (
                <div>
                  {playerOffers.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-1"
                      onClick={() => removeFromPlayerOffer(item.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h4 className="mt-1">Your Inventory</h4>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between p-1"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                  onClick={() => addToPlayerOffer(item)}
                >
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              className="button"
              disabled={playerOffers.length === 0}
              onClick={sendTradeOffer}
              style={{ marginBottom: "1rem" }}
            >
              Send Offer
            </button>
            <div className="text-accent">⇄</div>
          </div>

          <div style={{ flex: "1" }}>
            <h4>Waiting for Response</h4>
            <div
              className="card"
              style={{
                backgroundColor: "var(--primary-color)",
                minHeight: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p className="text-accent">Send an offer to start trading</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the NPC trading UI
  const renderNPCTrading = () => {
    if (!selectedNPC) {
      return (
        <div>
          <h3>Select a Trading Partner</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginTop: "1rem",
            }}
          >
            {npcs.map((npc) => {
              // Determine which image to use based on NPC name
              let portraitSrc = "";
              if (npc.name === "Doc Wilson") {
                portraitSrc = "/assets/images/Doctor_Wilson.png";
              } else if (npc.name === "Hunter Mike") {
                portraitSrc = "/assets/images/Hunter_Mike.png";
              } else if (npc.name === "Farmer Sarah") {
                portraitSrc = "/assets/images/Farmer_Sarah.png";
              }

              const isHovered = hoveredNPC === npc.id;

              return (
                <div
                  key={npc.id}
                  style={{
                    ...npcCardStyle,
                    ...(isHovered ? npcCardHoverStyle : {}),
                  }}
                  onClick={() => selectNPC(npc)}
                  onMouseEnter={() => setHoveredNPC(npc.id)}
                  onMouseLeave={() => setHoveredNPC(null)}
                >
                  <div style={portraitContainerStyle}>
                    <img
                      src={portraitSrc}
                      alt={npc.name}
                      style={{
                        ...portraitImageStyle,
                        ...(isHovered ? portraitImageHoverStyle : {}),
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.7))",
                        padding: "2rem 1rem 0.5rem",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#fff",
                          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          fontSize: "1.5rem",
                        }}
                      >
                        {npc.name}
                      </h3>
                    </div>
                  </div>

                  <div style={npcInfoStyle}>
                    <div style={specialtyBadgeStyle}>{npc.specialty}</div>

                    <p style={{ flex: 1, margin: "0.5rem 0 1rem" }}>
                      {npc.description}
                    </p>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>Relationship</span>
                        <span>{npc.relationshipLevel}/100</span>
                      </div>
                      <div style={relationshipBarContainerStyle}>
                        <div
                          style={relationshipBarStyle(npc.relationshipLevel)}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Determine which image to use based on NPC name for the selected NPC
    let selectedPortraitSrc = "";
    if (selectedNPC.name === "Doc Wilson") {
      selectedPortraitSrc = "/assets/images/Doctor_Wilson.png";
    } else if (selectedNPC.name === "Hunter Mike") {
      selectedPortraitSrc = "/assets/images/Hunter_Mike.png";
    } else if (selectedNPC.name === "Farmer Sarah") {
      selectedPortraitSrc = "/assets/images/Farmer_Sarah.png";
    }

    return (
      <div>
        <div className="flex justify-between align-center mb-1">
          <div className="flex align-center" style={{ gap: "1rem" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid var(--accent-color)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                position: "relative",
              }}
            >
              <img
                src={selectedPortraitSrc}
                alt={selectedNPC.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Trading with {selectedNPC.name}</h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "0.25rem",
                }}
              >
                <span
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "#fff",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "3px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {selectedNPC.specialty}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Relationship:</span>
                  <div
                    style={{
                      width: "80px",
                      height: "6px",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${selectedNPC.relationshipLevel}%`,
                        backgroundColor:
                          selectedNPC.relationshipLevel > 70
                            ? "#4CAF50"
                            : selectedNPC.relationshipLevel > 40
                            ? "#FFC107"
                            : "#F44336",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="button" onClick={() => selectNPC(null)}>
            Back to NPC List
          </button>
        </div>

        <div className="flex" style={{ gap: "1rem" }}>
          <div style={{ flex: "1" }}>
            <h4>Your Offer</h4>
            <div
              className="card"
              style={{
                backgroundColor: "var(--primary-color)",
                minHeight: "200px",
              }}
            >
              {playerOffers.length === 0 ? (
                <p className="text-accent">
                  Add items from your inventory to offer
                </p>
              ) : (
                <div>
                  {playerOffers.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-1"
                      onClick={() => removeFromPlayerOffer(item.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h4 className="mt-1">Your Inventory</h4>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between p-1"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                  onClick={() => addToPlayerOffer(item)}
                >
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              className="button"
              disabled={playerOffers.length === 0 || npcOffers.length === 0}
              onClick={executeTrade}
              style={{ marginBottom: "1rem" }}
            >
              Trade
            </button>
            <div className="text-accent">⇄</div>
          </div>

          <div style={{ flex: "1" }}>
            <h4>{selectedNPC.name}'s Offer</h4>
            <div
              className="card"
              style={{
                backgroundColor: "var(--primary-color)",
                minHeight: "200px",
              }}
            >
              {npcOffers.length === 0 ? (
                <p className="text-accent">
                  Add items from {selectedNPC.name}'s inventory to request
                </p>
              ) : (
                <div>
                  {npcOffers.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-1"
                      onClick={() => removeFromNPCOffer(item.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h4 className="mt-1">{selectedNPC.name}'s Inventory</h4>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {selectedNPC.inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between p-1"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                  onClick={() => addToNPCOffer(item)}
                >
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card mt-1">
          <p className="text-accent">Companion's Advice:</p>
          <p>
            {selectedNPC.name} specializes in{" "}
            {selectedNPC.specialty.toLowerCase()} items. They're more likely to
            give you a good deal on other types of items in exchange for{" "}
            {selectedNPC.specialty.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <h2 className="card-title">Bartering</h2>

      {/* Trading mode selector */}
      <div className="tabs mb-1">
        <button
          className={`tab ${tradingMode === "npc" ? "active" : ""}`}
          onClick={() => {
            setTradingMode("npc");
            disconnectDevice(); // Disconnect from any Bluetooth device when switching to NPC mode
            clearOffers();
          }}
        >
          Trade with NPCs
        </button>
        <button
          className={`tab ${tradingMode === "bluetooth" ? "active" : ""}`}
          onClick={() => {
            setTradingMode("bluetooth");
            selectNPC(null); // Deselect any NPC when switching to Bluetooth mode
            clearOffers();
          }}
        >
          Trade with Players
        </button>
      </div>

      {/* Render the appropriate trading UI based on the selected mode */}
      {tradingMode === "npc" ? renderNPCTrading() : renderBluetoothTrading()}
    </div>
  );
};

export default BarteringTab;
