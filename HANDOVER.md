# freelancerad.io — Handover

## Project Summary
Focus music web app for freelancers. Three channels (Calm/Flow/Energy) with simulated live radio + four triggers (Pomodoro/Power Nap/Breathe/Sprint). Vite + React + TypeScript, Tailwind, Canvas 2D visuals, audio from Cloudflare R2.

**Domain:** freelancerad.io (registered on Stablepoint, 5 Feb 2026)

## Live & Repo
- **Live:** https://freelancerad.io
- **Code:** `/Users/Alistair/Coding/freelancer-radio/`
- **GitHub:** https://github.com/Webster-10101/freelancer-radio
- **Vercel:** connected to GitHub, auto-deploys on push
- **R2 bucket:** `freelancer-radio-audio` (public URL: `https://pub-86c17558943c4f43984f4fdd502b7d45.r2.dev`)
- **PRD:** `/Users/Alistair/World/Projects/Freelance Radio/PRD.md`
- **Project status:** `/Users/Alistair/World/Projects/Freelance Radio.md`

## Current State

**Complete:**
- Full project scaffold (Vite 5 + React + TS + Tailwind 3)
- PWA setup via vite-plugin-pwa (manifest, service worker, meta tags)
- AudioEngine — dual HTMLAudioElement with crossfade, preload, fade-in on play/resume, iOS warm-up, visibility change handling, `isLoading` state for UI feedback, `onTrackEnd` callback for background tab support
- RadioSimulator — timestamp-based "live radio" position calculation
- TimerEngine — countdown with tick/complete callbacks, pause/resume
- AnimationEngine — Canvas 2D with ambient gradient blobs, `prefers-reduced-motion` support
- All React hooks (useAudio, useRadio, useTimer, useAnimation, useWakeLock, useChannelPreload)
- App state via React Context (includes `selectedChannelId` for channel preference)
- All copy integrated (tagline, about, channel descriptions)
- Clean TypeScript build, zero errors
- **41 real GBM Music tracks + 2 radio idents wired in** (8 calm, 16 flow, 15 energy, 2 triggers, 2 idents per channel)
- All tracks converted to 128kbps MP3 and normalised to -14 LUFS (EBU R128 broadcast standard)
- Branding updated to freelancerad.io throughout (header, footer, page title, PWA manifest)
- Dev server working with real audio playback
- **Favicon** — custom SVG + PWA icons (192px, 512px)
- **Radio idents** — 2 spoken idents shuffled into each channel's playlist
- **Chime** — plays on timer completion for triggers with `hasChime: true`
- **Support link** — Buy Me a Coffee (https://buymeacoffee.com/freelanceradio)
- **Attribution** — "Music by GBM Music" with link to goodbackgroundmusic.co.uk
- **Buy links** — Bandcamp links for Pomodoro and Power Nap triggers
- **Coming soon triggers** — Breathe and Sprint show faded with "Coming soon" badge

**UI — hero play button design:**
- Single hero play/pause button + segmented channel selector (Calm/Flow/Energy pills)
- Hero button: large circular control (160px), channel-coloured breathing glow when playing, outer decorative ring, tactile hover/press scale transitions
- Channel selector: coloured dot indicators per channel (cyan/purple/amber), tinted active backgrounds
- Volume slider fades in smoothly when playing
- Switching channel while playing immediately starts the new channel
- NowPlaying bar hidden on channels tab (hero button handles controls), still shows for triggers

**Audio:**
- 800ms smoothstep fade-in on initial play, 400ms fade-in on resume
- 2s crossfade between tracks
- All tracks volume-normalised for consistent radio feel

**Animation visuals:**
- Background gradient blobs with smooth colour transitions per channel
- Channel palette colours shift per channel
- `prefers-reduced-motion` support — shows static gradient for users with reduced motion enabled
- Wave animations removed for Safari compatibility and performance

**UX:**
- Loading spinner on play button while audio buffers from R2
- Flow channel preloads on app mount for faster initial playback
- Background tab support — tracks advance via `onTrackEnd` event + visibility resync

**Not started:**
- Breathe trigger track (TBC) — shows as "Coming soon"
- Sprint trigger track (TBC) — shows as "Coming soon"

## Key Decisions & Assumptions
- **Domain:** freelancerad.io (not freelancerradio.com — unavailable)
- Vite 5 (not 7) — Node 18 on system, Vite 7 requires Node 20+
- Cloudflare R2 for production audio (free egress)
- Simulated live radio — timestamp mod, not actual streaming. Client-side only.
- Canvas 2D not WebGL — simpler, sufficient for gradient/wave effects
- Phase 2 confirmed: Capacitor wrap for iOS App Store (PWA groundwork in v1)
- Track audio: 128kbps MP3, -14 LUFS normalisation (EBU R128)
- Single hero play button with channel selector underneath

## Track Inventory

### Channels
| Channel | Tracks | Runtime |
|---------|--------|---------|
| Calm | 8 + 2 idents (GBM Vol 1, Vol 3, Let Go) | ~31 min |
| Flow | 16 + 2 idents (Chilled Vibes, GBM Vol 1, Vol 3, Lo-Fi Life) | ~63 min |
| Energy | 15 + 2 idents (Chilled Vibes, GBM Vol 1, Vol 2 Euphoria) | ~51 min |

### Idents
- `ident-1.mp3` (~2s) and `ident-2.mp3` (~4s) in R2 `idents/` folder
- Shuffled into each channel's daily playlist
- Source files in `public/audio/`

### Triggers
| Trigger | Track | Status | Buy Link |
|---------|-------|--------|----------|
| Pomodoro | Productive Pomodoro (25 min) | Ready | Bandcamp |
| Power Nap | Send Me to Sleep Extended (39 min) | Ready | Bandcamp |
| Breathe | TBC | Coming soon | — |
| Sprint | TBC | Coming soon | — |

Track source files: `/Users/Alistair/Laptop SD Transfer/GBM Music Work/_---Releases - GBM Music`

## Component Architecture

```
App
└── AppProvider (context: mode, activeChannelId, selectedChannelId, etc.)
    └── AppInner
        ├── AppShell (canvas background + animation)
        ├── Header ("freelancerad.io" + tagline)
        ├── ModeSelector (Channels / Triggers tab toggle)
        ├── main
        │   ├── ChannelPanel (hero play button + ChannelSelect + VolumeSlider)
        │   └── TriggerPanel → TriggerCard[] (with ProgressRing)
        ├── NowPlaying (footer bar — hidden for channels when on channels tab)
        └── Footer (about + attribution + support)
```

## Next Steps (Ordered)
1. **Fix background tab track advancement** — `onTrackEnd` callback added but still not advancing reliably when tab is backgrounded. May need Web Audio API or service worker approach.
2. Add Breathe + Sprint trigger tracks (or keep as "Coming soon")
3. Polish pass — responsive, iOS testing, final copy

## Key Source Files
- `src/engine/AudioEngine.ts` — dual-player crossfade, fade-in, preload, iOS handling, onTrackEnd callback
- `src/engine/RadioSimulator.ts` — timestamp-based live radio position calc
- `src/engine/AnimationEngine.ts` — Canvas gradient blobs (waves removed)
- `src/engine/TimerEngine.ts` — countdown for triggers
- `src/config/channels.ts` — channel definitions with real tracks + idents + palettes
- `src/config/triggers.ts` — trigger definitions (2 ready, 2 coming soon, with Bandcamp buy links)
- `src/config/audio.ts` — audio base URL resolver (dev: `/dev-audio`, prod: R2 URL)
- `src/state/AppContext.tsx` — global state
- `src/hooks/useChannelPreload.ts` — preloads Flow channel on mount for faster playback
- `src/components/channels/ChannelPanel.tsx` — hero play button + channel selector + volume
- `src/components/triggers/TriggerCard.tsx` — trigger cards with "Coming soon" state

## Commands
```bash
cd /Users/Alistair/Coding/freelancer-radio
npm run dev      # Dev server
npm run build    # Production build
npx tsc --noEmit # Type check
```

## Adding New Tracks
1. **Prepare audio:** Convert to 128kbps MP3, normalise to -14 LUFS
2. **Upload to R2:** Drop into the right folder (`channels/calm/`, `channels/flow/`, `channels/energy/`, or `triggers/`)
3. **Update config:** Add track entry to `src/config/channels.ts` or `src/config/triggers.ts` with filename, duration (seconds), title
4. **Commit & push:** Vercel auto-deploys on push to main

The app doesn't auto-discover files — it plays what's listed in the config.

## Future Roadmap

### Analytics
Track usage to understand how people actually use the app:
- **Channel usage** — which channels are played, how long per session
- **Trigger usage** — which triggers are used, completion rate (did they finish the timer or bail?)
- **Session duration** — how long people stay on the site
- Cloudflare Web Analytics is the baseline option (free, no cookies, privacy-friendly). If deeper event tracking is needed (channel switches, trigger starts/completes), consider something like Plausible or a lightweight custom event layer.

### Deployment & Limits
- **Vercel** — fine for hosting a static/client-side app like this. Free tier generous for early stage.
- **Usage limits** — add rate limiting or sensible caps so the R2 egress can't be abused (e.g. if someone scripts repeated audio fetches). Cloudflare R2 free egress helps, but worth monitoring.
- **Caching** — ensure audio files have long cache headers so repeat visits don't re-fetch.

### Feedback / Suggestions
- Small icon (bottom-right corner) that opens a lightweight feedback form
- On submit, sends an email (e.g. via a simple serverless function or a service like Formspree/Resend)
- Keep it minimal: text field + optional email for reply. No login required.

### Radio Idents ✓ DONE
- 2 idents generated with ElevenLabs (Al's voice), normalised to -14 LUFS
- Added to all 3 channels, shuffled daily with music tracks
- Files: `idents/ident-1.mp3` (~2s), `idents/ident-2.mp3` (~4s) on R2

### Track Ordering & Shuffle
- **Implemented:** Daily shuffle — tracks are shuffled using a seeded PRNG based on the date + channel ID. Everyone on the same day hears the same order (live radio feel), but it changes at midnight for variety.
- **Future options:**
  - More frequent shuffle (e.g., 4-hourly) — one-line change to the seed in `RadioSimulator.ts`
  - Smarter rotation — ensure variety, avoid repeats, weight by energy/mood
  - Auto-ident insertion — play an ident every N tracks automatically

### Music & Licensing
- **Original music** — longer term, commission or source original tracks to reduce licensing dependency and open up monetisation
- **"Get in touch" prompt** — subtle note on the site (e.g. in About or a dedicated section) inviting musicians/producers to reach out. Opens the door to commissions, collaborations, and sponsorship without being salesy.

### Community / Social Layer
- **"What are you working on?"** — optional input where users can write what they're focused on
- Other people's task descriptions float by gently (like a shared ambient workspace vibe)
- Lightweight, anonymous or pseudonymous — no accounts needed initially
- Would need a simple backend (WebSocket or polling) — good Phase 3 candidate once there's meaningful traffic

## Open Questions / Risks
- **Background tab audio** — tracks don't advance reliably when tab is backgrounded. Attempted fixes: visibility resync, onTrackEnd callback, 15s drift correction. May need Web Audio API or service worker for reliable background playback.
- Node 18: works now but vite-plugin-pwa workbox deps want Node 20. Functional with warnings.
- Breathe trigger track TBC — Al needs to decide/create one
- Sprint trigger track TBC — from GBM running catalog
- Analytics approach TBD — Cloudflare Web Analytics suggested (free, no cookies)
