import { registerPlugin } from '@capacitor/core'

interface RoutePickerPlugin {
  /** Present the system AirPlay route picker sheet. iOS only. */
  show(): Promise<void>
}

export const RoutePicker = registerPlugin<RoutePickerPlugin>('RoutePicker')
