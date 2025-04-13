import apiConfig from '../config/apiConfig';

// Custom event for speech status changes
export const SPEECH_STATUS_EVENT = 'speech-status-change';

// Custom event for audio ready status
export const AUDIO_READY_EVENT = 'audio-ready-change';

export class VoiceService {
  private static instance: VoiceService;
  private audio: HTMLAudioElement | null = null;
  private isStreaming: boolean = false;
  private audioQueue: {text: string, conversationId: string}[] = []; // Store both text and conversation ID
  private processedSentences: Map<string, Set<string>> = new Map(); // Track processed sentences by conversation ID
  private processingQueue: boolean = false;
  private lastConversationId: string = ''; // Track conversation ID to reset on new conversations
  private currentAudioPromise: Promise<void> | null = null; // Track current audio playback promise
  private audioPlaybackLock: boolean = false; // Additional lock for audio playback
  private audioReadyForConversation: Map<string, boolean> = new Map(); // Track if audio is ready for a conversation
  
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
   * @param delayDisplay Whether to delay displaying the message until audio is ready
   * @returns A promise that resolves when the sentence is queued
   */
  public async streamSentence(sentence: string, conversationId: string = 'default', delayDisplay: boolean = false): Promise<void> {
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
      
      // Initialize processed sentences set for this conversation
      if (!this.processedSentences.has(conversationId)) {
        this.processedSentences.set(conversationId, new Set());
      }
    } else {
      console.log('Continuing conversation:', conversationId);
    }
    
    // Check if we've already spoken this sentence in this conversation
    const isDuplicate = this.isDuplicateInConversation(sentence, conversationId);
    console.log('VOICE SERVICE: Is duplicate or similar:', isDuplicate);
    
    if (isDuplicate) {
      console.log('VOICE SERVICE: Sentence already spoken recently or is similar, skipping:', sentence);
      return;
    }
    
    // Mark audio as not ready for this conversation if delayDisplay is true
    if (delayDisplay) {
      this.audioReadyForConversation.set(conversationId, false);
      console.log(`VOICE SERVICE: Marked audio as not ready for conversation ${conversationId}`);
    }
    
    // Add the sentence to the queue with its conversation ID
    this.audioQueue.push({text: sentence, conversationId});
    console.log('VOICE SERVICE: Added sentence to queue. New queue length:', this.audioQueue.length);
    console.log('Audio queue length:', this.audioQueue.length);
    
    // Add to processed sentences for this conversation
    const sentencesForConversation = this.processedSentences.get(conversationId) || new Set();
    sentencesForConversation.add(sentence);
    this.processedSentences.set(conversationId, sentencesForConversation);
    
    // Limit the size of the processed sentences set for this conversation
    if (sentencesForConversation.size > 100) {
      console.log(`Trimming processed sentences set for conversation ${conversationId} (size > 100)`);
      // Convert to array, remove oldest entries, convert back to set
      const sentencesArray = Array.from(sentencesForConversation);
      this.processedSentences.set(conversationId, new Set(sentencesArray.slice(-50))); // Keep only the 50 most recent
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
   * Process the audio queue with strict sequential processing
   * This implementation ensures only one audio file plays at a time
   */
  private async processQueue(): Promise<void> {
    console.log('VOICE SERVICE: processQueue called, queue length:', this.audioQueue.length);
    
    // If queue is empty, stop processing
    if (this.audioQueue.length === 0) {
      console.log('VOICE SERVICE: Queue is empty, stopping processing');
      this.processingQueue = false;
      this.setStreamingStatus(false);
      return;
    }
    
    // Set processing flag to true
    this.processingQueue = true;
    console.log('VOICE SERVICE: Set processingQueue flag to true');
    
    // Set streaming status to true as soon as we start processing the queue
    // This ensures the talking animation starts immediately
    this.setStreamingStatus(true);
    console.log('VOICE SERVICE: Set isStreaming flag to true at start of queue processing');
    
    // Process each item in the queue sequentially
    while (this.audioQueue.length > 0 && this.processingQueue) {
      // Check if we're already processing audio
      if (this.audioPlaybackLock) {
        console.log('VOICE SERVICE: Audio playback lock is active, waiting...');
        // Wait a short time and check again
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      
      // Set the audio playback lock
      this.audioPlaybackLock = true;
      
      // Get the next sentence from the queue
      const queueItem = this.audioQueue.shift();
      if (!queueItem) {
        console.log('VOICE SERVICE: Empty queue item, skipping');
        this.audioPlaybackLock = false;
        continue;
      }
      
      const { text: sentence, conversationId } = queueItem;
      console.log(`Processing sentence from conversation ${conversationId}:`, sentence);
      
      try {
        // Stop any currently playing audio
        this.stopCurrentAudio();
        console.log('Stopped current audio');
        
        // Create a promise for this audio playback
        this.currentAudioPromise = this.playAudioForSentence(sentence, conversationId);
        
        // Wait for the audio to finish playing before processing the next item
        await this.currentAudioPromise;
        
      } catch (error) {
        console.error('VOICE SERVICE: Error in processQueue:', error);
        console.log('VOICE SERVICE: Error type:', error instanceof Error ? error.name : typeof error);
        console.log('VOICE SERVICE: Error message:', error instanceof Error ? error.message : String(error));
      } finally {
        // Release the audio playback lock
        this.audioPlaybackLock = false;
      }
    }
    
    // If queue is now empty, update status
    if (this.audioQueue.length === 0) {
      this.processingQueue = false;
      this.setStreamingStatus(false);
      console.log('VOICE SERVICE: Queue processing complete, all audio played');
    }
  }
  
  /**
   * Play audio for a single sentence
   * Returns a promise that resolves when the audio finishes playing
   */
  private async playAudioForSentence(sentence: string, conversationId: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
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
        
        // Mark audio as ready for this conversation if it exists in the map
        if (this.audioReadyForConversation.has(conversationId)) {
          this.audioReadyForConversation.set(conversationId, true);
          console.log(`VOICE SERVICE: Marked audio as ready for conversation ${conversationId}`);
          
          // Dispatch audio ready event
          const event = new CustomEvent(AUDIO_READY_EVENT, {
            detail: { conversationId: conversationId, isReady: true }
          });
          document.dispatchEvent(event);
        }
        
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
          this.audio = null;
          resolve(); // Resolve the promise when audio ends
        };
        
        audioElement.onerror = (error) => {
          console.error('VOICE SERVICE: Error playing audio:', error);
          URL.revokeObjectURL(audioUrl);
          this.audio = null;
          reject(error); // Reject the promise on error
        };
        
        // Play the audio
        console.log('VOICE SERVICE: Attempting to play audio...');
        try {
          await audioElement.play();
          console.log('VOICE SERVICE: Audio playback started successfully');
        } catch (playError) {
          console.error('VOICE SERVICE: Error starting audio playback:', playError);
          URL.revokeObjectURL(audioUrl);
          this.audio = null;
          reject(playError); // Reject the promise on play error
        }
      } catch (error) {
        console.error('VOICE SERVICE: Error in playAudioForSentence:', error);
        reject(error); // Reject the promise on any error
      }
    });
  }
  
  /**
   * Stop the currently playing audio
   */
  private stopCurrentAudio(): void {
    if (this.audio) {
      console.log('Stopping current audio');
      this.audio.pause();
      this.audio.src = '';
      this.audio.onended = null; // Remove event listeners
      this.audio.onerror = null;
      this.audio = null;
    }
    
    // Reset the current audio promise
    this.currentAudioPromise = null;
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
    this.audioPlaybackLock = false; // Release the audio playback lock
  }
  
  /**
   * Clear all speech, including queue and history
   */
  public clearAllSpeech(): void {
    console.log('clearAllSpeech called');
    this.stopSpeaking();
    this.processedSentences.clear();
    this.audioReadyForConversation.clear();
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
   * Check if audio is ready for a specific conversation
   * @param conversationId The conversation ID to check
   * @returns True if audio is ready, false otherwise
   */
  public isAudioReady(conversationId: string): boolean {
    return this.audioReadyForConversation.get(conversationId) || false;
  }
  
  /**
   * Wait for audio to be ready for a specific conversation
   * @param conversationId The conversation ID to wait for
   * @param timeout Optional timeout in milliseconds
   * @returns A promise that resolves when audio is ready or rejects on timeout
   */
  public waitForAudioReady(conversationId: string, timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already ready, resolve immediately
      if (this.isAudioReady(conversationId)) {
        console.log(`VOICE SERVICE: Audio already ready for conversation ${conversationId}`);
        resolve();
        return;
      }
      
      console.log(`VOICE SERVICE: Waiting for audio to be ready for conversation ${conversationId}`);
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        document.removeEventListener(AUDIO_READY_EVENT, handleAudioReady);
        reject(new Error(`Timeout waiting for audio to be ready for conversation ${conversationId}`));
      }, timeout);
      
      // Set up event listener
      const handleAudioReady = (event: Event) => {
        const customEvent = event as CustomEvent<{conversationId: string, isReady: boolean}>;
        if (customEvent.detail.conversationId === conversationId && customEvent.detail.isReady) {
          clearTimeout(timeoutId);
          document.removeEventListener(AUDIO_READY_EVENT, handleAudioReady);
          console.log(`VOICE SERVICE: Audio is now ready for conversation ${conversationId}`);
          resolve();
        }
      };
      
      document.addEventListener(AUDIO_READY_EVENT, handleAudioReady);
    });
  }
  
  /**
   * Check if a sentence is a duplicate within a specific conversation
   */
  private isDuplicateInConversation(sentence: string, conversationId: string): boolean {
    console.log(`VOICE SERVICE: Checking if sentence is duplicate in conversation ${conversationId}:`, sentence);
    
    const sentencesForConversation = this.processedSentences.get(conversationId);
    if (!sentencesForConversation) {
      console.log(`VOICE SERVICE: No processed sentences for conversation ${conversationId}`);
      return false;
    }
    
    console.log(`VOICE SERVICE: Current processed sentences count for conversation ${conversationId}:`, sentencesForConversation.size);
    
    // Exact match check
    if (sentencesForConversation.has(sentence)) {
      console.log('VOICE SERVICE: Exact match found in processed sentences');
      return true;
    }
    
    // Normalize the sentence for comparison (lowercase, remove extra spaces)
    const normalizedSentence = sentence.toLowerCase().trim().replace(/\s+/g, ' ');
    console.log('VOICE SERVICE: Normalized sentence:', normalizedSentence);
    
    // Check for normalized exact matches
    const processedSentencesArray = Array.from(sentencesForConversation);
    for (const processedSentence of processedSentencesArray) {
      const normalizedProcessed = processedSentence.toLowerCase().trim().replace(/\s+/g, ' ');
      
      // If exact match after normalization
      if (normalizedSentence === normalizedProcessed) {
        console.log('VOICE SERVICE: Normalized exact match found:', normalizedProcessed);
        return true;
      }
      
      // We're being less strict about similarity within the same conversation
      // Only check for exact duplicates, not substrings
    }
    
    console.log('VOICE SERVICE: No duplicate found in this conversation');
    return false;
  }
}

export default VoiceService.getInstance();