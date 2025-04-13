// Add type declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Define the SpeechRecognition type
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Define the SpeechRecognition constructor
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Get the appropriate SpeechRecognition object based on browser support
const SpeechRecognitionAPI = window.SpeechRecognition ||
  (window as any).webkitSpeechRecognition as SpeechRecognitionConstructor;

export class SpeechRecognitionService {
  private static instance: SpeechRecognitionService;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  
  private constructor() {
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      // Use non-null assertion since we just created the recognition object
      this.recognition!.continuous = false;
      this.recognition!.interimResults = false;
      this.recognition!.lang = 'en-US';
      this.recognition!.maxAlternatives = 1;
      
      this.recognition!.onresult = this.handleResult.bind(this);
      this.recognition!.onend = this.handleEnd.bind(this);
      this.recognition!.onerror = this.handleError.bind(this);
      this.recognition!.onstart = this.handleStart.bind(this);
    }
  }
  
  public static getInstance(): SpeechRecognitionService {
    if (!SpeechRecognitionService.instance) {
      SpeechRecognitionService.instance = new SpeechRecognitionService();
    }
    return SpeechRecognitionService.instance;
  }
  
  public isSupported(): boolean {
    return !!this.recognition;
  }
  
  public startListening(): boolean {
    if (!this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition is not supported in this browser.');
      }
      return false;
    }
    
    if (this.isListening) {
      return true;
    }
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('Error starting speech recognition.');
      }
      return false;
    }
  }
  
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  public setOnResult(callback: (text: string) => void): void {
    this.onResultCallback = callback;
  }
  
  public setOnEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }
  
  public setOnStart(callback: () => void): void {
    this.onStartCallback = callback;
  }
  
  public setOnError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }
  
  private handleResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.resultIndex];
    if (result.isFinal) {
      const transcript = result[0].transcript.trim();
      if (transcript && this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    }
  }
  
  private handleEnd(): void {
    this.isListening = false;
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }
  
  private handleStart(): void {
    this.isListening = true;
    if (this.onStartCallback) {
      this.onStartCallback();
    }
  }
  
  private handleError(event: Event): void {
    this.isListening = false;
    console.error('Speech recognition error:', event);
    if (this.onErrorCallback) {
      this.onErrorCallback('An error occurred during speech recognition.');
    }
  }
}

export default SpeechRecognitionService.getInstance();