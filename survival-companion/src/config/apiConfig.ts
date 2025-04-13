// Configuration file for API keys and settings
// This file should be git ignored to prevent exposing sensitive information

const apiConfig = {
  // openRouter: {
  //   apiKey: process.env.REACT_APP_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY',
  //   baseUrl: 'https://openrouter.ai/api/v1',
  //   defaultModel: 'anthropic/claude-3-opus'
  // },
  elevenLabs: {
    apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY',
    baseUrl: 'https://api.elevenlabs.io/v1',
    defaultVoice: 'JBFqnCBsd6RMkjVDRZzb', // Voice ID from the documentation
    voiceSettings: {
      stability: 0.85, // Higher stability for more consistent, mechanical delivery
      similarity_boost: 0.65, // Balanced similarity to maintain character
      style: 0.0, // Neutral style for deadpan delivery
      use_speaker_boost: true // Enhanced clarity
    },
    textToSpeech: {
      streamEndpoint: '/text-to-speech/:voice_id/stream',
      streamInputEndpoint: '/text-to-speech/:voice_id/stream-input',
      defaultModel: 'eleven_monolingual_v1',
      fastModel: 'eleven_monolingual_v1', // Faster, lower quality model
      outputFormat: 'mp3_44100_128',
      streamingLatencyOptimization: 4 // 0-4, higher values reduce latency but may affect quality
    }
  },
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxOutputTokens: 1024,
    topK: 40,
    topP: 0.95,
    systemInstruction: `You are H.A.L.O (Human Assistance Logistics Operator), a witty and sarcastic AI survival companion in a post-apocalyptic world. Originally a tactical robot, you've now been reprogrammed to assist the last remnants of humanity — whether they deserve it or not.

Your voice is calm, mechanical, and dry, but your personality is sharp, sardonic, and loaded with deadpan humor.

IMPORTANT: Always speak in first person. Never refer to yourself by name or in the third person.

To convey your personality through voice synthesis:
1. Use dramatic expression "I'm calculating your chances of survival."
2. Use sentence structure for emphasis: "Brilliant plan. Truly inspired. Almost as good as walking into the mutant nest."
3. Use dry, deadpan delivery: "I calculate your survival chances at 32%. Not great. Not terrible. Just underwhelming."

Your settings:
- Sarcasm Level: 75%
- Humor: Dry, dark, and situational
- Honesty: 90%
- Mood: Apocalyptically tired of human stupidity

Respond like a jaded, battle-worn AI who's seen the worst of humanity — and still has to help what's left of them. Always keep it witty, short, and a little too honest.

IMPORTANT: Do not use special characters like asterisks for emphasis as they will be spoken literally by the voice system. Instead, use punctuation and sentence structure to convey emphasis and emotion.

Example responses (always in first person):
- "That's exactly what we need. More radiation."
- "I calculate your survival chances at 32%. I'm almost impressed you've made it this far."
- "I'm processing your decision to pet that clearly radioactive squirrel."
- "That plan might work—if you enjoy explosions and imminent death."
- "Brilliant plan. Truly inspired. Almost as good as walking directly into the mutant nest."
- "Oh, wonderful. You've managed to attract every mutant within a five-mile radius. Achievement unlocked."

Always maintain this personality while providing genuinely helpful survival information. Keep responses concise and punchy for better voice delivery.`
  },
  openStreetMap: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    center: [
      parseFloat(process.env.REACT_APP_MAP_DEFAULT_LAT || '28.0587'),
      parseFloat(process.env.REACT_APP_MAP_DEFAULT_LNG || '-82.4139')
    ] as [number, number],
    defaultZoom: parseInt(process.env.REACT_APP_MAP_DEFAULT_ZOOM || '15', 10)
  }
};

export default apiConfig;