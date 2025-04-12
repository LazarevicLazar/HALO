// This is a template file that should be copied to apiConfig.ts with real API keys
// apiConfig.ts should be git ignored to prevent exposing sensitive information

const apiConfig = {
  openRouter: {
    apiKey: process.env.REACT_APP_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3-opus'
  },
  humeAI: {
    apiKey: process.env.REACT_APP_HUME_AI_KEY || 'YOUR_HUME_AI_KEY',
    baseUrl: 'https://api.hume.ai/v0',
    defaultVoice: 'en_male_1'
  },
  openStreetMap: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    center: [28.0587, -82.4139] as [number, number], // USF Tampa campus coordinates
    defaultZoom: 15
  }
};

export default apiConfig;