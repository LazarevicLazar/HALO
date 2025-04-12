import React, { useContext } from 'react';
import { InventoryContext } from '../../contexts/InventoryContext';
import { BarterContext } from '../../contexts/BarterContext';
import { InventoryItem } from '../../data/mockInventory';

const BarteringTab: React.FC = () => {
  const { inventory } = useContext(InventoryContext);
  const {
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
    clearOffers
  } = useContext(BarterContext);
  

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
                onClick={() => selectNPC(npc)}
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
            <button className="button" onClick={() => selectNPC(null)}>Back to NPC List</button>
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