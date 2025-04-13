import React, { createContext, useState, useCallback, ReactNode } from 'react';

// Message interface
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Context type
interface CompanionContextType {
  state: 'idle' | 'thinking' | 'responding';
  messages: Message[];
  sendMessage: (message: string) => void;
  triggerCompanionResponse: (event: string) => Promise<void>;
  clearConversation: () => void;
}

// Create context with default values
export const CompanionContext = createContext<CompanionContextType>({
  state: 'idle',
  messages: [],
  sendMessage: () => {},
  triggerCompanionResponse: async () => {},
  clearConversation: () => {}
});

// Provider component
export const CompanionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Generate a response based on user input
  const getResponse = (message: string): string => {
    // Simple pattern matching for responses
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your assistant. How can I help you today?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can answer questions, provide information, and assist with various tasks. Just let me know what you need help with!";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (lowerMessage.includes('weather')) {
      return "I don't have access to real-time weather data, but I can help you find weather information online or answer other questions.";
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
      return `The current time and date is ${new Date().toLocaleString()}.`;
    }
    
    if (lowerMessage.includes('name')) {
      return "I'm your AI assistant. You can call me Assistant.";
    }
    
    // Default response
    return "I understand. Is there anything specific you'd like to know or discuss?";
  };
  
  // Send a message and get a response
  const sendMessage = useCallback(async (message: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setState('thinking');
    
    // Simulate processing delay
    setTimeout(() => {
      // Generate response
      const responseText = getResponse(message);
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setState('idle');
    }, 500);
  }, []);
  // Clear conversation history
  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Trigger a companion response based on an event
  const triggerCompanionResponse = useCallback(async (event: string) => {
    // Parse the event
    const [eventType, eventData] = event.split(':');
    
    // Check if this is a valid event type we want to respond to
    switch (eventType) {
      case 'inventory_added':
      case 'inventory_removed':
      case 'inventory_updated':
      case 'trade_completed':
      case 'map_marker_added':
        // These are valid events we want to respond to
        break;
      default:
        return; // Don't respond to unknown events
    }
    
    // Generate a simple response based on the event
    const responseText = `I see you've ${eventType.replace('_', ' ')} ${eventData}. That's a good step.`;
    
    // Add assistant message
    const assistantMessage: Message = {
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setState('idle');
  }, []);
  
  
  return (
    <CompanionContext.Provider value={{
      state,
      messages,
      sendMessage,
      clearConversation,
      triggerCompanionResponse
    }}>
      {children}
    </CompanionContext.Provider>
  );
};