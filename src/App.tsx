import { useState } from 'react'
import { MicButton } from './components/MicButton'
import { Waveform } from './components/Waveform'
import { LogPanel } from './components/LogPanel'
import { useWhisperListen } from './hooks/useWhisperListen'
import { askLlm } from './lib/askLlm'

function App() {
  const [log, setLog] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const { listen } = useWhisperListen()

  const handleClick = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      setLog('Listening (Whisper)...')
      const speech = await listen()
      setLog('You: ' + speech)

      setLog('Calling LLM...')
      const reply = await askLlm(speech)
      setLog('Jarvis: ' + reply)

      const utterance = new SpeechSynthesisUtterance(reply)

      const stopAll = () => {
        setSpeaking(false)
      }

      utterance.onstart = () => {
        setSpeaking(true)
      }

      utterance.onend = stopAll
      utterance.onerror = stopAll
      utterance.onpause = stopAll

      speechSynthesis.speak(utterance)
    } catch (err) {
      console.error(err)
      setLog('Error: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050816] text-slate-200 gap-6 font-sans m-0">
      <MicButton
        onClick={handleClick}
        disabled={isProcessing}
        isProcessing={isProcessing}
      />
      <Waveform speaking={speaking} />
      <LogPanel log={log} />
    </div>
  )
}

export default App
