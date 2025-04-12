/**
 * Speech Service
 * 
 * This service handles text-to-speech functionality for the AI companion.
 * It uses Hume AI for voice synthesis with fallback to browser's speech synthesis.
 */

import humeAiService from './humeAiService';
import audioService from './audioService';

// Voice types
export type VoiceType = 'rugged-male' | 'calm-female' | 'energetic-male' | 'soothing-female';

// Emotion types
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

class SpeechService {
  /**
   * Convert text to speech and play it
   * 
   * @param text Text to speak
   * @param emotion Emotion to express
   * @param voiceType Voice type to use
   * @returns Promise<boolean> True if successful
   */
  public async speakText(
    text: string, 
    emotion: EmotionType = 'neutral',
    voiceType: VoiceType = 'rugged-male'
  ): Promise<boolean> {
    try {
      // Initialize audio context (must be done in response to user interaction)
      audioService.initAudioContext();
      
      // Check if API key is available
      const apiKey = process.env.REACT_APP_HUME_AI_API_KEY;
      if (!apiKey || apiKey === 'placeholder_hume_ai_key') {
        console.warn('Hume AI API key not found. Using fallback voice.');
        
        // Use browser's built-in speech synthesis as fallback
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        
        // Try to match voice type with browser voices
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Simple mapping of our voice types to browser voices
          if (voiceType === 'rugged-male' || voiceType === 'energetic-male') {
            // Find a male voice
            const maleVoice = voices.find(v => v.name.toLowerCase().includes('male'));
            if (maleVoice) utterance.voice = maleVoice;
          } else {
            // Find a female voice
            const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female'));
            if (femaleVoice) utterance.voice = femaleVoice;
          }
        }
        
        window.speechSynthesis.speak(utterance);
        
        return true;
      }
      
      // Get audio URL from Hume AI
      const audioUrl = await humeAiService.textToSpeech(text, voiceType, emotion);
      
      if (audioUrl) {
        // Play audio
        await audioService.playAudio(audioUrl);
        return true;
      } else {
        throw new Error('No audio URL returned from Hume AI');
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      
      // Fallback to browser's speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      
      return true;
    }
  }
  
  /**
   * Get available voice types
   * 
   * @returns Array of voice types
   */
  public getAvailableVoices(): { id: VoiceType; name: string; description: string }[] {
    return [
      { 
        id: 'rugged-male', 
        name: 'Rugged Male', 
        description: 'A deep, weathered voice of a survivor who has seen it all' 
      },
      { 
        id: 'calm-female', 
        name: 'Calm Female', 
        description: 'A steady, reassuring voice that brings clarity in chaos' 
      },
      { 
        id: 'energetic-male', 
        name: 'Energetic Male', 
        description: 'An alert, vigilant voice ready for action' 
      },
      { 
        id: 'soothing-female', 
        name: 'Soothing Female', 
        description: 'A gentle voice that brings comfort in harsh times' 
      }
    ];
  }
}

// Create singleton instance
const speechService = new SpeechService();

export default speechService;