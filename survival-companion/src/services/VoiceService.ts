import apiConfig from '../config/apiConfig';

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
    console.log('streamSentence called with:', sentence);
    
    if (process.env.REACT_APP_ENABLE_VOICE_FEATURES !== 'true') {
      console.log('Voice features are disabled');
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
    if (this.isDuplicateOrSimilar(sentence)) {
      console.log('Sentence already spoken recently or is similar, skipping:', sentence);
      return;
    }
    
    // Add the sentence to the queue
    this.audioQueue.push(sentence);
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
      console.log('Starting queue processing');
      this.processQueue();
    } else {
      console.log('Queue is already being processed');
    }
  }
  
  /**
   * Process the audio queue
   */
  private async processQueue(): Promise<void> {
    console.log('processQueue called, queue length:', this.audioQueue.length);
    
    if (this.audioQueue.length === 0) {
      console.log('Queue is empty, stopping processing');
      this.processingQueue = false;
      return;
    }
    
    this.processingQueue = true;
    
    // Get the next sentence from the queue
    const sentence = this.audioQueue.shift() || '';
    console.log('Processing sentence:', sentence);
    
    try {
      // Stop any currently playing audio
      this.stopCurrentAudio();
      console.log('Stopped current audio');
      
      // Set streaming flag
      this.isStreaming = true;
      
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
      console.log('Request body:', JSON.stringify(requestBody));
      console.log('Using TARS voice settings:', apiConfig.elevenLabs.voiceSettings ? 'Yes' : 'No (fallback)');
      
      // Make the API request
      console.log('Making API request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiConfig.elevenLabs.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('API response status:', response.status);
      
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
      console.log('Created audio element');
      
      // Set up event listeners
      audioElement.onended = () => {
        console.log('Audio playback ended');
        URL.revokeObjectURL(audioUrl);
        this.isStreaming = false;
        this.processQueue();
      };
      
      audioElement.onerror = (error) => {
        console.error('Error playing audio:', error);
        URL.revokeObjectURL(audioUrl);
        this.isStreaming = false;
        this.processQueue();
      };
      
      // Play the audio
      console.log('Playing audio...');
      await audioElement.play();
      console.log('Audio playback started');
      
    } catch (error) {
      console.error('Error streaming sentence:', error);
      this.isStreaming = false;
      
      // Continue with the next item in the queue
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
    this.isStreaming = false;
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
   * Check if a sentence is a duplicate or very similar to recently spoken sentences
   */
  private isDuplicateOrSimilar(sentence: string): boolean {
    // Exact match check
    if (this.processedSentences.has(sentence)) {
      return true;
    }
    
    // Normalize the sentence for comparison (lowercase, remove extra spaces)
    const normalizedSentence = sentence.toLowerCase().trim().replace(/\s+/g, ' ');
    // Check for normalized exact matches
    const processedSentencesArray = Array.from(this.processedSentences);
    for (const processedSentence of processedSentencesArray) {
      const normalizedProcessed = processedSentence.toLowerCase().trim().replace(/\s+/g, ' ');
      
      
      // If exact match after normalization
      if (normalizedSentence === normalizedProcessed) {
        return true;
      }
      
      // Check if one is a substring of the other (with high overlap)
      if (normalizedSentence.length > 10 && normalizedProcessed.length > 10) {
        if (normalizedSentence.includes(normalizedProcessed) ||
            normalizedProcessed.includes(normalizedSentence)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

export default VoiceService.getInstance();