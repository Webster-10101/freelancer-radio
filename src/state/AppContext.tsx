import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Channel, Trigger, PlayMode, Track } from '../types'

interface AppContextValue {
  mode: PlayMode
  activeChannelId: Channel['id'] | null
  activeTriggerId: Trigger['id'] | null
  currentTrack: Track | null
  selectedChannelId: Channel['id']
  setSelectedChannel: (id: Channel['id']) => void
  setChannel: (id: Channel['id'] | null) => void
  setTrigger: (id: Trigger['id'] | null) => void
  setCurrentTrack: (track: Track | null) => void
  stopAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PlayMode>('idle')
  const [activeChannelId, setActiveChannelId] = useState<Channel['id'] | null>(null)
  const [activeTriggerId, setActiveTriggerId] = useState<Trigger['id'] | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [selectedChannelId, setSelectedChannel] = useState<Channel['id']>('flow')

  const setChannel = useCallback((id: Channel['id'] | null) => {
    if (id) {
      setMode('channel')
      setActiveChannelId(id)
      setActiveTriggerId(null)
    } else {
      setMode('idle')
      setActiveChannelId(null)
    }
  }, [])

  const setTrigger = useCallback((id: Trigger['id'] | null) => {
    if (id) {
      setMode('trigger')
      setActiveTriggerId(id)
      setActiveChannelId(null)
    } else {
      setMode('idle')
      setActiveTriggerId(null)
    }
  }, [])

  const stopAll = useCallback(() => {
    setMode('idle')
    setActiveChannelId(null)
    setActiveTriggerId(null)
    setCurrentTrack(null)
  }, [])

  return (
    <AppContext.Provider
      value={{
        mode,
        activeChannelId,
        activeTriggerId,
        currentTrack,
        selectedChannelId,
        setSelectedChannel,
        setChannel,
        setTrigger,
        setCurrentTrack,
        stopAll,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
