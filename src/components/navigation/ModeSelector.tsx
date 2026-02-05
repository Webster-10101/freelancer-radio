interface ModeSelectorProps {
  activeTab: 'channels' | 'triggers'
  onTabChange: (tab: 'channels' | 'triggers') => void
}

export function ModeSelector({ activeTab, onTabChange }: ModeSelectorProps) {
  return (
    <div className="flex justify-center py-6">
      <div className="flex rounded-full border border-white/[0.06] bg-white/[0.02] p-1">
        <button
          onClick={() => onTabChange('channels')}
          className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-300 ${
            activeTab === 'channels'
              ? 'bg-white/[0.08] text-white/90'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Channels
        </button>
        <button
          onClick={() => onTabChange('triggers')}
          className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-300 ${
            activeTab === 'triggers'
              ? 'bg-white/[0.08] text-white/90'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Triggers
        </button>
      </div>
    </div>
  )
}
