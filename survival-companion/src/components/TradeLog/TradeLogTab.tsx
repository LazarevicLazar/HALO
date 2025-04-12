import React, { useState } from 'react';

interface TradeEntry {
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

const TradeLogTab: React.FC = () => {
  const [tradeLog, setTradeLog] = useState<TradeEntry[]>(mockTradeLog);
  const [selectedEntry, setSelectedEntry] = useState<TradeEntry | null>(null);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="card">
      <h2 className="card-title">Trade Log</h2>
      
      <div className="flex" style={{ gap: '1rem' }}>
        <div style={{ flex: '1' }}>
          <div className="flex justify-between align-center mb-1">
            <h3>Recent Trades</h3>
            <button className="button">Export Log</button>
          </div>
          
          <div className="card" style={{ backgroundColor: 'var(--primary-color)' }}>
            {tradeLog.map(entry => (
              <div 
                key={entry.id} 
                className="card mb-1" 
                style={{ 
                  cursor: 'pointer',
                  borderLeft: selectedEntry?.id === entry.id ? '4px solid var(--accent-color)' : 'none'
                }}
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex justify-between">
                  <h4 style={{ margin: '0' }}>Trade with {entry.partner}</h4>
                  <span className="text-accent">{formatDate(entry.date)}</span>
                </div>
                <div className="flex mt-1" style={{ fontSize: '0.9rem' }}>
                  <div style={{ flex: '1' }}>
                    <p style={{ margin: '0' }}><strong>Given:</strong></p>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {entry.givenItems.map((item, index) => (
                        <li key={index}>{item.name} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ flex: '1' }}>
                    <p style={{ margin: '0' }}><strong>Received:</strong></p>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {entry.receivedItems.map((item, index) => (
                        <li key={index}>{item.name} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedEntry && (
          <div style={{ flex: '1' }}>
            <h3>Trade Details</h3>
            <div className="card" style={{ backgroundColor: 'var(--primary-color)' }}>
              <h4 className="text-accent">Trade with {selectedEntry.partner}</h4>
              <p><strong>Date:</strong> {formatDate(selectedEntry.date)}</p>
              
              <div className="card mb-1">
                <h5 style={{ margin: '0 0 0.5rem 0' }}>Items Given:</h5>
                <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                  {selectedEntry.givenItems.map((item, index) => (
                    <li key={index}>{item.name} (x{item.quantity})</li>
                  ))}
                </ul>
              </div>
              
              <div className="card mb-1">
                <h5 style={{ margin: '0 0 0.5rem 0' }}>Items Received:</h5>
                <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                  {selectedEntry.receivedItems.map((item, index) => (
                    <li key={index}>{item.name} (x{item.quantity})</li>
                  ))}
                </ul>
              </div>
              
              {selectedEntry.notes && (
                <div className="card">
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Notes:</h5>
                  <p style={{ margin: '0' }}>{selectedEntry.notes}</p>
                </div>
              )}
              
              <div className="flex justify-between mt-1">
                <button className="button">Edit</button>
                <button className="button" style={{ backgroundColor: 'var(--danger-color)' }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeLogTab;