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
      url: getTrackUrl('triggers/pomodoro.mp3'),
      duration: 25 * 60,
      title: 'Productive Pomodoro',
      artist: 'GBM Music',
      buyUrl: '#', // TODO: real GBM buy link
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
      url: getTrackUrl('triggers/power-nap.mp3'),
      duration: 20 * 60,
      title: 'Send Me to Sleep',
      artist: 'GBM Music',
      buyUrl: '#',
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
  },
  {
    id: 'sprint',
    name: 'Sprint',
    description: '30 minutes of high energy.',
    duration: 30 * 60,
    track: {
      id: 'trigger-sprint',
      url: getTrackUrl('triggers/sprint.mp3'),
      duration: 30 * 60,
      title: 'Sprint',
      artist: 'GBM Music',
      buyUrl: '#',
    },
    hasProgressRing: false,
    hasChime: true,
  },
]

export function getTrigger(id: Trigger['id']): Trigger {
  const trigger = triggers.find(t => t.id === id)
  if (!trigger) throw new Error(`Trigger not found: ${id}`)
  return trigger
}
