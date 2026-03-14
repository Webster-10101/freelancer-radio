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
    return () => engine.destroy()
  }, [])

  const play = useCallback(async (url: string, seekTo = 0) => {
    setIsLoading(true)
    await engineRef.current?.warmUp()
    await engineRef.current?.play(url, seekTo)
    setIsLoading(false)
    setIsPlaying(true)
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

  const getCurrentSrc = useCallback(() => {
    return engineRef.current?.getCurrentSrc() ?? ''
  }, [])

  return {
    play,
    pause,
    resume,
    setVolume,
    onTrackEnd,
    getCurrentTime,
    getCurrentSrc,
    isPlaying,
    isLoading,
    volume,
  }
}
