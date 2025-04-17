import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import geminiService from "../services/GeminiService";
import voiceService from "../services/VoiceService";

// Message interface
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  imageData?: string; // Base64 encoded image data
}

// Context type
interface CompanionContextType {
  state: "idle" | "thinking" | "responding";
  messages: Message[];
  sendMessage: (message: string) => void;
  sendImageMessage: (imageData: string) => void; // New function to send image messages
  triggerCompanionResponse: (event: string) => Promise<void>;
  clearConversation: () => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
}

// Create context with default values
export const CompanionContext = createContext<CompanionContextType>({
  state: "idle",
  messages: [],
  sendMessage: () => {},
  sendImageMessage: () => {}, // Add default implementation
  triggerCompanionResponse: async () => {},
  clearConversation: () => {},
  isVoiceEnabled: false,
  setIsVoiceEnabled: () => {},
});

// Provider component
export const CompanionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<"idle" | "thinking" | "responding">(
    "idle"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(
    process.env.REACT_APP_ENABLE_VOICE_FEATURES === "true"
  );

  // Create a stable conversation ID for the current session
  const sessionConversationIdRef = useRef<string>(`session_${uuidv4()}`);

  // Buffer for accumulating text chunks for TTS
  const textBufferRef = useRef<string>("");

  // Minimum buffer size before sending to TTS (characters)
  const MIN_BUFFER_SIZE = 20;

  // Maximum time to wait before sending buffer to TTS (milliseconds)
  const MAX_BUFFER_TIME = 500;

  // Timer for buffer flushing
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Current message ID for TTS
  const currentMessageIdRef = useRef<string>("");

  // Log voice settings on mount
  useEffect(() => {
    console.log("CompanionContext initialized");
    console.log("Voice features enabled in context:", isVoiceEnabled);
    console.log(
      "REACT_APP_ENABLE_VOICE_FEATURES:",
      process.env.REACT_APP_ENABLE_VOICE_FEATURES
    );
    console.log("Session conversation ID:", sessionConversationIdRef.current);
  }, [isVoiceEnabled]);

  // Process TARS responses for optimal voice delivery
  const processTARSResponse = useCallback((text: string): string => {
    // Remove any asterisks or other special characters that might be spoken literally
    let processed = text.replace(/\*/g, "").replace(/\_/g, "");

    // Instead of adding line breaks, use proper punctuation that ElevenLabs understands

    // Ensure proper pauses after sentences by adding a period if needed
    processed = processed.replace(/([.!?])("|')?(\s*)([A-Z])/g, "$1$2. $4");

    // Handle ellipses for hesitation by ensuring proper spacing
    processed = processed.replace(/\.\.\.(\s*)([a-zA-Z])/g, "... $2");

    // Handle dashes for interruptions by ensuring proper spacing
    processed = processed.replace(/—(\s*)([a-zA-Z])/g, "— $2");

    // Add slight pauses between short, punchy sentences for emphasis using periods
    processed = processed.replace(/\.\s+([\w\s]{1,20}\.)\s+/g, ". $1. ");

    // Log the processed text for debugging
    console.log("Processed text for TTS:", processed);

    return processed;
  }, []);

  // Function to flush the text buffer and send it to TTS
  const flushTextBuffer = useCallback(() => {
    if (
      textBufferRef.current.trim() &&
      isVoiceEnabled &&
      currentMessageIdRef.current
    ) {
      const processedText = processTARSResponse(textBufferRef.current);
      const conversationId = `${
        currentMessageIdRef.current
      }_chunk_${Date.now()}`;

      console.log("Flushing text buffer to TTS:", processedText);
      console.log("Conversation ID:", conversationId);

      voiceService.streamSentence(processedText, conversationId);
      textBufferRef.current = "";
    }

    // Clear the timer
    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current);
      bufferTimerRef.current = null;
    }
  }, [isVoiceEnabled, processTARSResponse]);

  // Function to add text to the buffer and potentially flush it
  const addToTextBuffer = useCallback(
    (text: string) => {
      if (!isVoiceEnabled) return;

      // Add text to buffer
      textBufferRef.current += text;

      // Check if we should flush the buffer
      if (textBufferRef.current.length >= MIN_BUFFER_SIZE) {
        // If the buffer ends with a sentence-ending punctuation, flush immediately
        if (/[.!?][\s"']*$/.test(textBufferRef.current)) {
          flushTextBuffer();
        } else if (!bufferTimerRef.current) {
          // Otherwise, set a timer to flush after MAX_BUFFER_TIME
          bufferTimerRef.current = setTimeout(flushTextBuffer, MAX_BUFFER_TIME);
        }
      } else if (!bufferTimerRef.current) {
        // Set a timer to ensure the buffer gets flushed eventually
        bufferTimerRef.current = setTimeout(flushTextBuffer, MAX_BUFFER_TIME);
      }
    },
    [isVoiceEnabled, flushTextBuffer]
  );

  // Reference to the current streaming message
  const streamingMessageRef = useRef<Message | null>(null);

  // Generate a response based on user input
  const getResponse = (message: string): string => {
    // Simple pattern matching for responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm your assistant. How can I help you today?";
    }

    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what can you do")
    ) {
      return "I can answer questions, provide information, and assist with various tasks. Just let me know what you need help with!";
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    if (lowerMessage.includes("weather")) {
      return "I don't have access to real-time weather data, but I can help you find weather information online or answer other questions.";
    }

    if (lowerMessage.includes("time") || lowerMessage.includes("date")) {
      return `The current time and date is ${new Date().toLocaleString()}.`;
    }

    if (lowerMessage.includes("name")) {
      return "I'm your AI assistant. You can call me Assistant.";
    }

    // Default response
    return "I understand. Is there anything specific you'd like to know or discuss?";
  };

  // Send a message and get a response
  const sendMessage = useCallback(
    async (message: string) => {
      // Add user message
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setState("thinking");

      try {
        // Create a placeholder for the assistant's response
        const assistantMessage: Message = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        // Add the placeholder message
        setMessages((prev) => [...prev, assistantMessage]);
        streamingMessageRef.current = assistantMessage;

        setState("responding");

        // Stop any previous speech
        if (isVoiceEnabled) {
          voiceService.stopSpeaking();
        }

        // Generate a unique message ID for this specific message
        const messageId = uuidv4();
        currentMessageIdRef.current = `${sessionConversationIdRef.current}_msg_${messageId}`;
        console.log(
          "Generated unique conversation ID for message:",
          currentMessageIdRef.current
        );

        // Reset text buffer
        textBufferRef.current = "";

        // Generate streaming response with chunk-level processing for voice
        await geminiService.generateStreamingResponse(
          message,
          // Handle each text chunk for display and TTS
          (chunkText) => {
            // Update the streaming message with each chunk
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const lastIndex = updatedMessages.length - 1;

              if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
                updatedMessages[lastIndex] = {
                  ...updatedMessages[lastIndex],
                  content: updatedMessages[lastIndex].content + chunkText,
                };
              }

              return updatedMessages;
            });

            // Add the chunk to the TTS buffer
            if (isVoiceEnabled) {
              addToTextBuffer(chunkText);
            }
          },
          // We're no longer using the sentence-level callback since we're processing chunks directly
          undefined
        );

        // Flush any remaining text in the buffer
        if (isVoiceEnabled) {
          flushTextBuffer();
        }

        // Mark the message as no longer streaming
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastIndex = updatedMessages.length - 1;

          if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              isStreaming: false,
            };
          }

          return updatedMessages;
        });

        streamingMessageRef.current = null;
        currentMessageIdRef.current = "";

        setState("idle");
      } catch (error) {
        console.error("Error processing message:", error);

        // Add error message
        const errorMessage: Message = {
          role: "assistant",
          content:
            "I apologize, but I encountered an error while processing your request.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => {
          // Remove the streaming message if it exists
          const filteredMessages = prev.filter((msg) => !msg.isStreaming);
          return [...filteredMessages, errorMessage];
        });

        streamingMessageRef.current = null;
        currentMessageIdRef.current = "";
        setState("idle");
      }
    },
    [isVoiceEnabled, addToTextBuffer, flushTextBuffer]
  );

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setMessages([]);
    // Generate a new session ID when clearing the conversation
    sessionConversationIdRef.current = `session_${uuidv4()}`;
    console.log(
      "Generated new session conversation ID:",
      sessionConversationIdRef.current
    );
  }, []);

  // Trigger a companion response based on an event
  const triggerCompanionResponse = useCallback(
    async (event: string) => {
      // Parse the event
      const [eventType, eventData] = event.split(":");

      // Check if this is a valid event type we want to respond to
      switch (eventType) {
        case "inventory_added":
        case "inventory_removed":
        case "inventory_updated":
        case "trade_completed":
        case "map_marker_added":
          // These are valid events we want to respond to
          break;
        default:
          return; // Don't respond to unknown events
      }

      setState("thinking");

      try {
        // Generate a prompt based on the event
        const prompt = `The user has ${eventType.replace(
          "_",
          " "
        )} ${eventData}. Provide a brief, helpful response about this action in the context of a post-apocalyptic survival scenario.`;

        // Create a placeholder for the assistant's response
        const assistantMessage: Message = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        // Add the placeholder message
        setMessages((prev) => [...prev, assistantMessage]);
        streamingMessageRef.current = assistantMessage;

        setState("responding");

        // Stop any previous speech
        if (isVoiceEnabled) {
          voiceService.stopSpeaking();
        }

        // Generate a unique event ID
        const eventId = uuidv4();
        currentMessageIdRef.current = `${sessionConversationIdRef.current}_event_${eventType}_${eventId}`;
        console.log(
          "Generated unique conversation ID for event:",
          currentMessageIdRef.current
        );

        // Reset text buffer
        textBufferRef.current = "";

        // Generate streaming response with chunk-level processing for voice
        await geminiService.generateStreamingResponse(
          prompt,
          // Handle each text chunk for display and TTS
          (chunkText) => {
            // Update the streaming message with each chunk
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const lastIndex = updatedMessages.length - 1;

              if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
                updatedMessages[lastIndex] = {
                  ...updatedMessages[lastIndex],
                  content: updatedMessages[lastIndex].content + chunkText,
                };
              }

              return updatedMessages;
            });

            // Add the chunk to the TTS buffer
            if (isVoiceEnabled) {
              addToTextBuffer(chunkText);
            }
          },
          // We're no longer using the sentence-level callback
          undefined
        );

        // Flush any remaining text in the buffer
        if (isVoiceEnabled) {
          flushTextBuffer();
        }

        // Mark the message as no longer streaming
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastIndex = updatedMessages.length - 1;

          if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              isStreaming: false,
            };
          }

          return updatedMessages;
        });

        streamingMessageRef.current = null;
        currentMessageIdRef.current = "";

        setState("idle");
      } catch (error) {
        console.error("Error generating event response:", error);

        // Add error message if needed
        if (streamingMessageRef.current) {
          setMessages((prev) => {
            // Remove the streaming message
            const filteredMessages = prev.filter((msg) => !msg.isStreaming);
            return [
              ...filteredMessages,
              {
                role: "assistant",
                content:
                  "I apologize, but I encountered an error while processing this event.",
                timestamp: new Date().toISOString(),
              },
            ];
          });

          streamingMessageRef.current = null;
          currentMessageIdRef.current = "";
        }

        setState("idle");
      }
    },
    [isVoiceEnabled, addToTextBuffer, flushTextBuffer]
  );

  // Toggle voice features
  const handleSetIsVoiceEnabled = useCallback((enabled: boolean) => {
    console.log("Setting voice enabled to:", enabled);
    setIsVoiceEnabled(enabled);
    if (!enabled) {
      console.log("Voice disabled, stopping speech");
      voiceService.stopSpeaking();
    } else {
      console.log("Voice enabled");
    }
  }, []);

  // Send an image message and get a response
  const sendImageMessage = useCallback(
    async (imageData: string) => {
      console.log("Sending image message...");

      // Add user message with image
      const userMessage: Message = {
        role: "user",
        content: "Image captured",
        timestamp: new Date().toISOString(),
        imageData: imageData,
      };

      setMessages((prev) => [...prev, userMessage]);
      setState("thinking");

      try {
        // Create a placeholder for the assistant's response
        const assistantMessage: Message = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        // Add the placeholder message
        setMessages((prev) => [...prev, assistantMessage]);
        streamingMessageRef.current = assistantMessage;

        setState("responding");

        // Stop any previous speech
        if (isVoiceEnabled) {
          voiceService.stopSpeaking();
        }

        // Generate a unique image ID
        const imageId = uuidv4();
        currentMessageIdRef.current = `${sessionConversationIdRef.current}_image_${imageId}`;
        console.log(
          "Generated unique conversation ID for image:",
          currentMessageIdRef.current
        );

        // Reset text buffer
        textBufferRef.current = "";

        // Generate streaming response with chunk-level processing for voice
        await geminiService.analyzeImage(
          imageData,
          // Handle each text chunk for display and TTS
          (chunkText) => {
            // Update the streaming message with each chunk
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const lastIndex = updatedMessages.length - 1;

              if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
                updatedMessages[lastIndex] = {
                  ...updatedMessages[lastIndex],
                  content: updatedMessages[lastIndex].content + chunkText,
                };
              }

              return updatedMessages;
            });

            // Add the chunk to the TTS buffer
            if (isVoiceEnabled) {
              addToTextBuffer(chunkText);
            }
          },
          // We're no longer using the sentence-level callback
          undefined
        );

        // Flush any remaining text in the buffer
        if (isVoiceEnabled) {
          flushTextBuffer();
        }

        // Mark the message as no longer streaming
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastIndex = updatedMessages.length - 1;

          if (lastIndex >= 0 && updatedMessages[lastIndex].isStreaming) {
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              isStreaming: false,
            };
          }

          return updatedMessages;
        });

        streamingMessageRef.current = null;
        currentMessageIdRef.current = "";

        setState("idle");
      } catch (error) {
        console.error("Error processing image:", error);

        // Add error message
        const errorMessage: Message = {
          role: "assistant",
          content:
            "I apologize, but I encountered an error while analyzing the image.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => {
          // Remove the streaming message if it exists
          const filteredMessages = prev.filter((msg) => !msg.isStreaming);
          return [...filteredMessages, errorMessage];
        });

        streamingMessageRef.current = null;
        currentMessageIdRef.current = "";
        setState("idle");
      }
    },
    [isVoiceEnabled, addToTextBuffer, flushTextBuffer]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (bufferTimerRef.current) {
        clearTimeout(bufferTimerRef.current);
      }
    };
  }, []);

  return (
    <CompanionContext.Provider
      value={{
        state,
        messages,
        sendMessage,
        sendImageMessage,
        clearConversation,
        triggerCompanionResponse,
        isVoiceEnabled,
        setIsVoiceEnabled: handleSetIsVoiceEnabled,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
};
