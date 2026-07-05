import { formatTime } from '../../utils/time'
import { SLEEP_OPTIONS, type SleepMinutes } from '../../hooks/useSleepTimer'

interface SleepTimerControlProps {
  minutes: SleepMinutes | null
  remainingMs: number
  onSelect: (minutes: SleepMinutes | null) => void
}

/**
 * Tap to cycle the sleep timer: Off → 15 → 30 → 45 → 60 → Off.
 * Shows the live countdown while active.
 */
export function SleepTimerControl({ minutes, remainingMs, onSelect }: SleepTimerControlProps) {
  const handleClick = () => {
    if (minutes === null) {
      onSelect(SLEEP_OPTIONS[0])
      return
    }
    const idx = SLEEP_OPTIONS.indexOf(minutes)
    const next = SLEEP_OPTIONS[idx + 1]
    onSelect(next ?? null)
  }

  const isActive = minutes !== null

  return (
    <button
      onClick={handleClick}
      aria-label={isActive ? `Sleep timer: ${minutes} minutes. Tap to change` : 'Set sleep timer'}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-light tracking-wide transition-all duration-300 active:scale-95 ${
        isActive
          ? 'border border-white/[0.12] text-white/45'
          : 'border border-white/[0.06] text-white/25 hover:border-white/[0.12] hover:text-white/40'
      }`}
    >
      <MoonIcon />
      <span className="tabular-nums">
        {isActive ? `${formatTime(remainingMs)} · ${minutes}m` : 'Sleep'}
      </span>
    </button>
  )
}

function MoonIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}
