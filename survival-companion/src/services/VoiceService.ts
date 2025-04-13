import apiConfig from '../config/apiConfig';

// Custom event for speech status changes
export const SPEECH_STATUS_EVENT = 'speech-status-change';

export class VoiceService {
  private static instance: VoiceService;
  private audio: HTMLAudioElement | null = null;
  private isStreaming: boolean = false;
  private audioQueue: string[] = [];
  private processedSentences: Set<string> = new Set(); // Track recently spoken sentences
  private processingQueue: boolean = false;
  private lastConversationId: string = ''; // Track conversation ID to reset on new conversations
  
  private constructor() {
    console.log('ElevenLabs service initialized');
    console.log('Voice features enabled:', process.env.REACT_APP_ENABLE_VOICE_FEATURES === 'true');
    console.log('ElevenLabs API key available:', !!apiConfig.elevenLabs.apiKey);
  }
  
  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }
  
  /**
   * Stream a sentence using the ElevenLabs API
   * @param sentence The text to speak
   * @param conversationId Optional ID to track different conversations
   */
  public async streamSentence(sentence: string, conversationId: string = 'default'): Promise<void> {
    console.log('VOICE SERVICE: streamSentence called with:', sentence);
    console.log('VOICE SERVICE: Conversation ID:', conversationId);
    console.log('VOICE SERVICE: REACT_APP_ENABLE_VOICE_FEATURES:', process.env.REACT_APP_ENABLE_VOICE_FEATURES);
    
    if (process.env.REACT_APP_ENABLE_VOICE_FEATURES !== 'true') {
      console.log('VOICE SERVICE: Voice features are disabled in environment variables');
      return;
    }
    
    // Check if this is a new conversation
    if (conversationId !== this.lastConversationId) {
      console.log('New conversation detected, clearing queue and history');
      console.log('Previous conversation ID:', this.lastConversationId);
      console.log('New conversation ID:', conversationId);
      this.lastConversationId = conversationId;
      this.clearAllSpeech();
    } else {
      console.log('Continuing conversation:', conversationId);
    }
    
    // Check if we've already spoken this sentence or a similar one recently
    const isDuplicate = this.isDuplicateOrSimilar(sentence);
    console.log('VOICE SERVICE: Is duplicate or similar:', isDuplicate);
    
    if (isDuplicate) {
      console.log('VOICE SERVICE: Sentence already spoken recently or is similar, skipping:', sentence);
      return;
    }
    
    // Add the sentence to the queue
    this.audioQueue.push(sentence);
    console.log('VOICE SERVICE: Added sentence to queue. New queue length:', this.audioQueue.length);
    console.log('Audio queue length:', this.audioQueue.length);
    
    // Add to processed sentences (limit to 100 entries to prevent memory leaks)
    this.processedSentences.add(sentence);
    
    // Limit the size of the processed sentences set
    if (this.processedSentences.size > 100) {
      console.log('Trimming processed sentences set (size > 100)');
      // Convert to array, remove oldest entries, convert back to set
      const sentencesArray = Array.from(this.processedSentences);
      this.processedSentences = new Set(sentencesArray.slice(-50)); // Keep only the 50 most recent
    }
    
    // If we're not already processing the queue, start processing
    if (!this.processingQueue) {
      console.log('VOICE SERVICE: Starting queue processing');
      this.processQueue();
    } else {
      console.log('VOICE SERVICE: Queue is already being processed');
    }
  }
  
  /**
   * Process the audio queue
   */
  private async processQueue(): Promise<void> {
    console.log('VOICE SERVICE: processQueue called, queue length:', this.audioQueue.length);
    
    if (this.audioQueue.length === 0) {
      console.log('VOICE SERVICE: Queue is empty, stopping processing');
      this.processingQueue = false;
      this.setStreamingStatus(false);
      return;
    }
    
    this.processingQueue = true;
    console.log('VOICE SERVICE: Set processingQueue flag to true');
    
    // Set streaming status to true as soon as we start processing the queue
    // This ensures the talking animation starts immediately
    this.setStreamingStatus(true);
    console.log('VOICE SERVICE: Set isStreaming flag to true at start of queue processing');
    
    // Get the next sentence from the queue
    const sentence = this.audioQueue.shift() || '';
    console.log('Processing sentence:', sentence);
    
    try {
      // Stop any currently playing audio
      this.stopCurrentAudio();
      console.log('Stopped current audio');
      // Streaming flag is now set at the beginning of processQueue
      
      
      // Use the ElevenLabs API directly
      const voiceId = apiConfig.elevenLabs.defaultVoice;
      const modelId = apiConfig.elevenLabs.textToSpeech.fastModel || 'eleven_monolingual_v1';
      
      console.log('Voice ID:', voiceId);
      console.log('Model ID:', modelId);
      
      // Create a URL for the stream endpoint
      const url = `${apiConfig.elevenLabs.baseUrl}/text-to-speech/${voiceId}`;
      console.log('API URL:', url);
      console.log('API Key (first 5 chars):', apiConfig.elevenLabs.apiKey ? apiConfig.elevenLabs.apiKey.substring(0, 5) + '...' : 'not set');
      
      // Prepare request body
      const requestBody = {
        text: sentence,
        model_id: modelId,
        voice_settings: apiConfig.elevenLabs.voiceSettings || {
          stability: 0.75,
          similarity_boost: 0.5
        }
      };
      console.log('VOICE SERVICE: Request body:', JSON.stringify(requestBody));
      console.log('VOICE SERVICE: Using TARS voice settings:', apiConfig.elevenLabs.voiceSettings ? 'Yes' : 'No (fallback)');
      console.log('VOICE SERVICE: ElevenLabs API Key available:', !!apiConfig.elevenLabs.apiKey);
      
      // Make the API request
      console.log('VOICE SERVICE: Making API request to ElevenLabs...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiConfig.elevenLabs.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('VOICE SERVICE: API response status:', response.status);
      // Log a few key headers without using entries() iterator
      console.log('VOICE SERVICE: API response content-type:', response.headers.get('content-type'));
      console.log('VOICE SERVICE: API response content-length:', response.headers.get('content-length'));
      
      if (!response.ok) {
        console.error(`ElevenLabs API error: ${response.status}`);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      console.log('API request successful');
      
      // Get the response as a blob
      const audioBlob = await response.blob();
      console.log('Received audio blob, size:', audioBlob.size);
      
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Created audio URL:', audioUrl);
      
      // Create a new audio element
      const audioElement = new Audio(audioUrl);
      this.audio = audioElement;
      console.log('VOICE SERVICE: Created audio element');
      
      // Set up event listeners
      audioElement.onended = () => {
        console.log('VOICE SERVICE: Audio playback ended');
        URL.revokeObjectURL(audioUrl);
        
        // Only set streaming status to false if there are no more items in the queue
        if (this.audioQueue.length === 0) {
          this.setStreamingStatus(false);
          console.log('VOICE SERVICE: Queue empty, setting isStreaming to false');
        } else {
          console.log('VOICE SERVICE: More items in queue, keeping isStreaming true');
        }
        
        console.log('VOICE SERVICE: Continuing to process queue after playback ended');
        this.processQueue();
      };
      
      audioElement.onerror = (error) => {
        console.error('VOICE SERVICE: Error playing audio:', error);
        URL.revokeObjectURL(audioUrl);
        
        // Only set streaming status to false if there are no more items in the queue
        if (this.audioQueue.length === 0) {
          this.setStreamingStatus(false);
          console.log('VOICE SERVICE: Queue empty, setting isStreaming to false after error');
        } else {
          console.log('VOICE SERVICE: More items in queue, keeping isStreaming true despite error');
        }
        
        console.log('VOICE SERVICE: Continuing to process queue after playback error');
        this.processQueue();
      };
      
      // Play the audio
      console.log('VOICE SERVICE: Attempting to play audio...');
      try {
        await audioElement.play();
        console.log('VOICE SERVICE: Audio playback started successfully');
      } catch (playError) {
        console.error('VOICE SERVICE: Error starting audio playback:', playError);
        URL.revokeObjectURL(audioUrl);
        
        // Only set streaming status to false if there are no more items in the queue
        if (this.audioQueue.length === 0) {
          this.setStreamingStatus(false);
          console.log('VOICE SERVICE: Queue empty, setting isStreaming to false after play error');
        } else {
          console.log('VOICE SERVICE: More items in queue, keeping isStreaming true despite play error');
        }
        
        this.processQueue();
      }
      
    } catch (error) {
      console.error('VOICE SERVICE: Error in processQueue:', error);
      console.log('VOICE SERVICE: Error type:', error instanceof Error ? error.name : typeof error);
      console.log('VOICE SERVICE: Error message:', error instanceof Error ? error.message : String(error));
      
      // Only set streaming status to false if there are no more items in the queue
      if (this.audioQueue.length === 0) {
        this.setStreamingStatus(false);
        console.log('VOICE SERVICE: Queue empty, setting isStreaming to false due to catch block error');
      } else {
        console.log('VOICE SERVICE: More items in queue, keeping isStreaming true despite catch block error');
      }
      
      // Continue with the next item in the queue
      console.log('VOICE SERVICE: Continuing to process queue after error');
      this.processQueue();
    }
  }
  
  /**
   * Stop the currently playing audio
   */
  private stopCurrentAudio(): void {
    if (this.audio) {
      console.log('Stopping current audio');
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }
  
  /**
   * Stop all speech and clear the queue
   */
  public stopSpeaking(): void {
    console.log('stopSpeaking called');
    this.stopCurrentAudio();
    this.audioQueue = [];
    this.setStreamingStatus(false);
    this.processingQueue = false;
  }
  
  /**
   * Clear all speech, including queue and history
   */
  public clearAllSpeech(): void {
    console.log('clearAllSpeech called');
    this.stopSpeaking();
    this.processedSentences.clear();
  }
  
  /**
   * Set the streaming status and dispatch an event
   */
  private setStreamingStatus(status: boolean): void {
    // Update the internal state
    this.isStreaming = status;
    console.log(`VOICE SERVICE: Set isStreaming flag to ${status}`);
    
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent(SPEECH_STATUS_EVENT, {
      detail: { isSpeaking: status }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Check if speech is currently happening
   */
  public isSpeaking(): boolean {
    return this.isStreaming;
  }
  
  /**
   * Check if a sentence is a duplicate or very similar to recently spoken sentences
   */
  private isDuplicateOrSimilar(sentence: string): boolean {
    console.log('VOICE SERVICE: Checking if sentence is duplicate or similar:', sentence);
    console.log('VOICE SERVICE: Current processed sentences count:', this.processedSentences.size);
    
    // Exact match check
    if (this.processedSentences.has(sentence)) {
      console.log('VOICE SERVICE: Exact match found in processed sentences');
      return true;
    }
    
    // Normalize the sentence for comparison (lowercase, remove extra spaces)
    const normalizedSentence = sentence.toLowerCase().trim().replace(/\s+/g, ' ');
    console.log('VOICE SERVICE: Normalized sentence:', normalizedSentence);
    
    // Check for normalized exact matches
    const processedSentencesArray = Array.from(this.processedSentences);
    for (const processedSentence of processedSentencesArray) {
      const normalizedProcessed = processedSentence.toLowerCase().trim().replace(/\s+/g, ' ');
      
      // If exact match after normalization
      if (normalizedSentence === normalizedProcessed) {
        console.log('VOICE SERVICE: Normalized exact match found:', normalizedProcessed);
        return true;
      }
      
      // Check if one is a substring of the other (with high overlap)
      if (normalizedSentence.length > 10 && normalizedProcessed.length > 10) {
        if (normalizedSentence.includes(normalizedProcessed)) {
          console.log('VOICE SERVICE: New sentence contains processed sentence:', normalizedProcessed);
          return true;
        }
        if (normalizedProcessed.includes(normalizedSentence)) {
          console.log('VOICE SERVICE: Processed sentence contains new sentence:', normalizedSentence);
          return true;
        }
      }
    }
    
    console.log('VOICE SERVICE: No duplicate or similar sentence found');
    return false;
  }
}

export default VoiceService.getInstance();