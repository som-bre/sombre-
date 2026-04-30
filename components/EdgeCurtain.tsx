'use client'

export default function EdgeCurtain({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  const folds = [25, 55, 85]
  return (
    <div className="fixed top-0 h-full pointer-events-none z-[5]" style={{
      [side]: 0, width: '7%', background: '#000',
    }}>
      {folds.map((pct, i) => (
        <div key={i} className="absolute top-0 bottom-0 sketch-jitter-line" style={{
          [isLeft ? 'right' : 'left']: `${pct}%`,
          width: `${1 + i * 0.2}px`,
          background: `rgba(255,255,255,${0.1 + i * 0.04})`,
          filter: 'url(#sketchy)', animationDelay: `${i * -0.07}s`,
        }} />
      ))}
      {/* Inner edge — facing content */}
      <div className="absolute top-0 bottom-0 sketch-jitter-line" style={{
        [isLeft ? 'right' : 'left']: 0,
        width: '1.5px',
        background: 'rgba(255,255,255,0.3)',
        filter: 'url(#sketchy)',
      }} />
    </div>
  )
}
