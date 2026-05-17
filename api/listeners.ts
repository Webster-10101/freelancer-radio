/**
 * Listener presence counter — Edge Function.
 *
 * POST /api/listeners — heartbeat (register/refresh a listener session)
 * GET  /api/listeners — get current count
 *
 * Uses in-memory Maps with TTL. Sessions expire after 60s without heartbeat.
 * Not perfectly accurate (resets on cold start, per-region) but good enough
 * for "X freelancers listening now". Swap in Upstash Redis for persistence.
 *
 * Hardening:
 *  - CORS restricted to known origins
 *  - Sessions Map capped (oldest entries evicted on overflow)
 *  - Per-IP POST rate limit prevents inflation attacks
 *  - Lazy purge (only when count is read or limits checked)
 */

export const config = { runtime: 'edge' }

const SESSION_TTL_MS = 60_000
const MAX_SESSIONS = 10_000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_POSTS = 30 // per IP per minute
const MAX_RATE_LIMIT_ENTRIES = 5_000

const ALLOWED_ORIGINS = new Set<string>([
  'https://freelancerad.io',
  'https://www.freelancerad.io',
  'http://localhost:5173',
  'http://localhost:4173',
])

// sessionId → lastSeen timestamp (insertion order = arrival order, useful for eviction)
const sessions = new Map<string, number>()

// ip → [postTimestamp, ...] within the rate-limit window
const rateLimits = new Map<string, number[]>()

let lastPurge = 0
function purgeIfStale(now: number) {
  // Lazy purge: at most once every 10 seconds, regardless of traffic volume.
  if (now - lastPurge < 10_000) return
  lastPurge = now

  for (const [id, lastSeen] of sessions) {
    if (now - lastSeen > SESSION_TTL_MS) sessions.delete(id)
  }
  for (const [ip, timestamps] of rateLimits) {
    const fresh = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
    if (fresh.length === 0) rateLimits.delete(ip)
    else rateLimits.set(ip, fresh)
  }
}

function isRateLimited(ip: string, now: number): boolean {
  const timestamps = rateLimits.get(ip) ?? []
  const fresh = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  if (fresh.length >= RATE_LIMIT_MAX_POSTS) {
    rateLimits.set(ip, fresh)
    return true
  }
  fresh.push(now)
  // Cap total tracked IPs to avoid an attacker filling this Map either.
  if (rateLimits.size >= MAX_RATE_LIMIT_ENTRIES && !rateLimits.has(ip)) {
    const oldestKey = rateLimits.keys().next().value
    if (oldestKey !== undefined) rateLimits.delete(oldestKey)
  }
  rateLimits.set(ip, fresh)
  return false
}

function recordSession(sessionId: string, now: number) {
  // Re-insert to refresh position in insertion order (used for LRU eviction).
  sessions.delete(sessionId)
  sessions.set(sessionId, now)
  if (sessions.size > MAX_SESSIONS) {
    // Evict the oldest entry — Map preserves insertion order in JS.
    const oldestKey = sessions.keys().next().value
    if (oldestKey !== undefined) sessions.delete(oldestKey)
  }
}

function countActiveSessions(now: number): number {
  let count = 0
  for (const lastSeen of sessions.values()) {
    if (now - lastSeen <= SESSION_TTL_MS) count++
  }
  return count
}

function corsHeaders(origin: string): Record<string, string> {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://freelancerad.io'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }
}

export default async function handler(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const headers = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  const now = Date.now()
  purgeIfStale(now)

  if (req.method === 'POST') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    if (isRateLimited(ip, now)) {
      return new Response(
        JSON.stringify({ count: countActiveSessions(now), rateLimited: true }),
        { status: 429, headers },
      )
    }

    try {
      const body = (await req.json()) as { sessionId?: string }
      const sessionId = body.sessionId
      if (sessionId && typeof sessionId === 'string' && sessionId.length < 64) {
        recordSession(sessionId, now)
      }
    } catch {
      // Ignore malformed body
    }
    return new Response(JSON.stringify({ count: countActiveSessions(now) }), { headers })
  }

  // GET
  return new Response(JSON.stringify({ count: countActiveSessions(now) }), { headers })
}
