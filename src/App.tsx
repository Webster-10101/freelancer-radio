import { useState, useCallback, useEffect, useRef } from 'react'
import { AppProvider, useAppContext } from './state/AppContext'
import { AppShell } from './components/layout/AppShell'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ModeSelector } from './components/navigation/ModeSelector'
import { ChannelPanel } from './components/channels/ChannelPanel'
import { TriggerPanel } from './components/triggers/TriggerPanel'
import { NowPlaying } from './components/player/NowPlaying'
import { useRadio } from './hooks/useRadio'
import { useAudio } from './hooks/useAudio'
import { useTimer } from './hooks/useTimer'
import { useWakeLock } from './hooks/useWakeLock'
import type { Channel, Trigger } from './types'
import { getTrigger } from './config/triggers'

function AppInner() {
  const [activeTab, setActiveTab] = useState<'channels' | 'triggers'>('channels')
  const { setChannel, setTrigger, stopAll, setCurrentTrack, activeTriggerId } = useAppContext()
  const chimeRef = useRef<HTMLAudioElement | null>(null)
  const radio = useRadio()
  const triggerAudio = useAudio()
  const timer = useTimer()
  const wakeLock = useWakeLock()

  const isPlaying = radio.isPlaying || triggerAudio.isPlaying

  const handlePlayChannel = useCallback(async (channel: Channel) => {
    timer.reset()
    triggerAudio.pause()
    wakeLock.release()

    setChannel(channel.id)
    await radio.tuneIn(channel)
  }, [radio, timer, triggerAudio, setChannel, wakeLock])

  const handlePlayTrigger = useCallback(async (trigger: Trigger) => {
    radio.stop()

    setTrigger(trigger.id)
    setCurrentTrack(trigger.track)
    await triggerAudio.play(trigger.track.url)
    timer.start(trigger.duration * 1000)
    wakeLock.request()
  }, [radio, triggerAudio, timer, setTrigger, setCurrentTrack, wakeLock])

  const handleStopTrigger = useCallback(() => {
    timer.reset()
    triggerAudio.pause()
    wakeLock.release()
    stopAll()
  }, [timer, triggerAudio, stopAll, wakeLock])

  const handlePause = useCallback(() => {
    radio.pause()
    triggerAudio.pause()
    timer.pause()
  }, [radio, triggerAudio, timer])

  const handleResume = useCallback(() => {
    radio.resume()
    triggerAudio.resume()
    timer.resume()
  }, [radio, triggerAudio, timer])

  const handleVolumeChange = useCallback((v: number) => {
    radio.setVolume(v)
    triggerAudio.setVolume(v)
  }, [radio, triggerAudio])

  // Play chime when timer completes (if trigger has chime enabled)
  useEffect(() => {
    if (timer.state === 'complete' && activeTriggerId) {
      const trigger = getTrigger(activeTriggerId)
      if (trigger.hasChime) {
        // Create chime audio element if not exists
        if (!chimeRef.current) {
          chimeRef.current = new Audio('/audio/chime.mp3')
        }
        chimeRef.current.currentTime = 0
        chimeRef.current.play().catch(() => {})
      }
    }
  }, [timer.state, activeTriggerId])

  return (
    <AppShell>
      <Header />
      <ModeSelector activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 pb-24">
        {activeTab === 'channels' ? (
          <ChannelPanel
            onPlay={handlePlayChannel}
            onPause={handlePause}
            onResume={handleResume}
            isPlaying={radio.isPlaying}
            isLoading={radio.isLoading}
            volume={radio.volume}
            onVolumeChange={handleVolumeChange}
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

      <Footer />
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
