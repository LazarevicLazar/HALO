/**
 * OpenRouter Service
 * 
 * This service handles communication with the OpenRouter API for AI conversation.
 * OpenRouter provides access to various large language models.
 */

import apiConfig from '../config/apiConfig';

// Message type for OpenRouter API
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || '';
    this.baseUrl = apiConfig.openRouter.baseUrl;
    this.model = apiConfig.openRouter.defaultModel;
  }
  
  /**
   * Check if the API is available
   * 
   * @returns Promise<boolean> True if API is available
   */
  public async checkApiAvailability(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === 'placeholder_openrouter_key') {
      console.warn('OpenRouter API key not found');
      return false;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking OpenRouter API availability:', error);
      return false;
    }
  }
  
  /**
   * Send a message to the OpenRouter API
   * 
   * @param messages Array of messages in the conversation
   * @returns Promise<string> The AI's response
   */
  public async sendMessage(messages: Message[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'placeholder_openrouter_key') {
      throw new Error('OpenRouter API key not found');
    }
    
    // Add system message if not present
    if (!messages.some(msg => msg.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: `You are a post-apocalyptic AI companion helping the user survive in a harsh world. 
        Your personality is resourceful, gritty, and slightly hopeful - like a battle-worn friend.
        Provide practical survival advice, respond to the user's questions, and help them navigate
        this dangerous world. Keep responses concise and focused on survival.`
      });
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Survival Companion'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to OpenRouter:', error);
      throw error;
    }
  }
}

// Create singleton instance
const openRouterService = new OpenRouterService();

export default openRouterService;