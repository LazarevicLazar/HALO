import React, { useState } from 'react';
import mockInventory, { InventoryItem } from '../../data/mockInventory';

const InventoryTab: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const categories = ['All', 'Food', 'Water', 'Medicine', 'Weapons', 'Ammo', 'Tools', 'Clothing', 'Miscellaneous'];
  
  const filteredInventory = activeCategory === 'All' 
    ? inventory 
    : inventory.filter(item => item.category === activeCategory);

  return (
    <div className="card">
      <h2 className="card-title">Inventory</h2>
      
      <div className="tabs">
        {categories.map(category => (
          <button 
            key={category}
            className={`tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between align-center mb-1">
        <h3>{activeCategory} Items ({filteredInventory.length})</h3>
        <button className="button">Add New Item</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {filteredInventory.map(item => (
          <div 
            key={item.id} 
            className="card" 
            style={{ 
              borderLeft: '4px solid var(--accent-color)',
              padding: '0.5rem'
            }}
          >
            <div className="flex justify-between">
              <h4 style={{ margin: '0' }}>{item.name}</h4>
              <span className="text-accent">x{item.quantity}</span>
            </div>
            <div className="flex mt-1">
              <div style={{ flex: '0 0 50px' }}>
                <img 
                  src={`/assets/icons/${item.category}/${item.icon}`} 
                  alt={item.name}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{ flex: '1', marginLeft: '0.5rem' }}>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>{item.description}</p>
                <p className="text-accent" style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>{item.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryTab;