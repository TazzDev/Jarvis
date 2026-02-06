import { useEffect, RefObject } from 'react'

export function useWaveform(canvasRef: RefObject<HTMLCanvasElement>, speaking: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let waveAnimationId: number | null = null

    const drawWaveframe = (time: number) => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const baseRadius = 60
      const barCount = 64

      ctx.clearRect(0, 0, w, h)

      // background glow ring
      ctx.beginPath()
      ctx.arc(cx, cy, baseRadius + 18, 0, Math.PI * 2)
      const ringGrad = ctx.createRadialGradient(
        cx,
        cy,
        baseRadius,
        cx,
        cy,
        baseRadius + 24
      )
      ringGrad.addColorStop(0, 'rgba(56,189,248,0.05)')
      ringGrad.addColorStop(1, 'rgba(56,189,248,0.35)')
      ctx.strokeStyle = ringGrad
      ctx.lineWidth = 4
      ctx.stroke()

      if (!speaking) {
        return
      }

      const t = time * 0.004

      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2
        const amp =
          18 +
          10 * Math.sin(t + i * 0.35) +
          6 * Math.sin(t * 0.7 + i * 0.9)

        const innerR = baseRadius
        const outerR = baseRadius + Math.max(6, amp)

        const x1 = cx + innerR * Math.cos(angle)
        const y1 = cy + innerR * Math.sin(angle)
        const x2 = cx + outerR * Math.cos(angle)
        const y2 = cy + outerR * Math.sin(angle)

        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, 'rgba(56,189,248,0.15)')
        grad.addColorStop(0.5, 'rgba(96,165,250,0.9)')
        grad.addColorStop(1, 'rgba(129,140,248,0.0)')

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = grad
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.stroke()
      }
    }

    const loop = (time: number) => {
      drawWaveframe(time || 0)
      waveAnimationId = requestAnimationFrame(loop)
    }

    // Always draw an initial frame
    drawWaveframe(0)

    if (speaking) {
      waveAnimationId = requestAnimationFrame(loop)
    }

    return () => {
      if (waveAnimationId !== null) {
        cancelAnimationFrame(waveAnimationId)
      }
    }
  }, [canvasRef, speaking])
}
