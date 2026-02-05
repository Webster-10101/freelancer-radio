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

  const tuneIn = useCallback(async (channel: Channel) => {
    clearTimers()
    const simulator = new RadioSimulator(channel)
    simulatorRef.current = simulator

    const pos = simulator.getPositionAtTime()
    currentTrackRef.current = pos.track
    await audio.play(pos.track.url, pos.seekSeconds)
    scheduleNextTrack()

    // Drift correction every 60s
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
    }, 60000)
  }, [audio, clearTimers, scheduleNextTrack])

  const stop = useCallback(() => {
    clearTimers()
    audio.pause()
    simulatorRef.current = null
    currentTrackRef.current = null
  }, [audio, clearTimers])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

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
