import { registerPlugin } from '@capacitor/core'
import { isNative } from './platform'
import type { Trigger } from '../types'

interface TriggerActivityPlugin {
  start(options: {
    triggerId: string
    triggerName: string
    durationSec: number
    endEpochMs: number
  }): Promise<void>
  setPaused(options: { paused: boolean; remainingMs: number }): Promise<void>
  end(): Promise<void>
}

const TriggerActivity = registerPlugin<TriggerActivityPlugin>('TriggerActivity')

/**
 * Live Activity countdown for trigger timers (Dynamic Island + lock screen).
 * No-ops on web; on iOS < 16.2 the native side resolves without doing anything.
 */
export function startTriggerActivity(trigger: Trigger): void {
  if (!isNative) return
  TriggerActivity.start({
    triggerId: trigger.id,
    triggerName: trigger.name,
    durationSec: trigger.duration,
    endEpochMs: Date.now() + trigger.duration * 1000,
  }).catch(() => {})
}

export function setTriggerActivityPaused(paused: boolean, remainingMs: number): void {
  if (!isNative) return
  TriggerActivity.setPaused({ paused, remainingMs }).catch(() => {})
}

export function endTriggerActivity(): void {
  if (!isNative) return
  TriggerActivity.end().catch(() => {})
}
