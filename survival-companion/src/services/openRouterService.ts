/**
 * OpenRouter API Service
 * 
 * This service handles communication with the OpenRouter API for AI conversation.
 * It provides methods for sending messages and receiving responses.
 */

// Get API key from environment variables
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Define message interface
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define response interface
export interface OpenRouterResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  object: string;
}

/**
 * Send a message to the OpenRouter API and get a response
 * 
 * @param messages Array of messages in the conversation
 * @param systemPrompt Optional system prompt to guide the AI
 * @returns Promise with the AI's response
 */
export const sendMessage = async (
  messages: Message[],
  systemPrompt: string = 'You are a survival guide in a post-apocalyptic world. Provide practical advice for surviving in harsh conditions. Be direct, resourceful, and slightly hopeful.'
): Promise<string> => {
  try {
    // Add system message if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const messagesWithSystem = hasSystemMessage 
      ? messages 
      : [{ role: 'system', content: systemPrompt }, ...messages];
    
    // Make API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Post-Apocalyptic AI Companion'
      },
      body: JSON.stringify({
        messages: messagesWithSystem,
        model: 'anthropic/claude-3-opus',
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data: OpenRouterResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error sending message to OpenRouter:', error);
    
    // Fallback responses for when the API is unavailable
    const fallbackResponses = [
      "I'm having trouble connecting to my knowledge base. Stay vigilant and conserve your resources until we can communicate properly.",
      "Communication systems are down. Remember the basics: find shelter, secure water, and stay hidden from potential threats.",
      "We're experiencing interference. In the meantime, focus on your immediate surroundings and assess your inventory.",
      "My systems are temporarily offline. Trust your instincts and remember: water, shelter, food, in that order of priority.",
      "I can't access my full capabilities right now. Stay where you are if it's safe, and avoid unnecessary risks until we reconnect."
    ];
    
    // Return a random fallback response
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
};

/**
 * Check if the OpenRouter API is available
 * 
 * @returns Promise<boolean> True if the API is available
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    if (!API_KEY) return false;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Post-Apocalyptic AI Companion'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'anthropic/claude-3-opus',
        max_tokens: 10
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking API availability:', error);
    return false;
  }
};

export default {
  sendMessage,
  checkApiAvailability
};