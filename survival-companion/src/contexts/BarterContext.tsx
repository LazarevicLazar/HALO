import React, { createContext, useState, useContext, ReactNode } from 'react';
import mockNPCs, { NPC } from '../data/mockNPCs';
import { InventoryItem } from '../data/mockInventory';
import { InventoryContext } from './InventoryContext';
import { CompanionContext } from './CompanionContext';

interface Trade {
  id: string;
  date: string;
  partner: string;
  givenItems: { name: string; quantity: number }[];
  receivedItems: { name: string; quantity: number }[];
  notes?: string;
}

interface BarterContextType {
  npcs: NPC[];
  selectedNPC: NPC | null;
  playerOffers: InventoryItem[];
  npcOffers: InventoryItem[];
  tradeHistory: Trade[];
  selectNPC: (npc: NPC | null) => void;
  addToPlayerOffer: (item: InventoryItem) => void;
  removeFromPlayerOffer: (itemId: string) => void;
  addToNPCOffer: (item: InventoryItem) => void;
  removeFromNPCOffer: (itemId: string) => void;
  executeTrade: () => void;
  clearOffers: () => void;
}

export const BarterContext = createContext<BarterContextType>({
  npcs: [],
  selectedNPC: null,
  playerOffers: [],
  npcOffers: [],
  tradeHistory: [],
  selectNPC: () => {},
  addToPlayerOffer: () => {},
  removeFromPlayerOffer: () => {},
  addToNPCOffer: () => {},
  removeFromNPCOffer: () => {},
  executeTrade: () => {},
  clearOffers: () => {}
});

interface BarterProviderProps {
  children: ReactNode;
}

export const BarterProvider: React.FC<BarterProviderProps> = ({ children }) => {
  const [npcs, setNpcs] = useState<NPC[]>(mockNPCs);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [playerOffers, setPlayerOffers] = useState<InventoryItem[]>([]);
  const [npcOffers, setNpcOffers] = useState<InventoryItem[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  
  const { inventory, updateItemQuantity } = useContext(InventoryContext);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  
  // Select an NPC for trading
  const selectNPC = (npc: NPC | null) => {
    setSelectedNPC(npc);
    clearOffers();
  };
  
  // Add an item to the player's offer
  const addToPlayerOffer = (item: InventoryItem) => {
    // Check if the item is already in the offer
    const existingItem = playerOffers.find(i => i.id === item.id);
    if (existingItem) {
      // Increment the quantity
      const updatedOffers = playerOffers.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setPlayerOffers(updatedOffers);
    } else {
      // Add the item with quantity 1
      setPlayerOffers([...playerOffers, { ...item, quantity: 1 }]);
    }
  };
  
  // Remove an item from the player's offer
  const removeFromPlayerOffer = (itemId: string) => {
    setPlayerOffers(playerOffers.filter(item => item.id !== itemId));
  };
  
  // Add an item to the NPC's offer
  const addToNPCOffer = (item: InventoryItem) => {
    // Check if the item is already in the offer
    const existingItem = npcOffers.find(i => i.id === item.id);
    if (existingItem) {
      // Increment the quantity
      const updatedOffers = npcOffers.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setNpcOffers(updatedOffers);
    } else {
      // Add the item with quantity 1
      setNpcOffers([...npcOffers, { ...item, quantity: 1 }]);
    }
  };
  
  // Remove an item from the NPC's offer
  const removeFromNPCOffer = (itemId: string) => {
    setNpcOffers(npcOffers.filter(item => item.id !== itemId));
  };
  
  // Execute the trade
  const executeTrade = () => {
    if (!selectedNPC || playerOffers.length === 0 || npcOffers.length === 0) {
      return;
    }
    
    // Create a new trade record
    const newTrade: Trade = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      partner: selectedNPC.name,
      givenItems: playerOffers.map(item => ({ name: item.name, quantity: item.quantity })),
      receivedItems: npcOffers.map(item => ({ name: item.name, quantity: item.quantity }))
    };
    
    // Add the trade to history
    setTradeHistory([newTrade, ...tradeHistory]);
    
    // Save trade history to localStorage
    localStorage.setItem('survival-trade-history', JSON.stringify([newTrade, ...tradeHistory]));
    
    // In a real implementation, we would update the inventory quantities
    // For now, we'll just clear the offers
    clearOffers();
    
    // Trigger companion response
    const receivedItemNames = npcOffers.map(item => item.name).join(', ');
    triggerCompanionResponse(`trade_completed:${receivedItemNames}`);
  };
  
  // Clear all offers
  const clearOffers = () => {
    setPlayerOffers([]);
    setNpcOffers([]);
  };
  
  return (
    <BarterContext.Provider value={{
      npcs,
      selectedNPC,
      playerOffers,
      npcOffers,
      tradeHistory,
      selectNPC,
      addToPlayerOffer,
      removeFromPlayerOffer,
      addToNPCOffer,
      removeFromNPCOffer,
      executeTrade,
      clearOffers
    }}>
      {children}
    </BarterContext.Provider>
  );
};