/**
 * Listener presence counter — Edge Function.
 *
 * POST /api/listeners — heartbeat (register/refresh a listener session)
 * GET  /api/listeners — get current count
 *
 * Uses in-memory Map with TTL. Sessions expire after 60s without heartbeat.
 * Not perfectly accurate (resets on cold start, per-region) but good enough
 * for "X freelancers listening now". Swap in Upstash Redis for persistence.
 */

export const config = { runtime: 'edge' }

const sessions = new Map<string, number>() // sessionId → lastSeen timestamp

const SESSION_TTL_MS = 60_000 // 60 seconds

function purgeExpired() {
  const now = Date.now()
  for (const [id, lastSeen] of sessions) {
    if (now - lastSeen > SESSION_TTL_MS) {
      sessions.delete(id)
    }
  }
}

export default async function handler(req: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  purgeExpired()

  if (req.method === 'POST') {
    try {
      const body = await req.json() as { sessionId?: string }
      const sessionId = body.sessionId
      if (sessionId && typeof sessionId === 'string' && sessionId.length < 64) {
        sessions.set(sessionId, Date.now())
      }
    } catch {
      // Ignore malformed body
    }
    return new Response(JSON.stringify({ count: sessions.size }), { headers })
  }

  // GET
  return new Response(JSON.stringify({ count: sessions.size }), { headers })
}
