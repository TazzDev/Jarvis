import { RefObject, useRef } from 'react'
import { useWaveform } from '../hooks/useWaveform'

interface WaveformProps {
  speaking: boolean
}

export function Waveform({ speaking }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  if (canvasRef.current) {
    useWaveform(canvasRef as RefObject<HTMLCanvasElement>, speaking)
  }

  return (
    <div className="relative w-[200px] h-[200px] rounded-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="w-full h-full drop-shadow-[0_0_16px_rgba(56,189,248,0.6)]"
      />
      <div className="absolute w-7 h-7 rounded-full bg-gradient-radial shadow-[0_0_20px_rgba(59,130,246,0.9)]" />
    </div>
  )
}
