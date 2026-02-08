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

interface SpeedLine {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
  width: number
}

const DEFAULT_PALETTE: Palette = {
  colors: ['#0f1628', '#1a1040', '#252060', '#1b3050', '#0d2040'],
  speed: 0.4,
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
  private prefersReducedMotion = false
  private reducedMotionQuery: MediaQueryList | null = null
  private _speedLines = false
  private speedLinePool: SpeedLine[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2d context')
    this.ctx = ctx
    this.initReducedMotionListener()
    this.resize(window.innerWidth, window.innerHeight)
    this.initBlobs()
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

  setSpeedLines(enabled: boolean): void {
    this._speedLines = enabled
    if (!enabled) {
      this.speedLinePool = []
    }
  }

  setPalette(palette: Palette, transitionMs = 2000): void {
    this.targetPalette = palette
    this.transitionProgress = 0
    this.transitionDuration = transitionMs
    this.transitionStart = performance.now()
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

    // Speed lines overlay (sprint mode)
    if (this._speedLines) {
      this.ctx.globalCompositeOperation = 'source-over'
      this.renderSpeedLines(w, h)
    }

    // Reset composite
    this.ctx.globalCompositeOperation = 'source-over'
  }

  private renderSpeedLines(w: number, h: number): void {
    // Spawn new lines
    while (this.speedLinePool.length < 18) {
      this.speedLinePool.push({
        x: w + Math.random() * w * 0.3,
        y: Math.random() * h,
        length: 60 + Math.random() * 180,
        speed: 3 + Math.random() * 5,
        opacity: 0.03 + Math.random() * 0.08,
        width: 1 + Math.random() * 2,
      })
    }

    // Update and draw
    for (let i = this.speedLinePool.length - 1; i >= 0; i--) {
      const line = this.speedLinePool[i]
      line.x -= line.speed

      // Remove offscreen lines
      if (line.x + line.length < 0) {
        this.speedLinePool[i] = {
          x: w + Math.random() * 100,
          y: Math.random() * h,
          length: 60 + Math.random() * 180,
          speed: 3 + Math.random() * 5,
          opacity: 0.03 + Math.random() * 0.08,
          width: 1 + Math.random() * 2,
        }
        continue
      }

      // Draw streak with gradient fade
      const gradient = this.ctx.createLinearGradient(line.x, 0, line.x + line.length, 0)
      gradient.addColorStop(0, `rgba(255, 160, 80, ${line.opacity})`)
      gradient.addColorStop(0.6, `rgba(255, 200, 140, ${line.opacity * 0.7})`)
      gradient.addColorStop(1, `rgba(255, 160, 80, 0)`)

      this.ctx.strokeStyle = gradient
      this.ctx.lineWidth = line.width
      this.ctx.beginPath()
      this.ctx.moveTo(line.x, line.y)
      this.ctx.lineTo(line.x + line.length, line.y)
      this.ctx.stroke()
    }
  }

  destroy(): void {
    this.stop()
    this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange)
  }
}
