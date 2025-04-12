import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface TradeEntry {
  id: string;
  date: string;
  partner: string;
  givenItems: { name: string; quantity: number }[];
  receivedItems: { name: string; quantity: number }[];
  notes?: string;
}

// Mock trade log data
const mockTradeLog: TradeEntry[] = [
  {
    id: '1',
    date: '2025-04-10T14:30:00Z',
    partner: 'Doc Wilson',
    givenItems: [
      { name: 'Canned Beans', quantity: 2 },
      { name: 'Water Bottle', quantity: 1 }
    ],
    receivedItems: [
      { name: 'Bandages', quantity: 5 }
    ],
    notes: 'Fair trade, Doc seemed pleased with the food.'
  },
  {
    id: '2',
    date: '2025-04-08T10:15:00Z',
    partner: 'Hunter Mike',
    givenItems: [
      { name: 'Multi-tool', quantity: 1 }
    ],
    receivedItems: [
      { name: 'Shotgun Shells', quantity: 12 }
    ],
    notes: 'Mike really needed a new tool. Got a good deal on ammo.'
  },
  {
    id: '3',
    date: '2025-04-05T16:45:00Z',
    partner: 'Farmer Sarah',
    givenItems: [
      { name: 'Radio', quantity: 1 }
    ],
    receivedItems: [
      { name: 'Fresh Vegetables', quantity: 10 },
      { name: 'Dried Meat', quantity: 3 }
    ],
    notes: 'Sarah was grateful for the radio. Generous with her food supplies.'
  }
];

interface TradeLogContextType {
  tradeLog: TradeEntry[];
  selectedEntry: TradeEntry | null;
  addTradeEntry: (entry: Omit<TradeEntry, 'id'>) => void;
  updateTradeEntry: (entryId: string, updates: Partial<TradeEntry>) => void;
  deleteTradeEntry: (entryId: string) => void;
  selectEntry: (entry: TradeEntry | null) => void;
  exportTradeLog: () => string;
}

export const TradeLogContext = createContext<TradeLogContextType>({
  tradeLog: [],
  selectedEntry: null,
  addTradeEntry: () => {},
  updateTradeEntry: () => {},
  deleteTradeEntry: () => {},
  selectEntry: () => {},
  exportTradeLog: () => ''
});

interface TradeLogProviderProps {
  children: ReactNode;
}

export const TradeLogProvider: React.FC<TradeLogProviderProps> = ({ children }) => {
  const [tradeLog, setTradeLog] = useState<TradeEntry[]>(mockTradeLog);
  const [selectedEntry, setSelectedEntry] = useState<TradeEntry | null>(null);
  
  // Load trade log from localStorage on mount
  useEffect(() => {
    const savedTradeLog = localStorage.getItem('survival-trade-log');
    if (savedTradeLog) {
      setTradeLog(JSON.parse(savedTradeLog));
    }
  }, []);
  
  // Save trade log to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('survival-trade-log', JSON.stringify(tradeLog));
  }, [tradeLog]);
  
  // Add a new trade entry
  const addTradeEntry = (entry: Omit<TradeEntry, 'id'>) => {
    const newEntry: TradeEntry = {
      ...entry,
      id: Date.now().toString()
    };
    
    setTradeLog([newEntry, ...tradeLog]);
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
  
  // Export trade log as CSV
  const exportTradeLog = () => {
    const headers = ['Date', 'Partner', 'Given Items', 'Received Items', 'Notes'];
    
    const rows = tradeLog.map(entry => {
      const date = new Date(entry.date).toLocaleString();
      const givenItems = entry.givenItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
      const receivedItems = entry.receivedItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
      
      return [
        date,
        entry.partner,
        givenItems,
        receivedItems,
        entry.notes || ''
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
      selectEntry,
      exportTradeLog
    }}>
      {children}
    </TradeLogContext.Provider>
  );
};