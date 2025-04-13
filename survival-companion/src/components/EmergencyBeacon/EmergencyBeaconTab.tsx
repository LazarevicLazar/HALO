import React, { useState, useEffect, useRef } from "react";
import "./EmergencyBeacon.css";

// Morse code mapping
const morseCodeMap: { [key: string]: string } = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
};

// SOS in Morse code
const SOS_MORSE = "... --- ...";

// Speed settings in milliseconds
const SPEED_SETTINGS = {
  slow: 600,
  medium: 300,
  fast: 150,
};

// Brightness settings in percentage
const BRIGHTNESS_SETTINGS = {
  low: 40,
  medium: 70,
  high: 100,
};

// Volume settings in percentage
const VOLUME_SETTINGS = {
  low: 30,
  medium: 60,
  high: 90,
};

// Morse code timing constants
const DOT_DURATION_RATIO = 1;
const DASH_DURATION_RATIO = 3;
const ELEMENT_GAP_RATIO = 1;
const LETTER_GAP_RATIO = 3;
const WORD_GAP_RATIO = 7;
const MESSAGE_GAP_MS = 500; // 0.5 second gap between message repetitions

const EmergencyBeaconTab: React.FC = () => {
  // State for beacon settings
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState("SOS");
  const [morseMessage, setMorseMessage] = useState(SOS_MORSE);
  const [flashSpeedSetting, setFlashSpeedSetting] = useState("medium");
  const [flashBrightnessSetting, setFlashBrightnessSetting] =
    useState("medium");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioPattern, setAudioPattern] = useState("morse"); // morse, continuous, intermittent, escalating
  const [audioVolumeSetting, setAudioVolumeSetting] = useState("medium");

  // Computed values from settings
  const flashSpeed =
    SPEED_SETTINGS[flashSpeedSetting as keyof typeof SPEED_SETTINGS];
  const flashBrightness =
    BRIGHTNESS_SETTINGS[
      flashBrightnessSetting as keyof typeof BRIGHTNESS_SETTINGS
    ];
  const audioVolume =
    VOLUME_SETTINGS[audioVolumeSetting as keyof typeof VOLUME_SETTINGS];

  // Refs
  const beaconRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isFlashingRef = useRef(false);
  const audioIntervalRef = useRef<number | null>(null);
  const morseAudioTimeoutRef = useRef<number | null>(null);
  const scheduledFlashesRef = useRef<
    Array<{ timeoutId: number; endTimeoutId: number | null }>
  >([]);

  // Convert text to Morse code
  const textToMorse = (text: string): string => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => morseCodeMap[char] || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Update Morse code when message changes
  useEffect(() => {
    if (message.toUpperCase() === "SOS") {
      setMorseMessage(SOS_MORSE);
    } else {
      setMorseMessage(textToMorse(message));
    }
  }, [message]);

  // Initialize audio context
  useEffect(() => {
    // Create audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    // Add event listener for user interaction
    document.addEventListener("click", initAudio, { once: true });

    return () => {
      document.removeEventListener("click", initAudio);
    };
  }, []);

  // Handle beacon activation/deactivation
  useEffect(() => {
    if (isActive) {
      startBeacon();
    } else {
      stopBeacon();
    }

    return () => {
      stopBeacon();
    };
  }, [
    isActive,
    morseMessage,
    flashSpeed,
    flashBrightness,
    audioEnabled,
    audioPattern,
    audioVolume,
  ]);

  // Set the beacon flashing state
  const setBeaconFlashing = (flashing: boolean) => {
    isFlashingRef.current = flashing;

    if (beaconRef.current) {
      if (flashing) {
        beaconRef.current.style.backgroundColor = `rgba(255, 255, 255, ${
          flashBrightness / 100
        })`;
      } else {
        beaconRef.current.style.backgroundColor = "";
      }
    }
  };

  // Schedule a flash with precise timing
  const scheduleFlash = (startDelay: number, duration: number) => {
    if (!isActive) return;

    // Schedule start of flash
    const startTimeoutId = window.setTimeout(() => {
      setBeaconFlashing(true);
    }, startDelay);

    // Schedule end of flash
    const endTimeoutId = window.setTimeout(() => {
      setBeaconFlashing(false);
    }, startDelay + duration);

    // Store timeout IDs for cleanup
    scheduledFlashesRef.current.push({
      timeoutId: startTimeoutId,
      endTimeoutId: endTimeoutId,
    });
  };

  // Clear all scheduled flashes
  const clearScheduledFlashes = () => {
    scheduledFlashesRef.current.forEach((flash) => {
      clearTimeout(flash.timeoutId);
      if (flash.endTimeoutId !== null) {
        clearTimeout(flash.endTimeoutId);
      }
    });
    scheduledFlashesRef.current = [];
    setBeaconFlashing(false);
  };

  // Play a beep with the specified duration and frequency
  const playBeep = (
    duration: number,
    frequency: number,
    volume: number,
    startTime: number
  ) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.setValueAtTime(volume, startTime + duration - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // Play Morse code audio and schedule visual flashes
  const playMorseCodeAudio = () => {
    if (!audioContextRef.current || !isActive) return;

    // Clear any existing timeouts and scheduled flashes
    if (morseAudioTimeoutRef.current !== null) {
      clearTimeout(morseAudioTimeoutRef.current);
      morseAudioTimeoutRef.current = null;
    }
    clearScheduledFlashes();

    // Base unit duration in seconds
    const unitDuration = flashSpeed / 1000;

    // Frequencies
    const dotFrequency = 1000; // Hz
    const dashFrequency = 800; // Hz

    // Volume
    const volume = audioEnabled ? audioVolume / 100 : 0;

    // Current time for audio scheduling
    let currentTime = audioContextRef.current.currentTime;

    // Current delay for visual scheduling (in ms)
    let currentDelay = 0;

    // Process each character in the Morse code
    for (let i = 0; i < morseMessage.length; i++) {
      const char = morseMessage[i];

      if (char === ".") {
        // Play a dot (short beep)
        if (audioEnabled && audioPattern === "morse") {
          playBeep(
            unitDuration * DOT_DURATION_RATIO,
            dotFrequency,
            volume,
            currentTime
          );
        }

        // Schedule a dot flash
        scheduleFlash(currentDelay, unitDuration * DOT_DURATION_RATIO * 1000);

        // Update timers
        currentTime += unitDuration * (DOT_DURATION_RATIO + ELEMENT_GAP_RATIO);
        currentDelay +=
          unitDuration * (DOT_DURATION_RATIO + ELEMENT_GAP_RATIO) * 1000;
      } else if (char === "-") {
        // Play a dash (long beep)
        if (audioEnabled && audioPattern === "morse") {
          playBeep(
            unitDuration * DASH_DURATION_RATIO,
            dashFrequency,
            volume,
            currentTime
          );
        }

        // Schedule a dash flash
        scheduleFlash(currentDelay, unitDuration * DASH_DURATION_RATIO * 1000);

        // Update timers
        currentTime += unitDuration * (DASH_DURATION_RATIO + ELEMENT_GAP_RATIO);
        currentDelay +=
          unitDuration * (DASH_DURATION_RATIO + ELEMENT_GAP_RATIO) * 1000;
      } else if (char === " ") {
        // Space between letters (already added element gap, so add the difference)
        currentTime += unitDuration * (LETTER_GAP_RATIO - ELEMENT_GAP_RATIO);
        currentDelay +=
          unitDuration * (LETTER_GAP_RATIO - ELEMENT_GAP_RATIO) * 1000;
      } else if (char === "/") {
        // Space between words
        currentTime += unitDuration * WORD_GAP_RATIO;
        currentDelay += unitDuration * WORD_GAP_RATIO * 1000;
      }
    }

    // Add 0.5 second gap between message repetitions
    currentTime += MESSAGE_GAP_MS / 1000;
    currentDelay += MESSAGE_GAP_MS;

    // Schedule replay of the Morse code after it finishes
    const totalDuration =
      (currentTime - audioContextRef.current.currentTime) * 1000;
    morseAudioTimeoutRef.current = window.setTimeout(() => {
      if (isActive) {
        playMorseCodeAudio();
      }
    }, totalDuration);
  };

  // Start the beacon
  const startBeacon = () => {
    isFlashingRef.current = false;
    setBeaconFlashing(false);

    // Start audio based on pattern
    if (audioPattern === "morse") {
      playMorseCodeAudio();
    } else if (audioEnabled) {
      startContinuousAudio();
    }
  };

  // Start continuous audio patterns
  const startContinuousAudio = () => {
    if (!audioContextRef.current) return;

    // Create oscillator and gain node
    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    oscillatorRef.current.type = "sine";
    oscillatorRef.current.frequency.value = 800; // Hz

    // Set initial volume to 0 (silent)
    gainNodeRef.current.gain.value = 0;

    // Connect oscillator to gain node
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    // Start oscillator
    oscillatorRef.current.start();

    // Handle different audio patterns
    switch (audioPattern) {
      case "continuous":
        // Continuous tone
        gainNodeRef.current.gain.value = audioVolume / 100;
        break;
      case "intermittent":
        // Intermittent tone - alternate on/off
        gainNodeRef.current.gain.value = audioVolume / 100;
        audioIntervalRef.current = window.setInterval(() => {
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.value =
              gainNodeRef.current.gain.value > 0 ? 0 : audioVolume / 100;
          }
        }, flashSpeed * 2);
        break;
      case "escalating":
        // Escalating tone - increase frequency over time
        gainNodeRef.current.gain.value = audioVolume / 100;
        let frequency = 400;
        audioIntervalRef.current = window.setInterval(() => {
          if (oscillatorRef.current) {
            frequency = frequency < 1200 ? frequency + 50 : 400;
            oscillatorRef.current.frequency.value = frequency;
          }
        }, flashSpeed * 3);
        break;
      default:
        break;
    }
  };

  // Stop the beacon
  const stopBeacon = () => {
    // Clear all scheduled flashes
    clearScheduledFlashes();

    // Stop audio
    stopAudio();

    // Clear any intervals
    if (audioIntervalRef.current !== null) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    // Clear any timeouts
    if (morseAudioTimeoutRef.current !== null) {
      clearTimeout(morseAudioTimeoutRef.current);
      morseAudioTimeoutRef.current = null;
    }
  };

  // Stop audio
  const stopAudio = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  // Toggle beacon activation
  const toggleBeacon = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="card">
      <h2 className="card-title">Emergency Beacon System</h2>

      <div className="emergency-beacon-container">
        <div className="beacon-display-container">
          <div
            ref={beaconRef}
            className={`beacon-display ${isActive ? "active" : ""}`}
          >
            <div className="beacon-message">{message}</div>
            <div className="morse-display">{morseMessage}</div>
          </div>

          <button
            className={`beacon-toggle-button ${isActive ? "active" : ""}`}
            onClick={toggleBeacon}
          >
            {isActive
              ? "DEACTIVATE EMERGENCY BEACON"
              : "ACTIVATE EMERGENCY BEACON"}
          </button>
        </div>

        <div className="beacon-controls">
          <div className="control-section">
            <h3>Message Settings</h3>

            <div className="control-group">
              <label htmlFor="message-input">Message:</label>
              <input
                id="message-input"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isActive}
                placeholder="Enter message (default: SOS)"
              />
            </div>

            <div className="preset-buttons">
              <button
                onClick={() => setMessage("SOS")}
                disabled={isActive}
                className={message === "SOS" ? "active" : ""}
              >
                SOS
              </button>
              <button
                onClick={() => setMessage("HELP")}
                disabled={isActive}
                className={message === "HELP" ? "active" : ""}
              >
                HELP
              </button>
              <button
                onClick={() => setMessage("MAYDAY")}
                disabled={isActive}
                className={message === "MAYDAY" ? "active" : ""}
              >
                MAYDAY
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>Visual Settings</h3>

            <div className="control-group">
              <label>Flash Speed:</label>
              <div className="level-selector">
                <button
                  className={flashSpeedSetting === "slow" ? "active" : ""}
                  onClick={() => setFlashSpeedSetting("slow")}
                  disabled={isActive}
                >
                  Slow
                </button>
                <button
                  className={flashSpeedSetting === "medium" ? "active" : ""}
                  onClick={() => setFlashSpeedSetting("medium")}
                  disabled={isActive}
                >
                  Medium
                </button>
                <button
                  className={flashSpeedSetting === "fast" ? "active" : ""}
                  onClick={() => setFlashSpeedSetting("fast")}
                  disabled={isActive}
                >
                  Fast
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Brightness:</label>
              <div className="level-selector">
                <button
                  className={flashBrightnessSetting === "low" ? "active" : ""}
                  onClick={() => setFlashBrightnessSetting("low")}
                  disabled={isActive}
                >
                  Low
                </button>
                <button
                  className={
                    flashBrightnessSetting === "medium" ? "active" : ""
                  }
                  onClick={() => setFlashBrightnessSetting("medium")}
                  disabled={isActive}
                >
                  Medium
                </button>
                <button
                  className={flashBrightnessSetting === "high" ? "active" : ""}
                  onClick={() => setFlashBrightnessSetting("high")}
                  disabled={isActive}
                >
                  High
                </button>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Audio Settings</h3>

            <div className="control-group checkbox">
              <label htmlFor="audio-enabled">
                <input
                  id="audio-enabled"
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                  disabled={isActive}
                />
                Enable Audio
              </label>
            </div>

            <div className="control-group">
              <label htmlFor="audio-pattern">Audio Pattern:</label>
              <select
                id="audio-pattern"
                value={audioPattern}
                onChange={(e) => setAudioPattern(e.target.value)}
                disabled={isActive || !audioEnabled}
              >
                <option value="morse">Morse Code (Sync with Visual)</option>
                <option value="continuous">Continuous Tone</option>
                <option value="intermittent">Intermittent Tone</option>
                <option value="escalating">Escalating Tone</option>
              </select>
            </div>

            <div className="control-group">
              <label>Volume:</label>
              <div className="level-selector">
                <button
                  className={audioVolumeSetting === "low" ? "active" : ""}
                  onClick={() => setAudioVolumeSetting("low")}
                  disabled={isActive || !audioEnabled}
                >
                  Low
                </button>
                <button
                  className={audioVolumeSetting === "medium" ? "active" : ""}
                  onClick={() => setAudioVolumeSetting("medium")}
                  disabled={isActive || !audioEnabled}
                >
                  Medium
                </button>
                <button
                  className={audioVolumeSetting === "high" ? "active" : ""}
                  onClick={() => setAudioVolumeSetting("high")}
                  disabled={isActive || !audioEnabled}
                >
                  High
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="morse-code-reference">
        <h3>Morse Code Reference</h3>
        <div className="morse-grid">
          {Object.entries(morseCodeMap)
            .filter(([key]) => key !== " ")
            .map(([char, code]) => (
              <div key={char} className="morse-item">
                <span className="morse-char">{char}</span>
                <span className="morse-code">{code}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyBeaconTab;
