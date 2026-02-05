import type { Channel } from '../types'
import { getTrackUrl } from './audio'

// Placeholder tracks — replace URLs and durations with real GBM tracks + R2 URLs
const placeholderTracks = (channelId: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${channelId}-${String(i + 1).padStart(2, '0')}`,
    url: getTrackUrl(`channels/${channelId}/${String(i + 1).padStart(2, '0')}.mp3`),
    duration: 300, // 5 min placeholder
    title: `Track ${i + 1}`,
    artist: 'GBM Music',
  }))

export const channels: Channel[] = [
  {
    id: 'calm',
    name: 'Calm',
    description: 'Gentle focus. Quiet mind.',
    palette: {
      colors: ['#0f2027', '#203a43', '#2c5364', '#1a3a4a', '#0d4f6b'],
      speed: 0.3,
    },
    tracks: placeholderTracks('calm', 10),
    get totalDuration() {
      return this.tracks.reduce((sum, t) => sum + t.duration, 0)
    },
  },
  {
    id: 'flow',
    name: 'Flow',
    description: 'Steady rhythm. Deep work.',
    palette: {
      colors: ['#1a0533', '#2d1b69', '#5b2c8e', '#8b3fa0', '#c74baa'],
      speed: 0.5,
    },
    tracks: placeholderTracks('flow', 10),
    get totalDuration() {
      return this.tracks.reduce((sum, t) => sum + t.duration, 0)
    },
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Upbeat. Driving. Move fast.',
    palette: {
      colors: ['#1a0a00', '#3d1c00', '#b35900', '#e8890c', '#ffd700'],
      speed: 0.7,
    },
    tracks: placeholderTracks('energy', 10),
    get totalDuration() {
      return this.tracks.reduce((sum, t) => sum + t.duration, 0)
    },
  },
]

export function getChannel(id: Channel['id']): Channel {
  const channel = channels.find(c => c.id === id)
  if (!channel) throw new Error(`Channel not found: ${id}`)
  return channel
}
