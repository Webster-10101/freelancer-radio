import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { isNative } from './platform'

export type BreathPhase = 'Breathe in' | 'Hold' | 'Breathe out'

/**
 * Haptic cues for the box-breathing cycle, designed to be legible with eyes
 * closed or phone in pocket: single firm tap = breathe in, double tap =
 * breathe out, soft tap = hold.
 */
export function breathePhaseHaptic(phase: BreathPhase): void {
  if (!isNative) return
  switch (phase) {
    case 'Breathe in':
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
      break
    case 'Breathe out':
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
      setTimeout(() => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
      }, 160)
      break
    case 'Hold':
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
      break
  }
}
