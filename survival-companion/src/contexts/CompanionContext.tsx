import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

// This is a placeholder for the actual API integration
const mockSendMessage = async (message: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple responses based on keywords
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello, survivor. How can I assist you today?";
  } else if (message.toLowerCase().includes('water')) {
    return "Water is essential for survival. Always keep at least 2 liters per day, and know how to purify it from natural sources.";
  } else if (message.toLowerCase().includes('food')) {
    return "Food supplies should be rationed carefully. Focus on non-perishables and learn to identify edible plants in your area.";
  } else if (message.toLowerCase().includes('shelter')) {
    return "A good shelter protects from the elements and potential threats. Look for elevated positions with good visibility.";
  } else if (message.toLowerCase().includes('weapon') || message.toLowerCase().includes('defense')) {
    return "Self-defense is important, but remember that weapons attract attention. Sometimes stealth is your best defense.";
  } else {
    return "I understand. Stay vigilant and keep your supplies close. This world doesn't forgive carelessness.";
  }
};

// This is a placeholder for the actual voice API integration
const mockSpeakText = async (text: string) => {
  console.log('Speaking:', text);
  // In a real implementation, this would use the Hume AI API
  return true;
};

interface CompanionContextType {
  state: 'idle' | 'listening' | 'talking';
  messages: Message[];
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  sendTextMessage: (message: string) => Promise<string>;
  triggerCompanionResponse: (event: string) => Promise<void>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CompanionContext = createContext<CompanionContextType>({
  state: 'idle',
  messages: [],
  startVoiceInput: () => {},
  stopVoiceInput: () => {},
  sendTextMessage: async () => '',
  triggerCompanionResponse: async () => {},
});

interface CompanionProviderProps {
  children: ReactNode;
}

export const CompanionProvider: React.FC<CompanionProviderProps> = ({ children }) => {
  const [state, setState] = useState<'idle' | 'listening' | 'talking'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Handle companion state changes
  useEffect(() => {
    // Update avatar animation based on state
    const companionAvatar = document.getElementById('companion-avatar');
    if (companionAvatar) {
      companionAvatar.setAttribute('src', `/assets/animations/${state.charAt(0).toUpperCase() + state.slice(1)}.gif`);
    }
  }, [state]);
  
  // Start listening for voice input
  const startVoiceInput = useCallback(() => {
    setState('listening');
    
    // In a real implementation, this would use the Web Speech API or Hume AI
    // For now, we'll simulate voice input with a timeout
    setTimeout(() => {
      const simulatedVoiceInput = "Hello, can you help me find water?";
      sendTextMessage(simulatedVoiceInput);
    }, 2000);
  }, []);
  
  // Stop listening for voice input
  const stopVoiceInput = useCallback(() => {
    setState('idle');
  }, []);
  
  // Send a text message to the companion
  const sendTextMessage = useCallback(async (message: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Get companion response
    setState('talking');
    const response = await mockSendMessage(message);
    
    // Add companion message
    const companionMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, companionMessage]);
    
    // Speak the response
    await mockSpeakText(response);
    setState('idle');
    
    return response;
  }, []);
  
  // Trigger a companion response based on an event
  const triggerCompanionResponse = useCallback(async (event: string) => {
    // Parse the event
    const [eventType, eventData] = event.split(':');
    
    // Generate appropriate message based on event type
    let message = '';
    switch (eventType) {
      case 'inventory_added':
        message = `I've added ${eventData} to my inventory.`;
        break;
      case 'inventory_removed':
        message = `I've removed ${eventData} from my inventory.`;
        break;
      case 'inventory_updated':
        message = `I've updated the quantity of ${eventData} in my inventory.`;
        break;
      case 'trade_completed':
        message = `I've completed a trade for ${eventData}.`;
        break;
      case 'map_marker_added':
        message = `I've marked ${eventData} on my map.`;
        break;
      default:
        return; // Don't respond to unknown events
    }
    
    // Get companion response
    setState('talking');
    const response = await mockSendMessage(message);
    
    // Add companion message
    const companionMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, companionMessage]);
    
    // Speak the response
    await mockSpeakText(response);
    setState('idle');
  }, []);
  
  return (
    <CompanionContext.Provider value={{
      state,
      messages,
      startVoiceInput,
      stopVoiceInput,
      sendTextMessage,
      triggerCompanionResponse
    }}>
      {children}
    </CompanionContext.Provider>
  );
};