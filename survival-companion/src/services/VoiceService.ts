import apiConfig from "../config/apiConfig";
import { v4 as uuidv4 } from "uuid";

// Custom event for speech status changes
export const SPEECH_STATUS_EVENT = "speech-status-change";

export class VoiceService {
  private static instance: VoiceService;
  private audio: HTMLAudioElement | null = null;
  private isStreaming: boolean = false;
  private audioQueue: { id: string; text: string }[] = [];
  private processedSentences: Set<string> = new Set(); // Track recently spoken sentences
  private processingQueue: boolean = false;
  private lastConversationId: string = ""; // Track conversation ID to reset on new conversations
  private audioPlayPromise: Promise<void> | null = null; // Track current audio play promise
  private isStopping: boolean = false; // Flag to track if we're in the process of stopping
  private activeConversations: Set<string> = new Set(); // Track active conversations
  private recentlyPlayedTexts: Map<string, number> = new Map(); // Track recently played texts with timestamps

  private constructor() {
    console.log("ElevenLabs service initialized");
    console.log(
      "Voice features enabled:",
      process.env.REACT_APP_ENABLE_VOICE_FEATURES === "true"
    );
    console.log("ElevenLabs API key available:", !!apiConfig.elevenLabs.apiKey);

    // Set up a cleanup interval for the recentlyPlayedTexts map
    setInterval(() => this.cleanupRecentlyPlayed(), 60000); // Clean up every minute
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Clean up the recently played texts map by removing entries older than 10 seconds
   */
  private cleanupRecentlyPlayed(): void {
    const now = Date.now();
    const expiryTime = 10000; // 10 seconds

    // Convert Map entries to array and then iterate
    Array.from(this.recentlyPlayedTexts.entries()).forEach(
      ([text, timestamp]) => {
        if (now - timestamp > expiryTime) {
          this.recentlyPlayedTexts.delete(text);
        }
      }
    );

    console.log(
      "Cleaned up recently played texts. Remaining:",
      this.recentlyPlayedTexts.size
    );
  }

  /**
   * Stream a sentence using the ElevenLabs API
   * @param sentence The text to speak
   * @param conversationId Optional ID to track different conversations
   */
  public async streamSentence(
    sentence: string,
    conversationId: string = "default"
  ): Promise<void> {
    console.log("VOICE SERVICE: streamSentence called with:", sentence);
    console.log("VOICE SERVICE: Conversation ID:", conversationId);
    console.log(
      "VOICE SERVICE: REACT_APP_ENABLE_VOICE_FEATURES:",
      process.env.REACT_APP_ENABLE_VOICE_FEATURES
    );

    if (process.env.REACT_APP_ENABLE_VOICE_FEATURES !== "true") {
      console.log(
        "VOICE SERVICE: Voice features are disabled in environment variables"
      );
      return;
    }

    // Skip empty sentences
    if (!sentence.trim()) {
      console.log("VOICE SERVICE: Empty sentence, skipping");
      return;
    }

    // Check if this exact text was recently played (within the last 10 seconds)
    const normalizedSentence = sentence.toLowerCase().trim();
    const now = Date.now();
    const recentPlayTime = this.recentlyPlayedTexts.get(normalizedSentence);

    if (recentPlayTime && now - recentPlayTime < 10000) {
      console.log(
        "VOICE SERVICE: This exact text was played very recently, skipping to prevent duplication:",
        sentence
      );
      console.log(
        "VOICE SERVICE: Time since last play:",
        now - recentPlayTime,
        "ms"
      );
      return;
    }

    // Add to recently played texts
    this.recentlyPlayedTexts.set(normalizedSentence, now);

    // Debounce rapid calls with the same sentence
    if (this.isDuplicateOrSimilar(sentence)) {
      console.log(
        "VOICE SERVICE: Sentence already spoken recently or is similar, skipping:",
        sentence
      );
      return;
    }

    // Check if this is a new conversation
    if (conversationId !== this.lastConversationId) {
      console.log("New conversation detected, clearing queue and history");
      console.log("Previous conversation ID:", this.lastConversationId);
      console.log("New conversation ID:", conversationId);
      this.lastConversationId = conversationId;

      // Clear previous conversations
      this.clearAllSpeech();

      // Add this conversation to active conversations
      this.activeConversations.add(conversationId);
    } else {
      console.log("Continuing conversation:", conversationId);

      // If this conversation isn't active anymore (was stopped), don't process
      if (!this.activeConversations.has(conversationId)) {
        console.log(
          "VOICE SERVICE: Conversation was stopped, not processing:",
          conversationId
        );
        return;
      }
    }

    // Add the sentence to the queue with a unique ID to prevent duplicates
    const uniqueId = `${uuidv4()}`;
    this.audioQueue.push({ id: uniqueId, text: sentence });
    console.log(
      "VOICE SERVICE: Added sentence to queue. New queue length:",
      this.audioQueue.length
    );

    // Store the actual sentence in a Map using the unique ID
    this.processedSentences.add(sentence);

    // Limit the size of the processed sentences set
    if (this.processedSentences.size > 100) {
      console.log("Trimming processed sentences set (size > 100)");
      // Convert to array, remove oldest entries, convert back to set
      const sentencesArray = Array.from(this.processedSentences);
      this.processedSentences = new Set(sentencesArray.slice(-50)); // Keep only the 50 most recent
    }

    // If we're not already processing the queue, start processing
    if (!this.processingQueue) {
      console.log("VOICE SERVICE: Starting queue processing");
      this.processQueue();
    } else {
      console.log("VOICE SERVICE: Queue is already being processed");
    }
  }

  /**
   * Process the audio queue
   */
  private async processQueue(): Promise<void> {
    console.log(
      "VOICE SERVICE: processQueue called, queue length:",
      this.audioQueue.length
    );

    // If we're stopping, don't process the queue
    if (this.isStopping) {
      console.log("VOICE SERVICE: Currently stopping, not processing queue");
      return;
    }

    if (this.audioQueue.length === 0) {
      console.log("VOICE SERVICE: Queue is empty, stopping processing");
      this.processingQueue = false;
      this.setStreamingStatus(false);
      return;
    }

    // Set processing flag to prevent multiple queue processing
    if (this.processingQueue) {
      console.log("VOICE SERVICE: Queue is already being processed, waiting");
      return;
    }

    this.processingQueue = true;
    console.log("VOICE SERVICE: Set processingQueue flag to true");

    // Set streaming status to true as soon as we start processing the queue
    // This ensures the talking animation starts immediately
    this.setStreamingStatus(true);
    console.log(
      "VOICE SERVICE: Set isStreaming flag to true at start of queue processing"
    );

    try {
      // Make sure any previous audio is fully stopped before proceeding
      await this.stopCurrentAudio();
      console.log(
        "VOICE SERVICE: Previous audio stopped, proceeding with queue"
      );

      // Get the next item from the queue
      const queueItem = this.audioQueue.shift();
      if (!queueItem) {
        console.log("VOICE SERVICE: No item in queue, stopping processing");
        this.processingQueue = false;
        this.setStreamingStatus(false);
        return;
      }

      const { id, text } = queueItem;
      console.log("Processing sentence:", text, "with ID:", id);

      // Use the ElevenLabs API directly
      const voiceId = apiConfig.elevenLabs.defaultVoice;
      const modelId =
        apiConfig.elevenLabs.textToSpeech.fastModel || "eleven_monolingual_v1";

      console.log("Voice ID:", voiceId);
      console.log("Model ID:", modelId);

      // Create a URL for the stream endpoint
      const url = `${apiConfig.elevenLabs.baseUrl}/text-to-speech/${voiceId}`;
      console.log("API URL:", url);
      console.log(
        "API Key (first 5 chars):",
        apiConfig.elevenLabs.apiKey
          ? apiConfig.elevenLabs.apiKey.substring(0, 5) + "..."
          : "not set"
      );

      // Prepare request body
      const requestBody = {
        text: text,
        model_id: modelId,
        voice_settings: apiConfig.elevenLabs.voiceSettings || {
          stability: 0.75,
          similarity_boost: 0.5,
        },
      };
      console.log("VOICE SERVICE: Request body:", JSON.stringify(requestBody));

      // Make the API request
      console.log("VOICE SERVICE: Making API request to ElevenLabs...");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiConfig.elevenLabs.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("VOICE SERVICE: API response status:", response.status);

      if (!response.ok) {
        console.error(`ElevenLabs API error: ${response.status}`);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      console.log("API request successful");

      // Get the response as a blob
      const audioBlob = await response.blob();
      console.log("Received audio blob, size:", audioBlob.size);

      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Created audio URL:", audioUrl);

      // Create a new audio element
      const audioElement = new Audio(audioUrl);
      this.audio = audioElement;
      console.log("VOICE SERVICE: Created audio element");

      // Set up event listeners
      const audioEndedPromise = new Promise<void>((resolve) => {
        audioElement.onended = () => {
          console.log("VOICE SERVICE: Audio playback ended");
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audioElement.onerror = (error) => {
          console.error("VOICE SERVICE: Error playing audio:", error);
          URL.revokeObjectURL(audioUrl);
          resolve(); // Resolve anyway to continue queue processing
        };
      });

      // Play the audio and store the promise
      console.log("VOICE SERVICE: Attempting to play audio...");
      try {
        this.audioPlayPromise = audioElement.play();
        await this.audioPlayPromise;
        console.log("VOICE SERVICE: Audio playback started successfully");

        // Wait for the audio to finish playing
        await audioEndedPromise;

        // Reset the play promise
        this.audioPlayPromise = null;

        // Only set streaming status to false if there are no more items in the queue
        if (this.audioQueue.length === 0) {
          this.setStreamingStatus(false);
          console.log(
            "VOICE SERVICE: Queue empty, setting isStreaming to false"
          );
        } else {
          console.log(
            "VOICE SERVICE: More items in queue, keeping isStreaming true"
          );
        }

        // Continue processing the queue
        this.processingQueue = false;
        this.processQueue();
      } catch (playError) {
        console.error(
          "VOICE SERVICE: Error starting audio playback:",
          playError
        );
        URL.revokeObjectURL(audioUrl);

        // Reset the play promise
        this.audioPlayPromise = null;

        // Only set streaming status to false if there are no more items in the queue
        if (this.audioQueue.length === 0) {
          this.setStreamingStatus(false);
          console.log(
            "VOICE SERVICE: Queue empty, setting isStreaming to false after play error"
          );
        } else {
          console.log(
            "VOICE SERVICE: More items in queue, keeping isStreaming true despite play error"
          );
        }

        // Continue processing the queue
        this.processingQueue = false;
        this.processQueue();
      }
    } catch (error) {
      console.error("VOICE SERVICE: Error in processQueue:", error);
      console.log(
        "VOICE SERVICE: Error type:",
        error instanceof Error ? error.name : typeof error
      );
      console.log(
        "VOICE SERVICE: Error message:",
        error instanceof Error ? error.message : String(error)
      );

      // Reset the play promise
      this.audioPlayPromise = null;

      // Only set streaming status to false if there are no more items in the queue
      if (this.audioQueue.length === 0) {
        this.setStreamingStatus(false);
        console.log(
          "VOICE SERVICE: Queue empty, setting isStreaming to false due to catch block error"
        );
      } else {
        console.log(
          "VOICE SERVICE: More items in queue, keeping isStreaming true despite catch block error"
        );
      }

      // Continue with the next item in the queue
      console.log("VOICE SERVICE: Continuing to process queue after error");
      this.processingQueue = false;
      this.processQueue();
    }
  }

  /**
   * Stop the currently playing audio
   */
  private async stopCurrentAudio(): Promise<void> {
    if (this.audio) {
      console.log("Stopping current audio");

      // Set stopping flag
      this.isStopping = true;

      try {
        // If there's a play promise, wait for it to resolve before pausing
        if (this.audioPlayPromise) {
          try {
            await this.audioPlayPromise;
          } catch (error) {
            console.log(
              "VOICE SERVICE: Error waiting for play promise:",
              error
            );
          }
        }

        // Now pause the audio
        this.audio.pause();
        this.audio.src = "";
        this.audio = null;
        this.audioPlayPromise = null;
      } catch (error) {
        console.error("VOICE SERVICE: Error stopping audio:", error);
      } finally {
        // Reset stopping flag
        this.isStopping = false;
      }
    }

    // Return a resolved promise to ensure we can await this function
    return Promise.resolve();
  }

  /**
   * Stop all speech and clear the queue
   */
  public stopSpeaking(): void {
    console.log("stopSpeaking called");
    this.stopCurrentAudio();
    this.audioQueue = [];
    this.setStreamingStatus(false);
    this.processingQueue = false;

    // Clear active conversations
    this.activeConversations.clear();

    // Clear recently played texts
    this.recentlyPlayedTexts.clear();
  }

  /**
   * Clear all speech, including queue and history
   */
  public clearAllSpeech(): void {
    console.log("clearAllSpeech called");
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
      detail: { isSpeaking: status },
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
    console.log(
      "VOICE SERVICE: Checking if sentence is duplicate or similar:",
      sentence
    );
    console.log(
      "VOICE SERVICE: Current processed sentences count:",
      this.processedSentences.size
    );

    // Skip empty sentences
    if (!sentence.trim()) {
      return true;
    }

    // Exact match check
    if (this.processedSentences.has(sentence)) {
      console.log("VOICE SERVICE: Exact match found in processed sentences");
      return true;
    }

    // Normalize the sentence for comparison (lowercase, remove extra spaces)
    const normalizedSentence = sentence
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    console.log("VOICE SERVICE: Normalized sentence:", normalizedSentence);

    // Check for normalized exact matches
    const processedSentencesArray = Array.from(this.processedSentences);
    for (const processedSentence of processedSentencesArray) {
      const normalizedProcessed = processedSentence
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

      // If exact match after normalization
      if (normalizedSentence === normalizedProcessed) {
        console.log(
          "VOICE SERVICE: Normalized exact match found:",
          normalizedProcessed
        );
        return true;
      }

      // Check if one is a substring of the other (with high overlap)
      if (normalizedSentence.length > 10 && normalizedProcessed.length > 10) {
        if (normalizedSentence.includes(normalizedProcessed)) {
          console.log(
            "VOICE SERVICE: New sentence contains processed sentence:",
            normalizedProcessed
          );
          return true;
        }
        if (normalizedProcessed.includes(normalizedSentence)) {
          console.log(
            "VOICE SERVICE: Processed sentence contains new sentence:",
            normalizedSentence
          );
          return true;
        }
      }
    }

    console.log("VOICE SERVICE: No duplicate or similar sentence found");
    return false;
  }
}

export default VoiceService.getInstance();
