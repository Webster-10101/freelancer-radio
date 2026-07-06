/** Lifetime of a toast in ms — keep in sync with the toast-in-out keyframes. */
export const TOAST_MS = 2600

/**
 * Transient pill notification (e.g. "Sleep timer cancelled").
 * The full fade in/hold/out lifecycle runs in CSS; the parent unmounts
 * it after TOAST_MS.
 */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-30 flex justify-center">
      <div
        role="status"
        className="rounded-full border border-white/[0.08] bg-black/60 px-4 py-2 text-[12px] font-light tracking-wide text-white/50 backdrop-blur-xl"
        style={{ animation: `toast-in-out ${TOAST_MS}ms ease-in-out both` }}
      >
        {message}
      </div>
    </div>
  )
}
