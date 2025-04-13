import React, { useContext, useState } from "react";
import { InventoryContext } from "../../contexts/InventoryContext";
import { BarterContext } from "../../contexts/BarterContext";
import { InventoryItem } from "../../data/mockInventory";

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

  // Local state for trading mode
  const [tradingMode, setTradingMode] = useState<"npc" | "bluetooth">("npc");

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
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            {npcs.map((npc) => (
              <div
                key={npc.id}
                className="card"
                style={{ cursor: "pointer" }}
                onClick={() => selectNPC(npc)}
              >
                <h4 className="text-accent">{npc.name}</h4>
                <p>{npc.description}</p>
                <p>
                  <strong>Specialty:</strong> {npc.specialty}
                </p>
                <p>
                  <strong>Relationship:</strong> {npc.relationshipLevel}/100
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between align-center mb-1">
          <h3>Trading with {selectedNPC.name}</h3>
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
