# VoiceService Implementation Plan

## Problem Statement

The current implementation of the VoiceService is experiencing issues with multiple audio files playing simultaneously when sentences are processed quickly. This causes overlapping speech that is unintelligible. We need to implement strict sequential playback to ensure only one audio file plays at a time.

## Current Implementation Analysis

The current VoiceService implementation:
- Uses a singleton pattern
- Has an `audioQueue` to store sentences to be spoken
- Has a `processQueue` method that processes one sentence at a time
- Has a `processingQueue` boolean flag to track if the queue is being processed
- Creates a new audio element for each sentence

## Issues Identified

1. Multiple audio files are playing simultaneously, overlapping each other
2. The ElevenLabs API returns multiple audio files that all start playing at once
3. The queue processing system doesn't effectively ensure sequential playback
4. Audio element management needs improvement

## Proposed Solution

### 1. Implement a Strict Sequential Processing System

- Enhance the lock mechanism to prevent concurrent audio playback
- Ensure each audio file completes before starting the next one
- Use promises to properly track when audio playback completes

### 2. Refactor the Audio Element Management

- Use a single reusable audio element instead of creating new ones for each sentence
- Implement proper promise-based sequential processing
- Add better error handling and recovery

### 3. Improve the Queue Processing System

- Make the queue processing strictly sequential using async/await
- Add better logging for debugging

## Implementation Details

### Class Properties Modifications

```typescript
private audio: HTMLAudioElement | null = null;
private isStreaming: boolean = false;
private audioQueue: string[] = [];
private processedSentences: Set<string> = new Set();
private processingQueue: boolean = false;
private lastConversationId: string = '';
private currentAudioPromise: Promise<void> | null = null; // New property to track current audio playback
```

### Process Queue Method Refactoring

The `processQueue` method will be refactored to:
- Use async/await for better control flow
- Ensure each audio file completes before starting the next one
- Use a single reusable audio element
- Add better error handling

### Audio Element Event Handlers

The audio element event handlers will be improved to:
- Use promises to properly track when audio playback completes
- Ensure proper cleanup after playback
- Add better error handling

## Code Implementation Plan

1. Modify the class properties to add the new `currentAudioPromise` property
2. Refactor the `processQueue` method to use async/await and ensure sequential processing
3. Improve the audio element event handlers to use promises
4. Add better error handling and logging

## Testing Plan

1. Test with single sentences to ensure basic functionality
2. Test with multiple sentences to ensure sequential playback
3. Test with new conversations starting while audio is still playing
4. Test error handling by simulating API errors

## Next Steps

After implementing these changes, we should:
1. Switch to Code mode to implement the actual changes to the VoiceService.ts file
2. Test the implementation thoroughly
3. Monitor for any issues and make adjustments as needed