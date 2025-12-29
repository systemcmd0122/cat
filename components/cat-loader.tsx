export function CatLoader({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <style>{`
        @keyframes paw {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1); }
          40% { opacity: 0; }
          100% { opacity: 0; }
        }

        .paw {
          animation: paw 1.2s infinite;
        }
      `}</style>

      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            className="paw text-primary"
            style={{ animationDelay: `${i * 0.2}s` }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* 肉球 */}
            <circle cx="12" cy="15" r="4" />
            <circle cx="7" cy="9" r="2" />
            <circle cx="12" cy="7" r="2" />
            <circle cx="17" cy="9" r="2" />
          </svg>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">読み込み中...</p>
    </div>
  )
}
