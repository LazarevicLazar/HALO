import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import openRouterService from '../services/openRouterService';
import speechService from '../services/speechService';

// Fallback function when API is unavailable
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

interface CompanionContextType {
  state: 'idle' | 'listening' | 'talking';
  messages: Message[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
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
  selectedVoice: 'rugged-male',
  setSelectedVoice: () => {},
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
  const [selectedVoice, setSelectedVoice] = useState<string>('rugged-male');
  
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
    
    // Use Web Speech API for voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input:', transcript);
        sendTextMessage(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setState('idle');
      };
      
      recognition.onend = () => {
        // Only set to idle if we're still in listening state
        // (prevents overriding the 'talking' state if we got a result)
        if (state === 'listening') {
          setState('idle');
        }
      };
      
      recognition.start();
    } else {
      console.warn('Speech recognition not supported in this browser');
      // Fallback to simulated input for browsers without speech recognition
      setTimeout(() => {
        const simulatedVoiceInput = "Hello, can you help me find water?";
        sendTextMessage(simulatedVoiceInput);
      }, 2000);
    }
  }, [state]);
  
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
    
    // Try to use OpenRouter API, fall back to mock if unavailable
    let response: string;
    try {
      // Check if API key is available
      const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
      if (!apiKey || apiKey === 'placeholder_openrouter_key') {
        throw new Error('OpenRouter API key not found');
      }
      
      // Create conversation history for context
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add user's new message
      conversationHistory.push({
        role: 'user',
        content: message
      });
      
      // Send to OpenRouter API
      response = await openRouterService.sendMessage(conversationHistory);
    } catch (error) {
      console.warn('Error using OpenRouter API, falling back to mock responses:', error);
      response = await mockSendMessage(message);
    }
    
    // Add companion message
    const companionMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, companionMessage]);
    // Determine emotion based on message content
    let emotion: string = 'neutral';
    if (response.toLowerCase().includes('danger') || response.toLowerCase().includes('threat') ||
        response.toLowerCase().includes('caution') || response.toLowerCase().includes('warning')) {
      emotion = 'fearful';
    } else if (response.toLowerCase().includes('good') || response.toLowerCase().includes('excellent') ||
               response.toLowerCase().includes('perfect') || response.toLowerCase().includes('well done')) {
      emotion = 'happy';
    } else if (response.toLowerCase().includes('sorry') || response.toLowerCase().includes('unfortunate') ||
               response.toLowerCase().includes('difficult')) {
      emotion = 'sad';
    }
    
    // Speak the response with appropriate emotion
    await speechService.speakText(response, emotion as any, selectedVoice as any);
    setState('idle');
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
    
    // Try to use OpenRouter API, fall back to mock if unavailable
    let response: string;
    try {
      // Check if API key is available
      const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
      if (!apiKey || apiKey === 'placeholder_openrouter_key') {
        throw new Error('OpenRouter API key not found');
      }
      
      // Create a system message explaining the event
      const systemMessage = {
        role: 'system' as const,
        content: `The user has performed an action in the survival app: ${eventType.replace('_', ' ')} - ${eventData}. Respond as a helpful survival companion with relevant advice about this action.`
      };
      
      // Send to OpenRouter API with just the system message and event
      response = await openRouterService.sendMessage([
        systemMessage,
        { role: 'user' as const, content: message }
      ]);
    } catch (error) {
      console.warn('Error using OpenRouter API, falling back to mock responses:', error);
      response = await mockSendMessage(message);
    }
    
    // Add companion message
    const companionMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, companionMessage]);
    // Determine emotion based on message content
    let emotion: string = 'neutral';
    if (message.toLowerCase().includes('danger') || message.toLowerCase().includes('threat')) {
      emotion = 'fearful';
    } else if (message.toLowerCase().includes('food') || message.toLowerCase().includes('water')) {
      emotion = 'neutral';
    } else if (message.toLowerCase().includes('trade') || message.toLowerCase().includes('barter')) {
      emotion = 'happy';
    }
    
    // Speak the response with appropriate emotion
    await speechService.speakText(response, emotion as any, selectedVoice as any);
    setState('idle');
  }, []);
  
  return (
    <CompanionContext.Provider value={{
      state,
      messages,
      selectedVoice,
      setSelectedVoice,
      startVoiceInput,
      stopVoiceInput,
      sendTextMessage,
      triggerCompanionResponse
    }}>
      {children}
    </CompanionContext.Provider>
  );
};