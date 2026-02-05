export type TimerState = 'idle' | 'running' | 'paused' | 'complete'

export type TimerTickCallback = (remainingMs: number, progress: number) => void
export type TimerCompleteCallback = () => void

export class TimerEngine {
  private durationMs: number
  private startTimestamp = 0
  private pausedAt = 0
  private accumulatedPauseMs = 0
  private _state: TimerState = 'idle'
  private onTick: TimerTickCallback
  private onComplete: TimerCompleteCallback
  private tickInterval: ReturnType<typeof setInterval> | null = null

  constructor(
    durationMs: number,
    onTick: TimerTickCallback,
    onComplete: TimerCompleteCallback,
  ) {
    this.durationMs = durationMs
    this.onTick = onTick
    this.onComplete = onComplete
  }

  get state(): TimerState {
    return this._state
  }

  start(): void {
    this.startTimestamp = Date.now()
    this.accumulatedPauseMs = 0
    this._state = 'running'
    this.onTick(this.durationMs, 0)
    this.startTicking()
  }

  pause(): void {
    if (this._state !== 'running') return
    this._state = 'paused'
    this.pausedAt = Date.now()
    this.stopTicking()
  }

  resume(): void {
    if (this._state !== 'paused') return
    this.accumulatedPauseMs += Date.now() - this.pausedAt
    this._state = 'running'
    this.startTicking()
  }

  reset(): void {
    this._state = 'idle'
    this.stopTicking()
    this.onTick(this.durationMs, 0)
  }

  private startTicking(): void {
    this.stopTicking()
    this.tickInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTimestamp - this.accumulatedPauseMs
      const remaining = Math.max(0, this.durationMs - elapsed)
      const progress = Math.min(1, elapsed / this.durationMs)

      this.onTick(remaining, progress)

      if (remaining <= 0) {
        this._state = 'complete'
        this.stopTicking()
        this.onComplete()
      }
    }, 250)
  }

  private stopTicking(): void {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
  }

  destroy(): void {
    this.stopTicking()
  }
}
