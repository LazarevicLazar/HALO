import React, { useContext, useEffect, useRef, useState } from 'react';
import { CompanionContext } from '../../contexts/CompanionContext';
import humeAiService from '../../services/humeAiService';
import audioService from '../../services/audioService';

interface VoiceInteractionProps {
  onError?: (error: string) => void;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ onError }) => {
  const { state, startVoiceInput, stopVoiceInput, sendTextMessage } = useContext(CompanionContext);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Check if voice features are enabled and supported
  useEffect(() => {
    const checkVoiceSupport = async () => {
      try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setVoiceSupported(false);
          setErrorMessage('Your browser does not support voice recording.');
          if (onError) onError('Your browser does not support voice recording.');
          return;
        }
        
        // Check if Hume AI API is available
        const apiAvailable = await humeAiService.checkApiAvailability();
        if (!apiAvailable) {
          console.warn('Hume AI API is not available. Using fallback voice processing.');
        }
        
        setVoiceSupported(true);
      } catch (error) {
        console.error('Error checking voice support:', error);
        setVoiceSupported(false);
        const errorMsg = 'Error initializing voice features.';
        setErrorMessage(errorMsg);
        if (onError) onError(errorMsg);
      }
    };
    
    checkVoiceSupport();
  }, [onError]);
  
  // Start recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Process the recorded audio
        await processAudio(audioBlob);
        
        // Release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      startVoiceInput();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMsg = 'Could not access microphone. Please check permissions.';
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      stopVoiceInput();
    }
  };
  
  // Process recorded audio
  const processAudio = async (audioBlob: Blob) => {
    // Define variables in the outer scope
    let transcribedText = '';
    let detectedEmotion = 'neutral';
    
    try {
      
      // Try to use Hume AI for speech recognition
      try {
        // Check if API is available
        const apiAvailable = await humeAiService.checkApiAvailability();
        if (!apiAvailable) {
          throw new Error('Hume AI API not available');
        }
        
        // Convert speech to text using Hume AI
        transcribedText = await humeAiService.speechToText(audioBlob);
        
        // Recognize emotion in the speech
        detectedEmotion = await humeAiService.recognizeEmotion(audioBlob);
        console.log('Detected emotion:', detectedEmotion);
        
        // Display emotion feedback to user
        setErrorMessage(`Detected mood: ${detectedEmotion}`);
        setTimeout(() => setErrorMessage(''), 3000);
      } catch (error) {
        console.warn('Error using Hume AI for speech recognition, falling back to Web Speech API:', error);
        
        // Fall back to Web Speech API
        transcribedText = await processBrowserSpeechRecognition(audioBlob);
      }
      if (transcribedText) {
        // Send the transcribed text to the companion
        await sendTextMessage(transcribedText);
      } else {
        const errorMsg = 'Could not understand audio. Please try again.';
        setErrorMessage(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Try browser speech recognition as a last resort
      try {
        const fallbackText = await processBrowserSpeechRecognition(audioBlob);
        if (fallbackText) {
          transcribedText = fallbackText;
        }
      } catch (fallbackError) {
        console.error('Fallback speech recognition also failed:', fallbackError);
      }
      
      // If we have text, send it to the companion
      if (transcribedText) {
        // Add emotion context to the message if detected
        if (detectedEmotion && detectedEmotion !== 'neutral') {
          transcribedText = `[Feeling ${detectedEmotion}] ${transcribedText}`;
        }
        
        await sendTextMessage(transcribedText);
      } else {
        const errorMsg = 'Could not understand audio. Please try again.';
        setErrorMessage(errorMsg);
        if (onError) onError(errorMsg);
      }
    }
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Process audio with browser's built-in speech recognition
  const processBrowserSpeechRecognition = async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }
      
      // Create audio element to play the recorded audio
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Set up event handlers
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        // If no result was received, resolve with empty string
        resolve('');
      };
      
      // Start recognition when audio starts playing
      audio.onplay = () => {
        recognition.start();
      };
      
      // Start playing the recorded audio
      audio.play().catch(error => {
        console.error('Error playing audio for recognition:', error);
        reject(error);
      });
    });
  };
  
  // Handle voice command to stop recording
  useEffect(() => {
    // This would be a more sophisticated implementation in a real app
    // For now, we'll just stop after 10 seconds
    let timer: NodeJS.Timeout;
    
    if (isListening) {
      timer = setTimeout(() => {
        stopRecording();
      }, 10000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isListening]);
  
  if (!voiceSupported) {
    return (
      <div className="voice-interaction error">
        <p className="text-danger">{errorMessage || 'Voice interaction is not supported.'}</p>
      </div>
    );
  }
  
  return (
    <div className="voice-interaction">
      <button 
        className={`button ${isRecording ? 'active' : ''}`}
        onClick={toggleRecording}
        disabled={state === 'talking'}
        style={{ 
          width: '100%',
          backgroundColor: isRecording ? 'var(--danger-color)' : 'var(--accent-color)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span className={`icon ${isRecording ? 'recording' : ''}`} style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: isRecording ? 'var(--background-color)' : 'var(--text-color)',
          animation: isRecording ? 'pulse 1.5s infinite' : 'none'
        }}></span>
        {isRecording ? 'Stop Voice' : 'Start Voice Interaction'}
      </button>
      
      {errorMessage && (
        <p className="text-danger" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {errorMessage}
        </p>
      )}
      
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default VoiceInteraction;