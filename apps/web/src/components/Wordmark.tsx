export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 shrink-0">
        <path
          d="M6 23c4.5-12 15.5-12 20 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="text-white/25"
        />
        <circle cx="6" cy="23" r="2.6" className="fill-ember-400" />
        <circle cx="26" cy="23" r="2.6" className="fill-tide-400" />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold tracking-[0.28em] text-mist-50 uppercase">
          LVN
        </span>
        {!compact && (
          <span className="mt-1 font-display text-[0.7rem] tracking-[0.3em] text-mist-400 uppercase">
            Atlas
          </span>
        )}
      </span>
    </span>
  );
}
