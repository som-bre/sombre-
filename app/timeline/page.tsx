'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import type { TimelineEvent, TimelineData } from '@/app/api/timeline/route'

const MANON_COLOR = '#D9809A'
const DYLAN_COLOR = '#C8C8C8'
const BOTH_COLOR = '#B8A0CC'

const TYPE_LABELS: Record<string, string> = {
  event: 'Event',
  milestone: 'Milestone',
  memory: 'Memory',
  turning: 'Turning Point',
}

const CHARACTER_COLORS: Record<string, string> = {
  manon: MANON_COLOR,
  dylan: DYLAN_COLOR,
  both: BOTH_COLOR,
}

function getAccent(ev: TimelineEvent) {
  return CHARACTER_COLORS[ev.character || 'both'] || BOTH_COLOR
}

// Small deterministic jitter per index
const JITTERS: [number, number][] = [
  [3, 2], [-5, -3], [4, 5], [-3, -2], [5, 3],
  [-2, -4], [4, -2], [-4, 3], [1, -5], [-1, 4],
  [3, -4], [-3, 2], [4, 3], [-5, -2], [2, -3],
  [-2, 4], [5, -3], [-4, -4], [3, 2], [-1, -3],
  [6, -2], [-6, 3], [2, 5], [-4, -5], [4, 1],
]

function getConstellationPositions(n: number): { x: number; y: number }[] {
  if (n === 0) return []
  if (n === 1) return [{ x: 50, y: 50 }]

  const COLS = n <= 3 ? n : n <= 6 ? 3 : n <= 12 ? 4 : 5
  const rows = Math.ceil(n / COLS)

  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / COLS)
    const col = i % COLS
    const goRight = row % 2 === 0
    const colsInRow = row === rows - 1 ? n - row * COLS : COLS
    const normalizedCol = colsInRow <= 1 ? 0.5 :
      goRight ? col / (colsInRow - 1) : (colsInRow - 1 - col) / (colsInRow - 1)

    const x = 12 + normalizedCol * 76
    const y = rows === 1 ? 50 : 14 + (row / (rows - 1)) * 72

    const [jx, jy] = JITTERS[i % JITTERS.length]
    return {
      x: Math.max(8, Math.min(92, x + jx)),
      y: Math.max(10, Math.min(90, y + jy)),
    }
  })
}

// Background star field (decorative, fixed positions)
const BG_STARS = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 137.508 + 13) % 100),
  y: ((i * 97.432 + 7) % 100),
  r: i % 5 === 0 ? 0.6 : i % 3 === 0 ? 0.4 : 0.25,
  o: 0.05 + (i % 7) * 0.02,
}))

export default function TimelinePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

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
  const hovered = events.find(e => e.id === hoverId)

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <EdgeCurtain side="left" />
      <EdgeCurtain side="right" />

      {/* SVG filter for glow */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="star-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

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
          paddingBottom: '24px',
        }}>
          {/* Left / Top: Constellation */}
          <div className="relative flex-1 min-h-0" style={{ minHeight: '45vh' }}>
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: 'visible' }}
            >
              {/* Background star field */}
              {BG_STARS.map((s, i) => (
                <circle key={`bg${i}`} cx={s.x} cy={s.y} r={s.r}
                  fill="white" opacity={s.o} />
              ))}

              {/* Constellation lines */}
              {events.map((ev, i) => {
                if (i === 0) return null
                const from = positions[i - 1]
                const to = positions[i]
                if (!from || !to) return null
                const isNearActive = ev.id === activeId || events[i - 1]?.id === activeId
                return (
                  <line key={`line-${i}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={isNearActive ? '0.3' : '0.18'}
                    strokeDasharray="0.8 1.2"
                    style={{ transition: 'stroke-width 0.3s, stroke 0.3s' }}
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
                const r = ev.type === 'milestone' ? 3.5 : ev.type === 'turning' ? 3 : 2.5
                const displayR = isActive ? r + 1.5 : isHovered ? r + 0.8 : r

                return (
                  <g key={ev.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveId(ev.id)}
                    onMouseEnter={() => setHoverId(ev.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    {/* Outer glow ring for active */}
                    {isActive && (
                      <circle
                        cx={pos.x} cy={pos.y}
                        r={displayR + 3}
                        fill="none"
                        stroke={accent}
                        strokeWidth="0.3"
                        opacity="0.25"
                        filter="url(#star-glow)"
                      />
                    )}

                    {/* Star body */}
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={displayR}
                      fill={isActive ? accent : isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'}
                      filter={isActive ? 'url(#star-glow-strong)' : isHovered ? 'url(#star-glow)' : undefined}
                      style={{ transition: 'r 0.3s, fill 0.3s' }}
                    />

                    {/* Star cross sparkle (for milestone/turning) */}
                    {(ev.type === 'milestone' || ev.type === 'turning') && (
                      <>
                        <line x1={pos.x} y1={pos.y - displayR - 1.5}
                              x2={pos.x} y2={pos.y + displayR + 1.5}
                              stroke={isActive ? accent : 'rgba(255,255,255,0.4)'}
                              strokeWidth="0.25" />
                        <line x1={pos.x - displayR - 1.5} y1={pos.y}
                              x2={pos.x + displayR + 1.5} y2={pos.y}
                              stroke={isActive ? accent : 'rgba(255,255,255,0.4)'}
                              strokeWidth="0.25" />
                      </>
                    )}

                    {/* Order number above star */}
                    <text
                      x={pos.x} y={pos.y - displayR - 1.5}
                      textAnchor="middle"
                      fontSize="2.2"
                      fill="rgba(255,255,255,0.3)"
                      fontFamily="'Pretendard Variable', sans-serif"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </text>

                    {/* Title label below star (show for hovered or active) */}
                    {(isActive || isHovered) && (
                      <text
                        x={pos.x} y={pos.y + displayR + 3.5}
                        textAnchor="middle"
                        fontSize="2.6"
                        fill={isActive ? accent : 'rgba(255,255,255,0.7)'}
                        fontFamily="'Playfair Display', serif"
                        fontStyle="italic"
                      >
                        {ev.title.length > 16 ? ev.title.slice(0, 15) + '…' : ev.title}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Hover tooltip (for non-active hovered) */}
            {hovered && hovered.id !== activeId && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  backdropFilter: 'blur(4px)',
                }}>
                  <span className="heading-condensed" style={{
                    fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)',
                    fontStyle: 'italic',
                  }}>
                    {hovered.storyDate} · {hovered.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right / Bottom: Detail Panel */}
          {active && (
            <div className="md:w-[320px] lg:w-[380px] flex flex-col overflow-hidden"
              style={{
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                padding: 'clamp(16px, 2vw, 32px) clamp(20px, 2.5vw, 36px)',
              }}
            >
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {/* Date + type */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="sketch-jitter-line" style={{
                    display: 'block', height: '1px',
                    width: '28px',
                    background: `${getAccent(active)}60`,
                    filter: 'url(#sketchy)',
                  }} />
                  <span className="label-caps" style={{
                    fontSize: '0.45rem', letterSpacing: '0.25em',
                    color: getAccent(active), opacity: 0.9,
                  }}>
                    {active.storyDate}
                  </span>
                  {active.type && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                      <span className="label-caps" style={{
                        fontSize: '0.42rem', letterSpacing: '0.2em',
                        color: 'rgba(255,255,255,0.3)',
                      }}>
                        {TYPE_LABELS[active.type] || active.type}
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="heading-display mb-3" style={{
                  fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.1,
                }}>
                  {active.title}
                </h2>

                {/* Character */}
                {active.character && (
                  <div className="mb-4">
                    <span className="label-caps" style={{
                      fontSize: '0.42rem', letterSpacing: '0.2em',
                      color: getAccent(active), opacity: 0.6,
                      borderBottom: `1px solid ${getAccent(active)}35`,
                      paddingBottom: '2px',
                    }}>
                      {active.character === 'both' ? 'Manon × Dylan' :
                       active.character === 'manon' ? 'Manon' : 'Dylan'}
                    </span>
                  </div>
                )}

                <div className="sketch-jitter-line mb-4" style={{
                  height: '1px', background: 'rgba(255,255,255,0.07)',
                  filter: 'url(#sketchy)',
                }} />

                <p className="text-editorial whitespace-pre-wrap" style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 'clamp(0.78rem, 1vw, 0.92rem)',
                  lineHeight: 1.85,
                }}>
                  {active.description || <span style={{ fontStyle: 'italic', opacity: 0.4 }}>내용 없음</span>}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 pt-3" style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <button
                  onClick={() => {
                    const idx = events.findIndex(e => e.id === activeId)
                    if (idx > 0) setActiveId(events[idx - 1].id)
                  }}
                  disabled={events.findIndex(e => e.id === activeId) === 0}
                  className="label-caps disabled:opacity-20 transition-opacity hover:text-white/80"
                  style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}
                >
                  ← PREV
                </button>
                <span className="label-caps text-white/25" style={{ fontSize: '0.42rem', letterSpacing: '0.2em' }}>
                  {String(events.findIndex(e => e.id === activeId) + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                </span>
                <button
                  onClick={() => {
                    const idx = events.findIndex(e => e.id === activeId)
                    if (idx < events.length - 1) setActiveId(events[idx + 1].id)
                  }}
                  disabled={events.findIndex(e => e.id === activeId) === events.length - 1}
                  className="label-caps disabled:opacity-20 transition-opacity hover:text-white/80"
                  style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}
                >
                  NEXT →
                </button>
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
      <span className="block h-px w-16" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <div className="text-center">
        <p className="heading-display text-white/40" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontStyle: 'italic' }}>
          No events yet.
        </p>
        <p className="heading-condensed text-white/20 mt-3" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
          Add timeline events from the admin panel.
        </p>
      </div>
      <span className="block h-px w-16" style={{ background: 'rgba(255,255,255,0.15)' }} />
    </div>
  )
}
