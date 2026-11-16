'use client'

// Small shared pieces for the Greenroom page and its RPG panels.

export const PINK = '#FF6B9D'
export const LOW = '#C2325B'

export type IconName = 'coin' | 'bread' | 'soup' | 'cake' | 'tea' | 'musicbox' | 'bouquet' | 'soap' | 'moon' | 'sun' | 'note' | 'sword' | 'leaf' | 'fish' | 'hammer' | 'bag' | 'list' | 'gold' | 'book'

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  let body: React.ReactNode = null
  switch (name) {
    case 'coin':
      body = <path {...s} d="M12 3c.6 4.5 4.5 8.4 9 9-4.5.6-8.4 4.5-9 9-.6-4.5-4.5-8.4-9-9 4.5-.6 8.4-4.5 9-9z" />
      break
    case 'bread':
      body = <><path {...s} d="M4 11c0-3 3.5-5 8-5s8 2 8 5c0 1.2-.8 2-2 2v5H6v-5c-1.2 0-2-.8-2-2z" /><path {...s} d="M9 9.5l1 2M12 9l1 2M15 9.5l1 2" /></>
      break
    case 'soup':
      body = <><path {...s} d="M3 12h18c0 4-3.5 7-9 7s-9-3-9-7z" /><path {...s} d="M9 8.5c-1-1.5 1-2.5 0-4M13.5 8.5c-1-1.5 1-2.5 0-4" /></>
      break
    case 'cake':
      body = <><path {...s} d="M5 12h14v7H5z" /><path {...s} d="M5 15.5c1.5 1.2 3-1.2 4.7 0s3-1.2 4.6 0 3-1.2 4.7 0" /><path {...s} d="M12 12V8.5M12 6.8c.8-1 .2-1.6 0-2.2-.2.6-.8 1.2 0 2.2z" /></>
      break
    case 'tea':
      body = <><path {...s} d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path {...s} d="M16 11.5h1.5a2.2 2.2 0 0 1 0 4.4H15.7" /><path {...s} d="M8.5 7c-.8-1 .8-2 0-3M12 7c-.8-1 .8-2 0-3" /></>
      break
    case 'musicbox':
      body = <><path {...s} d="M4 11h13v8H4z" /><path {...s} d="M4 11l2.5-4h13L17 11M17 15h3.5v-2.5" /><path {...s} d="M9.5 16.5v-3.2l3-.6v3" /><circle {...s} cx="8.6" cy="16.5" r=".9" /><circle {...s} cx="11.6" cy="15.7" r=".9" /></>
      break
    case 'bouquet':
      body = <><path {...s} d="M12 21l-3.5-8h7z" /><circle {...s} cx="8.7" cy="8.5" r="2.4" /><circle {...s} cx="15.3" cy="8.5" r="2.4" /><circle {...s} cx="12" cy="5.3" r="2.4" /><path {...s} d="M9.3 15.5c2 .8 3.5.8 5.4 0" /></>
      break
    case 'soap':
      body = <><rect {...s} x="3" y="12" width="16" height="7" rx="2.5" /><circle {...s} cx="9" cy="7" r="2" /><circle {...s} cx="14.5" cy="5" r="1.4" /><circle {...s} cx="18.5" cy="8.5" r="1" /></>
      break
    case 'moon':
      body = <path {...s} d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9z" />
      break
    case 'sun':
      body = <><circle {...s} cx="12" cy="12" r="3.8" /><path {...s} d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6" /></>
      break
    case 'sword':
      body = <><path {...s} d="M9 15L19.5 4.5V3H18L7.5 13.5" /><path {...s} d="M6 12l6 6M8 16l-4 4" /></>
      break
    case 'leaf':
      body = <><path {...s} d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" /><path {...s} d="M5 19l8-8" /></>
      break
    case 'fish':
      body = <><path {...s} d="M3 12c3-4 6.5-5 9.5-5s5.5 2 6.5 5c-1 3-3.5 5-6.5 5S6 16 3 12z" /><path {...s} d="M19 12l3-3v6zM15 10.5v.01" /></>
      break
    case 'hammer':
      body = <><path {...s} d="M13.5 4l6.5 6.5-2.5 2.5L11 6.5z" /><path {...s} d="M12.5 9.5L4 18l2 2 8.5-8.5" /></>
      break
    case 'bag':
      body = <><path {...s} d="M6 9h12l1.5 11h-15z" /><path {...s} d="M9 9V7a3 3 0 0 1 6 0v2" /></>
      break
    case 'list':
      body = <path {...s} d="M8.5 6H20M8.5 12H20M8.5 18H20M4.5 6v.01M4.5 12v.01M4.5 18v.01" />
      break
    case 'gold':
      body = <><circle {...s} cx="12" cy="12" r="8.5" /><circle {...s} cx="12" cy="12" r="5" /></>
      break
    case 'book':
      body = <><path {...s} d="M4 5.5c3-1 5.5-1 8 1 2.5-2 5-2 8-1v13c-3-1-5.5-1-8 1-2.5-2-5-2-8-1z" /><path {...s} d="M12 6.5v13" /></>
      break
    case 'note':
      body = <><path {...s} d="M9 17.5V6.5l9-2v11" /><circle {...s} cx="6.8" cy="17.5" r="2.2" /><circle {...s} cx="15.8" cy="15.5" r="2.2" /></>
      break
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">{body}</svg>
}

// Bordered button with a wobbling hand-drawn frame
export function SketchButton({
  children, onClick, disabled, on, title, type = 'button', className = '', style,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; on?: boolean
  title?: string; type?: 'button' | 'submit'; className?: string; style?: React.CSSProperties
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} data-on={on ? 'true' : 'false'}
      className={`gr-btn cursor-pointer ${className}`} style={{ background: 'none', ...style }}>
      <span className="gr-frame absolute inset-0 sketch-jitter-line pointer-events-none" style={{ filter: 'url(#sketchy)' }} />
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </button>
  )
}

export function Coins({ n, size = '0.72rem' }: { n: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-[3px]" style={{ fontFamily: "'Playfair Display', serif", fontSize: size, fontStyle: 'italic' }}>
      <Icon name="coin" size={10} />{n}
    </span>
  )
}

// Everyday money, as opposed to the starlight earned from to-dos (see Coins).
export const GOLD = '#E8C46A'
export function Gold({ n, size = '0.72rem' }: { n: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-[3px]" style={{ fontFamily: "'Playfair Display', serif", fontSize: size, fontStyle: 'italic', color: GOLD }}>
      <Icon name="gold" size={10} />{n}
    </span>
  )
}
