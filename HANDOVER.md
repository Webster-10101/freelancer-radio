# freelancerad.io — Handover

## Project Summary
Focus music web app for freelancers. Three channels (Calm/Flow/Energy) with simulated live radio + four triggers (Pomodoro/Power Nap/Breathe/Sprint). Vite + React + TypeScript, Tailwind, Canvas 2D visuals, audio from Cloudflare R2.

**Domain:** freelancerad.io (registered on Stablepoint, 5 Feb 2026)

## Live & Repo
- **Code:** `/Users/Alistair/Coding/freelancer-radio/`
- **PRD:** `/Users/Alistair/World/Projects/Freelance Radio/PRD.md`
- **Project status:** `/Users/Alistair/World/Projects/Freelance Radio.md`
- **Git:** initialised, first commit 5 Feb 2026
- **Not yet deployed** — no GitHub remote or Vercel setup yet

## Current State

**Complete:**
- Full project scaffold (Vite 5 + React + TS + Tailwind 3)
- PWA setup via vite-plugin-pwa (manifest, service worker, meta tags)
- AudioEngine — dual HTMLAudioElement with crossfade, preload, fade-in on play/resume, iOS warm-up, visibility change handling
- RadioSimulator — timestamp-based "live radio" position calculation
- TimerEngine — countdown with tick/complete callbacks, pause/resume
- AnimationEngine — Canvas 2D with ambient gradient blobs + flowing brainwave/river streams per channel
- All React hooks (useAudio, useRadio, useTimer, useAnimation, useWakeLock)
- App state via React Context (includes `selectedChannelId` for channel preference)
- All copy integrated (tagline, about, channel descriptions)
- Clean TypeScript build, zero errors
- **41 real GBM Music tracks wired in** (8 calm, 16 flow, 15 energy, 2 triggers)
- All tracks converted to 128kbps MP3 and normalised to -14 LUFS (EBU R128 broadcast standard)
- Branding updated to freelancerad.io throughout (header, footer, page title, PWA manifest)
- Dev server working with real audio playback

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
- Waves flow L→R, blurry/soft, Energy channel pulses
- Background gradient blobs work, river waves fade in on play
- Channel palette colours shift per channel

**Not started:**
- Cloudflare R2 bucket setup + audio upload
- Git remote (GitHub) + Vercel deployment
- Support mechanism (Ko-fi etc.)
- Pomodoro chime audio file (`public/audio/chime.mp3`)
- Breathe trigger track (TBC)
- Sprint trigger track (TBC)
- Buy link URLs (all `#` placeholder)

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
| Calm | 8 (GBM Vol 1, Vol 3, Let Go) | ~31 min |
| Flow | 16 (Chilled Vibes, GBM Vol 1, Vol 3, Lo-Fi Life) | ~63 min |
| Energy | 15 (Chilled Vibes, GBM Vol 1, Vol 2 Euphoria) | ~51 min |

### Triggers
| Trigger | Track | Status |
|---------|-------|--------|
| Pomodoro | Productive Pomodoro (25 min) | Ready |
| Power Nap | Send Me to Sleep Extended (39 min) | Ready |
| Breathe | TBC | Missing |
| Sprint | TBC | Missing |

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
1. Set up Cloudflare R2 bucket, configure CORS, upload tracks
2. Set `VITE_AUDIO_BASE_URL` env var to R2 bucket URL
3. Add Breathe + Sprint trigger tracks
4. Add chime audio file to `public/audio/chime.mp3`
5. Add real GBM buy link URLs to trigger configs
6. Push to GitHub
7. Deploy to Vercel, connect freelancerad.io domain
8. Set up support mechanism (Ko-fi or similar)
9. Polish pass — responsive, iOS testing, final copy

## Key Source Files
- `src/engine/AudioEngine.ts` — dual-player crossfade, fade-in, preload, iOS handling
- `src/engine/RadioSimulator.ts` — timestamp-based live radio position calc
- `src/engine/AnimationEngine.ts` — Canvas gradient blobs + river waves
- `src/engine/TimerEngine.ts` — countdown for triggers
- `src/config/channels.ts` — channel definitions with real tracks + palettes
- `src/config/triggers.ts` — trigger definitions (2 real, 2 placeholder)
- `src/config/audio.ts` — audio base URL resolver (dev: `/dev-audio`, prod: R2 URL)
- `src/state/AppContext.tsx` — global state
- `src/components/channels/ChannelPanel.tsx` — hero play button + channel selector + volume

## Commands
```bash
cd /Users/Alistair/Coding/freelancer-radio
npm run dev      # Dev server
npm run build    # Production build
npx tsc --noEmit # Type check
```

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

### Music & Licensing
- **Original music** — longer term, commission or source original tracks to reduce licensing dependency and open up monetisation
- **"Get in touch" prompt** — subtle note on the site (e.g. in About or a dedicated section) inviting musicians/producers to reach out. Opens the door to commissions, collaborations, and sponsorship without being salesy.

### Community / Social Layer
- **"What are you working on?"** — optional input where users can write what they're focused on
- Other people's task descriptions float by gently (like a shared ambient workspace vibe)
- Lightweight, anonymous or pseudonymous — no accounts needed initially
- Would need a simple backend (WebSocket or polling) — good Phase 3 candidate once there's meaningful traffic

## Open Questions / Risks
- Node 18: works now but vite-plugin-pwa workbox deps want Node 20. Functional with warnings.
- Breathe trigger track TBC — Al needs to decide/create one
- Sprint trigger track TBC — from GBM running catalog
- Buy link URLs all `#` — need real GBM store links
- Analytics approach TBD — Cloudflare Web Analytics suggested (free, no cookies)
