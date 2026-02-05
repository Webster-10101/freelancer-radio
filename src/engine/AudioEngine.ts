type PlayerSlot = 'A' | 'B'

export class AudioEngine {
  private playerA: HTMLAudioElement
  private playerB: HTMLAudioElement
  private activeSlot: PlayerSlot = 'A'
  private _volume = 1
  private crossfadeId: number | null = null
  private onTrackEndCallback: (() => void) | null = null
  private warmedUp = false

  constructor() {
    this.playerA = new Audio()
    this.playerA.crossOrigin = 'anonymous'
    this.playerA.preload = 'auto'
    this.playerB = new Audio()
    this.playerB.crossOrigin = 'anonymous'
    this.playerB.preload = 'auto'
  }

  private get active(): HTMLAudioElement {
    return this.activeSlot === 'A' ? this.playerA : this.playerB
  }

  private get inactive(): HTMLAudioElement {
    return this.activeSlot === 'A' ? this.playerB : this.playerA
  }

  /** Warm up audio elements on first user gesture (required for iOS). */
  async warmUp(): Promise<void> {
    if (this.warmedUp) return
    const silence =
      'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwMHAAAAAAD/+1DEAAAB8ANeUAAAIiIkq850IQQAACH/EcRE4jkf4CAYBA4PB4IBgCAYPg+XB9/ygIBgEAQCBwfL/WD4f/6gfB8HxQEMAABh0MAJgAADFj/+1DEFQAFnF1TnmHgAK0MKjedPCQAkIIAnOMA2B4HhTMSmEQmEgEpzjSYLEM0UaBoJJItFJImiS0jTBsLEJZKJYoF0G2DYIoU/+oVEBRFBhMhBBRFBh/6jUVEBQOwGIOoqA='
    try {
      this.playerA.src = silence
      this.playerB.src = silence
      await Promise.all([
        this.playerA.play().then(() => this.playerA.pause()),
        this.playerB.play().then(() => this.playerB.pause()),
      ])
    } catch {
      // Some browsers may still block — that's OK
    }
    this.warmedUp = true
  }

  async play(url: string, seekTo = 0, fadeInMs = 800): Promise<void> {
    this.cancelCrossfade()
    const player = this.active
    player.src = url
    player.volume = 0
    player.currentTime = seekTo
    player.onended = () => this.onTrackEndCallback?.()

    try {
      await player.play()
    } catch (e) {
      console.warn('Audio play failed:', e)
      return
    }

    const startTime = performance.now()
    const targetVol = this._volume

    const fadeIn = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / fadeInMs, 1)
      const eased = progress * progress * (3 - 2 * progress) // smoothstep
      player.volume = targetVol * eased

      if (progress < 1) {
        this.crossfadeId = requestAnimationFrame(fadeIn)
      } else {
        this.crossfadeId = null
      }
    }

    this.crossfadeId = requestAnimationFrame(fadeIn)
  }

  async crossfadeTo(url: string, seekTo = 0, durationMs = 2000): Promise<void> {
    const outgoing = this.active
    const incoming = this.inactive

    incoming.src = url
    incoming.currentTime = seekTo
    incoming.volume = 0
    incoming.onended = () => this.onTrackEndCallback?.()

    try {
      await incoming.play()
    } catch (e) {
      console.warn('Crossfade play failed:', e)
      return
    }

    this.activeSlot = this.activeSlot === 'A' ? 'B' : 'A'

    const startTime = performance.now()
    const startVolOut = outgoing.volume
    const targetVol = this._volume

    this.cancelCrossfade()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = progress * progress * (3 - 2 * progress) // smoothstep

      outgoing.volume = startVolOut * (1 - eased)
      incoming.volume = targetVol * eased

      if (progress < 1) {
        this.crossfadeId = requestAnimationFrame(animate)
      } else {
        outgoing.pause()
        outgoing.src = ''
        this.crossfadeId = null
      }
    }

    this.crossfadeId = requestAnimationFrame(animate)
  }

  preload(url: string): void {
    this.inactive.src = url
    this.inactive.preload = 'auto'
  }

  pause(): void {
    this.active.pause()
  }

  resume(fadeInMs = 400): void {
    const player = this.active
    player.volume = 0
    player.play().catch(() => {})

    const startTime = performance.now()
    const targetVol = this._volume

    const fadeIn = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / fadeInMs, 1)
      const eased = progress * progress * (3 - 2 * progress)
      player.volume = targetVol * eased

      if (progress < 1) {
        requestAnimationFrame(fadeIn)
      }
    }

    requestAnimationFrame(fadeIn)
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v))
    this.active.volume = this._volume
  }

  getVolume(): number {
    return this._volume
  }

  getCurrentTime(): number {
    return this.active.currentTime
  }

  getDuration(): number {
    return this.active.duration || 0
  }

  isCurrentlyPlaying(): boolean {
    return !this.active.paused
  }

  onTrackEnd(callback: () => void): void {
    this.onTrackEndCallback = callback
  }

  handleVisibilityChange(): void {
    if (document.visibilityState === 'visible' && !this.active.paused) {
      this.active.play().catch(() => {})
    }
  }

  private cancelCrossfade(): void {
    if (this.crossfadeId !== null) {
      cancelAnimationFrame(this.crossfadeId)
      this.crossfadeId = null
    }
  }

  destroy(): void {
    this.cancelCrossfade()
    this.playerA.pause()
    this.playerB.pause()
    this.playerA.src = ''
    this.playerB.src = ''
    this.onTrackEndCallback = null
  }
}
