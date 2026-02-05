import type { Channel, Track } from '../types'

export interface RadioPosition {
  trackIndex: number
  seekSeconds: number
  track: Track
  nextTrack: Track
  secondsUntilNextTrack: number
}

export class RadioSimulator {
  private channel: Channel

  constructor(channel: Channel) {
    this.channel = channel
  }

  /**
   * Calculate what track should be playing and at what position,
   * based on the current timestamp. Everyone calling this at the
   * same time gets the same result — simulated live radio.
   */
  getPositionAtTime(timestampMs: number = Date.now()): RadioPosition {
    const { tracks, totalDuration } = this.channel

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
