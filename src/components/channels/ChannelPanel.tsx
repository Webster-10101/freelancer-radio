import { useAppContext } from '../../state/AppContext'
import { getChannel } from '../../config/channels'
import { ChannelSelect } from './ChannelSelect'
import { VolumeSlider } from '../player/VolumeSlider'
import { SleepTimerControl } from './SleepTimerControl'
import type { SleepMinutes } from '../../hooks/useSleepTimer'
import { isNative } from '../../native/platform'
import { RoutePicker } from '../../native/routePicker'
import { uiTapHaptic } from '../../native/uiHaptics'
import type { Channel } from '../../types'
import { track } from '@vercel/analytics'

const CHANNEL_GLOW = {
  calm: { shadow: 'rgba(44, 83, 100, 0.4)', soft: 'rgba(44, 83, 100, 0.12)' },
  flow: { shadow: 'rgba(139, 63, 160, 0.4)', soft: 'rgba(139, 63, 160, 0.12)' },
  energy: { shadow: 'rgba(232, 137, 12, 0.35)', soft: 'rgba(232, 137, 12, 0.1)' },
} as const

interface ChannelPanelProps {
  onPlay: (channel: Channel) => void
  onPause: () => void
  onResume: () => void
  isPlaying: boolean
  isLoading: boolean
  volume: number
  onVolumeChange: (v: number) => void
  listenerCount: number | null
  sleepMinutes: SleepMinutes | null
  sleepRemainingMs: number
  onSleepSelect: (minutes: SleepMinutes | null) => void
}

export function ChannelPanel({
  onPlay,
  onPause,
  onResume,
  isPlaying,
  isLoading,
  volume,
  onVolumeChange,
  listenerCount,
  sleepMinutes,
  sleepRemainingMs,
  onSleepSelect,
}: ChannelPanelProps) {
  const { mode, selectedChannelId, setSelectedChannel } = useAppContext()
  const selectedChannel = getChannel(selectedChannelId)
  const isChannelPlaying = mode === 'channel' && isPlaying
  const isChannelPaused = mode === 'channel' && !isPlaying
  const glow = CHANNEL_GLOW[selectedChannelId]

  const handleHeroClick = () => {
    uiTapHaptic('medium')
    if (mode !== 'channel') {
      onPlay(selectedChannel)
    } else if (isPlaying) {
      onPause()
    } else {
      onResume()
    }
  }

  const handleChannelChange = (id: Channel['id']) => {
    uiTapHaptic('light')
    if (mode === 'channel') {
      track('channel_switch', { from: selectedChannelId, to: id })
    }
    setSelectedChannel(id)
    if (mode === 'channel') {
      onPlay(getChannel(id))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 pt-4 sm:pt-8">
      <p className="mb-10 text-center text-[13px] font-light tracking-[0.04em] text-white/25 sm:mb-14">
        Press play. Do one thing. Come back when you're done.
      </p>

      {/* Hero play/pause button */}
      <div className="relative flex items-center justify-center">
        {/* Outer decorative ring */}
        <div
          className="absolute rounded-full transition-all duration-1000"
          style={{
            inset: '-18px',
            border: '1px solid',
            borderColor: isChannelPlaying ? glow.soft : 'rgba(255,255,255,0.03)',
            ...(isChannelPlaying && {
              boxShadow: `0 0 80px ${glow.shadow}, 0 0 160px ${glow.soft}`,
            }),
          }}
        />

        {/* Breathing glow — visible when playing */}
        <div
          className="absolute rounded-full transition-opacity duration-1000"
          style={{
            inset: '-30px',
            opacity: isChannelPlaying ? 0.5 : 0,
            background: `radial-gradient(circle, ${glow.shadow} 0%, transparent 70%)`,
            animation: isChannelPlaying ? 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          }}
        />

        <button
          onClick={handleHeroClick}
          disabled={isLoading}
          className={`group relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-300 sm:h-40 sm:w-40 ${
            isLoading
              ? 'cursor-wait border border-white/10 bg-white/[0.04]'
              : isChannelPlaying
                ? 'border border-white/15 bg-white/[0.07]'
                : isChannelPaused
                  ? 'border border-white/10 bg-white/[0.04]'
                  : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.05] hover:scale-[1.03] active:scale-[0.97]'
          }`}
          style={isChannelPlaying ? {
            boxShadow: `0 0 40px ${glow.shadow}, inset 0 0 60px ${glow.soft}`,
          } : isChannelPaused ? {
            boxShadow: `0 0 20px ${glow.soft}`,
          } : undefined}
        >
          {isLoading ? <LoadingSpinner /> : isChannelPlaying ? <LargePauseIcon /> : <LargePlayIcon />}
        </button>
      </div>

      {/* Channel selector */}
      <div className="mt-10 sm:mt-12">
        <ChannelSelect
          selectedId={selectedChannelId}
          onChange={handleChannelChange}
        />
      </div>

      {/* Channel description */}
      <p className="mt-3 text-[13px] font-light tracking-wide text-white/25">
        {selectedChannel.description}
      </p>

      {/* Listener count — only shown at 2+ so the plural form is always correct */}
      {listenerCount !== null && listenerCount >= 2 && (
        <p className="mt-3 text-[12px] font-light tracking-wide text-white/20">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/60" />
          {listenerCount} freelancers listening now
        </p>
      )}

      {/* Volume slider — fades in when playing */}
      <div
        className={`mt-6 transition-all duration-500 sm:mt-8 ${
          mode === 'channel'
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <VolumeSlider volume={volume} onChange={onVolumeChange} />
      </div>

      {/* Sleep timer + AirPlay — shown while tuned in */}
      <div
        className={`mt-5 flex items-center gap-3 transition-all duration-500 ${
          mode === 'channel'
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <SleepTimerControl
          minutes={sleepMinutes}
          remainingMs={sleepRemainingMs}
          onSelect={onSleepSelect}
        />
        {isNative && (
          <button
            onClick={() => RoutePicker.show().catch(() => {})}
            aria-label="Choose audio output (AirPlay)"
            className="flex items-center gap-1.5 rounded-full border border-white/[0.06] px-3 py-1.5 text-[12px] font-light tracking-wide text-white/25 transition-all duration-300 hover:border-white/[0.12] hover:text-white/40 active:scale-95"
          >
            <AirPlayIcon />
            <span>AirPlay</span>
          </button>
        )}
      </div>

      {/* Keyframes for breathing glow */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

function AirPlayIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
      <polygon points="12 15 17 21 7 21 12 15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LargePlayIcon() {
  return (
    <svg
      className="ml-1.5 h-12 w-12 text-white/60 transition-all duration-300 group-hover:text-white/80 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function LargePauseIcon() {
  return (
    <svg className="h-12 w-12 text-white/60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="h-10 w-10 animate-spin text-white/50"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
