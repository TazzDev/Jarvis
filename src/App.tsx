import { useState, useRef } from 'react'
import { MicButton } from './components/MicButton'
import { Waveform } from './components/Waveform'
import { LogPanel } from './components/LogPanel'
import { useWhisperListen } from './hooks/useWhisperListen'
import { useWakeWord } from './hooks/useWakeWord'
import { askLlm } from './lib/askLlm'

function App() {
  const [log, setLog] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const isProcessingRef = useRef(false)
  const speakingRef = useRef(false)
  isProcessingRef.current = isProcessing
  speakingRef.current = speaking

  const { listen } = useWhisperListen()

  const handleWakeWord = () => {
    console.log('[Wake word flow] 4. App handleWakeWord called', {
      isProcessingRef: isProcessingRef.current,
      speakingRef: speakingRef.current,
    })
    if (isProcessingRef.current || speakingRef.current) {
      console.log('[Wake word flow] 4b. App handleWakeWord: early return (busy)')
      return
    }
    console.log('[Wake word flow] 4c. App handleWakeWord: calling handleClick()')
    handleClick()
  }

  const { state: wakeWordState, setEnabled: setWakeWordEnabled } = useWakeWord(handleWakeWord)

  const handleClick = async () => {
    console.log('[Wake word flow] 5. App handleClick called', { isProcessingRef: isProcessingRef.current })
    if (isProcessingRef.current) {
      console.log('[Wake word flow] 5b. App handleClick: early return (already processing)')
      return
    }
    isProcessingRef.current = true
    setIsProcessing(true)
    console.log('[Wake word flow] 6. App handleClick: set state to Listening')
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
      {wakeWordState.available && (
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={wakeWordState.enabled}
            onChange={(e) => setWakeWordEnabled(e.target.checked)}
            className="rounded border-slate-500 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
          />
          Wake word (Jarvis)
        </label>
      )}
      <LogPanel log={log} />
    </div>
  )
}

export default App
