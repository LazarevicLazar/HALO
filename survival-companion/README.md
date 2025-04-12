# Post-Apocalyptic AI Companion

A survival-oriented AI companion web application that guides users through a harsh, desolate world. This application features an interactive AI companion, inventory management, bartering system, trade log, and interactive map.

## Features

- **AI Companion**: A survival guide that teaches skills via text and voice, with animated avatar states (talk, idle, listen).
- **Inventory Management**: Track and manage your survival items with categories and quantities.
- **Bartering System**: Trade items with NPCs, with companion advice on deals.
- **Trade Log**: History of all trades made, with export functionality.
- **Interactive Map**: Mark locations, resources, and dangers on a post-apocalyptic styled map.

## Tech Stack

- **Frontend**: React with TypeScript
- **Map**: Leaflet.js with OpenStreetMap tiles
- **AI APIs**: 
  - OpenRouter (for AI conversation logic)
  - Hume AI (for voice and emotional interaction)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd survival-companion
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Add your API keys to the `.env` file:
   ```
   REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key
   REACT_APP_HUME_AI_API_KEY=your_hume_ai_api_key
   ```

5. Start the development server:
   ```
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Project Structure

- `/src/components`: React components organized by feature
  - `/Companion`: AI companion components
  - `/Inventory`: Inventory management components
  - `/Bartering`: Trading system components
  - `/TradeLog`: Trade history components
  - `/Map`: Interactive map components
  - `/Layout`: Layout and navigation components
- `/src/contexts`: React context providers for state management
- `/src/data`: Mock data for development
- `/src/services`: API service integrations
- `/src/utils`: Utility functions
- `/public/assets`: Static assets including animations and icons

## API Integration

### OpenRouter API

The application uses OpenRouter for the AI conversation logic. To integrate with your own OpenRouter API key:

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add it to your `.env` file

### Hume AI API

For voice and emotional interaction, the application uses Hume AI. To integrate with your own Hume AI API key:

1. Sign up at [Hume AI](https://hume.ai/)
2. Get your API key
3. Add it to your `.env` file

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## License

This project is licensed under the MIT License - see the LICENSE file for details.
