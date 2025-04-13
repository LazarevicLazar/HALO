import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import mockNPCs, { NPC } from '../data/mockNPCs';
import { InventoryItem } from '../data/mockInventory';
import { InventoryContext } from './InventoryContext';
import { CompanionContext } from './CompanionContext';
import { TradeLogContext } from './TradeLogContext';


interface BarterContextType {
  npcs: NPC[];
  selectedNPC: NPC | null;
  playerOffers: InventoryItem[];
  npcOffers: InventoryItem[];
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
  const { inventory, updateItemQuantity, addItem } = useContext(InventoryContext);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  const tradeLogContext = useContext(TradeLogContext);
  const { addTradeEntry } = useContext(TradeLogContext);
  
  // Load NPCs from localStorage on mount
  useEffect(() => {
    const savedNPCs = localStorage.getItem('survival-npcs');
    if (savedNPCs) {
      try {
        const parsedNPCs = JSON.parse(savedNPCs);
        setNpcs(parsedNPCs);
      } catch (error) {
        console.error('Error parsing saved NPCs:', error);
      }
    }
  }, []);
  
  // Select an NPC for trading
  const selectNPC = (npc: NPC | null) => {
    if (npc) {
      // Find the latest version of this NPC from the npcs state
      const latestNPC = npcs.find(n => n.id === npc.id) || npc;
      setSelectedNPC(latestNPC);
    } else {
      setSelectedNPC(null);
    }
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
    const newTrade = {
      date: new Date().toISOString(),
      partner: selectedNPC.name,
      givenItems: playerOffers.map(item => ({ name: item.name, quantity: item.quantity })),
      receivedItems: npcOffers.map(item => ({ name: item.name, quantity: item.quantity }))
    };
    
    // Add the trade to the trade log
    console.log('Adding trade to log:', newTrade);
    tradeLogContext.addTradeEntry(newTrade);
    
    // Update player's inventory - remove offered items
    playerOffers.forEach(item => {
      const playerItem = inventory.find(i => i.id === item.id);
      if (playerItem) {
        if (playerItem.quantity > item.quantity) {
          // Reduce quantity if player has more than offered
          updateItemQuantity(item.id, playerItem.quantity - item.quantity);
        } else {
          // Remove item if player offered all they had
          updateItemQuantity(item.id, 0);
        }
      }
    });
    
    // Update player's inventory - add received items
    npcOffers.forEach(item => {
      addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description,
        icon: item.icon
      });
    });
    
    // Update NPC's inventory - remove offered items and add player's items
    if (selectedNPC) {
      const updatedNpcs = npcs.map(npc => {
        if (npc.id === selectedNPC.id) {
          // Create a deep copy of the NPC
          const updatedNpc = { ...npc };
          // Create a new inventory array with updated quantities
          updatedNpc.inventory = npc.inventory.reduce((newInventory, item) => {
            const offeredItem = npcOffers.find(offered => offered.id === item.id);
            
            if (!offeredItem) {
              // Item wasn't offered, keep it unchanged
              newInventory.push({...item});
              return newInventory;
            }
            
            // If the NPC offered some but not all, reduce quantity
            if (item.quantity > offeredItem.quantity) {
              newInventory.push({
                ...item,
                quantity: item.quantity - offeredItem.quantity
              });
            }
            // If the NPC offered all, don't add it to the new inventory
            
            return newInventory;
          }, [] as InventoryItem[]);
          
          // Add items the player offered
          playerOffers.forEach(playerItem => {
            // Check if NPC already has this item
            const existingItemIndex = updatedNpc.inventory.findIndex(
              item => item.name === playerItem.name && item.category === playerItem.category
            );
            
            if (existingItemIndex >= 0) {
              // Create a new array with the updated item
              updatedNpc.inventory = [
                ...updatedNpc.inventory.slice(0, existingItemIndex),
                {
                  ...updatedNpc.inventory[existingItemIndex],
                  quantity: updatedNpc.inventory[existingItemIndex].quantity + playerItem.quantity
                },
                ...updatedNpc.inventory.slice(existingItemIndex + 1)
              ];
            } else {
              // Add new item to NPC's inventory
              updatedNpc.inventory.push({
                id: `npc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: playerItem.name,
                category: playerItem.category,
                quantity: playerItem.quantity,
                description: playerItem.description || '',
                icon: playerItem.icon || `${playerItem.category}.png`
              });
            }
          });
          
          return updatedNpc;
        }
        return npc;
      });
      // Update NPCs state and save to localStorage
      setNpcs(updatedNpcs);
      localStorage.setItem('survival-npcs', JSON.stringify(updatedNpcs));
    }
    
    
    // Clear the offers
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