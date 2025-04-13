// More detailed test file to explore the ElevenLabs library
const elevenlabs = require('elevenlabs');

// Log the available exports
console.log('ElevenLabs library exports:', Object.keys(elevenlabs));

// Log the structure of the main export
console.log('Main export structure:', JSON.stringify(elevenlabs, null, 2));

// Log the ElevenLabsClient class structure
console.log('ElevenLabsClient structure:', Object.getOwnPropertyNames(elevenlabs.ElevenLabsClient));
console.log('ElevenLabsClient prototype:', Object.getOwnPropertyNames(elevenlabs.ElevenLabsClient.prototype));

// Log the available methods on the ElevenLabsClient instance
const client = new elevenlabs.ElevenLabsClient();
console.log('ElevenLabsClient instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));

// Check if there are any text-to-speech related methods
console.log('Client methods:', Object.keys(client).filter(key => typeof client[key] === 'function'));