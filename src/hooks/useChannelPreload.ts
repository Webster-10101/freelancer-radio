import { useEffect, useRef } from 'react'
import { getChannel } from '../config/channels'
import { RadioSimulator } from '../engine/RadioSimulator'
import type { Channel } from '../types'

/**
 * Preloads the current track for the given channel so playback starts faster.
 * Re-runs when the channel changes.
 */
export function useChannelPreload(channelId: Channel['id']) {
  const preloaderRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const channel = getChannel(channelId)
    const simulator = new RadioSimulator(channel)
    const pos = simulator.getPositionAtTime()

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.preload = 'auto'
    audio.src = pos.track.url

    preloaderRef.current = audio

    return () => {
      audio.src = ''
    }
  }, [channelId])
}
