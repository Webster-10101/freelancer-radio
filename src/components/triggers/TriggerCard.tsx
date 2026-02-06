import type { Trigger } from '../../types'
import { useAppContext } from '../../state/AppContext'
import { ProgressRing } from './ProgressRing'
import { formatTime } from '../../utils/time'

interface TriggerCardProps {
  trigger: Trigger
  onPlay: (trigger: Trigger) => void
  onStop: () => void
  timerProgress: number
  timerRemainingMs: number
  timerState: string
}

export function TriggerCard({
  trigger,
  onPlay,
  onStop,
  timerProgress,
  timerRemainingMs,
  timerState,
}: TriggerCardProps) {
  const { activeTriggerId } = useAppContext()
  const isActive = activeTriggerId === trigger.id
  const isRunning = isActive && timerState === 'running'
  const isComingSoon = trigger.comingSoon

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
        isComingSoon
          ? 'border-white/[0.02] bg-white/[0.01] opacity-50'
          : isActive
            ? 'border-white/[0.12] bg-white/[0.07]'
            : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.04]'
      }`}
      style={isActive && !isComingSoon ? {
        boxShadow: '0 0 40px rgba(139, 63, 160, 0.08), inset 0 0 40px rgba(139, 63, 160, 0.03)',
      } : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Play/stop button or progress ring */}
        <div className="flex-shrink-0">
          {isComingSoon ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.02]">
              <PlayIcon disabled />
            </div>
          ) : isActive && trigger.hasProgressRing ? (
            <ProgressRing
              progress={timerProgress}
              remainingMs={timerRemainingMs}
            />
          ) : (
            <button
              onClick={() => isActive ? onStop() : onPlay(trigger)}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-white/15 hover:bg-white/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] hover:scale-105 active:scale-95'
              }`}
            >
              {isActive ? (
                <StopIcon />
              ) : (
                <PlayIcon />
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-base font-medium ${isComingSoon ? 'text-white/40' : 'text-white/90'}`}>{trigger.name}</h3>
            {isRunning && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400/80" />
            )}
            {isComingSoon && (
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/30">
                Coming soon
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-sm ${isComingSoon ? 'text-white/20' : 'text-white/35'}`}>{trigger.description}</p>
          {!isActive && !isComingSoon && (
            <span className="mt-1 inline-block rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] tabular-nums text-white/25">
              {formatTime(trigger.duration * 1000)}
            </span>
          )}
        </div>

        {/* Buy link - hidden for coming soon */}
        {trigger.track.buyUrl && !isComingSoon && (
          <a
            href={trigger.track.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 rounded-full border border-white/[0.06] px-2.5 py-1 text-[11px] text-white/25 transition-all duration-300 hover:border-white/[0.12] hover:text-white/45"
          >
            Get track &rarr;
          </a>
        )}
      </div>

      {/* Pomodoro: tappable area when ring is showing */}
      {isActive && trigger.hasProgressRing && !isComingSoon && (
        <button
          onClick={onStop}
          className="absolute inset-0 z-10"
          aria-label="Stop trigger"
        />
      )}
    </div>
  )
}

function PlayIcon({ disabled }: { disabled?: boolean }) {
  return (
    <svg className={`ml-0.5 h-4 w-4 transition-colors ${disabled ? 'text-white/20' : 'text-white/60'}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h12v12H6z" />
    </svg>
  )
}
