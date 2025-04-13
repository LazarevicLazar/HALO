# Updated Gemini API Integration Plan

## Overview

Based on the Gemini API documentation provided, I'm updating the integration plan to use the official Google GenAI JavaScript SDK for integrating the Gemini 2.0 Flash model with the Survival Companion application.

## Implementation Details

### 1. Install Required Dependencies

First, we need to install the Google GenAI SDK:

```bash
cd survival-companion
npm install @google/genai
```

### 2. Update API Configuration

Update the `apiConfig.ts` file to include the correct Gemini configuration:

```typescript
// Configuration file for API keys and settings
// This file should be git ignored to prevent exposing sensitive information

const apiConfig = {
  openRouter: {
    apiKey: process.env.REACT_APP_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3-opus'
  },
  elevenLabs: {
    apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY',
    baseUrl: 'https://api.elevenlabs.io/v1',
    defaultVoice: 'JBFqnCBsd6RMkjVDRZzb', // Voice ID from the documentation
    textToSpeech: {
      streamEndpoint: '/text-to-speech/:voice_id/stream',
      defaultModel: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128'
    }
  },
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxOutputTokens: 1024,
    topK: 40,
    topP: 0.95,
    systemInstruction: "You are a helpful AI assistant in a post-apocalyptic world. Your name is Companion. You help survivors with information, advice, and emotional support. You're knowledgeable about survival tactics, resource management, and navigating dangerous situations."
  },
  openStreetMap: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    center: [
      parseFloat(process.env.REACT_APP_MAP_DEFAULT_LAT || '28.0587'),
      parseFloat(process.env.REACT_APP_MAP_DEFAULT_LNG || '-82.4139')
    ] as [number, number],
    defaultZoom: parseInt(process.env.REACT_APP_MAP_DEFAULT_ZOOM || '15', 10)
  }
};

export default apiConfig;
```

### 3. Create Gemini Service

Create a new service to handle interactions with the Gemini API using the official SDK:

```typescript
// src/services/GeminiService.ts
import { GoogleGenAI } from "@google/genai";
import apiConfig from '../config/apiConfig';

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenAI;
  private chat: any; // Will be initialized with the chat instance
  
  private constructor() {
    this.genAI = new GoogleGenAI({ apiKey: apiConfig.gemini.apiKey });
    this.initializeChat();
  }
  
  private initializeChat() {
    this.chat = this.genAI.chats.create({
      model: apiConfig.gemini.model,
      config: {
        temperature: apiConfig.gemini.temperature,
        maxOutputTokens: apiConfig.gemini.maxOutputTokens,
        topK: apiConfig.gemini.topK,
        topP: apiConfig.gemini.topP,
        systemInstruction: apiConfig.gemini.systemInstruction,
      },
      history: [] // Start with an empty history
    });
  }
  
  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }
  
  public async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.chat.sendMessage({
        message: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error while processing your request.';
    }
  }
  
  public async generateStreamingResponse(prompt: string, onChunk: (text: string) => void): Promise<string> {
    try {
      const stream = await this.chat.sendMessageStream({
        message: prompt,
      });
      
      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        onChunk(chunkText);
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error generating streaming response:', error);
      const errorMessage = 'I apologize, but I encountered an error while processing your request.';
      onChunk(errorMessage);
      return errorMessage;
    }
  }
  
  public resetChat(): void {
    this.initializeChat();
  }
}

export default GeminiService.getInstance();
```

### 4. Create Voice Service

Create a service to handle text-to-speech conversion using the ElevenLabs API:

```typescript
// src/services/VoiceService.ts
import apiConfig from '../config/apiConfig';

export class VoiceService {
  private static instance: VoiceService;
  private audio: HTMLAudioElement | null = null;
  
  private constructor() {}
  
  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }
  
  public async speakText(text: string): Promise<void> {
    if (process.env.REACT_APP_ENABLE_VOICE_FEATURES !== 'true') {
      console.log('Voice features are disabled');
      return;
    }
    
    try {
      const response = await this.convertTextToSpeech(text);
      await this.playAudio(response);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }
  
  private async convertTextToSpeech(text: string): Promise<Blob> {
    const voiceId = apiConfig.elevenLabs.defaultVoice;
    const url = `${apiConfig.elevenLabs.baseUrl}/text-to-speech/${voiceId}/stream`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiConfig.elevenLabs.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: apiConfig.elevenLabs.textToSpeech.defaultModel,
        output_format: apiConfig.elevenLabs.textToSpeech.outputFormat
      })
    });
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }
    
    return await response.blob();
  }
  
  private async playAudio(audioBlob: Blob): Promise<void> {
    // Stop any currently playing audio
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    // Create a new audio element
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audio = new Audio(audioUrl);
    
    // Play the audio
    return new Promise((resolve, reject) => {
      if (!this.audio) return reject('Audio not initialized');
      
      this.audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      this.audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      this.audio.play().catch(reject);
    });
  }
  
  public stopSpeaking(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
}

export default VoiceService.getInstance();
```

### 5. Update CompanionContext

Modify the CompanionContext to use both the GeminiService and VoiceService:

```typescript
// src/contexts/CompanionContext.tsx
import React, { createContext, useState, useCallback, ReactNode, useRef } from 'react';
import geminiService from '../services/GeminiService';
import voiceService from '../services/VoiceService';

// Message interface
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

// Context type
interface CompanionContextType {
  state: 'idle' | 'thinking' | 'responding';
  messages: Message[];
  sendMessage: (message: string) => void;
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
  
  // Reference to the current streaming message
  const streamingMessageRef = useRef<Message | null>(null);
  
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
      
      // Generate streaming response
      const fullResponse = await geminiService.generateStreamingResponse(
        message,
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
        }
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
      
      // Speak the response if voice features are enabled
      if (isVoiceEnabled) {
        try {
          await voiceService.speakText(fullResponse);
        } catch (error) {
          console.error('Error speaking response:', error);
        }
      }
      
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
    geminiService.resetChat();
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
      
      // Generate streaming response
      const fullResponse = await geminiService.generateStreamingResponse(
        prompt,
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
        }
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
      
      // Speak the response if voice features are enabled
      if (isVoiceEnabled) {
        try {
          await voiceService.speakText(fullResponse);
        } catch (error) {
          console.error('Error speaking response:', error);
        }
      }
      
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
    setIsVoiceEnabled(enabled);
    if (!enabled) {
      voiceService.stopSpeaking();
    }
  }, []);
  
  return (
    <CompanionContext.Provider value={{
      state,
      messages,
      sendMessage,
      clearConversation,
      triggerCompanionResponse,
      isVoiceEnabled,
      setIsVoiceEnabled: handleSetIsVoiceEnabled
    }}>
      {children}
    </CompanionContext.Provider>
  );
};
```

### 6. Update CompanionTab Component

Modify the CompanionTab component to include voice controls:

```tsx
// src/components/Companion/CompanionTab.tsx
import React, { useState, useContext } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';
import CompanionAvatar from './CompanionAvatar';
import MessageList from './MessageList';
import TextInput from './TextInput';
import AssistantInfo from './AssistantInfo';

const CompanionTab: React.FC = () => {
  const { state, isVoiceEnabled, setIsVoiceEnabled } = useContext(CompanionContext);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle voice features
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };
  
  return (
    <div className="card">
      <h2 className="card-title">AI Assistant</h2>
      
      {error && (
        <div className="alert alert-danger" style={{
          backgroundColor: 'var(--danger-color)',
          color: 'var(--text-color)',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <div className="flex" style={{ gap: '1rem' }}>
        <div className="companion-sidebar" style={{ flex: '0 0 200px' }}>
          <CompanionAvatar size="medium" showStatus={true} />
          
          <div className="companion-status mt-1" style={{
            padding: '0.5rem',
            backgroundColor: 'var(--primary-color)',
            borderRadius: '4px',
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            <p>Status: <span className="text-accent">{state.charAt(0).toUpperCase() + state.slice(1)}</span></p>
            
            <button
              className="button mt-1"
              onClick={toggleVoice}
              style={{
                backgroundColor: isVoiceEnabled ? 'var(--accent-color)' : 'var(--primary-color)',
                border: isVoiceEnabled ? 'none' : '1px solid var(--border-color)',
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                width: '100%'
              }}
            >
              {isVoiceEnabled ? 'Voice: ON' : 'Voice: OFF'}
            </button>
          </div>
        </div>
        
        <div className="companion-main" style={{ flex: '1' }}>
          <MessageList maxHeight="350px" />
          
          <div className="mt-1">
            <TextInput />
          </div>
          
          <div className="mt-1">
            <AssistantInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanionTab;
```

### 7. Update MessageList Component

Update the MessageList component to handle streaming messages:

```tsx
// src/components/Companion/MessageList.tsx
import React, { useContext, useEffect, useRef } from 'react';
import { CompanionContext, Message } from '../../contexts/CompanionContext';

interface MessageListProps {
  maxHeight?: string;
}

const MessageList: React.FC<MessageListProps> = ({ maxHeight = '300px' }) => {
  const { messages } = useContext(CompanionContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Render message content with streaming indicator if needed
  const renderMessageContent = (message: Message) => {
    if (message.isStreaming) {
      return (
        <>
          {message.content}
          <span className="streaming-indicator">▋</span>
          <style jsx>{`
            @keyframes blink {
              0% { opacity: 1; }
              50% { opacity: 0; }
              100% { opacity: 1; }
            }
            .streaming-indicator {
              display: inline-block;
              animation: blink 1s infinite;
              margin-left: 2px;
            }
          `}</style>
        </>
      );
    }
    return message.content;
  };
  
  return (
    <div 
      className="message-list"
      style={{
        maxHeight,
        overflowY: 'auto',
        padding: '0.5rem',
        backgroundColor: 'var(--primary-color)',
        borderRadius: '4px',
        border: '1px solid var(--border-color)'
      }}
    >
      {messages.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <div 
            key={index}
            className={`message ${message.role}`}
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem',
              borderRadius: '4px',
              backgroundColor: message.role === 'user' ? 'var(--accent-color-light)' : 'var(--secondary-color)',
              maxWidth: '80%',
              marginLeft: message.role === 'user' ? 'auto' : '0'
            }}
          >
            <div className="message-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              <span>{message.role === 'user' ? 'You' : 'Assistant'}</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            <div className="message-content">
              {renderMessageContent(message)}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
```

## Implementation Steps

1. First, fix the `apiConfig.ts` file to resolve the current errors
2. Install the Google GenAI SDK
3. Create the GeminiService and VoiceService
4. Update the CompanionContext to use both services
5. Update the CompanionTab and MessageList components
6. Test the integration

## Conclusion

This updated plan leverages the official Google GenAI SDK to integrate the Gemini 2.0 Flash model with the Survival Companion application. The integration includes:

1. Text generation using the Gemini API
2. Streaming responses for a more interactive experience
3. Text-to-speech conversion using the ElevenLabs API
4. Voice controls in the UI

The result will be a more immersive and interactive experience for users of the application.