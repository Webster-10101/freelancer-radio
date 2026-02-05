import type { ReactNode } from 'react'
import { useAnimation } from '../../hooks/useAnimation'
import { useAppContext } from '../../state/AppContext'
import { channels } from '../../config/channels'

export function AppShell({ children }: { children: ReactNode }) {
  const { activeChannelId, mode } = useAppContext()
  const channel = activeChannelId ? channels.find(c => c.id === activeChannelId) : null
  const isPlaying = mode !== 'idle'
  const canvasRef = useAnimation(channel?.palette, isPlaying, activeChannelId ?? undefined)

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  )
}
