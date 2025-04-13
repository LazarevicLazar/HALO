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
      // Append instructions about avoiding special characters for voice synthesis
      const enhancedPrompt = `${prompt}

IMPORTANT: Do not use special characters like asterisks, underscores, or other markdown formatting in your response as they will be spoken literally by the voice system. Use sentence structure and word choice to convey emphasis instead.`;
      
      const response = await this.chat.sendMessage({
        message: enhancedPrompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error while processing your request.';
    }
  }
  
  /**
   * Generate a streaming response with enhanced chunk processing
   * @param prompt The user's prompt
   * @param onChunk Callback for each text chunk
   * @param onSentence Optional callback for each complete sentence
   * @returns The full response text
   */
  public async generateStreamingResponse(
    prompt: string,
    onChunk: (text: string) => void,
    onSentence?: (sentence: string) => void
  ): Promise<string> {
    try {
      // Append instructions about avoiding special characters for voice synthesis
      const enhancedPrompt = `${prompt}

IMPORTANT: Do not use special characters like asterisks, underscores, or other markdown formatting in your response as they will be spoken literally by the voice system. Use sentence structure and word choice to convey emphasis instead.`;
      
      const stream = await this.chat.sendMessageStream({
        message: enhancedPrompt,
      });
      
      let fullResponse = '';
      let currentSentence = '';
      const sentenceEndRegex = /[.!?]\s*$/;
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        onChunk(chunkText);
        
        // Process sentences if the callback is provided
        if (onSentence) {
          currentSentence += chunkText;
          
          // Check if we have a complete sentence
          if (sentenceEndRegex.test(currentSentence)) {
            onSentence(currentSentence.trim());
            currentSentence = '';
          }
        }
      }
      
      // Handle any remaining text as a sentence
      if (onSentence && currentSentence.trim().length > 0) {
        onSentence(currentSentence.trim());
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Error generating streaming response:', error);
      const errorMessage = 'I apologize, but I encountered an error while processing your request.';
      onChunk(errorMessage);
      if (onSentence) {
        onSentence(errorMessage);
      }
      return errorMessage;
    }
  }
  
  public resetChat(): void {
    this.initializeChat();
  }
}

export default GeminiService.getInstance();