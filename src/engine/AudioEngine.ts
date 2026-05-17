export class AudioEngine {
  private player: HTMLAudioElement
  private _volume = 1
  private onTrackEndCallback: (() => void) | null = null
  private warmedUp = false

  constructor() {
    this.player = new Audio()
    this.player.crossOrigin = 'anonymous'
    this.player.preload = 'auto'
  }

  /** Warm up audio element on first user gesture (required for iOS). */
  async warmUp(): Promise<void> {
    if (this.warmedUp) return
    const silence =
      'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwMHAAAAAAD/+1DEAAAB8ANeUAAAIiIkq850IQQAACH/EcRE4jkf4CAYBA4PB4IBgCAYPg+XB9/ygIBgEAQCBwfL/WD4f/6gfB8HxQEMAABh0MAJgAADFj/+1DEFQAFnF1TnmHgAK0MKjedPCQAkIIAnOMA2B4HhTMSmEQmEgEpzjSYLEM0UaBoJJItFJImiS0jTBsLEJZKJYoF0G2DYIoU/+oVEBRFBhMhBBRFBh/6jUVEBQOwGIOoqA='
    try {
      this.player.src = silence
      await this.player.play().then(() => this.player.pause())
    } catch {
      // Some browsers may still block — that's OK
    }
    this.warmedUp = true
  }

  async play(url: string, seekTo = 0): Promise<boolean> {
    this.player.src = url
    this.player.currentTime = seekTo
    this.player.volume = this._volume
    this.player.onended = () => this.onTrackEndCallback?.()

    try {
      await this.player.play()
      return true
    } catch (e) {
      console.warn('Audio play failed:', e)
      return false
    }
  }

  pause(): void {
    this.player.pause()
  }

  async resume(): Promise<boolean> {
    this.player.volume = this._volume
    try {
      await this.player.play()
      return true
    } catch {
      return false
    }
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v))
    this.player.volume = this._volume
  }

  getVolume(): number {
    return this._volume
  }

  getCurrentTime(): number {
    return this.player.currentTime
  }

  getCurrentSrc(): string {
    return this.player.src
  }

  getDuration(): number {
    return this.player.duration || 0
  }

  isCurrentlyPlaying(): boolean {
    return !this.player.paused
  }

  onTrackEnd(callback: () => void): void {
    this.onTrackEndCallback = callback
  }

  destroy(): void {
    this.player.pause()
    this.player.src = ''
    this.player.onended = null
    this.onTrackEndCallback = null
  }
}
