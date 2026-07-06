import { useState, useCallback, useEffect, useRef } from 'react'
import { AppProvider, useAppContext } from './state/AppContext'
import { AppShell } from './components/layout/AppShell'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Toast, TOAST_MS } from './components/layout/Toast'
import { ModeSelector } from './components/navigation/ModeSelector'
import { ChannelPanel } from './components/channels/ChannelPanel'
import { TriggerPanel } from './components/triggers/TriggerPanel'
import { NowPlaying } from './components/player/NowPlaying'
import { useRadio } from './hooks/useRadio'
import { useAudio } from './hooks/useAudio'
import { useTimer } from './hooks/useTimer'
import { useSleepTimer, type SleepMinutes } from './hooks/useSleepTimer'
import { useWakeLock } from './hooks/useWakeLock'
import { useChannelPreload } from './hooks/useChannelPreload'
import { useMediaSession } from './hooks/useMediaSession'
import { useListenerCount } from './hooks/useListenerCount'
import type { Channel, Trigger } from './types'
import { getTrigger } from './config/triggers'
import { track } from '@vercel/analytics'

function AppInner() {
  const [activeTab, setActiveTab] = useState<'channels' | 'triggers'>('channels')
  const { mode, setChannel, setTrigger, stopAll, setCurrentTrack, activeTriggerId, activeChannelId, currentTrack, selectedChannelId } = useAppContext()
  const chimeRef = useRef<HTMLAudioElement | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const radio = useRadio()
  const triggerAudio = useAudio()
  const timer = useTimer()
  const wakeLock = useWakeLock()

  // Sleep timer (channels only): fades out over the last 20s, then stops.
  const sleepTimer = useSleepTimer({
    setFade: radio.setFade,
    onComplete: () => {
      track('sleep_timer_complete')
      radio.stop()
      stopAll()
    },
  })

  // Preload current track for the selected channel so playback starts faster.
  // Re-runs when the user switches channel before pressing play.
  useChannelPreload(selectedChannelId)

  const isPlaying = radio.isPlaying || triggerAudio.isPlaying

  // Sync radio's current track into app context (for MediaSession + NowPlaying).
  // Event-driven: radio.currentTrack updates on tune-in, track end, and resync.
  // Guarded so radio stopping (null) doesn't clobber a trigger's track.
  useEffect(() => {
    if (radio.currentTrack) setCurrentTrack(radio.currentTrack)
  }, [radio.currentTrack, setCurrentTrack])

  const handlePlayChannel = useCallback(async (channel: Channel) => {
    timer.reset()
    triggerAudio.pause()
    wakeLock.release()

    track('channel_play', { channel: channel.id })
    setChannel(channel.id)
    await radio.tuneIn(channel)
  }, [radio, timer, triggerAudio, setChannel, wakeLock])

  const showToast = useCallback((message: string) => {
    setToast(message)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  const handlePlayTrigger = useCallback(async (trigger: Trigger) => {
    // The mode-change effect below drops the sleep timer; tell the user why
    if (sleepTimer.isActive) showToast('Sleep timer cancelled')
    radio.stop()

    track('trigger_start', { trigger: trigger.id, duration_min: Math.round(trigger.duration / 60) })
    setTrigger(trigger.id)
    setCurrentTrack(trigger.track)
    await triggerAudio.play(trigger.track.url)
    timer.start(trigger.duration * 1000)
    wakeLock.request()
  }, [radio, triggerAudio, timer, setTrigger, setCurrentTrack, wakeLock, sleepTimer.isActive, showToast])

  const handleStopTrigger = useCallback(() => {
    if (activeTriggerId) {
      const trigger = getTrigger(activeTriggerId)
      const elapsedPct = Math.round((1 - timer.remainingMs / (trigger.duration * 1000)) * 100)
      track('trigger_cancel', { trigger: activeTriggerId, elapsed_pct: elapsedPct })
    }
    timer.reset()
    triggerAudio.pause()
    wakeLock.release()
    stopAll()
  }, [timer, triggerAudio, stopAll, wakeLock, activeTriggerId])

  // Pause/resume must be mode-aware: both audio engines keep their last
  // loaded track after stopping, so resuming the inactive one would play
  // stale audio over the active mode.
  const handlePause = useCallback(() => {
    if (mode === 'channel') {
      radio.pause()
    } else if (mode === 'trigger') {
      triggerAudio.pause()
      timer.pause()
    }
  }, [mode, radio, triggerAudio, timer])

  const handleResume = useCallback(() => {
    if (mode === 'channel') {
      radio.resume()
    } else if (mode === 'trigger') {
      triggerAudio.resume()
      timer.resume()
    }
  }, [mode, radio, triggerAudio, timer])

  const handleVolumeChange = useCallback((v: number) => {
    radio.setVolume(v)
    triggerAudio.setVolume(v)
  }, [radio, triggerAudio])

  const handleSleepSelect = useCallback((minutes: SleepMinutes | null) => {
    if (minutes === null) {
      track('sleep_timer_cancel')
      sleepTimer.cancel()
    } else {
      track('sleep_timer_set', { minutes })
      sleepTimer.start(minutes)
    }
  }, [sleepTimer])

  // Leaving channel mode (trigger started / stop all) drops the sleep timer
  const sleepCancel = sleepTimer.cancel
  useEffect(() => {
    if (mode !== 'channel') sleepCancel()
  }, [mode, sleepCancel])

  // Listener presence counter
  const listenerCount = useListenerCount(isPlaying)

  // MediaSession API — lock screen controls + tells browser this is an active audio app
  const channelName = activeChannelId
    ? activeChannelId.charAt(0).toUpperCase() + activeChannelId.slice(1)
    : null
  useMediaSession({
    track: currentTrack,
    channelName,
    isPlaying,
    onPause: handlePause,
    onResume: handleResume,
  })

  // Play chime when timer completes (if trigger has chime enabled).
  // getTrigger is module-scope and pure, so it's intentionally absent from deps.
  useEffect(() => {
    if (timer.state !== 'complete' || !activeTriggerId) return
    track('trigger_complete', { trigger: activeTriggerId })
    const trigger = getTrigger(activeTriggerId)
    if (!trigger.hasChime) return
    if (!chimeRef.current) {
      chimeRef.current = new Audio('/audio/chime.mp3')
    }
    chimeRef.current.currentTime = 0
    chimeRef.current.play().catch(() => {})
  }, [timer.state, activeTriggerId])

  return (
    <AppShell>
      <Header />
      <ModeSelector activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Bottom clearance only needed when the fixed NowPlaying bar shows (triggers tab) */}
      <main className={`flex-1 ${activeTab === 'channels' ? 'pb-6' : 'pb-24'}`}>
        {activeTab === 'channels' ? (
          <ChannelPanel
            onPlay={handlePlayChannel}
            onPause={handlePause}
            onResume={handleResume}
            isPlaying={radio.isPlaying}
            isLoading={radio.isLoading}
            volume={radio.volume}
            onVolumeChange={handleVolumeChange}
            listenerCount={listenerCount}
            sleepMinutes={sleepTimer.minutes}
            sleepRemainingMs={sleepTimer.remainingMs}
            onSleepSelect={handleSleepSelect}
          />
        ) : (
          <TriggerPanel
            onPlay={handlePlayTrigger}
            onStop={handleStopTrigger}
            timerProgress={timer.progress}
            timerRemainingMs={timer.remainingMs}
            timerState={timer.state}
          />
        )}
      </main>

      <NowPlaying
        isPlaying={isPlaying}
        volume={radio.volume}
        activeTab={activeTab}
        onVolumeChange={handleVolumeChange}
        onPause={handlePause}
        onResume={handleResume}
      />

      <Toast message={toast} />

      <Footer clearNowPlaying={activeTab === 'triggers'} />
    </AppShell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
