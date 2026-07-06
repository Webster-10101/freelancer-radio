/**
 * clearNowPlaying: pad the bottom to keep links tappable above the fixed
 * NowPlaying bar (triggers tab). On the channels tab the bar is hidden, so
 * only the home-indicator safe area is needed.
 */
export function Footer({ clearNowPlaying = false }: { clearNowPlaying?: boolean }) {
  return (
    <footer
      className={`mt-auto px-6 pt-6 text-center sm:pt-8 ${
        clearNowPlaying ? 'pb-20' : 'pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
      }`}
    >
      <p className="text-[11px] leading-relaxed tracking-wide text-white/20">
        freelancerad.io was built by{' '}
        <a
          href="https://alistairwebster.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/30 transition-colors duration-300 hover:text-white/50"
        >
          a freelancer
        </a>{' '}
        who needed music that didn't distract, interrupt, or cost another
        subscription.
      </p>
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-[11px] tracking-wide text-white/15">
          Music by{' '}
          <a
            href="https://goodbackgroundmusic.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/25 transition-colors duration-300 hover:text-white/45"
          >
            GBM Music
          </a>
        </span>
        <a
          href="https://buymeacoffee.com/freelanceradio"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/[0.06] px-3 py-1 text-[11px] tracking-wide text-white/30 transition-all duration-300 hover:border-white/[0.12] hover:text-white/50"
        >
          Buy me a coffee
        </a>
      </div>
    </footer>
  )
}
