import React, { createContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import geminiService from '../services/GeminiService';
import voiceService from '../services/VoiceService';
import { v4 as uuidv4 } from 'uuid';

// Message interface
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  imageData?: string; // Base64 encoded image data
}

// Context type
interface CompanionContextType {
  state: 'idle' | 'thinking' | 'responding';
  messages: Message[];
  sendMessage: (message: string) => void;
  sendImageMessage: (imageData: string) => void; // New function to send image messages
  triggerCompanionResponse: (event: string) => Promise<void>;
  clearConversation: () => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
}

// Create context with default values
export const CompanionContext = createContext<CompanionContextType>({
  state: 'idle',
  messages: [],
  sendMessage: () => {},
  sendImageMessage: () => {}, // Add default implementation
  triggerCompanionResponse: async () => {},
  clearConversation: () => {},
  isVoiceEnabled: false,
  setIsVoiceEnabled: () => {}
});

// Provider component
export const CompanionProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(
    process.env.REACT_APP_ENABLE_VOICE_FEATURES === 'true'
  );
  
  // Track recent events to prevent duplicates
  const recentEventsRef = useRef<Map<string, number>>(new Map());
  
  // Log voice settings on mount
  useEffect(() => {
    console.log('CompanionContext initialized');
    console.log('Voice features enabled in context:', isVoiceEnabled);
    console.log('REACT_APP_ENABLE_VOICE_FEATURES:', process.env.REACT_APP_ENABLE_VOICE_FEATURES);
  }, [isVoiceEnabled]);
  
  // Process TARS responses for optimal voice delivery
  const processTARSResponse = useCallback((text: string): string => {
    // Remove any asterisks or other special characters that might be spoken literally
    let processed = text.replace(/\*/g, '').replace(/\_/g, '');
    
    // Instead of adding line breaks, use proper punctuation that ElevenLabs understands
    
    // Ensure proper pauses after sentences by adding a period if needed
    processed = processed.replace(/([.!?])("|')?(\s*)([A-Z])/g, '$1$2. $4');
    
    // Handle ellipses for hesitation by ensuring proper spacing
    processed = processed.replace(/\.\.\.(\s*)([a-zA-Z])/g, '... $2');
    
    // Handle dashes for interruptions by ensuring proper spacing
    processed = processed.replace(/—(\s*)([a-zA-Z])/g, '— $2');
    
    // Add slight pauses between short, punchy sentences for emphasis using periods
    processed = processed.replace(/\.\s+([\w\s]{1,20}\.)\s+/g, '. $1. ');
    
    // Log the processed text for debugging
    console.log('Processed first-person response:', processed);
    
    return processed;
  }, []);
  
  // Reference to the current streaming message
  const streamingMessageRef = useRef<Message | null>(null);
  
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
    // Generate a single conversation ID for the entire response
    const responseConversationId = `conv_${Date.now()}`;
    console.log('Generated conversation ID for entire response:', responseConversationId);
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setState('thinking');
    
    try {
      // Create a placeholder for the assistant's response
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      // Add the placeholder message
      setMessages(prev => [...prev, assistantMessage]);
      streamingMessageRef.current = assistantMessage;
      
      setState('responding');
      
      // Stop any previous speech
      if (isVoiceEnabled) {
        voiceService.stopSpeaking();
      }
      
      // Generate streaming response with sentence-level processing for voice
      await geminiService.generateStreamingResponse(
        message,
        // Handle each text chunk for display
        (chunkText) => {
          // Update the streaming message with each chunk
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastIndex = updatedMessages.length - 1;
            
            if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: updatedMessages[lastIndex].content + chunkText
              };
            }
            
            return updatedMessages;
          });
        },
        // Handle each complete sentence for voice with WebSocket-based streaming
        isVoiceEnabled ? (sentence) => {
          // Use the same conversation ID for all sentences in this response
          // This ensures they're treated as part of the same conversation
          
          // Use the optimized WebSocket-based streaming for real-time speech
          if (sentence.trim().length > 0) {
            console.log('Streaming sentence with conversation ID:', responseConversationId);
            // Process the sentence for optimal TARS voice delivery
            const processedSentence = processTARSResponse(sentence);
            voiceService.streamSentence(processedSentence, responseConversationId);
          }
        } : undefined
      );
      
      // Mark the message as no longer streaming
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        
        if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            isStreaming: false
          };
        }
        
        return updatedMessages;
      });
      
      streamingMessageRef.current = null;
      
      setState('idle');
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => {
        // Remove the streaming message if it exists
        const filteredMessages = prev.filter(msg => !msg.isStreaming);
        return [...filteredMessages, errorMessage];
      });
      
      streamingMessageRef.current = null;
      setState('idle');
    }
  }, [isVoiceEnabled]);
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
    
    // Create a unique key for this event type + data combination
    const eventKey = `${eventType}:${eventData}`;
    
    // Check if this exact event was triggered recently (within 1 second)
    const now = Date.now();
    const lastTriggered = recentEventsRef.current.get(eventKey);
    
    if (lastTriggered && now - lastTriggered < 1000) {
      console.log(`Skipping duplicate event triggered too quickly: ${eventKey}`);
      return;
    }
    
    // Update the last triggered time for this event
    recentEventsRef.current.set(eventKey, now);
    
    // Clean up old events (older than 5 seconds)
    recentEventsRef.current.forEach((timestamp, key) => {
      if (now - timestamp > 5000) {
        recentEventsRef.current.delete(key);
      }
    });
    
    setState('thinking');
    
    try {
      // Generate a prompt based on the event
      const prompt = `The user has ${eventType.replace('_', ' ')} ${eventData}. Provide a brief, helpful response about this action in the context of a post-apocalyptic survival scenario.`;
      
      // Create a placeholder for the assistant's response
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      // Add the placeholder message
      setMessages(prev => [...prev, assistantMessage]);
      streamingMessageRef.current = assistantMessage;
      
      setState('responding');
      
      // Stop any previous speech
      if (isVoiceEnabled) {
        voiceService.stopSpeaking();
      }
      
      // Generate streaming response with sentence-level processing for voice
      await geminiService.generateStreamingResponse(
        prompt,
        // Handle each text chunk for display
        (chunkText) => {
          // Update the streaming message with each chunk
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastIndex = updatedMessages.length - 1;
            
            if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: updatedMessages[lastIndex].content + chunkText
              };
            }
            
            return updatedMessages;
          });
        },
        // Handle each complete sentence for voice with WebSocket-based streaming
        isVoiceEnabled ? (sentence) => {
          // Generate a single conversation ID for the entire event response
          // Use a UUID instead of timestamp to ensure uniqueness
          const eventConversationId = `conv_${uuidv4()}_event_${eventType}`;
          
          // Use the optimized WebSocket-based streaming for real-time speech
          if (sentence.trim().length > 0) {
            console.log('Streaming event sentence with conversation ID:', eventConversationId);
            // Process the sentence for optimal TARS voice delivery
            const processedSentence = processTARSResponse(sentence);
            voiceService.streamSentence(processedSentence, eventConversationId);
          }
        } : undefined
      );
      
      // Mark the message as no longer streaming
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        
        if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            isStreaming: false
          };
        }
        
        return updatedMessages;
      });
      
      streamingMessageRef.current = null;
      
      setState('idle');
    } catch (error) {
      console.error('Error generating event response:', error);
      
      // Add error message if needed
      if (streamingMessageRef.current) {
        setMessages(prev => {
          // Remove the streaming message
          const filteredMessages = prev.filter(msg => !msg.isStreaming);
          return [...filteredMessages, {
            role: 'assistant',
            content: 'I apologize, but I encountered an error while processing this event.',
            timestamp: new Date().toISOString()
          }];
        });
        
        streamingMessageRef.current = null;
      }
      
      setState('idle');
    }
  }, [isVoiceEnabled]);
  
  
  // Toggle voice features
  const handleSetIsVoiceEnabled = useCallback((enabled: boolean) => {
    console.log('Setting voice enabled to:', enabled);
    setIsVoiceEnabled(enabled);
    if (!enabled) {
      console.log('Voice disabled, stopping speech');
      voiceService.stopSpeaking();
    } else {
      console.log('Voice enabled');
    }
  }, []);
  
  // Send an image message and get a response
  const sendImageMessage = useCallback(async (imageData: string) => {
    console.log('Sending image message...');
    
    // Add user message with image
    const userMessage: Message = {
      role: 'user',
      content: 'Image captured',
      timestamp: new Date().toISOString(),
      imageData: imageData
    };
    
    setMessages(prev => [...prev, userMessage]);
    setState('thinking');
    
    try {
      // Create a placeholder for the assistant's response
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      // Add the placeholder message
      setMessages(prev => [...prev, assistantMessage]);
      streamingMessageRef.current = assistantMessage;
      
      setState('responding');
      
      // Stop any previous speech
      if (isVoiceEnabled) {
        voiceService.stopSpeaking();
      }
      
      // Generate streaming response with sentence-level processing for voice
      await geminiService.analyzeImage(
        imageData,
        // Handle each text chunk for display
        (chunkText) => {
          // Update the streaming message with each chunk
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastIndex = updatedMessages.length - 1;
            
            if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: updatedMessages[lastIndex].content + chunkText
              };
            }
            
            return updatedMessages;
          });
        },
        // Handle each complete sentence for voice with WebSocket-based streaming
        isVoiceEnabled ? (sentence) => {
          // Generate a single conversation ID for the entire image analysis
          // Use a UUID instead of timestamp to ensure uniqueness
          const imageConversationId = `conv_${uuidv4()}_image`;
          
          // Use the optimized WebSocket-based streaming for real-time speech
          if (sentence.trim().length > 0) {
            console.log('IMAGE ANALYSIS: Streaming sentence with conversation ID:', imageConversationId);
            console.log('IMAGE ANALYSIS: Sentence content:', sentence);
            console.log('IMAGE ANALYSIS: Voice enabled:', isVoiceEnabled);
            
            // Process the sentence for optimal TARS voice delivery
            const processedSentence = processTARSResponse(sentence);
            console.log('IMAGE ANALYSIS: Processed sentence:', processedSentence);
            
            // Stream the sentence
            voiceService.streamSentence(processedSentence, imageConversationId);
          }
        } : undefined
      );
      
      // Mark the message as no longer streaming
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;
        
        if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            isStreaming: false
          };
        }
        
        return updatedMessages;
      });
      
      streamingMessageRef.current = null;
      
      setState('idle');
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while analyzing the image.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => {
        // Remove the streaming message if it exists
        const filteredMessages = prev.filter(msg => !msg.isStreaming);
        return [...filteredMessages, errorMessage];
      });
      
      streamingMessageRef.current = null;
      setState('idle');
    }
  }, [isVoiceEnabled, processTARSResponse]);
  
  return (
    <CompanionContext.Provider value={{
      state,
      messages,
      sendMessage,
      sendImageMessage,
      clearConversation,
      triggerCompanionResponse,
      isVoiceEnabled,
      setIsVoiceEnabled: handleSetIsVoiceEnabled
    }}>
      {children}
    </CompanionContext.Provider>
  );
};