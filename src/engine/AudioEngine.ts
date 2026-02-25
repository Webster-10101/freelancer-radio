type PlayerSlot = 'A' | 'B'

export class AudioEngine {
  private playerA: HTMLAudioElement
  private playerB: HTMLAudioElement
  private activeSlot: PlayerSlot = 'A'
  private _volume = 1
  private crossfadeId: number | null = null
  private onTrackEndCallback: (() => void) | null = null
  private warmedUp = false
  private preloadedUrl: string | null = null

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
    this.preloadedUrl = null // Playing a new track invalidates any preload
    const player = this.active
    player.src = url
    player.volume = 0
    player.currentTime = seekTo
    player.onended = () => this.onTrackEndCallback?.()

    try {
      await player.play()
    } catch (e) {
      console.warn('Audio play failed, retrying:', e)
      // Retry once — background tabs can reject the first attempt
      try {
        await player.play()
      } catch (e2) {
        console.warn('Audio play retry also failed:', e2)
        return
      }
    }

    // Background tab: skip fade, set volume immediately
    // (rAF doesn't fire in background, leaving volume at 0 = silence)
    if (document.visibilityState === 'hidden') {
      player.volume = this._volume
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

    this.preloadedUrl = null // Crossfade uses the inactive player, invalidating any preload
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
    outgoing.onended = null // Prevent stale callback from outgoing track

    this.cancelCrossfade()

    // Background tab: skip crossfade animation, set volumes immediately
    // (rAF doesn't fire in background, leaving incoming at 0 = silence)
    if (document.visibilityState === 'hidden') {
      incoming.volume = this._volume
      outgoing.pause()
      outgoing.src = ''
      return
    }

    const startTime = performance.now()
    const startVolOut = outgoing.volume
    const targetVol = this._volume

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

  /**
   * Radio-style transition: brief fade-out on outgoing, then clean start on incoming.
   * No overlap — preserves the full beginning of every track (especially short idents).
   * Used for automatic track-to-track transitions. crossfadeTo is kept for user-initiated
   * channel switches where an overlap sounds smoother.
   */
  async transitionTo(url: string, seekTo = 0, fadeOutMs = 300): Promise<void> {
    const outgoing = this.active
    const incoming = this.inactive

    this.preloadedUrl = null
    incoming.src = url
    incoming.currentTime = seekTo
    incoming.volume = this._volume
    incoming.onended = () => this.onTrackEndCallback?.()

    // Quick fade-out on outgoing (or instant if in background)
    outgoing.onended = null
    if (document.visibilityState === 'hidden' || fadeOutMs <= 0) {
      outgoing.pause()
      outgoing.src = ''
    } else {
      const startVol = outgoing.volume
      const startTime = performance.now()
      await new Promise<void>(resolve => {
        const fade = (now: number) => {
          const progress = Math.min((now - startTime) / fadeOutMs, 1)
          outgoing.volume = startVol * (1 - progress)
          if (progress < 1) {
            requestAnimationFrame(fade)
          } else {
            outgoing.pause()
            outgoing.src = ''
            resolve()
          }
        }
        requestAnimationFrame(fade)
      })
    }

    // Start incoming at full volume — clean start
    this.activeSlot = this.activeSlot === 'A' ? 'B' : 'A'
    this.cancelCrossfade()

    try {
      await incoming.play()
    } catch (e) {
      console.warn('transitionTo play failed, retrying:', e)
      try {
        await incoming.play()
      } catch (e2) {
        console.warn('transitionTo retry also failed:', e2)
      }
    }
  }

  preload(url: string): void {
    this.inactive.src = url
    this.inactive.preload = 'auto'
    this.inactive.load() // Force browser to start loading, even in background tabs
    this.preloadedUrl = url
  }

  /**
   * Switch to the preloaded inactive player — no network request needed.
   * Used for background tab transitions where loading a new source is unreliable.
   */
  async switchToPreloaded(seekTo = 0): Promise<void> {
    const outgoing = this.active
    const incoming = this.inactive

    if (!this.preloadedUrl || !incoming.src) {
      // Nothing preloaded — fall back to regular play behaviour
      return
    }

    incoming.currentTime = seekTo
    incoming.volume = this._volume
    incoming.onended = () => this.onTrackEndCallback?.()

    outgoing.onended = null
    outgoing.pause()
    outgoing.src = ''

    this.activeSlot = this.activeSlot === 'A' ? 'B' : 'A'
    this.cancelCrossfade()
    this.preloadedUrl = null

    try {
      await incoming.play()
    } catch (e) {
      console.warn('switchToPreloaded play failed, retrying:', e)
      // Single retry — the audio data is already loaded so this should work
      try {
        await incoming.play()
      } catch (e2) {
        console.warn('switchToPreloaded retry also failed:', e2)
      }
    }
  }

  isPreloaded(url: string): boolean {
    return this.preloadedUrl === url
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
    if (document.visibilityState === 'hidden') {
      // Tab going to background: complete any in-progress fade immediately
      // so rAF stopping doesn't leave volume stuck at 0
      if (this.crossfadeId !== null) {
        this.cancelCrossfade()
        this.active.volume = this._volume
        const outgoing = this.inactive
        if (!outgoing.paused && outgoing.src) {
          outgoing.pause()
          outgoing.src = ''
        }
      }
    }
    // No play() on visibility return — useRadio.resyncPlayback handles re-sync
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
