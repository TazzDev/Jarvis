# Jarvis Voice UI (Electron)

Minimal Electron desktop app that:

- Listens to your microphone using the Web Speech API.
- Sends the transcribed text to an LM Studio server.
- Speaks the reply using the browser's speech synthesis.
- Shows a circular animated waveform while Jarvis is speaking.

## Prerequisites

- Node.js (LTS recommended)
- LM Studio running locally and exposing an OpenAI-compatible endpoint at:
  - `http://localhost:1234/v1/chat/completions`

## Setup

From the `jarvis-electron` directory:

```bash
npm install
npm start
```

This will:

- Install Electron as a dev dependency.
- Launch the Electron window running `index.html`.

## Notes

- The circular waveform is a **visual effect**, not driven by real audio samples from TTS (the Speech Synthesis API does not expose raw audio).
- Speech recognition and speech synthesis support may vary depending on your OS and Electron/Chromium version.

## Roadmap

  1. Persistent Storage 
      - First use SQL based databases and then switch to vector databases
  2. Removing the window frame and making it wake-word compatible
  3. Using AppleScript to make it work with MacOS functions for everyday tasks
  4. Make the waveform dynamic.

