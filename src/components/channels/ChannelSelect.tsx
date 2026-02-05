import { channels } from '../../config/channels'
import type { Channel } from '../../types'

const CHANNEL_COLORS: Record<string, { dot: string; bg: string }> = {
  calm: { dot: 'bg-cyan-400/70', bg: 'rgba(44, 83, 100, 0.15)' },
  flow: { dot: 'bg-purple-400/70', bg: 'rgba(139, 63, 160, 0.15)' },
  energy: { dot: 'bg-amber-400/70', bg: 'rgba(232, 137, 12, 0.15)' },
}

interface ChannelSelectProps {
  selectedId: Channel['id']
  onChange: (id: Channel['id']) => void
}

export function ChannelSelect({ selectedId, onChange }: ChannelSelectProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1">
      {channels.map(channel => {
        const isSelected = selectedId === channel.id
        const colors = CHANNEL_COLORS[channel.id]
        return (
          <button
            key={channel.id}
            onClick={() => onChange(channel.id)}
            className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              isSelected
                ? 'text-white/90'
                : 'text-white/30 hover:text-white/50'
            }`}
            style={isSelected ? { backgroundColor: colors.bg } : undefined}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                isSelected ? colors.dot : 'bg-white/[0.08]'
              } ${isSelected ? 'scale-100' : 'scale-75'}`}
            />
            {channel.name}
          </button>
        )
      })}
    </div>
  )
}
