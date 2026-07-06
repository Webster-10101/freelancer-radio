import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { isNative } from './platform'

/**
 * Subtle haptic tap for primary UI controls (hero play button, channel
 * selector). Native only — no-op on web.
 */
export function uiTapHaptic(style: 'light' | 'medium' = 'light'): void {
  if (!isNative) return
  Haptics.impact({
    style: style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light,
  }).catch(() => {})
}
