import React, { useState, useContext } from 'react';
import { InventoryContext } from '../../contexts/InventoryContext';
import { InventoryItem } from '../../data/mockInventory';

const InventoryTab: React.FC = () => {
  const { inventory, getCategories, getItemsByCategory, addItem, removeItem, updateItemQuantity } = useContext(InventoryContext);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Food',
    quantity: 1,
    description: ''
  });
  
  const categories = getCategories();
  const filteredInventory = getItemsByCategory(activeCategory);
  
  const handleAddItem = () => {
    if (newItem.name && newItem.category) {
      addItem(newItem);
      setNewItem({
        name: '',
        category: 'Food',
        quantity: 1,
        description: ''
      });
      setShowAddItemForm(false);
    }
  };

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
        <button className="button" onClick={() => setShowAddItemForm(!showAddItemForm)}>
          {showAddItemForm ? 'Cancel' : 'Add New Item'}
        </button>
      </div>
      
      {showAddItemForm && (
        <div className="card mb-1">
          <h4>Add New Item</h4>
          <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label>Name</label>
              <input
                type="text"
                className="input"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label>Category</label>
              <select
                className="input"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value as any})}
              >
                {categories.filter(cat => cat !== 'All').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label>Quantity</label>
              <input
                type="number"
                className="input"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                min="1"
              />
            </div>
          </div>
          <div className="mt-1">
            <label>Description</label>
            <textarea
              className="input"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              rows={2}
            ></textarea>
          </div>
          <div className="flex justify-between mt-1">
            <button className="button" onClick={() => setShowAddItemForm(false)}>Cancel</button>
            <button
              className="button"
              onClick={handleAddItem}
              disabled={!newItem.name || !newItem.category}
            >
              Add Item
            </button>
          </div>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {filteredInventory.length === 0 ? (
          <p>No items in this category. Add some items to get started.</p>
        ) : filteredInventory.map(item => (
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
            <div className="flex justify-between mt-1">
              <button
                className="button"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <button
                className="button"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>
              <button
                className="button"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryTab;