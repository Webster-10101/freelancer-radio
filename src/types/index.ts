export interface Track {
  id: string
  url: string
  duration: number // seconds
  title: string
  artist: string
  buyUrl?: string
}

export interface ChannelPalette {
  colors: string[]
  speed: number
}

export interface Channel {
  id: 'calm' | 'flow' | 'energy'
  name: string
  description: string
  palette: ChannelPalette
  tracks: Track[]
  totalDuration: number
}

export interface Trigger {
  id: 'pomodoro' | 'power-nap' | 'breathe' | 'sprint'
  name: string
  description: string
  duration: number // seconds
  track: Track
  hasProgressRing: boolean
  hasChime: boolean
  comingSoon?: boolean
  palette?: ChannelPalette
  speedLines?: boolean
}

export type PlayMode = 'idle' | 'channel' | 'trigger'

export interface AppState {
  mode: PlayMode
  activeChannelId: Channel['id'] | null
  activeTriggerId: Trigger['id'] | null
  isPlaying: boolean
  volume: number
  currentTrack: Track | null
}
