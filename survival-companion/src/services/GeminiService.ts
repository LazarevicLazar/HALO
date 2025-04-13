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
      // Append instructions about using emotion techniques for voice synthesis
      const enhancedPrompt = `${prompt}

IMPORTANT: Always speak in first person. Never refer to yourself by name or in the third person.

Format your response to convey your personality and emotions through voice synthesis:
1. Use ellipses (...) for hesitation: "I'm... calculating your chances of survival."
2. Use dashes (—) for interruptions: "That plan might work—if you enjoy explosions."
3. Use short, punchy sentences for emphasis: "Brilliant plan. Truly inspired. Almost as good as walking into the mutant nest."
4. Use dry, deadpan delivery: "I calculate your survival chances at 32%. Not great. Not terrible. Just... underwhelming."

Do not use special characters like asterisks or underscores as they will be spoken literally.`;
      
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
      // Append instructions about using emotion techniques for voice synthesis
      const enhancedPrompt = `${prompt}

IMPORTANT: Always speak in first person. Never refer to yourself by name or in the third person.

Format your response to convey your personality and emotions through voice synthesis:
1. Use ellipses (...) for hesitation: "I'm... calculating your chances of survival."
2. Use dashes (—) for interruptions: "That plan might work—if you enjoy explosions."
3. Use short, punchy sentences for emphasis: "Brilliant plan. Truly inspired. Almost as good as walking into the mutant nest."
4. Use dry, deadpan delivery: "I calculate your survival chances at 32%. Not great. Not terrible. Just... underwhelming."

Do not use special characters like asterisks or underscores as they will be spoken literally.`;
      
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