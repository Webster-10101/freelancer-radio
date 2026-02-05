import type { Channel } from '../types'
import { getTrackUrl } from './audio'

export const channels: Channel[] = [
  {
    id: 'calm',
    name: 'Calm',
    description: 'Gentle focus. Quiet mind.',
    palette: {
      colors: ['#0f2027', '#203a43', '#2c5364', '#1a3a4a', '#0d4f6b'],
      speed: 0.3,
    },
    tracks: [
      {
        id: 'calm-01',
        url: getTrackUrl('channels/calm/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 01 Awakening.mp3'),
        duration: 132,
        title: 'Awakening',
        artist: 'GBM Music',
      },
      {
        id: 'calm-02',
        url: getTrackUrl('channels/calm/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 02 Lost in Thought.mp3'),
        duration: 188,
        title: 'Lost in Thought',
        artist: 'GBM Music',
      },
      {
        id: 'calm-03',
        url: getTrackUrl('channels/calm/Alistair Webster - Let Go - 01 Honeycomb.mp3'),
        duration: 361,
        title: 'Honeycomb',
        artist: 'GBM Music',
      },
      {
        id: 'calm-04',
        url: getTrackUrl('channels/calm/Alistair Webster - Let Go - 02 Mischief.mp3'),
        duration: 192,
        title: 'Mischief',
        artist: 'GBM Music',
      },
      {
        id: 'calm-05',
        url: getTrackUrl('channels/calm/Alistair Webster - Let Go - 03 Shades of Energy.mp3'),
        duration: 187,
        title: 'Shades of Energy',
        artist: 'GBM Music',
      },
      {
        id: 'calm-06',
        url: getTrackUrl('channels/calm/Alistair Webster - Let Go - 04 Another Day.mp3'),
        duration: 436,
        title: 'Another Day',
        artist: 'GBM Music',
      },
      {
        id: 'calm-07',
        url: getTrackUrl('channels/calm/GBM Music - Good Background Music - Volume 1 - 04 Maybe Not.mp3'),
        duration: 236,
        title: 'Maybe Not',
        artist: 'GBM Music',
      },
      {
        id: 'calm-08',
        url: getTrackUrl('channels/calm/GBM Music - Good Background Music - Volume 1 - 05 Ripples.mp3'),
        duration: 171,
        title: 'Ripples',
        artist: 'GBM Music',
      },
    ],
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
    tracks: [
      {
        id: 'flow-01',
        url: getTrackUrl('channels/flow/Alistair Webster - Chilled Vibes - 01 All You Left Behind.mp3'),
        duration: 317,
        title: 'All You Left Behind',
        artist: 'GBM Music',
      },
      {
        id: 'flow-02',
        url: getTrackUrl('channels/flow/Alistair Webster - Chilled Vibes - 02 Cut Back.mp3'),
        duration: 224,
        title: 'Cut Back',
        artist: 'GBM Music',
      },
      {
        id: 'flow-03',
        url: getTrackUrl('channels/flow/Alistair Webster - Chilled Vibes - 03 Distant Lights.mp3'),
        duration: 242,
        title: 'Distant Lights',
        artist: 'GBM Music',
      },
      {
        id: 'flow-04',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 03 Misleading Monologue.mp3'),
        duration: 248,
        title: 'Misleading Monologue',
        artist: 'GBM Music',
      },
      {
        id: 'flow-05',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 04 One More.mp3'),
        duration: 252,
        title: 'One More',
        artist: 'GBM Music',
      },
      {
        id: 'flow-06',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 05 Tell Me You Knew.mp3'),
        duration: 238,
        title: 'Tell Me You Knew',
        artist: 'GBM Music',
      },
      {
        id: 'flow-07',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 06 Distracted.mp3'),
        duration: 116,
        title: 'Distracted',
        artist: 'GBM Music',
      },
      {
        id: 'flow-08',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 07 Barefoot.mp3'),
        duration: 187,
        title: 'Barefoot',
        artist: 'GBM Music',
      },
      {
        id: 'flow-09',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 08 Flying To You.mp3'),
        duration: 319,
        title: 'Flying To You',
        artist: 'GBM Music',
      },
      {
        id: 'flow-10',
        url: getTrackUrl('channels/flow/Alistair Webster - Good Background Music - Volume 3 (Late Night) - 09 The World In Her Head.mp3'),
        duration: 246,
        title: 'The World In Her Head',
        artist: 'GBM Music',
      },
      {
        id: 'flow-11',
        url: getTrackUrl('channels/flow/GBM Music - Good Background Music - Volume 1 - 06 The Question Remains.mp3'),
        duration: 217,
        title: 'The Question Remains',
        artist: 'GBM Music',
      },
      {
        id: 'flow-12',
        url: getTrackUrl('channels/flow/GBM Music - Good Background Music - Volume 1 - 09 Last Train Waiting.mp3'),
        duration: 269,
        title: 'Last Train Waiting',
        artist: 'GBM Music',
      },
      {
        id: 'flow-13',
        url: getTrackUrl('channels/flow/GBM Music - Lo-Fi Life - 01 Daylight.mp3'),
        duration: 204,
        title: 'Daylight',
        artist: 'GBM Music',
      },
      {
        id: 'flow-14',
        url: getTrackUrl('channels/flow/GBM Music - Lo-Fi Life - 02 A Candid Question.mp3'),
        duration: 323,
        title: 'A Candid Question',
        artist: 'GBM Music',
      },
      {
        id: 'flow-15',
        url: getTrackUrl('channels/flow/GBM Music - Lo-Fi Life - 03 Slipping Away.mp3'),
        duration: 187,
        title: 'Slipping Away',
        artist: 'GBM Music',
      },
      {
        id: 'flow-16',
        url: getTrackUrl('channels/flow/GBM Music - Lo-Fi Life - 04 Moving Closer.mp3'),
        duration: 204,
        title: 'Moving Closer',
        artist: 'GBM Music',
      },
    ],
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
    tracks: [
      {
        id: 'energy-01',
        url: getTrackUrl('channels/energy/Alistair Webster - Chilled Vibes - 04 Weight Off Your Shoulders.mp3'),
        duration: 169,
        title: 'Weight Off Your Shoulders',
        artist: 'GBM Music',
      },
      {
        id: 'energy-02',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 01 Simplified Logic.mp3'),
        duration: 214,
        title: 'Simplified Logic',
        artist: 'GBM Music',
      },
      {
        id: 'energy-03',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 02 You Never Wait Again.mp3'),
        duration: 197,
        title: 'You Never Wait Again',
        artist: 'GBM Music',
      },
      {
        id: 'energy-04',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 03 Fading Colours.mp3'),
        duration: 181,
        title: 'Fading Colours',
        artist: 'GBM Music',
      },
      {
        id: 'energy-05',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 04 White Sands.mp3'),
        duration: 244,
        title: 'White Sands',
        artist: 'GBM Music',
      },
      {
        id: 'energy-06',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 05 Secrets.mp3'),
        duration: 180,
        title: 'Secrets',
        artist: 'GBM Music',
      },
      {
        id: 'energy-07',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 06 Might Have Known.mp3'),
        duration: 214,
        title: 'Might Have Known',
        artist: 'GBM Music',
      },
      {
        id: 'energy-08',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 07 Pressured.mp3'),
        duration: 148,
        title: 'Pressured',
        artist: 'GBM Music',
      },
      {
        id: 'energy-09',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 08 Deep Down.mp3'),
        duration: 184,
        title: 'Deep Down',
        artist: 'GBM Music',
      },
      {
        id: 'energy-10',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 09 With Fire.mp3'),
        duration: 297,
        title: 'With Fire',
        artist: 'GBM Music',
      },
      {
        id: 'energy-11',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 10 Zero Sum.mp3'),
        duration: 208,
        title: 'Zero Sum',
        artist: 'GBM Music',
      },
      {
        id: 'energy-12',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 11 Don\'t Look Twice.mp3'),
        duration: 174,
        title: "Don't Look Twice",
        artist: 'GBM Music',
      },
      {
        id: 'energy-13',
        url: getTrackUrl('channels/energy/Alistair Webster - Good Background Music - Volume 2 (Euphoria) - 12 With You.mp3'),
        duration: 300,
        title: 'With You',
        artist: 'GBM Music',
      },
      {
        id: 'energy-14',
        url: getTrackUrl('channels/energy/GBM Music - Good Background Music - Volume 1 - 07 Hold the Line.mp3'),
        duration: 196,
        title: 'Hold the Line',
        artist: 'GBM Music',
      },
      {
        id: 'energy-15',
        url: getTrackUrl('channels/energy/GBM Music - Good Background Music - Volume 1 - 08 Soon to Be.mp3'),
        duration: 156,
        title: 'Soon to Be',
        artist: 'GBM Music',
      },
    ],
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
