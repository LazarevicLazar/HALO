import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface TradeEntry {
  id: string;
  date: string;
  partner: string;
  givenItems: { name: string; quantity: number }[];
  receivedItems: { name: string; quantity: number }[];
  notes?: string;
}

// Initial empty trade log
const initialTradeLog: TradeEntry[] = [];

interface TradeLogContextType {
  tradeLog: TradeEntry[];
  selectedEntry: TradeEntry | null;
  addTradeEntry: (entry: Omit<TradeEntry, 'id'>) => void;
  updateTradeEntry: (entryId: string, updates: Partial<TradeEntry>) => void;
  deleteTradeEntry: (entryId: string) => void;
  clearTradeLog: () => void;
  selectEntry: (entry: TradeEntry | null) => void;
  exportTradeLog: () => string;
}

export const TradeLogContext = createContext<TradeLogContextType>({
  tradeLog: [],
  selectedEntry: null,
  addTradeEntry: () => {},
  updateTradeEntry: () => {},
  deleteTradeEntry: () => {},
  clearTradeLog: () => {},
  selectEntry: () => {},
  exportTradeLog: () => ''
});

interface TradeLogProviderProps {
  children: ReactNode;
}

export const TradeLogProvider: React.FC<TradeLogProviderProps> = ({ children }) => {
  const [tradeLog, setTradeLog] = useState<TradeEntry[]>(initialTradeLog);
  const [selectedEntry, setSelectedEntry] = useState<TradeEntry | null>(null);
  
  // Load trade log from localStorage on mount
  useEffect(() => {
    // Try to load from both possible keys for backward compatibility
    const savedTradeLog = localStorage.getItem('survival-trade-log') || localStorage.getItem('survival-trade-history');
    if (savedTradeLog) {
      try {
        const parsedLog = JSON.parse(savedTradeLog);
        console.log('Loaded trade log from localStorage:', parsedLog);
        setTradeLog(parsedLog);
      } catch (error) {
        console.error('Error parsing trade log from localStorage:', error);
      }
    } else {
      console.log('No trade log found in localStorage');
    }
  }, []);
  
  // Save trade log to localStorage when it changes
  useEffect(() => {
    try {
      console.log('Saving trade log to localStorage:', tradeLog);
      const tradeLogJson = JSON.stringify(tradeLog);
      localStorage.setItem('survival-trade-log', tradeLogJson);
      // Also save to the old key for backward compatibility
      localStorage.setItem('survival-trade-history', tradeLogJson);
    } catch (error) {
      console.error('Error saving trade log to localStorage:', error);
    }
  }, [tradeLog]);
  // Add a new trade entry
  const addTradeEntry = (entry: Omit<TradeEntry, 'id'>) => {
    console.log('TradeLogContext: Adding new entry:', entry);
    const newEntry: TradeEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    console.log('TradeLogContext: New entry with ID:', newEntry);
    setTradeLog([newEntry, ...tradeLog]);
    console.log('TradeLogContext: Updated trade log:', [newEntry, ...tradeLog]);
  };
  
  // Update an existing trade entry
  const updateTradeEntry = (entryId: string, updates: Partial<TradeEntry>) => {
    const updatedTradeLog = tradeLog.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    
    setTradeLog(updatedTradeLog);
    
    // Update selected entry if it's the one being updated
    if (selectedEntry && selectedEntry.id === entryId) {
      setSelectedEntry({ ...selectedEntry, ...updates });
    }
  };
  
  // Delete a trade entry
  const deleteTradeEntry = (entryId: string) => {
    setTradeLog(tradeLog.filter(entry => entry.id !== entryId));
    
    // Clear selected entry if it's the one being deleted
    if (selectedEntry && selectedEntry.id === entryId) {
      setSelectedEntry(null);
    }
  };
  
  // Select a trade entry
  const selectEntry = (entry: TradeEntry | null) => {
    setSelectedEntry(entry);
  };
  
  // Clear the entire trade log
  const clearTradeLog = () => {
    if (window.confirm('Are you sure you want to clear the entire trade log? This action cannot be undone.')) {
      setTradeLog([]);
      setSelectedEntry(null);
    }
  };
  
  // Export trade log as CSV
  const exportTradeLog = () => {
    const headers = ['Date', 'Partner', 'Given Items', 'Received Items', 'Notes'];
    
    // Helper function to escape CSV values
    const escapeCSV = (value: string) => {
      // If the value contains commas, quotes, or newlines, wrap it in quotes
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // Double up any quotes to escape them
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };
    
    const rows = tradeLog.map(entry => {
      const date = new Date(entry.date).toLocaleString();
      const givenItems = entry.givenItems.map(item => `${item.quantity}x ${item.name}`).join('; ');
      const receivedItems = entry.receivedItems.map(item => `${item.quantity}x ${item.name}`).join('; ');
      
      return [
        escapeCSV(date),
        escapeCSV(entry.partner),
        escapeCSV(givenItems),
        escapeCSV(receivedItems),
        escapeCSV(entry.notes || '')
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };
  
  return (
    <TradeLogContext.Provider value={{
      tradeLog,
      selectedEntry,
      addTradeEntry,
      updateTradeEntry,
      deleteTradeEntry,
      clearTradeLog,
      selectEntry,
      exportTradeLog
    }}>
      {children}
    </TradeLogContext.Provider>
  );
};