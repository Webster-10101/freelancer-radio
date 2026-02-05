export function Footer() {
  return (
    <footer className="mt-auto px-6 py-8 text-center">
      <p className="text-[11px] leading-relaxed tracking-wide text-white/20">
        Freelancer Radio was built by a freelance creative who needed music
        that didn't distract, interrupt, or cost another subscription.
      </p>
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-[11px] tracking-wide text-white/15">
          Music by GBM Music &times; FFG
        </span>
        <a
          href="#"
          className="rounded-full border border-white/[0.06] px-3 py-1 text-[11px] tracking-wide text-white/30 transition-all duration-300 hover:border-white/[0.12] hover:text-white/50"
        >
          Support Freelancer Radio
        </a>
      </div>
    </footer>
  )
}
