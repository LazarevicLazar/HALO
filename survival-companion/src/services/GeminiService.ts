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

  /**
   * Analyze an image using Gemini Vision capabilities
   * @param imageData Base64 encoded image data
   * @param onChunk Callback for each text chunk
   * @param onSentence Optional callback for each complete sentence
   * @returns The full response text
   */
  public async analyzeImage(
    imageData: string, // Base64 encoded image data
    onChunk: (text: string) => void,
    onSentence?: (sentence: string) => void
  ): Promise<string> {
    try {
      console.log('Analyzing image with Gemini Vision...');
      
      // Create a prompt that instructs Gemini how to analyze the image
      const prompt = `
        Analyze this image from a post-apocalyptic survival perspective.
        Describe what you see and provide any relevant survival insights.
        
        IMPORTANT: Always speak in first person. Never refer to yourself by name or in the third person.
        
        Format your response to convey your personality and emotions through voice synthesis:
        1. Use ellipses (...) for hesitation: "I'm... calculating your chances of survival."
        2. Use dashes (—) for interruptions: "That plan might work—if you enjoy explosions."
        3. Use short, punchy sentences for emphasis: "Brilliant plan. Truly inspired. Almost as good as walking into the mutant nest."
        4. Use dry, deadpan delivery: "I calculate your survival chances at 32%. Not great. Not terrible. Just... underwhelming."
        
        Do not use special characters like asterisks or underscores as they will be spoken literally.
      `;

      // Extract the base64 data from the data URL
      const base64Data = imageData.split(',')[1];
      console.log('Image data extracted, length:', base64Data.length);

      // Create a parts array with the text prompt and image data
      const parts = [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ];
      // Use the Gemini API to analyze the image
      console.log('Creating temporary chat instance for image analysis...');

      // Create a temporary chat instance for image analysis
      const imageChat = this.genAI.chats.create({
        model: apiConfig.gemini.model,
        config: {
          temperature: apiConfig.gemini.temperature,
          maxOutputTokens: apiConfig.gemini.maxOutputTokens,
          topK: apiConfig.gemini.topK,
          topP: apiConfig.gemini.topP,
        }
      });

      console.log('Sending message with image data...');
      const stream = await imageChat.sendMessageStream({
        message: parts
      });

      // Process the streaming response
      let fullResponse = '';
      let currentSentence = '';
      const sentenceEndRegex = /[.!?]\s*$/;

      console.log('Processing response stream...');
      for await (const chunk of stream) {
        // Handle potential undefined text
        const chunkText = chunk.text || '';
        fullResponse += chunkText;
        console.log('IMAGE ANALYSIS: Received chunk:', chunkText);
        onChunk(chunkText);
        
        // Process sentences if the callback is provided
        if (onSentence) {
          console.log('IMAGE ANALYSIS: onSentence callback is provided');
          currentSentence += chunkText;
          console.log('IMAGE ANALYSIS: Current sentence buffer:', currentSentence);
          
          // Check if we have a complete sentence
          if (sentenceEndRegex.test(currentSentence)) {
            console.log('IMAGE ANALYSIS: Complete sentence detected:', currentSentence.trim());
            console.log('IMAGE ANALYSIS: Calling onSentence callback');
            onSentence(currentSentence.trim());
            currentSentence = '';
          }
        } else {
          console.log('IMAGE ANALYSIS: No onSentence callback provided');
        }
      }
      
      // Handle any remaining text as a sentence
      if (onSentence && currentSentence.trim().length > 0) {
        console.log('IMAGE ANALYSIS: Processing remaining text as sentence:', currentSentence.trim());
        console.log('IMAGE ANALYSIS: Calling onSentence callback with remaining text');
        onSentence(currentSentence.trim());
      } else if (currentSentence.trim().length > 0) {
        console.log('IMAGE ANALYSIS: Remaining text exists but no onSentence callback provided:', currentSentence.trim());
      }
      
      console.log('IMAGE ANALYSIS: Complete, response length:', fullResponse.length);
      return fullResponse;
    } catch (error) {
      console.error('IMAGE ANALYSIS ERROR:', error);
      console.log('IMAGE ANALYSIS ERROR type:', error instanceof Error ? error.name : typeof error);
      console.log('IMAGE ANALYSIS ERROR message:', error instanceof Error ? error.message : String(error));
      
      const errorMessage = 'I apologize, but I encountered an error while analyzing the image.';
      console.log('IMAGE ANALYSIS: Sending error message to onChunk callback');
      onChunk(errorMessage);
      
      if (onSentence) {
        console.log('IMAGE ANALYSIS: Sending error message to onSentence callback');
        onSentence(errorMessage);
      } else {
        console.log('IMAGE ANALYSIS: No onSentence callback provided for error message');
      }
      
      return errorMessage;
    }
  }
}

export default GeminiService.getInstance();