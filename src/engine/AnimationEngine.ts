export interface Palette {
  colors: string[]
  speed: number
}

interface GradientBlob {
  cx: number
  cy: number
  radius: number
  freqX: number
  freqY: number
  phaseX: number
  phaseY: number
  colorIdx: number
}

interface RiverWave {
  amplitude: number
  frequency: number
  speed: number
  phase: number
  colorIdx: number
  thickness: number
  yOffset: number // vertical position as fraction of height (0-1)
}

const DEFAULT_PALETTE: Palette = {
  colors: ['#0f1628', '#1a1040', '#252060', '#1b3050', '#0d2040'],
  speed: 0.4,
}

// Brighter accent colours per channel for the river waves
const RIVER_COLORS: Record<string, string[]> = {
  calm: ['#4dd0e1', '#26c6da', '#00bcd4', '#80deea', '#b2ebf2'],
  flow: ['#ce93d8', '#ba68c8', '#ab47bc', '#e1bee7', '#f48fb1'],
  energy: ['#ffb74d', '#ffa726', '#ff9800', '#ffcc80', '#ff7043'],
  default: ['#7986cb', '#5c6bc0', '#9fa8da', '#7c4dff', '#536dfe'],
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
}

function lerpHex(a: string, b: string, t: number): string {
  const na = parseInt(a.slice(1), 16)
  const nb = parseInt(b.slice(1), 16)
  const r = Math.round(((na >> 16) & 255) + (((nb >> 16) & 255) - ((na >> 16) & 255)) * t)
  const g = Math.round(((na >> 8) & 255) + (((nb >> 8) & 255) - ((na >> 8) & 255)) * t)
  const bl = Math.round((na & 255) + ((nb & 255) - (na & 255)) * t)
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`
}

export class AnimationEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number | null = null
  private currentPalette: Palette = DEFAULT_PALETTE
  private targetPalette: Palette | null = null
  private transitionProgress = 1
  private transitionDuration = 2000
  private transitionStart = 0
  private blobs: GradientBlob[] = []
  private waves: RiverWave[] = []
  private isMobile = false
  private _isPlaying = false
  private riverOpacity = 0 // fades in when playing
  private activeChannelId: string = 'default'
  private prefersReducedMotion = false
  private reducedMotionQuery: MediaQueryList | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')
    this.ctx = ctx
    this.isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 1
    this.initReducedMotionListener()
    this.resize(window.innerWidth, window.innerHeight)
    this.initBlobs()
    this.initWaves()
  }

  private handleReducedMotionChange = (e: MediaQueryListEvent): void => {
    this.prefersReducedMotion = e.matches
  }

  private initReducedMotionListener(): void {
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.prefersReducedMotion = this.reducedMotionQuery.matches
    this.reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange)
  }

  private initBlobs(): void {
    this.blobs = Array.from({ length: 4 }, (_, i) => ({
      cx: 0.2 + Math.random() * 0.6,
      cy: 0.2 + Math.random() * 0.6,
      radius: 0.3 + Math.random() * 0.3,
      freqX: 0.0002 + Math.random() * 0.0003,
      freqY: 0.00015 + Math.random() * 0.00025,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      colorIdx: i % 5,
    }))
  }

  private initWaves(): void {
    const count = this.isMobile ? 3 : 4
    this.waves = Array.from({ length: count }, (_, i) => ({
      amplitude: 20 + Math.random() * 40,
      frequency: 0.003 + Math.random() * 0.004,
      speed: 0.0004 + Math.random() * 0.0006,
      phase: Math.random() * Math.PI * 2,
      colorIdx: i % 5,
      thickness: 2 + Math.random() * 3,
      yOffset: 0.35 + (i / count) * 0.3, // spread across middle band
    }))
  }

  start(): void {
    if (this.animationId !== null) return
    const animate = (timestamp: number) => {
      this.render(timestamp)
      this.animationId = requestAnimationFrame(animate)
    }
    this.animationId = requestAnimationFrame(animate)
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  setPalette(palette: Palette, transitionMs = 2000): void {
    this.targetPalette = palette
    this.transitionProgress = 0
    this.transitionDuration = transitionMs
    this.transitionStart = performance.now()
  }

  setPlaying(playing: boolean, channelId?: string): void {
    this._isPlaying = playing
    if (channelId) this.activeChannelId = channelId
  }

  resize(width: number, height: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.scale(dpr, dpr)
  }

  private getActiveColor(index: number): string {
    const ci = index % this.currentPalette.colors.length
    const current = this.currentPalette.colors[ci]

    if (!this.targetPalette || this.transitionProgress >= 1) {
      return current
    }

    const ti = index % this.targetPalette.colors.length
    const target = this.targetPalette.colors[ti]
    return lerpHex(current, target, this.transitionProgress)
  }

  private getRiverColors(): string[] {
    return RIVER_COLORS[this.activeChannelId] || RIVER_COLORS.default
  }

  private render(timestamp: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = this.canvas.width / dpr
    const h = this.canvas.height / dpr

    // Update palette transition
    if (this.targetPalette && this.transitionProgress < 1) {
      const elapsed = timestamp - this.transitionStart
      const raw = Math.min(1, elapsed / this.transitionDuration)
      this.transitionProgress = raw * raw * (3 - 2 * raw) // smoothstep

      if (this.transitionProgress >= 1) {
        this.currentPalette = this.targetPalette
        this.targetPalette = null
        this.transitionProgress = 1
      }
    }

    // Fade river opacity in/out
    const targetOpacity = this._isPlaying ? 1 : 0
    this.riverOpacity += (targetOpacity - this.riverOpacity) * 0.02

    // Clear with base colour
    this.ctx.fillStyle = this.getActiveColor(0)
    this.ctx.fillRect(0, 0, w, h)

    // Reduced motion: show simple static gradient, skip expensive animations
    if (this.prefersReducedMotion) {
      const gradient = this.ctx.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, this.getActiveColor(0))
      gradient.addColorStop(0.5, this.getActiveColor(1))
      gradient.addColorStop(1, this.getActiveColor(2))
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, w, h)
      return
    }

    // Draw ambient gradient blobs (always visible)
    const speed = this.currentPalette.speed
    this.ctx.globalCompositeOperation = 'lighter'

    for (const blob of this.blobs) {
      const cx = w * (blob.cx + 0.3 * Math.sin(timestamp * blob.freqX * speed + blob.phaseX))
      const cy = h * (blob.cy + 0.3 * Math.cos(timestamp * blob.freqY * speed + blob.phaseY))
      const r = Math.min(w, h) * blob.radius
      const color = this.getActiveColor(blob.colorIdx)

      const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      gradient.addColorStop(0, hexToRgba(color, 0.6))
      gradient.addColorStop(1, hexToRgba(color, 0))

      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, w, h)
    }

    // Draw river/brainwave streams (only when playing, fades in)
    if (this.riverOpacity > 0.01) {
      const riverColors = this.getRiverColors()

      // Energy channel pulse: amplitude and opacity breathe in and out
      const isEnergy = this.activeChannelId === 'energy'

      // Apply blur filter for genuine soft glow (10px balances aesthetics vs performance)
      this.ctx.filter = 'blur(10px)'
      this.ctx.lineCap = 'round'
      this.ctx.lineJoin = 'round'

      for (let i = 0; i < this.waves.length; i++) {
        const wave = this.waves[i]
        const baseY = h * wave.yOffset
        const color = riverColors[wave.colorIdx % riverColors.length]

        // Per-wave phase offset so they don't all pulse in sync
        const pulseFactor = isEnergy
          ? 1 + 0.5 * Math.sin(timestamp * 0.0015 + i * 1.2)
          : 1
        const pulseAlpha = isEnergy
          ? 1 + 0.4 * Math.sin(timestamp * 0.0015 + i * 1.2)
          : 1

        // Build wave path — flows left to right
        this.ctx.beginPath()

        for (let x = 0; x <= w; x += 5) {
          const flow = timestamp * wave.speed * 150
          const y = baseY
            + Math.sin((x - flow) * wave.frequency + wave.phase) * wave.amplitude * pulseFactor
            + Math.sin((x - flow) * wave.frequency * 0.5 + wave.phase * 2) * wave.amplitude * 0.5 * pulseFactor
            + Math.sin((x - flow) * wave.frequency * 1.8 + wave.phase * 0.5) * wave.amplitude * 0.25 * pulseFactor

          if (x === 0) {
            this.ctx.moveTo(x, y)
          } else {
            this.ctx.lineTo(x, y)
          }
        }

        // Single stroke — the blur filter handles the soft glow
        const alpha = Math.min(1, 0.35 * this.riverOpacity * pulseAlpha)
        this.ctx.strokeStyle = hexToRgba(color, alpha)
        this.ctx.lineWidth = wave.thickness * 4
        this.ctx.stroke()
      }

      // Reset filter
      this.ctx.filter = 'none'
    }

    // Reset composite
    this.ctx.globalCompositeOperation = 'source-over'
  }

  destroy(): void {
    this.stop()
    this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange)
  }
}
