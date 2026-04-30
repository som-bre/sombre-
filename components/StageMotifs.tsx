'use client'

// Subtle ballet ribbon — S-curve, hand-drawn
export function BalletRibbon({
  className = '', style, opacity = 0.15, size = 1,
}: { className?: string; style?: React.CSSProperties; opacity?: number; size?: number }) {
  return (
    <svg
      className={`pointer-events-none sketch-jitter ${className}`}
      style={{ filter: 'url(#sketchy)', opacity, ...style }}
      width={120 * size} height={120 * size} viewBox="0 0 120 120"
      aria-hidden
    >
      <path
        d="M15,100 C20,80 10,60 25,45 C40,30 55,40 50,55 C45,68 30,68 35,55 C40,42 60,32 75,40 C88,48 85,65 70,68"
        stroke="white" strokeWidth="1" fill="none" strokeLinecap="round"
      />
      <path
        d="M17,102 C22,82 12,62 27,47 C42,32 57,42 52,57 C47,70 32,70 37,57 C42,44 62,34 77,42 C90,50 87,67 72,70"
        stroke="white" strokeWidth="0.5" fill="none" opacity="0.5"
      />
    </svg>
  )
}

// Subtle magic sparkles — scatter of star marks
export function MagicSparkle({
  className = '', style, opacity = 0.2, size = 1, count = 5,
}: { className?: string; style?: React.CSSProperties; opacity?: number; size?: number; count?: number }) {
  const sparkles: { x: number; y: number; r: number }[] = []
  for (let i = 0; i < count; i++) {
    sparkles.push({
      x: 10 + (i * 31 + 7) % 100,
      y: 10 + (i * 47 + 13) % 100,
      r: 1 + (i % 3) * 0.6,
    })
  }
  return (
    <svg
      className={`pointer-events-none sketch-jitter ${className}`}
      style={{ filter: 'url(#sketchy)', opacity, ...style }}
      width={120 * size} height={120 * size} viewBox="0 0 120 120"
      aria-hidden
    >
      {sparkles.map((s, i) => (
        <g key={i}>
          <line x1={s.x - s.r} y1={s.y} x2={s.x + s.r} y2={s.y}
                stroke="white" strokeWidth="0.6" strokeLinecap="round" />
          <line x1={s.x} y1={s.y - s.r} x2={s.x} y2={s.y + s.r}
                stroke="white" strokeWidth="0.6" strokeLinecap="round" />
          <line x1={s.x - s.r * 0.6} y1={s.y - s.r * 0.6} x2={s.x + s.r * 0.6} y2={s.y + s.r * 0.6}
                stroke="white" strokeWidth="0.4" opacity="0.6" strokeLinecap="round" />
          <line x1={s.x + s.r * 0.6} y1={s.y - s.r * 0.6} x2={s.x - s.r * 0.6} y2={s.y + s.r * 0.6}
                stroke="white" strokeWidth="0.4" opacity="0.6" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}
