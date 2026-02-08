import type { Trigger } from '../types'
import { getTrackUrl } from './audio'

export const triggers: Trigger[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 minutes of focused work.',
    duration: 25 * 60,
    track: {
      id: 'trigger-pomodoro',
      url: getTrackUrl('triggers/Alistair Webster - Productive Pomodoro.mp3'),
      duration: 1508,
      title: 'Productive Pomodoro',
      artist: 'GBM Music',
      buyUrl: 'https://gbmmusicuk.bandcamp.com/track/productive-pomodoro',
    },
    hasProgressRing: true,
    hasChime: true,
  },
  {
    id: 'power-nap',
    name: 'Power Nap',
    description: '20 minutes to recharge.',
    duration: 20 * 60,
    track: {
      id: 'trigger-power-nap',
      url: getTrackUrl('triggers/Send me to Sleep Extended V2.mp3'),
      duration: 2374,
      title: 'Send Me to Sleep',
      artist: 'GBM Music',
      buyUrl: 'https://gbmmusicuk.bandcamp.com/track/send-me-to-sleep-a-song-to-fall-asleep-to-extended-version',
    },
    hasProgressRing: false,
    hasChime: true,
  },
  {
    id: 'breathe',
    name: 'Breathe',
    description: '10 minutes to reset.',
    duration: 10 * 60,
    track: {
      id: 'trigger-breathe',
      url: getTrackUrl('triggers/breathe.mp3'),
      duration: 10 * 60,
      title: 'Breathe',
      artist: 'GBM Music',
      buyUrl: '#',
    },
    hasProgressRing: false,
    hasChime: true,
    comingSoon: true,
  },
  {
    id: 'sprint',
    name: 'Sprint',
    description: '30 minutes of high energy.',
    duration: 30 * 60,
    track: {
      id: 'trigger-sprint',
      url: getTrackUrl('triggers/GBM Music - Reason To Run.mp3'),
      duration: 1998,
      title: 'Reason To Run',
      artist: 'GBM Music',
      buyUrl: '#',
    },
    hasProgressRing: false,
    hasChime: true,
    palette: {
      colors: ['#1a0a00', '#3d1500', '#6b2000', '#4a1200', '#2d0800'],
      speed: 1.2,
    },
    speedLines: true,
  },
]

export function getTrigger(id: Trigger['id']): Trigger {
  const trigger = triggers.find(t => t.id === id)
  if (!trigger) throw new Error(`Trigger not found: ${id}`)
  return trigger
}
