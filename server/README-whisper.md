# Whisper STT server for Jarvis Electron

This small server provides **speech-to-text** for your Jarvis Electron app using **faster-whisper**.

The renderer records microphone audio and POSTs it to:

- `POST http://localhost:8000/transcribe`

This matches the `WHISPER_SERVER_URL` configured in `index.html`.

## 1. Install dependencies

It's best to use a virtual environment, but you can also install globally:

```bash
cd jarvis-electron/server
python3 -m pip install fastapi uvicorn faster-whisper python-multipart
```

If you have a GPU and want faster transcription, install the GPU build of `faster-whisper` instead (see its docs), but the default CPU version should work fine for short commands.

## 2. Run the server

From the `server` directory:

```bash
python3 whisper_server.py
```

You should see Uvicorn start on `http://0.0.0.0:8000`.

## 3. Use it from the Electron app

1. Start LM Studio's local server (so `http://localhost:1234/v1/chat/completions` works).
2. Start this Whisper server (`python3 whisper_server.py`).
3. In the root of the project, run your Electron app:

```bash
npm start
```

4. Click **"Talk to Jarvis"** and speak. The flow is:
   - Electron records up to ~10 seconds of audio.
   - Audio is sent to `http://localhost:8000/transcribe`.
   - Whisper returns text.
   - That text is sent to LM Studio.
   - The reply is spoken back using the browser's Speech Synthesis API.

