export function Footer() {
  return (
    <footer className="mt-auto px-6 pb-20 pt-8 text-center">
      <p className="text-[11px] leading-relaxed tracking-wide text-white/20">
        freelancerad.io was built by a freelance creative who needed music
        that didn't distract, interrupt, or cost another subscription.
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
