import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import mockInventory, { InventoryItem } from '../data/mockInventory';
import { CompanionContext } from './CompanionContext';

interface InventoryContextType {
  inventory: InventoryItem[];
  addItem: (item: Partial<InventoryItem>, silent?: boolean) => void;
  removeItem: (itemId: string, silent?: boolean) => void;
  updateItemQuantity: (itemId: string, newQuantity: number, silent?: boolean) => void;
  getItemsByCategory: (category: string) => InventoryItem[];
  getCategories: () => string[];
}

export const InventoryContext = createContext<InventoryContextType>({
  inventory: [],
  addItem: () => {},
  removeItem: () => {},
  updateItemQuantity: () => {},
  getItemsByCategory: () => [],
  getCategories: () => [],
});

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  
  const CATEGORIES = [
    'Food', 'Water', 'Medicine', 'Weapons', 'Ammo', 'Tools', 'Clothing', 'Miscellaneous'
  ];
  
  // Load inventory from localStorage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('survival-inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, []);
  
  // Save inventory to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('survival-inventory', JSON.stringify(inventory));
  }, [inventory]);
  
  // Add a new item to inventory
  const addItem = (item: Partial<InventoryItem>, silent: boolean = false) => {
    if (!item.name || !item.category) {
      console.error('Item must have a name and category');
      return;
    }
    
    // Check if item already exists
    const existingItemIndex = inventory.findIndex(
      i => i.name.toLowerCase() === item.name!.toLowerCase() && i.category === item.category
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedInventory = [...inventory];
      updatedInventory[existingItemIndex] = {
        ...updatedInventory[existingItemIndex],
        quantity: updatedInventory[existingItemIndex].quantity + (item.quantity || 1)
      };
      setInventory(updatedInventory);
      if (!silent) {
        triggerCompanionResponse(`inventory_updated:${item.name}`);
      }
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: item.name,
        category: item.category as any, // Type assertion needed here
        quantity: item.quantity || 1,
        description: item.description || '',
        icon: item.icon || `${item.category}.png`
      };
      setInventory([...inventory, newItem]);
      if (!silent) {
        triggerCompanionResponse(`inventory_added:${item.name}`);
      }
    }
  };
  
  // Remove an item from inventory
  const removeItem = (itemId: string, silent: boolean = false) => {
    const itemToRemove = inventory.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    setInventory(inventory.filter(item => item.id !== itemId));
    if (!silent) {
      triggerCompanionResponse(`inventory_removed:${itemToRemove.name}`);
    }
  };
  
  // Update an item's quantity
  const updateItemQuantity = (itemId: string, newQuantity: number, silent: boolean = false) => {
    if (newQuantity <= 0) {
      // Call removeItem which will trigger its own companion response if not silent
      removeItem(itemId, silent);
      return;
    }
    
    const updatedInventory = inventory.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setInventory(updatedInventory);
    
    const updatedItem = updatedInventory.find(item => item.id === itemId);
    if (updatedItem && !silent) {
      triggerCompanionResponse(`inventory_updated:${updatedItem.name}`);
    }
  };
  
  // Get items by category
  const getItemsByCategory = (category: string) => {
    return category === 'All' 
      ? inventory 
      : inventory.filter(item => item.category === category);
  };
  
  // Get all categories
  const getCategories = () => ['All', ...CATEGORIES];
  
  return (
    <InventoryContext.Provider value={{
      inventory,
      addItem,
      removeItem,
      updateItemQuantity,
      getItemsByCategory,
      getCategories
    }}>
      {children}
    </InventoryContext.Provider>
  );
};