import { useEffect, useRef, useState } from 'react'

const HEARTBEAT_INTERVAL_MS = 30_000 // 30 seconds
const API_URL = '/api/listeners'

function getSessionId(): string {
  const key = 'fr-session-id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

/**
 * Tracks listener presence. Sends heartbeat while playing,
 * polls count periodically.
 */
export function useListenerCount(isPlaying: boolean) {
  const [count, setCount] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionId = useRef(getSessionId())

  useEffect(() => {
    const heartbeat = async () => {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId.current }),
        })
        const data = await res.json()
        if (typeof data.count === 'number') {
          setCount(data.count)
        }
      } catch {
        // Silently fail — counter is cosmetic
      }
    }

    const poll = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()
        if (typeof data.count === 'number') {
          setCount(data.count)
        }
      } catch {
        // Silently fail
      }
    }

    if (isPlaying) {
      // Send initial heartbeat immediately
      heartbeat()
      intervalRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS)
    } else {
      // Not playing — just poll the count occasionally
      poll()
      intervalRef.current = setInterval(poll, HEARTBEAT_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  return count
}
