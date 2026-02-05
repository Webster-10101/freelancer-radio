import { useAppContext } from '../../state/AppContext'
import { VolumeSlider } from './VolumeSlider'

interface NowPlayingProps {
  isPlaying: boolean
  volume: number
  activeTab: 'channels' | 'triggers'
  onVolumeChange: (v: number) => void
  onPause: () => void
  onResume: () => void
}

export function NowPlaying({
  isPlaying,
  volume,
  activeTab,
  onVolumeChange,
  onPause,
  onResume,
}: NowPlayingProps) {
  const { mode, activeChannelId, activeTriggerId, currentTrack } = useAppContext()

  if (mode === 'idle') return null
  if (mode === 'channel' && activeTab === 'channels') return null

  const label = mode === 'channel'
    ? activeChannelId?.charAt(0).toUpperCase() + activeChannelId!.slice(1)
    : activeTriggerId?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.04] bg-black/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/70">{label}</p>
          {currentTrack && (
            <p className="truncate text-[11px] text-white/25">{currentTrack.title}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <VolumeSlider volume={volume} onChange={onVolumeChange} />
          <button
            onClick={isPlaying ? onPause : onResume}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] transition-all duration-300 hover:bg-white/[0.12] active:scale-95"
          >
            {isPlaying ? (
              <svg className="h-3.5 w-3.5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="ml-0.5 h-3.5 w-3.5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
