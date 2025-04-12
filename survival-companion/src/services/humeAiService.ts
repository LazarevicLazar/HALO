/**
 * Hume AI API Service
 * 
 * This service handles communication with the Hume AI API for voice and emotional interaction.
 * It provides methods for text-to-speech, speech-to-text, and emotion recognition.
 */

// Get API key from environment variables
const API_KEY = process.env.REACT_APP_HUME_AI_API_KEY;
const API_BASE_URL = 'https://api.hume.ai/v0';

// Emotion types
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

// Voice options
export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
}

// Available voices
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'rugged-male',
    name: 'Survivor',
    gender: 'male',
    description: 'A deep, weathered voice that conveys experience and resilience'
  },
  {
    id: 'stern-female',
    name: 'Commander',
    gender: 'female',
    description: 'A strong, authoritative voice that inspires confidence'
  },
  {
    id: 'wise-male',
    name: 'Elder',
    gender: 'male',
    description: 'A calm, thoughtful voice with wisdom earned through hardship'
  }
];

/**
 * Convert text to speech using Hume AI
 * 
 * @param text The text to convert to speech
 * @param voiceId The ID of the voice to use
 * @param emotion The emotion to convey in the speech
 * @returns Promise with the audio URL
 */
export const textToSpeech = async (
  text: string,
  voiceId: string = 'rugged-male',
  emotion: EmotionType = 'neutral'
): Promise<string> => {
  try {
    if (!API_KEY) {
      throw new Error('Hume AI API key not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/tts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hume-Api-Key': API_KEY
      },
      body: JSON.stringify({
        text,
        voice: voiceId,
        emotion_intensity: getEmotionIntensity(emotion),
        output_format: 'mp3'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.audio_url;
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return '';
  }
};

/**
 * Convert speech to text using Hume AI
 * 
 * @param audioBlob The audio blob to convert to text
 * @returns Promise with the transcribed text
 */
export const speechToText = async (audioBlob: Blob): Promise<string> => {
  try {
    if (!API_KEY) {
      throw new Error('Hume AI API key not found');
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    const response = await fetch(`${API_BASE_URL}/speech/transcribe`, {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error in speech-to-text:', error);
    return '';
  }
};

/**
 * Recognize emotions in speech using Hume AI
 * 
 * @param audioBlob The audio blob to analyze
 * @returns Promise with the dominant emotion
 */
export const recognizeEmotion = async (audioBlob: Blob): Promise<EmotionType> => {
  try {
    if (!API_KEY) {
      throw new Error('Hume AI API key not found');
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    const response = await fetch(`${API_BASE_URL}/speech/emotions`, {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': API_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Find the emotion with the highest score
    let highestScore = 0;
    let dominantEmotion: EmotionType = 'neutral';
    
    Object.entries(data.emotions).forEach(([emotion, score]) => {
      const scoreValue = score as number;
      if (scoreValue > highestScore) {
        highestScore = scoreValue;
        dominantEmotion = emotion as EmotionType;
      }
    });
    
    return dominantEmotion;
  } catch (error) {
    console.error('Error in emotion recognition:', error);
    return 'neutral';
  }
};

/**
 * Get the appropriate emotion intensity for a given emotion
 * 
 * @param emotion The emotion type
 * @returns The emotion intensity (0-1)
 */
const getEmotionIntensity = (emotion: EmotionType): number => {
  switch (emotion) {
    case 'neutral':
      return 0.2;
    case 'happy':
      return 0.6;
    case 'sad':
      return 0.7;
    case 'angry':
      return 0.8;
    case 'fearful':
      return 0.7;
    case 'disgusted':
      return 0.6;
    case 'surprised':
      return 0.5;
    default:
      return 0.5;
  }
};

/**
 * Check if the Hume AI API is available
 * 
 * @returns Promise<boolean> True if the API is available
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    if (!API_KEY) return false;
    
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'X-Hume-Api-Key': API_KEY
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking API availability:', error);
    return false;
  }
};

export default {
  textToSpeech,
  speechToText,
  recognizeEmotion,
  checkApiAvailability,
  VOICE_OPTIONS
};