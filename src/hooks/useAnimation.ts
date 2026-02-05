import { useEffect, useRef } from 'react'
import { AnimationEngine, type Palette } from '../engine/AnimationEngine'

export function useAnimation(palette?: Palette, isPlaying = false, channelId?: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<AnimationEngine | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new AnimationEngine(canvas)
    engineRef.current = engine
    engine.start()

    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
    }
  }, [])

  useEffect(() => {
    if (palette && engineRef.current) {
      engineRef.current.setPalette(palette)
    }
  }, [palette])

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPlaying(isPlaying, channelId)
    }
  }, [isPlaying, channelId])

  return canvasRef
}
