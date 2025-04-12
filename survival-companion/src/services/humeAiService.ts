/**
 * Hume AI Service
 * 
 * This service handles communication with the Hume AI API for voice and emotion features.
 * Hume AI provides voice synthesis, speech recognition, and emotion recognition.
 */

import apiConfig from '../config/apiConfig';

// Emotion types
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

// Voice types
export type VoiceType = 'rugged-male' | 'calm-female' | 'energetic-male' | 'soothing-female';

class HumeAiService {
  private apiKey: string;
  private baseUrl: string;
  private defaultVoice: string;
  
  constructor() {
    this.apiKey = process.env.REACT_APP_HUME_AI_API_KEY || '';
    this.baseUrl = apiConfig.humeAI.baseUrl;
    this.defaultVoice = apiConfig.humeAI.defaultVoice;
  }
  
  /**
   * Check if the API is available
   * 
   * @returns Promise<boolean> True if API is available
   */
  public async checkApiAvailability(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === 'placeholder_hume_ai_key') {
      console.warn('Hume AI API key not found');
      return false;
    }
    
    try {
      // Simple request to check if API is accessible
      const response = await fetch(`${this.baseUrl}/prosody/voices`, {
        method: 'GET',
        headers: {
          'X-Hume-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking Hume AI API availability:', error);
      return false;
    }
  }
  
  /**
   * Convert text to speech using Hume AI
   * 
   * @param text Text to convert to speech
   * @param voice Voice type to use
   * @param emotion Emotion to express in the voice
   * @returns Promise<string> URL to the audio file
   */
  public async textToSpeech(
    text: string, 
    voice: VoiceType = 'rugged-male', 
    emotion: EmotionType = 'neutral'
  ): Promise<string> {
    if (!this.apiKey || this.apiKey === 'placeholder_hume_ai_key') {
      throw new Error('Hume AI API key not found');
    }
    
    try {
      // Map our voice types to Hume AI voice IDs
      const voiceId = this.mapVoiceToHumeId(voice);
      
      // Map our emotion types to Hume AI prosody settings
      const prosodySettings = this.getEmotionProsodySettings(emotion);
      
      const response = await fetch(`${this.baseUrl}/prosody/speech`, {
        method: 'POST',
        headers: {
          'X-Hume-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          prosody: prosodySettings
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Hume AI API error: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      return data.audio_url;
    } catch (error) {
      console.error('Error converting text to speech with Hume AI:', error);
      throw error;
    }
  }
  
  /**
   * Convert speech to text using Hume AI
   * 
   * @param audioBlob Audio blob to convert to text
   * @returns Promise<string> Transcribed text
   */
  public async speechToText(audioBlob: Blob): Promise<string> {
    if (!this.apiKey || this.apiKey === 'placeholder_hume_ai_key') {
      throw new Error('Hume AI API key not found');
    }
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      
      const response = await fetch(`${this.baseUrl}/speech/transcriptions`, {
        method: 'POST',
        headers: {
          'X-Hume-Api-Key': this.apiKey
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Hume AI API error: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error converting speech to text with Hume AI:', error);
      throw error;
    }
  }
  
  /**
   * Recognize emotion in speech
   * 
   * @param audioBlob Audio blob to analyze
   * @returns Promise<EmotionType> Detected emotion
   */
  public async recognizeEmotion(audioBlob: Blob): Promise<EmotionType> {
    if (!this.apiKey || this.apiKey === 'placeholder_hume_ai_key') {
      throw new Error('Hume AI API key not found');
    }
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      
      const response = await fetch(`${this.baseUrl}/speech/emotions`, {
        method: 'POST',
        headers: {
          'X-Hume-Api-Key': this.apiKey
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Hume AI API error: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Get the dominant emotion
      const emotions = data.emotions;
      let dominantEmotion: EmotionType = 'neutral';
      let highestScore = 0;
      
      for (const emotion of emotions) {
        if (emotion.score > highestScore) {
          highestScore = emotion.score;
          dominantEmotion = this.mapHumeEmotionToEmotionType(emotion.name);
        }
      }
      
      return dominantEmotion;
    } catch (error) {
      console.error('Error recognizing emotion with Hume AI:', error);
      return 'neutral'; // Default to neutral on error
    }
  }
  
  /**
   * Map our voice types to Hume AI voice IDs
   * 
   * @param voice Voice type
   * @returns Hume AI voice ID
   */
  private mapVoiceToHumeId(voice: VoiceType): string {
    switch (voice) {
      case 'rugged-male':
        return 'en_male_1'; // Assuming this is a rugged male voice
      case 'calm-female':
        return 'en_female_1'; // Assuming this is a calm female voice
      case 'energetic-male':
        return 'en_male_2'; // Assuming this is an energetic male voice
      case 'soothing-female':
        return 'en_female_2'; // Assuming this is a soothing female voice
      default:
        return this.defaultVoice;
    }
  }
  
  /**
   * Get prosody settings for a given emotion
   * 
   * @param emotion Emotion type
   * @returns Prosody settings object
   */
  private getEmotionProsodySettings(emotion: EmotionType): any {
    // These are simplified prosody settings
    // In a real implementation, these would be more sophisticated
    switch (emotion) {
      case 'happy':
        return {
          rate: 1.1,
          pitch: 1.2,
          energy: 1.3
        };
      case 'sad':
        return {
          rate: 0.8,
          pitch: 0.8,
          energy: 0.7
        };
      case 'angry':
        return {
          rate: 1.2,
          pitch: 1.1,
          energy: 1.5
        };
      case 'fearful':
        return {
          rate: 1.3,
          pitch: 1.3,
          energy: 0.8
        };
      case 'disgusted':
        return {
          rate: 0.9,
          pitch: 0.9,
          energy: 1.1
        };
      case 'surprised':
        return {
          rate: 1.2,
          pitch: 1.4,
          energy: 1.2
        };
      case 'neutral':
      default:
        return {
          rate: 1.0,
          pitch: 1.0,
          energy: 1.0
        };
    }
  }
  
  /**
   * Map Hume AI emotion names to our emotion types
   * 
   * @param humeEmotion Hume AI emotion name
   * @returns Our emotion type
   */
  private mapHumeEmotionToEmotionType(humeEmotion: string): EmotionType {
    // This is a simplified mapping
    // In a real implementation, this would be more sophisticated
    switch (humeEmotion.toLowerCase()) {
      case 'joy':
      case 'amusement':
      case 'contentment':
        return 'happy';
      case 'sadness':
      case 'grief':
      case 'disappointment':
        return 'sad';
      case 'anger':
      case 'rage':
      case 'annoyance':
        return 'angry';
      case 'fear':
      case 'anxiety':
      case 'nervousness':
        return 'fearful';
      case 'disgust':
      case 'contempt':
        return 'disgusted';
      case 'surprise':
      case 'amazement':
        return 'surprised';
      default:
        return 'neutral';
    }
  }
}

// Create singleton instance
const humeAiService = new HumeAiService();

export default humeAiService;