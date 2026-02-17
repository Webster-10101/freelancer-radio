import { useState, useEffect, useRef } from 'react'
import { formatTime } from '../../utils/time'

interface BreatheViewProps {
  onStop: () => void
  timerRemainingMs: number
  timerProgress: number
}

const CYCLE = 16 // 4+4+4+4

function getBreathState(elapsed: number) {
  const cyclePos = elapsed % CYCLE
  if (cyclePos < 4) {
    const t = cyclePos / 4
    return { label: 'Breathe in', progress: t * t * (3 - 2 * t) }
  }
  if (cyclePos < 8) {
    return { label: 'Hold', progress: 1 }
  }
  if (cyclePos < 12) {
    const t = (cyclePos - 8) / 4
    return { label: 'Breathe out', progress: 1 - t * t * (3 - 2 * t) }
  }
  return { label: 'Hold', progress: 0 }
}

export function BreatheView({ onStop, timerRemainingMs }: BreatheViewProps) {
  const startRef = useRef(performance.now())
  const [breath, setBreath] = useState({ label: 'Breathe in', progress: 0 })
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000
      setBreath(getBreathState(elapsed))
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  // Ring sizes — expand/contract with breath
  const minScale = 0.4
  const maxScale = 1.0
  const scale = minScale + (maxScale - minScale) * breath.progress

  return (
    <div className="flex flex-col items-center justify-center px-6 pt-8 pb-12">
      {/* Breathing rings container */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {/* Concentric rings */}
        {[0, 1, 2, 3].map(i => {
          const ringScale = scale * (1 - i * 0.12)
          const size = 240 * ringScale
          const opacity = (0.15 - i * 0.03) * (0.5 + 0.5 * breath.progress)
          return (
            <div
              key={i}
              className="absolute rounded-full border transition-none"
              style={{
                width: size,
                height: size,
                borderColor: `rgba(120, 220, 210, ${opacity})`,
                borderWidth: i === 0 ? 2 : 1.5,
                background: i === 0
                  ? `radial-gradient(circle, rgba(120, 220, 210, ${opacity * 0.3}) 0%, transparent 70%)`
                  : 'transparent',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )
        })}

        {/* Central glow dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 12 + breath.progress * 16,
            height: 12 + breath.progress * 16,
            background: `radial-gradient(circle, rgba(180, 240, 235, ${0.3 + breath.progress * 0.4}) 0%, rgba(120, 220, 210, ${breath.progress * 0.15}) 50%, transparent 100%)`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Phase label */}
      <p className="mt-6 text-lg font-light tracking-[0.12em] text-white/35 select-none">
        {breath.label}
      </p>

      {/* Timer */}
      <p className="mt-3 text-sm tabular-nums text-white/25">
        {formatTime(timerRemainingMs)}
      </p>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="mt-8 rounded-full border border-white/[0.08] px-6 py-2 text-sm text-white/30 transition-all duration-300 hover:border-white/[0.15] hover:text-white/50 active:scale-95"
      >
        Stop
      </button>
    </div>
  )
}
