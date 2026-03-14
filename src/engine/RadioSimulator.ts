import type { Channel, Track } from '../types'

export interface RadioPosition {
  trackIndex: number
  seekSeconds: number
  track: Track
  nextTrack: Track
  secondsUntilNextTrack: number
}

/**
 * Simple seeded PRNG (mulberry32)
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Convert a string to a numeric seed
 */
function stringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  const random = seededRandom(seed)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Get today's date string (changes at midnight)
 */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Build a playlist: shuffle music tracks, then insert idents at regular intervals.
 * One ident every IDENT_INTERVAL music tracks (cycling through available idents).
 */
const IDENT_INTERVAL = 5

function buildPlaylist(channel: Channel, seed: number): Track[] {
  const music = channel.tracks.filter(t => !t.id.includes('ident'))
  const idents = channel.tracks.filter(t => t.id.includes('ident'))

  const shuffled = seededShuffle(music, seed)

  if (idents.length === 0) return shuffled

  // Insert an ident after every IDENT_INTERVAL music tracks
  const playlist: Track[] = []
  let identIdx = 0
  for (let i = 0; i < shuffled.length; i++) {
    playlist.push(shuffled[i])
    if ((i + 1) % IDENT_INTERVAL === 0) {
      playlist.push(idents[identIdx % idents.length])
      identIdx++
    }
  }

  return playlist
}

export class RadioSimulator {
  private channel: Channel
  private playlist: Track[]
  private playlistTotalDuration: number

  constructor(channel: Channel) {
    this.channel = channel
    const seed = stringToSeed(getTodayString() + channel.id)
    this.playlist = buildPlaylist(channel, seed)
    this.playlistTotalDuration = this.playlist.reduce((sum, t) => sum + t.duration, 0)
  }

  /**
   * Calculate what track should be playing and at what position,
   * based on the current timestamp. Everyone calling this at the
   * same time gets the same result — simulated live radio.
   * Track order is shuffled daily (same for all listeners on the same day).
   */
  getPositionAtTime(timestampMs: number = Date.now()): RadioPosition {
    const tracks = this.playlist
    const totalDuration = this.playlistTotalDuration

    if (tracks.length === 0) {
      throw new Error(`Channel ${this.channel.id} has no tracks`)
    }

    const positionInLoop = (timestampMs / 1000) % totalDuration

    let accumulated = 0
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      if (accumulated + track.duration > positionInLoop) {
        const seekSeconds = positionInLoop - accumulated
        const secondsUntilNextTrack = track.duration - seekSeconds
        const nextTrack = tracks[(i + 1) % tracks.length]

        return {
          trackIndex: i,
          seekSeconds,
          track,
          nextTrack,
          secondsUntilNextTrack,
        }
      }
      accumulated += track.duration
    }

    // Fallback — should never reach due to modulo
    return {
      trackIndex: 0,
      seekSeconds: 0,
      track: tracks[0],
      nextTrack: tracks[1 % tracks.length],
      secondsUntilNextTrack: tracks[0].duration,
    }
  }

  getChannel(): Channel {
    return this.channel
  }
}
