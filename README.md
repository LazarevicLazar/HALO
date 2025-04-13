# H.A.L.O. - Human Assistance Logistics Operator

![H.A.L.O. Logo](survival-companion/public/favicon.ico)

## Post-Apocalyptic Survival Companion

H.A.L.O. (Human Assistance Logistics Operator) is a comprehensive post-apocalyptic survival companion application designed to assist users in navigating and thriving in challenging scenarios. This interactive web application combines practical survival tools with AI-powered assistance to provide a complete survival management system.

## 🌟 Features

### 🤖 AI Companion

- **Real-time AI Assistant**: Powered by Google's Gemini AI model
- **Voice Interaction**: Text-to-speech capabilities using ElevenLabs API
- **Speech Recognition**: Voice command support for hands-free operation
- **Adaptive Personality**: TARS-inspired AI with adjustable personality settings
- **Real-time TTS**: Speaks text as it's being generated for immediate feedback

### 🗺️ Interactive Survival Map

- **Custom Markers**: Add and manage locations with custom icons and descriptions
- **Area Marking**: Define and mark areas with different classifications (danger, resource, etc.)
- **Geolocation**: Find and mark your current location
- **Map Legend**: Comprehensive legend with marker type explanations
- **Post-apocalyptic Styling**: Themed map visuals for immersion

### 📦 Inventory Management

- **Resource Tracking**: Keep track of essential supplies
- **Categorization**: Organize items by type (food, water, medicine, etc.)
- **Quantity Tracking**: Monitor resource levels and consumption
- **Priority Tagging**: Mark critical items for quick access

### 💼 Bartering System

- **NPC Interactions**: Trade with simulated NPCs
- **Relationship Management**: Build relationships with trading partners
- **Fair Value Calculator**: Determine fair trade values for items
- **Trade History**: Track past transactions

### 📝 Trade Log

- **Transaction History**: Complete record of all trades
- **Resource Flow Analysis**: Track resource gains and losses
- **Trading Partner Records**: Monitor relationships with different trading partners

### 🚨 Emergency Beacon

- **Bluetooth Integration**: Connect to external emergency beacon devices
- **Signal Broadcasting**: Send distress signals when needed
- **Status Monitoring**: Track beacon status and battery levels

### 📚 Survival Encyclopedia

- **Survival Techniques**: Access to survival knowledge and tips
- **Resource Information**: Details on various resources and their uses
- **Threat Database**: Information on common dangers and how to avoid them

## 🛠️ Technical Features

### Advanced Voice Processing

- **Chunk-based TTS**: Processes text in chunks for real-time speech
- **Duplicate Prevention**: Intelligent system to prevent speech duplication
- **Buffer Management**: Smart text buffer system for optimal speech flow
- **Conversation Tracking**: Maintains context across different conversations

### Responsive UI

- **Adaptive Layout**: Works on various screen sizes
- **Themed Components**: Consistent post-apocalyptic visual theme
- **Interactive Elements**: Hover effects and visual feedback
- **Accessibility Features**: Designed with accessibility in mind

### Map Technology

- **Leaflet Integration**: Powered by the Leaflet.js mapping library
- **Custom Markers**: Emoji-based custom markers for different location types
- **Area Highlighting**: Color-coded area marking for different zone types
- **Offline Capabilities**: Basic functionality without internet connection

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- API keys for:
  - Google Gemini AI
  - ElevenLabs (for voice features)
  - OpenStreetMap (included by default)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/survival-companion.git
   cd survival-companion
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:

   ```
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   REACT_APP_ENABLE_VOICE_FEATURES=true
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### Configuration

#### API Configuration

The application uses a central configuration file located at `src/config/apiConfig.ts`. To set up your API keys, create this file based on the example:

1. Copy the example configuration:

   ```bash
   cp src/config/apiConfig.example.ts src/config/apiConfig.ts
   ```

2. Edit the file to include your API keys and preferred settings.

## 🧩 Project Structure

```
survival-companion/
├── public/                  # Static files
│   ├── assets/              # Images, icons, and animations
│   │   ├── animations/      # GIF animations for the companion
│   │   ├── icons/           # Category icons
│   │   └── images/          # Background images and textures
│   └── index.html           # HTML entry point
├── src/                     # Source code
│   ├── components/          # React components
│   │   ├── Bartering/       # Bartering system components
│   │   ├── Companion/       # AI companion components
│   │   ├── Creators/        # About the creators components
│   │   ├── EmergencyBeacon/ # Emergency beacon components
│   │   ├── Inventory/       # Inventory management components
│   │   ├── Layout/          # Layout and navigation components
│   │   ├── Map/             # Interactive map components
│   │   ├── SplashScreen/    # Application splash screen
│   │   └── TradeLog/        # Trade history components
│   ├── config/              # Configuration files
│   ├── contexts/            # React context providers
│   ├── data/                # Mock data and constants
│   ├── services/            # Service integrations
│   │   ├── BluetoothService.ts    # Bluetooth connectivity
│   │   ├── GeminiService.ts       # Google Gemini AI integration
│   │   ├── SpeechRecognitionService.ts # Voice recognition
│   │   └── VoiceService.ts        # ElevenLabs TTS integration
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Application entry point
└── package.json             # Project dependencies and scripts
```

## 🎮 Usage Guide

### AI Companion

1. **Text Interaction**: Type your message in the input field and press Enter or click Send
2. **Voice Commands**: Click the "Start Conversation" button and speak your command
3. **Toggle Voice**: Enable or disable the AI's voice responses using the toggle switch

### Map Navigation

1. **View Map**: Navigate to the Map tab to view the interactive survival map
2. **Add Marker**: Click "Add Marker", then click on the map to place a marker
3. **Add Area**: Click "Add Area", then click multiple points on the map to define an area
4. **Find Location**: Click "Find My Location" to center the map on your current position
5. **View Details**: Click on any marker or area to view its details

### Inventory Management

1. **View Inventory**: Navigate to the Inventory tab to see your current supplies
2. **Add Item**: Click "Add Item" to add a new resource to your inventory
3. **Edit Item**: Click on any item to edit its details or quantity
4. **Remove Item**: Use the delete button on any item to remove it from inventory

### Bartering

1. **Select NPC**: Choose a trading partner from the available NPCs
2. **Select Items**: Choose items to trade from your inventory and the NPC's inventory
3. **Negotiate**: Adjust quantities until a fair trade is reached
4. **Complete Trade**: Confirm the trade to update your inventory

## 🧪 Testing

The application includes a Voice Test panel for debugging and testing the TTS functionality:

1. Navigate to the Companion tab
2. Click the "Debug" button to show the Voice Test panel
3. Enter text or select from the emotion examples
4. Use the "Play" button to test single utterances
5. Use the "Test Sequential" button to test multiple sequential utterances

## 🔧 Troubleshooting

### Voice Features Not Working

1. Ensure your API keys are correctly set in the `.env` file
2. Check that `REACT_APP_ENABLE_VOICE_FEATURES` is set to `true`
3. Verify your browser supports the Web Speech API
4. Check the browser console for any API-related errors

### Map Issues

1. Ensure you have granted location permissions if using geolocation features
2. Clear browser cache if map tiles aren't loading properly
3. Check your internet connection for map tile loading

### General Issues

1. Check the browser console for error messages
2. Ensure all dependencies are installed correctly
3. Try clearing your browser cache and reloading the application
4. Verify your API keys are valid and have the necessary permissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Waratchaya Luangphairin** - _Hardware Design_ - Electrical Engineering
- **Johan John Joji** - _Backend Development_ - Computer Engineering
- **Lazar Lazarevic** - _Frontend Development_ - Computer Engineering

## 🛠️ Technologies, Frameworks & Libraries

### Core Technologies

- [React](https://reactjs.org/) - UI library for building the user interface
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript for better code quality
- [Node.js](https://nodejs.org/) - JavaScript runtime environment

### State Management & Context

- [React Context API](https://reactjs.org/docs/context.html) - For state management across components

### UI & Styling

- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - For styling components
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - For theming and style variables

### Mapping

- [Leaflet](https://leafletjs.com/) - Interactive map library
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data provider

### AI & Voice

- [Google Gemini AI](https://ai.google.dev/) - Large language model for AI assistant
- [ElevenLabs](https://elevenlabs.io/) - Text-to-speech API
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - For speech recognition

### Bluetooth & Hardware

- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) - For connecting to Bluetooth devices

### Utilities

- [UUID](https://www.npmjs.com/package/uuid) - For generating unique identifiers
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - For making HTTP requests

### Development Tools

- [Create React App](https://create-react-app.dev/) - React application bootstrapping
- [npm](https://www.npmjs.com/) - Package manager
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

### Testing

- [Jest](https://jestjs.io/) - JavaScript testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - React component testing

### Deployment & Build

- [Webpack](https://webpack.js.org/) - Module bundler (via Create React App)
- [Babel](https://babeljs.io/) - JavaScript compiler (via Create React App)

## 🙏 Acknowledgements

- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [ElevenLabs](https://elevenlabs.io/) for text-to-speech technology
- [Leaflet](https://leafletjs.com/) for mapping functionality
- [React](https://reactjs.org/) for the UI framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) for Bluetooth connectivity
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for speech recognition
- [UUID](https://www.npmjs.com/package/uuid) for unique ID generation
- [Create React App](https://create-react-app.dev/) for project setup
- [npm](https://www.npmjs.com/) for package management
- [Node.js](https://nodejs.org/) for the JavaScript runtime
- [Webpack](https://webpack.js.org/) for bundling
- [Babel](https://babeljs.io/) for JavaScript compilation
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io/) for code formatting
- [Jest](https://jestjs.io/) for testing

---

_Created with passion and dedication for the post-apocalyptic survival community_

_© 2025 USF Engineering Team - All Rights Reserved_
