# Freelancer Radio — Handover

## Project Summary
Focus music web app for freelancers. Three channels (Calm/Flow/Energy) with simulated live radio + four triggers (Pomodoro/Power Nap/Breathe/Sprint). Vite + React + TypeScript, Tailwind, Canvas 2D visuals, audio from Cloudflare R2.

## Live & Repo
- **Code:** `/Users/Alistair/Coding/freelancer-radio/`
- **PRD:** `/Users/Alistair/World/Projects/Freelance Radio/PRD.md`
- **Project status:** `/Users/Alistair/World/Projects/Freelance Radio.md`
- **Not yet deployed** — no git repo or Vercel setup yet

## Current State

**Complete:**
- Full project scaffold (Vite 5 + React + TS + Tailwind 3)
- PWA setup via vite-plugin-pwa (manifest, service worker, meta tags)
- AudioEngine — dual HTMLAudioElement with crossfade, preload, iOS warm-up, visibility change handling
- RadioSimulator — timestamp-based "live radio" position calculation
- TimerEngine — countdown with tick/complete callbacks, pause/resume
- AnimationEngine — Canvas 2D with ambient gradient blobs + flowing brainwave/river streams per channel
- All React hooks (useAudio, useRadio, useTimer, useAnimation, useWakeLock)
- App state via React Context (includes `selectedChannelId` for channel preference)
- All copy integrated (tagline, about, channel descriptions)
- Clean TypeScript build, zero errors
- Dev server runs at localhost:5173/5174

**UI — hero play button redesign (4 Feb):**
- Replaced three separate channel cards with single hero play/pause button + segmented channel selector (Calm/Flow/Energy pills)
- Hero button: large circular control (160px), channel-coloured breathing glow when playing, outer decorative ring, tactile hover/press scale transitions
- Channel selector: coloured dot indicators per channel (cyan/purple/amber), tinted active backgrounds
- Volume slider fades in smoothly when playing (opacity + translate transition)
- Switching channel while playing immediately starts the new channel
- NowPlaying bar hidden on channels tab (hero button handles controls), still shows for triggers and when on triggers tab with a channel playing
- `selectedChannelId` in AppContext defaults to 'flow' — tracks user's channel preference independently of what's actively playing

**UI — design polish pass (4 Feb):**
- Channel-reactive colour system: hero button glow, channel pill dots, and decorative ring all shift to match selected channel palette
- Trigger cards: refined borders/backgrounds, subtle violet glow when active, duration in pill badge, buy link as bordered pill button, hover/press scale on play buttons
- Header: extra-light weight, wider letter-spacing for more presence
- ModeSelector/NowPlaying/Footer: cohesive opacity/border system, smoother transitions, softer overall feel
- All text elements use consistent tracking and opacity scale

**Animation visuals:**
- Waves flow L→R, blurry/soft, Energy channel pulses
- Background gradient blobs work, river waves fade in on play
- Channel palette colours shift background blobs; river waves use brighter accent colours

**Not started:**
- Cloudflare R2 bucket setup + audio upload
- Track curation (which GBM tracks in which channel)
- Real track metadata in config files (URLs, durations, titles, buy links)
- Git repo + GitHub
- Vercel deployment
- Custom domain (freelancerradio.com)
- Support mechanism (Ko-fi etc)
- Pomodoro chime audio file (`public/audio/chime.mp3`)
- Placeholder dev audio files for local testing

## Key Decisions & Assumptions
- Vite 5 (not 7) — Node 18 on system, Vite 7 requires Node 20+
- Cloudflare R2 for audio (free egress, Al's tracks are large/long)
- Simulated live radio — timestamp mod, not actual streaming. Client-side only.
- Canvas 2D not WebGL — simpler, sufficient for gradient/wave effects
- Triggers renamed: Pomodoro, Power Nap, Breathe, Sprint
- Each trigger has "Get this track" buy link to GBM Music
- Phase 2 confirmed: Capacitor wrap for iOS App Store (PWA groundwork in v1)
- River/brainwave waves only appear when playing, fade in/out
- Single hero play button with channel selector underneath (aligned with PRD core loop: land → hit play → focus)
- `selectedChannelId` defaults to 'flow' — user can change before or during playback
- ChannelCard component removed — replaced by hero button pattern

## Component Architecture

```
App
└── AppProvider (context: mode, activeChannelId, selectedChannelId, etc.)
    └── AppInner
        ├── AppShell (canvas background + animation)
        ├── Header ("Freelancer Radio" + tagline)
        ├── ModeSelector (Channels / Triggers tab toggle)
        ├── main
        │   ├── ChannelPanel (hero play button + ChannelSelect + VolumeSlider)
        │   └── TriggerPanel → TriggerCard[] (with ProgressRing)
        ├── NowPlaying (footer bar — hidden for channels when on channels tab)
        └── Footer (about + attribution + support)
```

## Next Steps (Ordered)
1. Set up Cloudflare account + R2 bucket, configure CORS for localhost + production domain
2. Al curates tracks — which GBM tracks go in each channel, which for each trigger
3. Upload tracks to R2, note URLs and durations
4. Update `src/config/channels.ts` and `src/config/triggers.ts` with real data
5. Set `VITE_AUDIO_BASE_URL` env var to R2 bucket URL
6. Add chime audio file to `public/audio/chime.mp3`
7. Test full audio flow (channels, triggers, crossfade, Pomodoro timer + chime)
8. Init git repo, push to GitHub
9. Deploy to Vercel, connect custom domain
10. Polish pass — responsive, iOS testing, final copy

## Relevant Context & Files

### Key source files
- `src/engine/AudioEngine.ts` — dual-player crossfade, preload, iOS handling
- `src/engine/RadioSimulator.ts` — timestamp-based live radio position calc
- `src/engine/AnimationEngine.ts` — Canvas gradient blobs + river waves
- `src/engine/TimerEngine.ts` — countdown for triggers
- `src/config/channels.ts` — channel definitions (placeholder tracks, palettes)
- `src/config/triggers.ts` — trigger definitions (placeholder tracks)
- `src/config/audio.ts` — R2 base URL resolver (switches dev/prod via env var)
- `src/state/AppContext.tsx` — global state (mode, activeChannelId, selectedChannelId, etc.)
- `src/App.tsx` — main wiring of all hooks and components
- `src/components/layout/AppShell.tsx` — canvas + animation integration
- `src/components/channels/ChannelPanel.tsx` — hero play button + channel selector + volume
- `src/components/channels/ChannelSelect.tsx` — segmented channel pills with colour indicators

### Commands
```bash
cd /Users/Alistair/Coding/freelancer-radio
npm run dev      # Dev server
npm run build    # Production build
npx tsc --noEmit # Type check
```

### Animation colour config
- Background blob palettes: defined per channel in `src/config/channels.ts`
- River wave accent colours: hardcoded in `AnimationEngine.ts` (`RIVER_COLORS` constant)
- Default (idle) palette: also in `AnimationEngine.ts` (`DEFAULT_PALETTE`)
- Channel glow colours for hero button: defined in `ChannelPanel.tsx` (`CHANNEL_GLOW` constant)
- Channel dot/pill colours: defined in `ChannelSelect.tsx` (`CHANNEL_COLORS` constant)

## Open Questions / Risks
- Node 18: works now but vite-plugin-pwa's workbox deps want Node 20. Functional but shows warnings.
- No placeholder audio files exist yet — player will error on play without them
- Track durations in config are all placeholder 300s — must match real files
- Breathe trigger track TBC — Al needs to decide/create one
- Sprint trigger track TBC — from GBM running catalog
- Buy link URLs all `#` — need real GBM store links

## If I Had 60 Minutes
1. Generate placeholder audio with ffmpeg (`ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 300 -q:a 9 public/dev-audio/placeholder.mp3`) and symlink into channel/trigger paths so audio actually plays during dev
2. Test full channel flow — play, crossfade between tracks, drift correction
3. Test trigger flow — Pomodoro timer + progress ring + chime
4. Init git repo and make first commit
5. Any remaining visual tweaks Al wants on the animation
