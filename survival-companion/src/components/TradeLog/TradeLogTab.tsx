import React, { useContext } from 'react';
import { TradeLogContext, TradeEntry } from '../../contexts/TradeLogContext';

const TradeLogTab: React.FC = () => {
  const { tradeLog, selectedEntry, selectEntry, exportTradeLog, deleteTradeEntry, updateTradeEntry } = useContext(TradeLogContext);
  
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
            <button className="button" onClick={() => {
              const csvContent = exportTradeLog();
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'trade-log.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>Export Log</button>
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
                onClick={() => selectEntry(entry)}
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
                <button className="button" onClick={() => {
                  const notes = prompt('Edit notes:', selectedEntry.notes || '');
                  if (notes !== null) {
                    updateTradeEntry(selectedEntry.id, { notes });
                  }
                }}>Edit</button>
                <button
                  className="button"
                  style={{ backgroundColor: 'var(--danger-color)' }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trade entry?')) {
                      deleteTradeEntry(selectedEntry.id);
                    }
                  }}
                >Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeLogTab;