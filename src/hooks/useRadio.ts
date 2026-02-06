import { useCallback, useRef, useEffect } from 'react'
import { RadioSimulator } from '../engine/RadioSimulator'
import type { Channel, Track } from '../types'
import { useAudio } from './useAudio'

export function useRadio() {
  const audio = useAudio()
  const simulatorRef = useRef<RadioSimulator | null>(null)
  const nextTrackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const driftIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTrackRef = useRef<Track | null>(null)
  const isActiveRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (nextTrackTimeoutRef.current) {
      clearTimeout(nextTrackTimeoutRef.current)
      nextTrackTimeoutRef.current = null
    }
    if (driftIntervalRef.current) {
      clearInterval(driftIntervalRef.current)
      driftIntervalRef.current = null
    }
  }, [])

  const scheduleNextTrack = useCallback(() => {
    const simulator = simulatorRef.current
    if (!simulator) return

    const pos = simulator.getPositionAtTime()
    currentTrackRef.current = pos.track

    // Preload next track 5 seconds before boundary
    const preloadIn = Math.max(0, (pos.secondsUntilNextTrack - 5) * 1000)
    setTimeout(() => {
      audio.preload(pos.nextTrack.url)
    }, preloadIn)

    // Schedule crossfade to next track
    if (nextTrackTimeoutRef.current) clearTimeout(nextTrackTimeoutRef.current)
    nextTrackTimeoutRef.current = setTimeout(() => {
      const newPos = simulatorRef.current?.getPositionAtTime()
      if (!newPos) return
      audio.crossfadeTo(newPos.track.url, newPos.seekSeconds)
      currentTrackRef.current = newPos.track
      scheduleNextTrack()
    }, pos.secondsUntilNextTrack * 1000)
  }, [audio])

  // Re-sync playback when tab becomes visible (fixes background throttling)
  const resyncPlayback = useCallback(() => {
    if (!simulatorRef.current || !isActiveRef.current) return

    const expected = simulatorRef.current.getPositionAtTime()
    const actual = audio.getCurrentTime()
    const drift = Math.abs(expected.seekSeconds - actual)

    // If track changed or significant drift, re-sync
    if (currentTrackRef.current?.id !== expected.track.id || drift > 1) {
      audio.crossfadeTo(expected.track.url, expected.seekSeconds)
      currentTrackRef.current = expected.track
    }

    // Reschedule next track with correct timing
    scheduleNextTrack()
  }, [audio, scheduleNextTrack])

  const tuneIn = useCallback(async (channel: Channel) => {
    clearTimers()
    const simulator = new RadioSimulator(channel)
    simulatorRef.current = simulator
    isActiveRef.current = true

    const pos = simulator.getPositionAtTime()
    currentTrackRef.current = pos.track
    await audio.play(pos.track.url, pos.seekSeconds)
    scheduleNextTrack()

    // Drift correction every 15s (more frequent to handle background throttling)
    driftIntervalRef.current = setInterval(() => {
      if (!simulatorRef.current) return
      const expected = simulatorRef.current.getPositionAtTime()
      const actual = audio.getCurrentTime()
      const drift = Math.abs(expected.seekSeconds - actual)
      if (drift > 2) {
        // Re-sync by seeking
        audio.play(expected.track.url, expected.seekSeconds)
        scheduleNextTrack()
      }
    }, 15000)
  }, [audio, clearTimers, scheduleNextTrack])

  const stop = useCallback(() => {
    clearTimers()
    audio.pause()
    simulatorRef.current = null
    currentTrackRef.current = null
    isActiveRef.current = false
  }, [audio, clearTimers])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  // Re-sync when tab becomes visible (browser throttles setTimeout in background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resyncPlayback()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [resyncPlayback])

  return {
    tuneIn,
    stop,
    pause: audio.pause,
    resume: audio.resume,
    setVolume: audio.setVolume,
    isPlaying: audio.isPlaying,
    isLoading: audio.isLoading,
    volume: audio.volume,
    getCurrentTrack: () => currentTrackRef.current,
  }
}
