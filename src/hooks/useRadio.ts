import { useCallback, useRef, useEffect, useMemo, useState } from 'react'
import { RadioSimulator } from '../engine/RadioSimulator'
import type { Channel, Track } from '../types'
import { useAudio } from './useAudio'

export function useRadio() {
  const audio = useAudio()
  const simulatorRef = useRef<RadioSimulator | null>(null)
  const currentTrackRef = useRef<Track | null>(null)
  const isActiveRef = useRef(false)
  const isPausedRef = useRef(false)
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null)

  // Ref mirrors state: the ref is read inside stable callbacks (same-track
  // check, onended closure), the state drives re-renders.
  const setCurrentTrack = useCallback((track: Track | null) => {
    currentTrackRef.current = track
    setCurrentTrackState(track)
  }, [])

  const playCurrentPosition = useCallback(async () => {
    const simulator = simulatorRef.current
    if (!simulator || !isActiveRef.current || isPausedRef.current) return

    const pos = simulator.getPositionAtTime()

    // Don't restart the same track if it's already playing at roughly the right position
    if (currentTrackRef.current?.id === pos.track.id) {
      const actual = audio.getCurrentTime()
      if (Math.abs(pos.seekSeconds - actual) <= 2) return
    }

    setCurrentTrack(pos.track)
    await audio.play(pos.track.url, pos.seekSeconds)
  }, [audio, setCurrentTrack])

  const tuneIn = useCallback(async (channel: Channel) => {
    const simulator = new RadioSimulator(channel)
    simulatorRef.current = simulator
    isActiveRef.current = true
    isPausedRef.current = false

    const pos = simulator.getPositionAtTime()
    setCurrentTrack(pos.track)
    await audio.play(pos.track.url, pos.seekSeconds)

    // Single track advancement mechanism: when a track ends, play the next one.
    // The browser's onended event is reliable in both foreground and background.
    audio.onTrackEnd(() => {
      if (!simulatorRef.current || !isActiveRef.current || isPausedRef.current) return
      const newPos = simulatorRef.current.getPositionAtTime()
      setCurrentTrack(newPos.track)
      audio.play(newPos.track.url, newPos.seekSeconds)
    })
  }, [audio, setCurrentTrack])

  const pause = useCallback(() => {
    isPausedRef.current = true
    audio.pause()
  }, [audio])

  const resume = useCallback(() => {
    // Don't resume a stale track after stop() — the audio element keeps
    // its last src, so play() would restart the old radio audio.
    if (!isActiveRef.current) return
    isPausedRef.current = false
    audio.resume()
  }, [audio])

  const stop = useCallback(() => {
    audio.pause()
    simulatorRef.current = null
    setCurrentTrack(null)
    isActiveRef.current = false
    isPausedRef.current = false
  }, [audio, setCurrentTrack])

  // Re-sync when tab becomes visible (browser may have drifted while backgrounded)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playCurrentPosition()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [playCurrentPosition])

  return useMemo(
    () => ({
      tuneIn,
      stop,
      pause,
      resume,
      setVolume: audio.setVolume,
      setFade: audio.setFade,
      isPlaying: audio.isPlaying,
      isLoading: audio.isLoading,
      volume: audio.volume,
      currentTrack,
    }),
    [tuneIn, stop, pause, resume, audio.setVolume, audio.setFade, audio.isPlaying, audio.isLoading, audio.volume, currentTrack],
  )
}
