import { useEffect, useRef } from 'react'
import { getChannel } from '../config/channels'
import { RadioSimulator } from '../engine/RadioSimulator'

/**
 * Preloads the current track for the Flow channel on app mount.
 * This warms the browser cache so playback starts faster.
 */
export function useChannelPreload() {
  const preloaderRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const flow = getChannel('flow')
    const simulator = new RadioSimulator(flow)
    const pos = simulator.getPositionAtTime()

    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = pos.track.url

    preloaderRef.current = audio

    return () => {
      audio.src = ''
    }
  }, [])
}
