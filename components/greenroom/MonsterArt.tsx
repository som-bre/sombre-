'use client'

// Hand-drawn magical creatures. One wobbling line drawing per `art` key.

const dot = (cx: number, cy: number, r = 2.2) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
const SOFT = 'rgba(255,255,255,0.06)'
const DARK = 'rgba(0,0,0,0.8)'

function drawing(art: string): React.ReactNode {
  switch (art) {
    case 'dust':
      return <>
        <path d="M30 56c-6-14 6-30 22-28s24 14 18 28-14 20-26 18-10-8-14-18z" fill={SOFT} />
        <path d="M38 62c8 6 16 6 24 0M34 44c4-6 10-8 14-6M58 38c5 0 8 3 10 7" />
        <path d="M24 44l-7-3M22 60l-8 2M73 40l7-4M77 57l8 1M50 25v-8M36 30l-4-7M64 30l5-6M40 76l-3 7M60 76l4 6" />
        {dot(43, 50)}{dot(57, 50)}
      </>
    case 'rat':
      return <>
        <path d="M26 74c0-20 12-30 26-30s24 10 24 28z" fill={SOFT} />
        <circle cx="38" cy="42" r="7" /><circle cx="62" cy="42" r="7" />
        <path d="M34 52h32l-3 11c-9 4-17 4-26 0z" fill={DARK} />
        <path d="M40 57h7M53 57h7M76 70c10 2 15-6 9-13s-10 2-4 5" />
        <path d="M34 66l-10 2M34 69l-9 5M66 66l10 2M66 69l9 5M50 63v4" />
      </>
    case 'troll':
      return <>
        <path d="M26 90c-5-28 4-48 24-48s29 20 24 48z" fill={SOFT} />
        <circle cx="50" cy="28" r="11" fill={SOFT} />
        <path d="M40 24l-8-4M60 24l8-4M44 34l2-4 2 4M52 34l2-4 2 4M42 36c5 3 11 3 16 0" />
        <path d="M30 54c-13 8-16 22-12 34M70 54c9 5 13 13 13 22" />
        <path d="M80 80l9-36 6 2-8 36z" fill={SOFT} /><path d="M88 50l5 2M86 58l5 2" />
        <path d="M40 60c6 4 14 4 20 0M44 72c4 2 8 2 12 0" />
        {dot(45, 26, 1.8)}{dot(55, 26, 1.8)}
      </>
    case 'pixie':
      return <>
        <path d="M46 50C30 34 16 38 20 52s20 6 26 2M54 50C70 34 84 38 80 52s-20 6-26 2" fill="rgba(255,255,255,0.04)" />
        <path d="M46 56c-12 4-16 14-9 18s10-6 10-12M54 56c12 4 16 14 9 18s-10-6-10-12" />
        <ellipse cx="50" cy="58" rx="5" ry="10" fill={SOFT} />
        <circle cx="50" cy="40" r="8" fill={SOFT} />
        <path d="M43 38l-8-6M57 38l8-6M46 33c-2-6-6-9-10-9M54 33c2-6 6-9 10-9M46 44c3 3 5 3 8 0M48 68l-3 12M52 68l3 12M45 54l-9 8M55 54l9 8" />
        <path d="M16 24v6M13 27h6M84 22v6M81 25h6M26 82v5M23.5 84.5h5" />
        {dot(47, 39, 1.5)}{dot(53, 39, 1.5)}
      </>
    case 'vine':
      return <>
        <path d="M34 80h32l-5 14H39z" fill={SOFT} />
        <path d="M50 80c-16-10-16-24 0-30s16-22 0-32" strokeWidth="2.2" />
        <path d="M50 64c14-2 24 4 26 16M50 46c-14-2-22-10-24-22M56 30c10-4 18 0 22 8" />
        <path d="M76 80c6-3 9 3 5 8s-9 0-5-8zM26 24c-6-3-9 3-5 8s9 0 5-8zM78 38c6-1 8 5 3 8s-7-3-3-8z" fill={SOFT} />
        <path d="M42 72l-4-3M58 58l5-2M40 52l-5 1M60 38l4-3M44 24l-4-2" />
        <circle cx="50" cy="15" r="5" fill={SOFT} />{dot(50, 15, 1.8)}
      </>
    case 'mandrake':
      return <>
        <path d="M50 44c-2-14-12-22-24-22 4 12 12 20 24 22zM50 44c2-14 12-22 24-22-4 12-12 20-24 22zM50 44V16" fill={SOFT} />
        <path d="M38 46c-5 16-1 30 6 42l6-9 6 9c7-12 11-26 6-42z" fill={SOFT} />
        <ellipse cx="50" cy="62" rx="5" ry="7" fill={DARK} />
        <path d="M41 52l6 3M59 52l-6 3M38 58l-13-5-4 4M62 58l13-5 4 4M44 76l-2 5M56 76l2 5" />
        <path d="M18 66c-4-4-4-10 0-14M82 66c4-4 4-10 0-14M12 70c-6-6-6-16 0-22M88 70c6-6 6-16 0-22" />
        {dot(45, 55, 1.5)}{dot(55, 55, 1.5)}
      </>
    case 'book':
      return <>
        <path d="M16 36l34 9 34-9v36l-34 11-34-11z" fill={SOFT} />
        <path d="M50 45v38M16 36l34-8 34 8" />
        <path d="M18 38l4 7 4-5 4 7 4-5 4 7 4-5 4 7M82 38l-4 7-4-5-4 7-4-5-4 7-4-5-4 7" />
        <path d="M24 62l18 5M24 68l18 5M76 62l-18 5M76 68l-18 5M50 82c-4 6 4 8 0 14" />
        <circle cx="33" cy="55" r="4" /><circle cx="67" cy="55" r="4" />
        {dot(33, 55, 1.6)}{dot(67, 55, 1.6)}
      </>
    case 'ink':
      return <>
        <path d="M30 52c-4-16 8-28 20-28s24 12 20 28c7 4 5 13-2 13-2 9-11 9-13 2-4 9-13 9-15 0-7 4-14-3-10-15z" fill={DARK} />
        <path d="M32 74v8M62 76v11M46 80v5M20 44v.01M82 58v.01M24 70v.01M78 34v.01" strokeWidth="2.5" />
        <path d="M62 30l15-20M70 16l9 5M73 12l7 4" />
        <path d="M42 54c5 4 11 4 16 0" />
        <circle cx="43" cy="44" r="3.5" fill="currentColor" stroke="none" /><circle cx="57" cy="44" r="3.5" fill="currentColor" stroke="none" />
      </>
    case 'ghost':
      return <>
        <path d="M28 88V44a20 20 0 0 1 40 0v44l-7-6-7 6-6-6-6 6-7-6z" fill={SOFT} />
        <ellipse cx="41" cy="46" rx="3" ry="5" fill="currentColor" stroke="none" />
        <ellipse cx="55" cy="46" rx="3" ry="5" fill="currentColor" stroke="none" />
        <path d="M42 60c4 4 8 4 12 0M72 52l15-4 4 17-15 4zM77 56l8-2M78 61l8-2M68 62l6 2" />
        <path d="M36 36c3-3 7-3 10 0M50 36c3-3 7-3 10 0" />
      </>
    case 'wisp':
      return <>
        <circle cx="50" cy="56" r="34" strokeDasharray="1 6" strokeWidth="0.8" />
        <path d="M50 16c10 14 20 24 20 40a20 20 0 0 1-40 0c0-9 6-13 9-22 4 4 6 8 6 12 4-8 5-18 5-30z" fill={SOFT} />
        <path d="M50 44c5 7 9 11 9 18a9 9 0 0 1-18 0c0-5 5-9 9-18z" />
        <path d="M45 66c3 3 7 3 10 0M22 30l-4-6M80 34l5-5M18 76l-6 3M84 78l6 2" />
        {dot(46, 59, 1.6)}{dot(54, 59, 1.6)}
      </>
    case 'spider':
      return <>
        <path d="M50 28V4" strokeDasharray="2 3" />
        <circle cx="50" cy="54" r="12" fill={SOFT} /><circle cx="50" cy="38" r="6" />
        <path d="M40 48L22 34l-6 8M38 54L16 52l-6 10M40 60L22 70l-2 12M45 65L36 82l3 9" />
        <path d="M60 48L78 34l6 8M62 54L84 52l6 10M60 60L78 70l2 12M55 65L64 82l-3 9" />
        <path d="M44 54c4-4 8-4 12 0M46 60h8" />
        {dot(47.5, 37, 1.3)}{dot(52.5, 37, 1.3)}
      </>
    case 'wolf':
      return <>
        <path d="M84 8a11 11 0 1 0 8 18 9 9 0 0 1-8-18z" fill={SOFT} />
        <path d="M30 42l-5-24 17 13M70 42l5-24-17 13" fill={SOFT} />
        <path d="M30 42c0 22 8 38 20 46 12-8 20-24 20-46-7-9-33-9-40 0z" fill={SOFT} />
        <path d="M37 52l9 4M63 52l-9 4M44 68l6 8 6-8M46 78l1 5M54 78l-1 5M42 80c5 4 11 4 16 0" />
        <path d="M30 56l-6 3M31 64l-5 4M70 56l6 3M69 64l5 4M46 40l4 5 4-5" />
        {dot(42, 56, 1.6)}{dot(58, 56, 1.6)}{dot(50, 69, 2.2)}
      </>
    case 'hand':
      return <>
        <path d="M36 68c2 14 10 22 18 22s16-8 15-26" fill={SOFT} />
        <path d="M38 62V34a4 4 0 0 1 8 0v22M46 56V24a4 4 0 0 1 8 0v30M54 56V28a4 4 0 0 1 8 0v28M62 58V40a4 4 0 0 1 7 0v24" fill={SOFT} />
        <path d="M38 58l-9-10a4 4 0 0 0-6 6l13 16M44 70c4 3 10 3 14 0" />
        <path d="M8 90c7-5 14-5 21 0s14 5 21 0 14-5 21 0 14 5 21 0M14 82c5-3 9-3 14 0M72 82c5-3 9-3 14 0" />
      </>
    case 'kelpie':
      return <>
        <path d="M36 86c2-26 8-42 22-52 7-6 17-6 22 0l5 15c0 7-6 9-11 7-2 5-9 7-13 5-3 12-5 18-5 25" fill={SOFT} />
        <path d="M60 30l-3-12 10 7M52 38c-9 2-13 9-13 15M47 49c-8 2-11 9-11 15M43 61c-6 2-8 8-8 13" />
        <path d="M8 88c7-5 14-5 21 0s14 5 21 0 14-5 21 0 14 5 21 0M70 52c3 2 6 2 8 0" />
        {dot(70, 38, 2)}{dot(82, 47, 1.2)}
      </>
    case 'snake':
      return <>
        <path d="M14 84c10-22 22 2 32-18s20 2 30-26" strokeWidth="6" stroke="rgba(255,255,255,0.14)" />
        <path d="M14 84c10-22 22 2 32-18s20 2 30-26" />
        <path d="M20 74l5 3M29 70l4 5M38 74l5-3M47 62l5 3M56 57l4 5M66 56l5-3M72 46l5 2" />
        <ellipse cx="80" cy="34" rx="9" ry="7" fill="rgba(255,255,255,0.08)" />
        <path d="M89 33l7-4M89 35l7 1M74 28l-3-6M80 26l1-7" />
        {dot(81, 32, 1.7)}
      </>
    case 'gargoyle':
      return <>
        <path d="M40 60C24 48 12 32 14 18c9 8 15 11 20 22M60 60c16-12 28-28 26-42-9 8-15 11-20 22" fill={SOFT} />
        <path d="M36 88c-4-16 0-30 14-34s18 18 14 34z" fill={SOFT} />
        <circle cx="50" cy="42" r="10" fill={SOFT} />
        <path d="M43 35l-6-12M57 35l6-12M44 48l2 4 2-4M52 48l2 4 2-4M40 40l7 2M60 40l-7 2" />
        <path d="M28 92h44M42 88l-2 4M58 88l2 4M44 66c4 3 8 3 12 0M18 30l8 4M82 30l-8 4" />
        {dot(46, 43, 1.5)}{dot(54, 43, 1.5)}
      </>
    case 'starsprite':
      return <>
        <path d="M54 14l9 21 23 2-18 15 6 22-20-13-20 13 6-22-18-15 23-2z" fill={SOFT} />
        <path d="M48 46l6 3M66 46l-6 3M50 58c4-3 9-3 13 0" />
        <path d="M22 84l12-12M12 74l10-8M30 92l8-9M88 18v8M84 22h8M14 20v6M11 23h6" />
        {dot(51, 50, 1.7)}{dot(63, 50, 1.7)}
      </>
    case 'dragon':
      return <>
        <path d="M46 62C36 38 22 28 6 26c5 10 7 16 15 22-6 0-10 2-14 4 9 7 19 11 31 12" fill={SOFT} />
        <path d="M18 86c8-20 22-24 36-20 11 4 15 15 10 24" fill={SOFT} />
        <path d="M54 66c-6-14 0-28 14-34l17-4 7 8-11 7 5 6-13 5" fill={SOFT} />
        <path d="M70 30l1-13M77 29l6-11M18 86c-9 4-13 0-12-7M30 70l-2-6M40 66l-1-6M60 52l-5-3M58 44l-5-1" />
        <path d="M93 42l6-2M93 46l7 2M91 50l5 5M24 88l-3 6M52 90l2 5" />
        {dot(75, 37, 1.8)}
      </>
    default:
      return <circle cx="50" cy="50" r="22" />
  }
}

export default function MonsterArt({ art, size = 120, boss = false, className = '' }: {
  art: string; size?: number; boss?: boolean; className?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden
      className={`sketch-jitter shrink-0 ${className}`}
      style={{ filter: 'url(#sketchy)', color: boss ? '#FFD9E4' : '#fff', overflow: 'visible' }}>
      {boss && <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,107,157,0.35)" strokeWidth="0.8" strokeDasharray="1 5" />}
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {drawing(art)}
      </g>
    </svg>
  )
}
