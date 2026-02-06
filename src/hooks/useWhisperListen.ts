const WHISPER_SERVER_URL =
  import.meta.env.VITE_WHISPER_URL || 'http://localhost:8000/transcribe'

export function useWhisperListen() {
  const listen = (): Promise<string> =>
    new Promise(async (resolve, reject) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = 'Microphone access is not supported in this environment.'
        console.error(msg)
        return reject(new Error(msg))
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })
        const chunks: Blob[] = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data)
          }
        }

        mediaRecorder.onerror = (e) => {
          console.error('MediaRecorder error:', e.error || e.name)
          stream.getTracks().forEach((t) => t.stop())
          reject(new Error('MediaRecorder error'))
        }

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop())

          if (!chunks.length) {
            const msg = 'No audio captured.'
            console.warn(msg)
            return reject(new Error(msg))
          }

          const blob = new Blob(chunks, { type: 'audio/webm' })
          const formData = new FormData()
          formData.append('file', blob, 'speech.webm')

          try {
            const res = await fetch(WHISPER_SERVER_URL, {
              method: 'POST',
              body: formData,
            })

            if (!res.ok) {
              const text = await res.text()
              console.error('Whisper server error:', res.status, text)
              return reject(new Error('Whisper server error: ' + res.status))
            }

            const data = await res.json()
            const transcript =
              data.text ||
              data.transcript ||
              (Array.isArray(data.segments) &&
                data.segments.map((s: { text: string }) => s.text).join(' ')) ||
              ''

            if (!transcript) {
              const msg = 'Whisper returned empty transcription.'
              console.warn(msg)
              return reject(new Error(msg))
            }

            console.log('Whisper transcript:', transcript)
            resolve(transcript)
          } catch (err) {
            console.error('Failed to call Whisper server:', err)
            reject(err)
          }
        }

        // Record up to N seconds, then stop automatically
        mediaRecorder.start()
        const maxMs = 10000 // 10 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
        }, maxMs)
      } catch (err) {
        console.error('Mic error:', err)
        reject(err)
      }
    })

  return { listen }
}
