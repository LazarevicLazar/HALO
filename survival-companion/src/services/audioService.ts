/**
 * Audio Service
 * 
 * This service handles audio playback for the AI companion's voice responses.
 * It provides methods for playing audio from URLs or Blob objects.
 */

class AudioService {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.8; // Default volume (0-1)
  
  constructor() {
    // Initialize audio context when needed (to avoid autoplay restrictions)
    this.initAudioContext = this.initAudioContext.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.stopAudio = this.stopAudio.bind(this);
    this.setVolume = this.setVolume.bind(this);
  }
  
  /**
   * Initialize the audio context
   * This should be called in response to a user interaction
   */
  public initAudioContext(): void {
    if (this.audioContext) return;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);
      
      // Create audio element
      this.audioElement = document.createElement('audio');
      this.audioElement.crossOrigin = 'anonymous';
      
      // Connect audio element to audio context
      this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
      this.audioSource.connect(this.gainNode);
      
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }
  
  /**
   * Play audio from a URL or Blob
   * 
   * @param source URL string or Blob object
   * @returns Promise that resolves when audio playback starts
   */
  public async playAudio(source: string | Blob): Promise<void> {
    // Initialize audio context if not already initialized
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    // Resume audio context if suspended
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Stop any currently playing audio
    this.stopAudio();
    
    // Create object URL if source is a Blob
    const audioUrl = source instanceof Blob ? URL.createObjectURL(source) : source;
    
    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('Audio element not initialized'));
        return;
      }
      
      // Set up event listeners
      const onPlay = () => {
        this.isPlaying = true;
        resolve();
        this.audioElement?.removeEventListener('play', onPlay);
      };
      
      const onError = (error: Event) => {
        console.error('Error playing audio:', error);
        reject(new Error('Error playing audio'));
        this.audioElement?.removeEventListener('error', onError);
      };
      
      const onEnded = () => {
        this.isPlaying = false;
        
        // Revoke object URL if source was a Blob
        if (source instanceof Blob) {
          URL.revokeObjectURL(audioUrl);
        }
        
        this.audioElement?.removeEventListener('ended', onEnded);
      };
      
      // Add event listeners
      this.audioElement.addEventListener('play', onPlay);
      this.audioElement.addEventListener('error', onError);
      this.audioElement.addEventListener('ended', onEnded);
      
      // Set source and play
      this.audioElement.src = audioUrl;
      this.audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        reject(error);
      });
    });
  }
  
  /**
   * Stop audio playback
   */
  public stopAudio(): void {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
  }
  
  /**
   * Set audio volume
   * 
   * @param volume Volume level (0-1)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }
  
  /**
   * Check if audio is currently playing
   * 
   * @returns True if audio is playing
   */
  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * Get current volume level
   * 
   * @returns Volume level (0-1)
   */
  public getVolume(): number {
    return this.volume;
  }
  
  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopAudio();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.audioElement = null;
    this.audioSource = null;
    this.gainNode = null;
  }
}

// Create singleton instance
const audioService = new AudioService();

export default audioService;