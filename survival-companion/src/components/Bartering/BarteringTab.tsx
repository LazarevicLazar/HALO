import React, { useState } from 'react';
import mockInventory, { InventoryItem } from '../../data/mockInventory';
import mockNPCs, { NPC } from '../../data/mockNPCs';

const BarteringTab: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [npcs, setNpcs] = useState<NPC[]>(mockNPCs);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [playerOffers, setPlayerOffers] = useState<InventoryItem[]>([]);
  const [npcOffers, setNpcOffers] = useState<InventoryItem[]>([]);
  
  const handleSelectNPC = (npc: NPC) => {
    setSelectedNPC(npc);
    setNpcOffers([]);
    setPlayerOffers([]);
  };
  
  const addToPlayerOffer = (item: InventoryItem) => {
    if (item.quantity > 0) {
      setPlayerOffers([...playerOffers, { ...item, quantity: 1 }]);
      // In a real implementation, we would update the inventory quantity
    }
  };
  
  const addToNPCOffer = (item: InventoryItem) => {
    if (item.quantity > 0) {
      setNpcOffers([...npcOffers, { ...item, quantity: 1 }]);
      // In a real implementation, we would update the NPC inventory quantity
    }
  };
  
  const executeTrade = () => {
    // In a real implementation, this would update both inventories
    // and create a trade log entry
    alert('Trade completed!');
    setPlayerOffers([]);
    setNpcOffers([]);
  };

  return (
    <div className="card">
      <h2 className="card-title">Bartering</h2>
      
      {!selectedNPC ? (
        <div>
          <h3>Select a Trading Partner</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {npcs.map(npc => (
              <div 
                key={npc.id} 
                className="card" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectNPC(npc)}
              >
                <h4 className="text-accent">{npc.name}</h4>
                <p>{npc.description}</p>
                <p><strong>Specialty:</strong> {npc.specialty}</p>
                <p><strong>Relationship:</strong> {npc.relationshipLevel}/100</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between align-center mb-1">
            <h3>Trading with {selectedNPC.name}</h3>
            <button className="button" onClick={() => setSelectedNPC(null)}>Back to NPC List</button>
          </div>
          
          <div className="flex" style={{ gap: '1rem' }}>
            <div style={{ flex: '1' }}>
              <h4>Your Offer</h4>
              <div className="card" style={{ backgroundColor: 'var(--primary-color)', minHeight: '200px' }}>
                {playerOffers.length === 0 ? (
                  <p className="text-accent">Add items from your inventory to offer</p>
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
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {inventory.map(item => (
                  <div 
                    key={item.id} 
                    className="flex justify-between p-1" 
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => addToPlayerOffer(item)}
                  >
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <button 
                className="button" 
                disabled={playerOffers.length === 0 || npcOffers.length === 0}
                onClick={executeTrade}
                style={{ marginBottom: '1rem' }}
              >
                Trade
              </button>
              <div className="text-accent">⇄</div>
            </div>
            
            <div style={{ flex: '1' }}>
              <h4>{selectedNPC.name}'s Offer</h4>
              <div className="card" style={{ backgroundColor: 'var(--primary-color)', minHeight: '200px' }}>
                {npcOffers.length === 0 ? (
                  <p className="text-accent">Add items from {selectedNPC.name}'s inventory to request</p>
                ) : (
                  <div>
                    {npcOffers.map((item, index) => (
                      <div key={index} className="flex justify-between p-1">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <h4 className="mt-1">{selectedNPC.name}'s Inventory</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {selectedNPC.inventory.map(item => (
                  <div 
                    key={item.id} 
                    className="flex justify-between p-1" 
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
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
              {selectedNPC.name} specializes in {selectedNPC.specialty.toLowerCase()} items. 
              They're more likely to give you a good deal on other types of items in exchange for {selectedNPC.specialty.toLowerCase()}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarteringTab;