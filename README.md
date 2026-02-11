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

## Wake word (optional)

To use hands-free activation, set a Picovoice Access Key and enable the wake word in the app:

1. Sign up at [Picovoice Console](https://console.picovoice.ai/) and copy your Access Key.
2. Set the environment variable before starting the app, e.g. `export PICOVOICE_ACCESS_KEY=your_key` (macOS/Linux) or `set PICOVOICE_ACCESS_KEY=your_key` (Windows).
3. Run the app; a "Wake word (Jarvis)" checkbox appears when the key is set. Say "Jarvis" to trigger listening without clicking the mic.

Wake-word detection runs in the Electron main process using Porcupine and does not send audio to the cloud.

## Notes

- The circular waveform is a **visual effect**, not driven by real audio samples from TTS (the Speech Synthesis API does not expose raw audio).
- Speech recognition and speech synthesis support may vary depending on your OS and Electron/Chromium version.

## Roadmap

  1. Persistent Storage 
      - First use SQL based databases and then switch to vector databases
  2. Removing the window frame and making it wake-word compatible
  3. Using AppleScript to make it work with MacOS functions for everyday tasks
  4. Make the waveform dynamic.

