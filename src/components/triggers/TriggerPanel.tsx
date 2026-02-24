import type { Trigger } from '../../types'
import { triggers } from '../../config/triggers'
import { useAppContext } from '../../state/AppContext'
import { TriggerCard } from './TriggerCard'
import { BreatheView } from './BreatheView'

interface TriggerPanelProps {
  onPlay: (trigger: Trigger) => void
  onStop: () => void
  timerProgress: number
  timerRemainingMs: number
  timerState: string
}

export function TriggerPanel({
  onPlay,
  onStop,
  timerProgress,
  timerRemainingMs,
  timerState,
}: TriggerPanelProps) {
  const { activeTriggerId } = useAppContext()

  // When Breathe is active, show dedicated breathing view
  if (activeTriggerId === 'breathe') {
    return (
      <BreatheView
        onStop={onStop}
        timerRemainingMs={timerRemainingMs}
        timerProgress={timerProgress}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-3 px-6">
      <p className="mb-6 text-center text-[13px] font-light tracking-[0.04em] text-white/25">
        Single-purpose sessions. Press play, let it guide you.
      </p>
      {triggers.map(trigger => (
        <TriggerCard
          key={trigger.id}
          trigger={trigger}
          onPlay={onPlay}
          onStop={onStop}
          timerProgress={timerProgress}
          timerRemainingMs={timerRemainingMs}
          timerState={timerState}
        />
      ))}
    </div>
  )
}
