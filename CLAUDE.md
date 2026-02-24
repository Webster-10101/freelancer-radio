# Freelancer Radio

Focus music web app for freelancers — simulated live radio with three channels and timed triggers.

## Tech Stack
- Vite 5 + React + TypeScript
- Tailwind CSS
- Canvas 2D for visuals
- Cloudflare R2 for audio hosting
- Vercel for deployment
- PWA-enabled (vite-plugin-pwa)

## Key Files
| File | Purpose |
|------|---------|
| `src/engine/AudioEngine.ts` | Dual-player crossfade, fade-in, preload |
| `src/engine/RadioSimulator.ts` | Timestamp-based "live radio" position |
| `src/engine/AnimationEngine.ts` | Canvas gradient blobs |
| `src/engine/TimerEngine.ts` | Countdown for triggers |
| `src/config/channels.ts` | Channel definitions + tracks + palettes |
| `src/config/triggers.ts` | Trigger definitions |
| `src/config/audio.ts` | Audio base URL resolver |
| `src/state/AppContext.tsx` | Global state |

## Commands
```bash
npm run dev      # Dev server
npm run build    # Production build
npx tsc --noEmit # Type check
```

## URLs
- Live: https://freelancerad.io
- GitHub: https://github.com/Webster-10101/freelancer-radio
- R2 bucket: `freelancer-radio-audio`
- R2 public URL: `https://pub-86c17558943c4f43984f4fdd502b7d45.r2.dev`

## Adding New Tracks
1. Convert to 128kbps MP3, normalise to -14 LUFS
2. Upload to R2 (`channels/calm/`, `channels/flow/`, `channels/energy/`, or `triggers/`)
3. Add entry to `src/config/channels.ts` or `src/config/triggers.ts`
4. Commit & push (auto-deploys)

## Key Decisions
- Simulated live radio (timestamp mod, not actual streaming)
- Daily shuffle using seeded PRNG (same order for everyone on same day)
- Track audio: 128kbps MP3, -14 LUFS normalisation
- Canvas 2D not WebGL (simpler, sufficient)
- Node 18 compatible (Vite 7 needs Node 20+)

## Related Docs
- PRD: `/Users/Alistair/World/Projects/Freelance Radio/PRD.md`
- Project status: `/Users/Alistair/World/Projects/Freelance Radio.md`

## Handover
Current state and next steps: [[Handovers/Freelancer Radio]]
