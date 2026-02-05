import { useAppContext } from '../../state/AppContext'
import { getChannel } from '../../config/channels'
import { ChannelSelect } from './ChannelSelect'
import { VolumeSlider } from '../player/VolumeSlider'
import type { Channel } from '../../types'

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
  volume: number
  onVolumeChange: (v: number) => void
}

export function ChannelPanel({
  onPlay,
  onPause,
  onResume,
  isPlaying,
  volume,
  onVolumeChange,
}: ChannelPanelProps) {
  const { mode, selectedChannelId, setSelectedChannel } = useAppContext()
  const selectedChannel = getChannel(selectedChannelId)
  const isChannelPlaying = mode === 'channel' && isPlaying
  const isChannelPaused = mode === 'channel' && !isPlaying
  const glow = CHANNEL_GLOW[selectedChannelId]

  const handleHeroClick = () => {
    if (mode !== 'channel') {
      onPlay(selectedChannel)
    } else if (isPlaying) {
      onPause()
    } else {
      onResume()
    }
  }

  const handleChannelChange = (id: Channel['id']) => {
    setSelectedChannel(id)
    if (mode === 'channel') {
      onPlay(getChannel(id))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 pt-8">
      <p className="mb-14 text-center text-[13px] font-light tracking-[0.04em] text-white/25">
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
          className={`group relative flex h-40 w-40 items-center justify-center rounded-full transition-all duration-300 ${
            isChannelPlaying
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
          {isChannelPlaying ? <LargePauseIcon /> : <LargePlayIcon />}
        </button>
      </div>

      {/* Channel selector */}
      <div className="mt-12">
        <ChannelSelect
          selectedId={selectedChannelId}
          onChange={handleChannelChange}
        />
      </div>

      {/* Channel description */}
      <p className="mt-3 text-[13px] font-light tracking-wide text-white/25">
        {selectedChannel.description}
      </p>

      {/* Volume slider — fades in when playing */}
      <div
        className={`mt-8 transition-all duration-500 ${
          mode === 'channel'
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <VolumeSlider volume={volume} onChange={onVolumeChange} />
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
