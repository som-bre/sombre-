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
    case 'bat':
      return <>
        <path d="M50 44c-8-10-24-14-40-8 6 4 8 10 6 16 6-4 12-4 16 2 4-6 10-8 18-10zM50 44c8-10 24-14 40-8-6 4-8 10-6 16-6-4-12-4-16 2-4-6-10-8-18-10z" fill={SOFT} />
        <ellipse cx="50" cy="50" rx="8" ry="11" fill={SOFT} />
        <path d="M44 40l-2-8 5 5M56 40l2-8-5 5M47 56l1.5 3 1.5-3 1.5 3 1.5-3M50 61v12" />
        {dot(46.5, 47, 1.6)}{dot(53.5, 47, 1.6)}
      </>
    case 'slime':
      return <>
        <path d="M20 80c-2-20 10-40 30-42 20 2 32 22 30 42-6 3-10-3-15 1-5 4-10-2-15 0-5 2-10-3-15 0-6 3-10-3-15-1z" fill={SOFT} />
        <path d="M34 54c2-6 8-9 14-9M64 76c4 2 8 2 12-2M30 90v.01M70 92v.01M50 94v.01" />
        <path d="M44 66c4 4 8 4 12 0" />
        {dot(42, 58)}{dot(58, 58)}
      </>
    case 'boar':
      return <>
        <path d="M20 66c0-18 14-30 34-30 18 0 30 10 32 24l-8 6c-8 8-24 10-38 8-10-1-18-2-20-8z" fill={SOFT} />
        <path d="M78 54c6 0 10 4 10 8s-4 8-10 8" fill={SOFT} />
        <path d="M82 60v.01M86 62v.01M74 66c4 4 4 10 0 14M70 66c2 4 0 8-3 10M30 36l4-8 4 8M40 34l4-8 4 8M48 32l4-8 4 8M30 72l-2 14M42 74l-1 14M60 74v14M70 72l2 14M20 60c-6-2-8-6-6-10" />
        {dot(70, 52, 1.8)}
      </>
    case 'cockatrice':
      return <>
        <path d="M34 72c-6-16 2-34 18-36 14-2 22 10 20 22-2 14-16 22-38 14z" fill={SOFT} />
        <circle cx="62" cy="30" r="9" fill={SOFT} />
        <path d="M70 30l10 3-10 3M56 22c0-6 4-8 6-4 2-4 6-2 6 3M62 38v6M34 72c-12 6-20 2-26-6 8 2 12 0 14-4M30 60l-14-10 4 12M44 74l-2 14M56 72l2 14M40 88h6M54 86h6" />
        <path d="M44 52c6-2 12 0 16 4M44 60c6-2 12 0 16 4" />
        {dot(64, 28, 1.6)}
      </>
    case 'ram':
      return <>
        <path d="M26 74c-4-14 4-30 22-32 18-2 30 10 28 24-4 12-18 16-32 14-8 0-16-2-18-6z" fill={SOFT} />
        <circle cx="70" cy="40" r="10" fill={SOFT} />
        <path d="M64 32c-10-8-22 0-18 10 3 6 10 6 12 0M76 32c8-8 18-2 14 8-2 4-8 4-8 0" />
        <path d="M30 56c3-3 6-3 9 0M42 52c3-3 6-3 9 0M54 56c3-3 6-3 9 0M34 66c3-3 6-3 9 0M48 64c3-3 6-3 9 0M32 78l-2 12M44 80v12M58 80v12M68 76l2 12M70 48c2 2 4 2 6 0" />
        {dot(73, 40, 1.6)}
      </>
    case 'ox':
      return <>
        <path d="M18 72c-2-18 10-30 30-30h20c12 0 18 8 18 18v10c-8 6-22 8-36 8s-26-2-32-6z" fill={SOFT} />
        <path d="M72 42c4-10 12-14 20-12-6 2-8 8-8 14M60 42c-2-10-8-14-16-14 4 4 6 8 4 14" />
        <ellipse cx="80" cy="60" rx="8" ry="6" fill={SOFT} />
        <path d="M77 60v.01M83 60v.01M24 74l-2 16M36 78v14M60 78v14M72 74l2 16M18 64c-6 2-10 8-8 14M38 52c4 4 10 4 14 0" />
        {dot(72, 50, 1.8)}
      </>
    case 'bull':
      return <>
        <path d="M30 92c0-24 6-38 20-38s20 14 20 38" fill={SOFT} />
        <path d="M34 40c0-12 8-20 16-20s16 8 16 20c0 10-6 16-16 16s-16-6-16-16z" fill={SOFT} />
        <path d="M36 28C26 24 16 26 10 34c8-2 14 0 20 4M64 28c10-4 20-2 26 6-8-2-14 0-20 4" />
        <ellipse cx="50" cy="48" rx="8" ry="5" fill={DARK} />
        <path d="M47 48v.01M53 48v.01M46 54c2 3 6 3 8 0M30 64l-12 6-4 10M70 64l12 6 4 10M50 54v4" />
        <circle cx="50" cy="60" r="3" />
        {dot(43, 36, 1.8)}{dot(57, 36, 1.8)}
      </>
    case 'mushroom':
      return <>
        <path d="M14 52c2-22 18-34 36-34s34 12 36 34c-12 4-24 6-36 6s-24-2-36-6z" fill={SOFT} />
        <path d="M40 58c-2 12-2 22 0 32h20c2-10 2-20 0-32" fill={SOFT} />
        <circle cx="34" cy="38" r="4" /><circle cx="56" cy="30" r="5" /><circle cx="70" cy="44" r="3.5" />
        <path d="M24 64c-4-4-4-8 0-10M78 64c4-4 4-8 0-10M16 74v.01M84 76v.01M30 84v.01M46 70c3 3 5 3 8 0" />
        {dot(45, 66, 1.6)}{dot(55, 66, 1.6)}
      </>
    case 'bees':
      return <>
        {[[30, 40], [62, 30], [50, 62], [74, 64], [24, 70]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse rx="6" ry="4" fill={SOFT} />
            <path d="M-2-4v8M2-4v8M-4-4c-4-6-8-6-8-2s4 4 8 2M4-4c4-6 8-6 8-2s-4 4-8 2M6 0l3 0" />
          </g>
        ))}
        <path d="M30 40c10 4 20-8 32-10M50 62c-6-4-20 2-26 8M62 30c4 12 12 20 12 34" strokeDasharray="2 4" />
      </>
    case 'quill':
      return <>
        <path d="M74 10C50 18 34 40 28 70l8-2C44 48 58 28 74 10z" fill={SOFT} />
        <path d="M74 10C62 24 50 40 36 68M44 46l-8-4M50 36l-8-4M56 28l-7-4M60 40l8 0M54 50l8 2" />
        <path d="M28 70l-6 14 10-10M20 90c10-4 20 2 30-2s20 0 30-4" />
        <path d="M18 84v.01M14 88v.01" strokeWidth="2.5" />
      </>
    case 'mimic':
      return <>
        <path d="M14 46h72v40H14z" fill={SOFT} />
        <path d="M10 46l8-14h64l8 14M14 60h72M48 60v26M52 60v26M24 86v6M76 86v6" />
        <path d="M18 46l4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6" />
        <path d="M30 40c4-3 8-3 12 0M58 40c4-3 8-3 12 0M76 24l4-6M84 28l6-4M80 18v-6" />
        <path d="M40 72h4M56 72h4" />
      </>
    case 'treant':
      return <>
        <path d="M34 92c2-20-2-36 0-52 2-10 8-14 16-14s14 4 16 14c2 16-2 32 0 52" fill={SOFT} />
        <path d="M34 50c-10-4-18-14-18-26 6 6 12 8 18 8M66 50c10-4 18-14 18-26-6 6-12 8-18 8M50 26V8M42 14l8 6 8-6" />
        <path d="M38 60c4 2 8 2 12 0M52 70c4 2 8 2 10 0M40 80c4 2 8 2 12 0M28 92h44M30 92l-6 4M70 92l6 4" />
        <ellipse cx="43" cy="44" rx="3" ry="4" fill={DARK} /><ellipse cx="57" cy="44" rx="3" ry="4" fill={DARK} />
        {dot(43, 44, 1.3)}{dot(57, 44, 1.3)}
      </>
    case 'stag':
      return <>
        <path d="M30 92l2-24c-6-10-2-24 10-28h16c12 4 14 18 8 28l2 24" fill={SOFT} />
        <path d="M44 40c-2-8 0-14 6-16 6 2 8 8 6 16" fill={SOFT} />
        <path d="M44 26l-8-10-6 4M38 18l-4-10M36 20l-12-2M56 26l8-10 6 4M62 18l4-10M64 20l12-2" />
        <path d="M47 36v.01M53 36v.01M48 42c1 1 3 1 4 0M38 92h6M56 92h6" />
        {dot(46, 32, 1.4)}{dot(54, 32, 1.4)}
      </>
    case 'eel':
      return <>
        <path d="M12 74c10-10 20 8 30-4s18-26 30-24c10 2 12 12 8 18" strokeWidth="6" stroke="rgba(255,255,255,0.14)" />
        <path d="M12 74c10-10 20 8 30-4s18-26 30-24c10 2 12 12 8 18" />
        <path d="M80 64c4 2 8 0 10-4" />
        <path d="M30 50l-4 8h6l-4 8M58 30l-4 8h6l-4 8M86 40l-3 6h5l-3 6" />
        {dot(76, 50, 1.6)}
      </>
    case 'crab':
      return <>
        <path d="M24 64c0-14 12-24 26-24s26 10 26 24c-8 6-16 8-26 8s-18-2-26-8z" fill={SOFT} />
        <path d="M30 52c6-4 12-6 20-6s14 2 20 6" />
        <path d="M26 56c-8-4-12-12-10-20 4 4 8 4 10 2-2-6 0-10 4-12 2 8 0 16-4 22M74 56c8-4 12-12 10-20-4 4-8 4-10 2 2-6 0-10-4-12-2 8 0 16 4 22" fill={SOFT} />
        <path d="M30 70l-10 10M36 72l-6 14M64 72l6 14M70 70l10 10M44 40v-8M56 40v-8" />
        {dot(44, 31, 2)}{dot(56, 31, 2)}
      </>
    case 'clock':
      return <>
        <path d="M36 92V50h28v42" fill={SOFT} />
        <circle cx="50" cy="32" r="18" fill={SOFT} />
        <circle cx="50" cy="32" r="13" />
        <path d="M50 32V22M50 32l7 4M50 16v3M50 45v3M34 32h3M63 32h3" />
        <path d="M36 58H22l-4 10M64 58h14l4 10M42 66h16M42 74h16M40 92h6M54 92h6M74 20l6-6 4 4-6 6M80 14l4-4" />
        {dot(50, 32, 1.8)}
      </>
    case 'owl':
      return <>
        <path d="M28 86c-6-20-4-46 22-52 26 6 28 32 22 52z" fill={SOFT} />
        <path d="M28 40l-4-14 14 8M72 40l4-14-14 8" />
        <circle cx="40" cy="48" r="8" /><circle cx="60" cy="48" r="8" />
        <path d="M48 56l2 6 2-6M38 70c4 4 8 4 12 0M50 70c4 4 8 4 12 0M40 80c4 3 8 3 10 0M50 80c4 3 8 3 10 0M40 86l-4 6M60 86l4 6" />
        <path d="M14 18v6M11 21h6M84 12v6M81 15h6" />
        {dot(40, 48, 3)}{dot(60, 48, 3)}
      </>
    case 'knight':
      return <>
        <path d="M38 92V52c0-8 6-12 12-12s12 4 12 12v40" fill={SOFT} />
        <path d="M40 30c0-10 4-16 10-16s10 6 10 16v8H40z" fill={SOFT} />
        <path d="M40 28h20M44 32h12M50 14V6" />
        <path d="M14 46h26v24c0 10-6 16-13 18-7-2-13-8-13-18z" fill="rgba(255,255,255,0.1)" />
        <path d="M20 54l14 14M22 66l6-6M62 52l20-24M78 24l8-4-2 8M42 92h6M52 92h6" />
      </>
    case 'twins':
      return <>
        <path d="M18 90c0-22 6-36 16-36s16 14 16 36" fill={DARK} />
        <path d="M50 90c0-22 6-36 16-36s16 14 16 36" fill={SOFT} />
        <circle cx="34" cy="40" r="11" fill={DARK} /><circle cx="66" cy="40" r="11" fill={SOFT} />
        <path d="M50 18v76" strokeDasharray="2 4" />
        <path d="M29 46c3 3 7 3 10 0M61 44c3-3 7-3 10 0" />
        {dot(30, 38, 1.6)}{dot(38, 38, 1.6)}{dot(62, 38, 1.6)}{dot(70, 38, 1.6)}
      </>
    case 'golem':
      return <>
        <path d="M30 56l10-8h20l10 8-4 26H34z" fill={SOFT} />
        <path d="M40 30l4-8h12l4 8-4 12H44z" fill={SOFT} />
        <path d="M30 56l-14 6-4 18 10 2M70 56l14 6 4 18-10 2M40 48l8 12 4-10 8 14M34 82l-4 12h12l2-12M66 82l4 12H58l-2-12" />
        <path d="M46 26l4 6 4-6M44 34h12" />
        {dot(46, 30, 1.6)}{dot(54, 30, 1.6)}
      </>
    case 'moth':
      return <>
        <path d="M46 44C34 22 14 22 12 38s16 20 34 12M54 44c12-22 32-22 34-6s-16 20-34 12" fill="rgba(255,255,255,0.08)" />
        <path d="M46 54c-14 0-24 10-20 20s14 4 20-12M54 54c14 0 24 10 20 20s-14 4-20-12" fill={SOFT} />
        <ellipse cx="50" cy="52" rx="4" ry="16" fill={SOFT} />
        <circle cx="26" cy="36" r="6" /><circle cx="74" cy="36" r="6" />
        <path d="M48 38c-4-10-10-14-16-14M52 38c4-10 10-14 16-14" />
      </>
    case 'queen':
      return <>
        <path d="M26 92c4-24 12-40 24-40s20 16 24 40z" fill={SOFT} />
        <ellipse cx="50" cy="38" rx="11" ry="13" fill={SOFT} />
        <path d="M38 24l4-10 4 8 4-12 4 12 4-8 4 10" />
        <path d="M14 30h20v32H14zM66 30h20v32H66z" fill="rgba(255,255,255,0.08)" />
        <path d="M18 34l12 24M70 34l12 24M44 46c4 2 8 2 12 0M36 64l-10-6M64 64l10-6" />
        {dot(45, 37, 1.6)}{dot(55, 37, 1.6)}
      </>
    case 'puppet':
      return <>
        <path d="M30 2l14 30M70 2L58 34M50 2v24" strokeDasharray="2 3" />
        <circle cx="50" cy="32" r="9" fill={SOFT} />
        <path d="M42 44h16l4 24H38z" fill={SOFT} />
        <path d="M42 46l-14 4-6 12M58 46l14-8 8-12M44 68l-8 22M56 68l6 22M32 90h8M58 90h8M42 40l3 2M58 40l-3 2" />
        <path d="M46 34c2 2 6 2 8 0" />
        {dot(46, 30, 1.4)}{dot(54, 30, 1.4)}
      </>
    case 'mask':
      return <>
        <path d="M20 28c20-8 40-8 60 0 2 26-10 50-30 54-20-4-32-28-30-54z" fill={SOFT} />
        <path d="M30 42c4-6 12-6 16 0-4 4-12 4-16 0zM54 42c4-6 12-6 16 0-4 4-12 4-16 0z" fill={DARK} />
        <path d="M34 60c8 10 24 10 32 0M38 62c8 6 16 6 24 0M50 48v6M14 22l6 6M86 22l-6 6M20 40l-8 2M80 40l8 2" />
      </>
    case 'curtain':
      return <>
        <path d="M14 10h72" strokeWidth="2.5" />
        <path d="M18 12c-2 30 2 56 8 80 6-2 10-2 14 0-2-26-2-54 2-80M44 12c-2 28 0 54 6 80 4-2 8-2 12 0 0-28-2-54 0-80M66 12c0 28 2 54 8 80 4-2 8-2 10 0-2-28-4-54-4-80" fill={SOFT} />
        <path d="M30 46l3 3M38 46l-3 3M56 40l3 3M64 40l-3 3M30 58c2 2 6 2 8 0" />
      </>
    case 'choir':
      return <>
        {[[24, 54], [50, 44], [76, 54]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x - 12} 92c0-20 4-${92 - y - 12} 12-${92 - y - 12}s12 ${92 - y - 32} 12 ${92 - y - 12}`} fill={DARK} />
            <circle cx={x} cy={y} r="9" fill={DARK} />
            <ellipse cx={x} cy={y + 4} rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
          </g>
        ))}
        <path d="M20 22c2-4 6-4 6 0v10M26 26h6M64 14c2-4 6-4 6 0v10M70 18h6M44 18v8" />
      </>
    case 'director':
      return <>
        <path d="M24 94c2-26 10-42 26-42s24 16 26 42z" fill={DARK} />
        <path d="M34 22h32v6H34zM38 22l2-14h20l2 14" fill={SOFT} />
        <ellipse cx="50" cy="40" rx="11" ry="12" fill={DARK} />
        <path d="M76 64l16-22M90 40l4-2-2 4M28 68l-10 12M50 52v20M44 58l6 4 6-4" />
        <path d="M42 46c4 3 12 3 16 0" />
        {dot(45, 38, 1.8)}{dot(55, 38, 1.8)}
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
