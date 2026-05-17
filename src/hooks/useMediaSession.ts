import { useEffect, useRef } from 'react'
import type { Track } from '../types'

interface MediaSessionOptions {
  track: Track | null
  channelName: string | null
  isPlaying: boolean
  onPause: () => void
  onResume: () => void
}

/**
 * Integrates with the Media Session API for lock screen / notification controls
 * and to signal to the browser that this is an active audio app (reduces tab throttling).
 */
export function useMediaSession({
  track,
  channelName,
  isPlaying,
  onPause,
  onResume,
}: MediaSessionOptions) {
  // Update metadata when track or channel changes
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    if (track && channelName) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Freelancer Radio',
        album: `${channelName} — freelancerad.io`,
        artwork: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      })
    } else {
      navigator.mediaSession.metadata = null
    }
  }, [track, channelName])

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  // Keep refs to the latest handlers so the registered action handlers
  // always call the current callbacks without needing to re-register.
  const onPauseRef = useRef(onPause)
  const onResumeRef = useRef(onResume)
  useEffect(() => {
    onPauseRef.current = onPause
    onResumeRef.current = onResume
  })

  // Register action handlers once on mount.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play', () => onResumeRef.current())
    navigator.mediaSession.setActionHandler('pause', () => onPauseRef.current())

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
    }
  }, [])
}
