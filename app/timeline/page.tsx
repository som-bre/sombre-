'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import { MagicSparkle } from '@/components/StageMotifs'
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

export default function TimelinePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const lineRef = useRef<HTMLDivElement>(null)

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

  const active = events.find(e => e.id === activeId)

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <EdgeCurtain side="left" />
      <EdgeCurtain side="right" />

      {/* Top horizontal line */}
      <div className="fixed pointer-events-none z-[3] sketch-jitter-line" style={{
        top: 'clamp(28px, 3vw, 48px)', left: '7%', right: '7%', height: '1px',
        background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)',
      }} />

      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ padding: 'clamp(28px, 3vw, 44px) clamp(64px, 9vw, 100px) 0' }}>
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

      {/* Decorations */}
      <div className="fixed pointer-events-none z-[2]" style={{ bottom: '10%', right: '8%' }}>
        <MagicSparkle opacity={0.12} size={1.1} count={5} />
      </div>

      {/* Main content */}
      <div className="absolute inset-0 flex" style={{
        paddingTop: 'clamp(80px, 10vw, 120px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
        paddingLeft: 'clamp(40px, 7vw, 90px)',
        paddingRight: 'clamp(40px, 7vw, 90px)',
      }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex-1 flex gap-8 md:gap-14 min-h-0">
            {/* Left: vertical timeline scrubber */}
            <div className="relative flex flex-col items-center" style={{ width: '2px', minWidth: '2px' }}>
              {/* Vertical line */}
              <div ref={lineRef} className="sketch-jitter-line" style={{
                position: 'absolute', top: 0, bottom: 0, left: '50%',
                width: '1px', background: 'rgba(255,255,255,0.12)',
                transform: 'translateX(-50%)', filter: 'url(#sketchy)',
              }} />
              {/* Dots */}
              <div className="relative z-10 flex flex-col gap-0 w-full h-full justify-between py-2">
                {events.map((ev) => {
                  const isActive = ev.id === activeId
                  const accent = getAccent(ev)
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setActiveId(ev.id)}
                      className="relative flex items-center justify-center group"
                      style={{ minHeight: '24px' }}
                      title={ev.title}
                    >
                      <span className="block transition-all duration-300" style={{
                        width: isActive ? '10px' : '6px',
                        height: isActive ? '10px' : '6px',
                        borderRadius: '50%',
                        background: isActive ? accent : 'rgba(255,255,255,0.2)',
                        boxShadow: isActive ? `0 0 8px ${accent}80` : 'none',
                        border: isActive ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.15)',
                      }} />
                      {/* Tooltip */}
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none label-caps"
                        style={{ fontSize: '0.45rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>
                        {ev.storyDate}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: event detail + list */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-10 min-h-0 overflow-hidden">
              {/* Event detail (large) */}
              {active && (
                <div className="flex-1 flex flex-col min-h-0 animate-fade-in" key={active.id}>
                  {/* Date tag */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="sketch-jitter-line" style={{
                      display: 'block', height: '1px',
                      width: 'clamp(24px, 4vw, 48px)',
                      background: `${getAccent(active)}60`,
                      filter: 'url(#sketchy)',
                    }} />
                    <span className="label-caps" style={{
                      fontSize: '0.48rem', letterSpacing: '0.25em',
                      color: getAccent(active), opacity: 0.8,
                    }}>
                      {active.storyDate}
                    </span>
                    {active.type && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.6rem' }}>·</span>
                        <span className="label-caps" style={{
                          fontSize: '0.45rem', letterSpacing: '0.2em',
                          color: 'rgba(255,255,255,0.3)',
                        }}>
                          {TYPE_LABELS[active.type] || active.type}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="heading-display mb-4" style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.8rem)',
                    color: 'rgba(255,255,255,0.92)',
                    lineHeight: 1.05,
                  }}>
                    {active.title}
                  </h2>

                  {/* Character badge */}
                  {active.character && (
                    <div className="mb-5">
                      <span className="label-caps" style={{
                        fontSize: '0.45rem', letterSpacing: '0.22em',
                        color: getAccent(active), opacity: 0.65,
                        borderBottom: `1px solid ${getAccent(active)}40`,
                        paddingBottom: '2px',
                      }}>
                        {active.character === 'both' ? 'Manon × Dylan' : active.character === 'manon' ? 'Manon' : 'Dylan'}
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="sketch-jitter-line mb-5" style={{
                    height: '1px', background: 'rgba(255,255,255,0.08)',
                    filter: 'url(#sketchy)',
                  }} />

                  {/* Description */}
                  <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    <p className="text-editorial whitespace-pre-wrap" style={{
                      color: 'rgba(255,255,255,0.68)',
                      fontSize: 'clamp(0.8rem, 1.1vw, 1rem)',
                      lineHeight: 1.85,
                    }}>
                      {active.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Event list (right panel) */}
              <div className="md:w-[220px] lg:w-[260px] flex flex-col gap-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {events.map((ev, idx) => {
                  const isActive = ev.id === activeId
                  const accent = getAccent(ev)
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setActiveId(ev.id)}
                      className="text-left group transition-all"
                      style={{
                        padding: '10px 12px',
                        background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                        borderLeft: `2px solid ${isActive ? accent : 'rgba(255,255,255,0.06)'}`,
                        opacity: isActive ? 1 : 0.55,
                      }}
                    >
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="label-caps" style={{
                          fontSize: '0.4rem', letterSpacing: '0.18em',
                          color: isActive ? accent : 'rgba(255,255,255,0.35)',
                        }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="label-caps" style={{
                          fontSize: '0.4rem', letterSpacing: '0.15em',
                          color: 'rgba(255,255,255,0.25)',
                        }}>
                          {ev.storyDate}
                        </span>
                      </div>
                      <p className="heading-condensed" style={{
                        fontSize: 'clamp(0.78rem, 1vw, 0.9rem)',
                        color: isActive ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.5)',
                        fontStyle: 'italic',
                        lineHeight: 1.3,
                      }}>
                        {ev.title}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav arrows */}
      {events.length > 1 && (
        <div className={`fixed left-0 right-0 bottom-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
          style={{ padding: 'clamp(16px, 2vw, 28px) clamp(64px, 9vw, 100px)' }}>
          <button
            onClick={() => {
              const idx = events.findIndex(e => e.id === activeId)
              if (idx > 0) setActiveId(events[idx - 1].id)
            }}
            disabled={events.findIndex(e => e.id === activeId) === 0}
            className="label-caps disabled:opacity-20 transition-opacity hover:text-white/80"
            style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}
          >
            ← PREV
          </button>
          <span className="label-caps text-white/20" style={{ fontSize: '0.45rem', letterSpacing: '0.2em' }}>
            {String((events.findIndex(e => e.id === activeId) + 1)).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
          </span>
          <button
            onClick={() => {
              const idx = events.findIndex(e => e.id === activeId)
              if (idx < events.length - 1) setActiveId(events[idx + 1].id)
            }}
            disabled={events.findIndex(e => e.id === activeId) === events.length - 1}
            className="label-caps disabled:opacity-20 transition-opacity hover:text-white/80"
            style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
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
