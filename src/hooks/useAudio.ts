import { useEffect, useRef, useCallback, useState } from 'react'
import { AudioEngine } from '../engine/AudioEngine'

export function useAudio() {
  const engineRef = useRef<AudioEngine | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolumeState] = useState(1)

  useEffect(() => {
    const engine = new AudioEngine()
    engineRef.current = engine

    const handleVisibility = () => engine.handleVisibilityChange()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      engine.destroy()
    }
  }, [])

  const warmUp = useCallback(async () => {
    await engineRef.current?.warmUp()
  }, [])

  const play = useCallback(async (url: string, seekTo = 0) => {
    setIsLoading(true)
    await engineRef.current?.warmUp()
    await engineRef.current?.play(url, seekTo)
    setIsLoading(false)
    setIsPlaying(true)
  }, [])

  const crossfadeTo = useCallback(async (url: string, seekTo = 0, durationMs = 2000) => {
    setIsLoading(true)
    await engineRef.current?.crossfadeTo(url, seekTo, durationMs)
    setIsLoading(false)
    setIsPlaying(true)
  }, [])

  const preload = useCallback((url: string) => {
    engineRef.current?.preload(url)
  }, [])

  const pause = useCallback(() => {
    engineRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    engineRef.current?.resume()
    setIsPlaying(true)
  }, [])

  const setVolume = useCallback((v: number) => {
    engineRef.current?.setVolume(v)
    setVolumeState(v)
  }, [])

  const onTrackEnd = useCallback((callback: () => void) => {
    engineRef.current?.onTrackEnd(callback)
  }, [])

  const getCurrentTime = useCallback(() => {
    return engineRef.current?.getCurrentTime() ?? 0
  }, [])

  return {
    play,
    crossfadeTo,
    preload,
    pause,
    resume,
    warmUp,
    setVolume,
    onTrackEnd,
    getCurrentTime,
    isPlaying,
    isLoading,
    volume,
  }
}
