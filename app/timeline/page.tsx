'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import type { TimelineEvent, TimelineData } from '@/app/api/timeline/route'

const MANON_COLOR = '#D9809A'
const DYLAN_COLOR = '#C8C8C8'
const BOTH_COLOR = '#B8A0CC'

const TYPE_LABELS: Record<string, string> = {
  event: 'Event', milestone: 'Milestone', memory: 'Memory', turning: 'Turning Point',
}

function getAccent(ev: TimelineEvent) {
  return { manon: MANON_COLOR, dylan: DYLAN_COLOR, both: BOTH_COLOR }[ev.character || 'both'] || BOTH_COLOR
}

// Star positions: zigzag constellation path
const JITTERS: [number, number][] = [
  [4, 3], [-6, -4], [5, 6], [-4, -3], [6, 4],
  [-3, -5], [5, -3], [-5, 4], [2, -6], [-2, 5],
  [4, -5], [-4, 3], [5, 4], [-6, -3], [3, -4],
  [-3, 5], [6, -4], [-5, -5], [4, 3], [-2, -4],
  [7, -3], [-7, 4], [3, 6], [-5, -6], [5, 2],
]

function getConstellationPositions(n: number): { x: number; y: number }[] {
  if (n === 0) return []
  if (n === 1) return [{ x: 35, y: 50 }]
  const COLS = n <= 3 ? n : n <= 6 ? 3 : n <= 12 ? 4 : 5
  const rows = Math.ceil(n / COLS)
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / COLS)
    const col = i % COLS
    const goRight = row % 2 === 0
    const colsInRow = row === rows - 1 ? n - row * COLS : COLS
    const normalizedCol = colsInRow <= 1 ? 0.5 :
      goRight ? col / (colsInRow - 1) : (colsInRow - 1 - col) / (colsInRow - 1)
    const x = 10 + normalizedCol * 80
    const y = rows === 1 ? 50 : 12 + (row / (rows - 1)) * 76
    const [jx, jy] = JITTERS[i % JITTERS.length]
    return { x: Math.max(6, Math.min(94, x + jx)), y: Math.max(8, Math.min(92, y + jy)) }
  })
}

// SVG 4-point star shape
function StarShape({ cx, cy, r, fill, opacity = 1, animate = false }: {
  cx: number; cy: number; r: number; fill: string; opacity?: number; animate?: boolean
}) {
  const inner = r * 0.38
  const d = `M${cx},${cy - r} L${cx + inner},${cy - inner} L${cx + r},${cy} L${cx + inner},${cy + inner} L${cx},${cy + r} L${cx - inner},${cy + inner} L${cx - r},${cy} L${cx - inner},${cy - inner} Z`
  return (
    <path d={d} fill={fill} opacity={opacity} style={animate ? { animation: 'twinkle 3s ease-in-out infinite' } : undefined} />
  )
}

// Background decorative stars
const BG_STARS = Array.from({ length: 100 }, (_, i) => ({
  x: ((i * 137.508 + 13) % 100),
  y: ((i * 97.432 + 7) % 100),
  r: i % 7 === 0 ? 0.8 : i % 4 === 0 ? 0.5 : 0.3,
  o: 0.04 + (i % 8) * 0.015,
  twinkle: i % 11 === 0,
}))

export default function TimelinePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/timeline')
      .then(r => r.json())
      .then((d: TimelineData) => {
        if (d?.events) {
          const sorted = [...d.events].sort((a, b) => a.order - b.order)
          setEvents(sorted)
          if (sorted.length > 0) setActiveId(sorted[0].id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const positions = getConstellationPositions(events.length)
  const active = events.find(e => e.id === activeId)

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <EdgeCurtain side="left" />
      <EdgeCurtain side="right" />

      {/* Twinkle animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.15; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ padding: 'clamp(28px, 3vw, 44px) clamp(40px, 6vw, 80px) 0' }}>
        <button onClick={() => router.push('/')}
          className="label-caps text-white/40 hover:text-white/80 transition-colors"
          style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}>
          ← BACK
        </button>
        <div className="flex items-baseline gap-2">
          <span className="label-caps text-white/25" style={{ fontSize: '0.5rem', letterSpacing: '0.3em' }}>TIMELINE</span>
          <span className="text-white/15">·</span>
          <span className="heading-condensed text-white/40" style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
            The Wheel of Karma
          </span>
        </div>
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="absolute inset-0 flex flex-col md:flex-row" style={{
          paddingTop: 'clamp(70px, 9vw, 110px)',
          paddingBottom: '16px',
          paddingLeft: '7%', paddingRight: '7%',
        }}>
          {/* Constellation canvas */}
          <div className="relative flex-1 min-h-0" style={{ minHeight: '40vh' }}>
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Glow filters */}
              <defs>
                <filter id="tl-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="1.2" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="tl-glow-strong" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="2.5" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="tl-halo">
                  <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background star field */}
              {BG_STARS.map((s, i) => (
                <g key={`bg${i}`}>
                  {s.r > 0.6 ? (
                    <StarShape cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} animate={s.twinkle} />
                  ) : (
                    <circle cx={s.x} cy={s.y} r={s.r * 0.5} fill="white" opacity={s.o}
                      style={s.twinkle ? { animation: `twinkle ${3 + (i % 4)}s ease-in-out ${(i % 7) * 0.5}s infinite` } : undefined} />
                  )}
                </g>
              ))}

              {/* Constellation lines */}
              {events.map((ev, i) => {
                if (i === 0) return null
                const from = positions[i - 1]
                const to = positions[i]
                if (!from || !to) return null
                const nearActive = ev.id === activeId || events[i - 1]?.id === activeId
                const accent = nearActive ? getAccent(active || ev) : 'rgba(255,255,255,0.15)'
                return (
                  <line key={`ln-${i}`}
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={accent} strokeWidth={nearActive ? '0.25' : '0.15'}
                    strokeDasharray="0.6 1.0"
                    opacity={nearActive ? 0.6 : 0.3}
                    style={{ transition: 'all 0.4s' }}
                  />
                )
              })}

              {/* Stars */}
              {events.map((ev, i) => {
                const pos = positions[i]
                if (!pos) return null
                const isActive = ev.id === activeId
                const isHovered = ev.id === hoverId
                const accent = getAccent(ev)
                const baseR = ev.type === 'milestone' ? 2.8 : ev.type === 'turning' ? 2.4 : 1.8
                const r = isActive ? baseR + 1.2 : isHovered ? baseR + 0.5 : baseR

                return (
                  <g key={ev.id} style={{ cursor: 'pointer' }}
                    onClick={() => setActiveId(ev.id)}
                    onMouseEnter={() => setHoverId(ev.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    {/* Halo glow for active */}
                    {isActive && (
                      <>
                        <circle cx={pos.x} cy={pos.y} r={r * 3.5} fill="url(#tl-halo)"
                          style={{ animation: 'glow-pulse 2.5s ease-in-out infinite' }} />
                        <circle cx={pos.x} cy={pos.y} r={r + 2}
                          fill="none" stroke={accent} strokeWidth="0.15" opacity="0.35" />
                      </>
                    )}

                    {/* Star body — 4-point star SVG */}
                    <StarShape cx={pos.x} cy={pos.y} r={r}
                      fill={isActive ? accent : isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'}
                    />

                    {/* Center bright dot */}
                    <circle cx={pos.x} cy={pos.y} r={r * 0.25}
                      fill="white" opacity={isActive ? 1 : 0.7}
                      filter={isActive ? 'url(#tl-glow-strong)' : 'url(#tl-glow)'} />

                    {/* Order number */}
                    <text x={pos.x} y={pos.y - r - 2}
                      textAnchor="middle" fontSize="1.8"
                      fill="rgba(255,255,255,0.25)"
                      fontFamily="'Pretendard Variable', sans-serif"
                    >{String(i + 1).padStart(2, '0')}</text>

                    {/* Title label on hover / active */}
                    {(isActive || isHovered) && (
                      <text x={pos.x} y={pos.y + r + 3.5}
                        textAnchor="middle" fontSize="2.2"
                        fill={isActive ? accent : 'rgba(255,255,255,0.7)'}
                        fontFamily="'Playfair Display', serif"
                        fontStyle="italic"
                      >{ev.title.length > 18 ? ev.title.slice(0, 17) + '…' : ev.title}</text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Detail panel */}
          {active && (
            <div className="md:w-[300px] lg:w-[340px] flex flex-col overflow-hidden animate-fade-in" key={active.id}
              style={{
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                padding: 'clamp(14px, 1.5vw, 28px) clamp(16px, 2vw, 28px)',
              }}>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {/* Star icon */}
                <div className="flex justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12,2 L13.8,9 L21,9.5 L15.5,14 L17.5,21 L12,17 L6.5,21 L8.5,14 L3,9.5 L10.2,9 Z"
                      fill="none" stroke={getAccent(active)} strokeWidth="0.8" opacity="0.5" />
                  </svg>
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="sketch-jitter-line" style={{
                    display: 'block', height: '1px', width: '24px',
                    background: `${getAccent(active)}50`, filter: 'url(#sketchy)',
                  }} />
                  <span className="label-caps" style={{
                    fontSize: '0.42rem', letterSpacing: '0.25em',
                    color: getAccent(active), opacity: 0.9,
                  }}>{active.storyDate}</span>
                  {active.type && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                      <span className="label-caps" style={{
                        fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)',
                      }}>{TYPE_LABELS[active.type] || active.type}</span>
                    </>
                  )}
                  <span className="sketch-jitter-line" style={{
                    display: 'block', height: '1px', width: '24px',
                    background: `${getAccent(active)}50`, filter: 'url(#sketchy)',
                  }} />
                </div>

                <h2 className="heading-display text-center mb-2" style={{
                  fontSize: 'clamp(1.2rem, 2.2vw, 1.7rem)',
                  color: 'rgba(255,255,255,0.92)', lineHeight: 1.1,
                }}>{active.title}</h2>

                {active.character && (
                  <div className="text-center mb-4">
                    <span className="label-caps" style={{
                      fontSize: '0.4rem', letterSpacing: '0.2em',
                      color: getAccent(active), opacity: 0.55,
                    }}>
                      {active.character === 'both' ? 'Manon × Dylan' : active.character === 'manon' ? 'Manon' : 'Dylan'}
                    </span>
                  </div>
                )}

                <div className="sketch-jitter-line mb-4" style={{
                  height: '1px', background: 'rgba(255,255,255,0.06)', filter: 'url(#sketchy)',
                }} />

                <p className="text-editorial whitespace-pre-wrap" style={{
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: 'clamp(0.76rem, 0.95vw, 0.88rem)',
                  lineHeight: 1.85,
                }}>
                  {active.description || <span style={{ fontStyle: 'italic', opacity: 0.4 }}>내용 없음</span>}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-3 pt-2" style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <button
                  onClick={() => { const idx = events.findIndex(e => e.id === activeId); if (idx > 0) setActiveId(events[idx - 1].id) }}
                  disabled={events.findIndex(e => e.id === activeId) === 0}
                  className="label-caps disabled:opacity-15 transition-opacity hover:text-white/80"
                  style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}
                >← PREV</button>
                <span className="label-caps text-white/20" style={{ fontSize: '0.4rem', letterSpacing: '0.18em' }}>
                  {String(events.findIndex(e => e.id === activeId) + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                </span>
                <button
                  onClick={() => { const idx = events.findIndex(e => e.id === activeId); if (idx < events.length - 1) setActiveId(events[idx + 1].id) }}
                  disabled={events.findIndex(e => e.id === activeId) === events.length - 1}
                  className="label-caps disabled:opacity-15 transition-opacity hover:text-white/80"
                  style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}
                >NEXT →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <path d="M20,4 L23,15 L34,15.5 L25.5,22 L28.5,33 L20,27 L11.5,33 L14.5,22 L6,15.5 L17,15 Z"
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      </svg>
      <div className="text-center">
        <p className="heading-display text-white/40" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontStyle: 'italic' }}>
          No events yet.
        </p>
        <p className="heading-condensed text-white/20 mt-3" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
          Add timeline events from the admin panel.
        </p>
      </div>
    </div>
  )
}
