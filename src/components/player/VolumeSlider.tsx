interface VolumeSliderProps {
  volume: number
  onChange: (volume: number) => void
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <VolumeIcon muted={volume === 0} />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/10 accent-white/60 sm:w-24"
      />
    </div>
  )
}

function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg className="h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12A4.5 4.5 0 0 0 14 8.1V4l-5 4H5v8h4l5 4v-4.1a4.5 4.5 0 0 0 2.5-3.9zM19 12a7 7 0 0 0-3-5.7v1.5A5.5 5.5 0 0 1 17.5 12 5.5 5.5 0 0 1 16 16.2v1.5A7 7 0 0 0 19 12z" />
        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg className="h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 4L9 8H5v8h4l5 4V4zm2.5 4.1A4.5 4.5 0 0 1 18.5 12a4.5 4.5 0 0 1-2 3.9v-7.8zM16 1.3v1.5A9 9 0 0 1 21 12a9 9 0 0 1-5 8.2v1.5A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 16 1.3z" />
    </svg>
  )
}
