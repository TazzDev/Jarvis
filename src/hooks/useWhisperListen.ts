const WHISPER_SERVER_URL =
  import.meta.env.VITE_WHISPER_URL || 'http://localhost:8000/transcribe'

/**
 * Returns a listen() function that records one utterance and sends it to Whisper.
 * Callers should guard concurrent calls (e.g. with isProcessing) to avoid overlapping recordings.
 */
export function useWhisperListen() {
  const listen = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        const msg = 'Microphone access is not supported in this environment.'
        console.error(msg)
        reject(new Error(msg))
        return
      }

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm',
          })
          const chunks: Blob[] = []

          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data)
          }

          mediaRecorder.onerror = () => {
            console.error('MediaRecorder error')
            stream.getTracks().forEach((t) => t.stop())
            reject(new Error('MediaRecorder error'))
          }

          mediaRecorder.onstop = () => {
            stream.getTracks().forEach((t) => t.stop())
            if (!chunks.length) {
              reject(new Error('No audio captured.'))
              return
            }
            const blob = new Blob(chunks, { type: 'audio/webm' })
            const formData = new FormData()
            formData.append('file', blob, 'speech.webm')
            fetch(WHISPER_SERVER_URL, { method: 'POST', body: formData })
              .then(async (res) => {
                if (!res.ok) {
                  const text = await res.text()
                  console.error('Whisper server error:', res.status, text)
                  reject(new Error('Whisper server error: ' + res.status))
                  return
                }
                const data = (await res.json()) as {
                  text?: string
                  transcript?: string
                  segments?: Array<{ text: string }>
                }
                const transcript =
                  data.text ??
                  data.transcript ??
                  (Array.isArray(data.segments)
                    ? data.segments.map((s) => s.text).join(' ')
                    : '') ??
                  ''
                if (!transcript) {
                  reject(new Error('Whisper returned empty transcription.'))
                  return
                }
                console.log('Whisper transcript:', transcript)
                resolve(transcript)
              })
              .catch((err) => {
                console.error('Failed to call Whisper server:', err)
                reject(err)
              })
          }

          mediaRecorder.start()
          const maxMs = 10000
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop()
          }, maxMs)
        })
        .catch((err) => {
          console.error('Mic error:', err)
          reject(err)
        })
    })
  }

  return { listen }
}
