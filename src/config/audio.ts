const isDev = import.meta.env.DEV

export const AUDIO_BASE_URL = isDev
  ? '/dev-audio'
  : (import.meta.env.VITE_AUDIO_BASE_URL || 'https://audio.freelancerad.io')

export function getTrackUrl(path: string): string {
  return `${AUDIO_BASE_URL}/${path}`
}
