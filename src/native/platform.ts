import { Capacitor } from '@capacitor/core'

/** True when running inside the Capacitor iOS/Android shell (not the website). */
export const isNative = Capacitor.isNativePlatform()
