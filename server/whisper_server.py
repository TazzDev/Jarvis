from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel
import uvicorn
import tempfile
import shutil
from pathlib import Path


app = FastAPI(title="Jarvis Whisper STT")

# Allow requests from Electron / browser
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# You can change "small" to another model size if you like
model = WhisperModel("small", device="cpu", compute_type="int8")


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
  """
  Accept an audio file and return a transcription.
  The Electron renderer sends audio/webm as the "file" field.
  """
  with tempfile.TemporaryDirectory() as tmpdir:
    tmp_path = Path(tmpdir) / file.filename
    with tmp_path.open("wb") as f:
      shutil.copyfileobj(file.file, f)

    segments, info = model.transcribe(str(tmp_path))
    text = "".join(seg.text for seg in segments).strip()

    return JSONResponse({"text": text, "language": info.language})


if __name__ == "__main__":
  # Runs on http://localhost:8000/transcribe to match the frontend
  uvicorn.run(app, host="0.0.0.0", port=8000)


