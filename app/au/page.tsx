'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import { BalletRibbon, MagicSparkle } from '@/components/StageMotifs'
import type { AU, AUData } from '@/app/api/au/route'

const MANON_COLOR = '#D9809A'
const DYLAN_COLOR = '#C8C8C8'

export default function AUPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [aus, setAUs] = useState<AU[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/au')
      .then(r => r.json())
      .then((d: AUData) => {
        if (d?.aus) setAUs(d.aus)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActiveIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setActiveIndex(i => Math.min(aus.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aus.length])

  const au = aus[activeIndex]

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <EdgeCurtain side="left" />
      <EdgeCurtain side="right" />

      <div className="fixed pointer-events-none z-[3] sketch-jitter-line" style={{
        top: 'clamp(28px, 3vw, 48px)', left: '7%', right: '7%', height: '1px',
        background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)',
      }} />

      <div className={`fixed top-0 left-0 right-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ padding: 'clamp(28px, 3vw, 44px) clamp(64px, 9vw, 100px) 0' }}>
        <button onClick={() => router.push('/')}
          className="label-caps text-white/40 hover:text-white/80 transition-colors"
          style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}>
          ← BACK
        </button>
        <div className="flex items-baseline gap-2">
          <span className="label-caps text-white/25" style={{ fontSize: '0.5rem', letterSpacing: '0.3em' }}>UNIVERSES</span>
          <span className="text-white/15">·</span>
          <span className="heading-condensed text-white/40" style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
            Alternate Worlds
          </span>
        </div>
      </div>

      <div className="fixed pointer-events-none z-[2]" style={{ top: '12%', left: '9%' }}>
        <BalletRibbon opacity={0.08} size={1.1} />
      </div>
      <div className="fixed pointer-events-none z-[2]" style={{ bottom: '12%', right: '9%' }}>
        <MagicSparkle opacity={0.14} size={1.2} count={6} />
      </div>

      <div className="absolute inset-0 flex flex-col" style={{
        paddingTop: 'clamp(80px, 10vw, 130px)',
        paddingBottom: 'clamp(80px, 10vh, 120px)',
        paddingLeft: '9%', paddingRight: '9%',
      }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : aus.length === 0 ? (
          <EmptyState />
        ) : au ? (
          <AUView au={au} key={au.id} />
        ) : null}
      </div>

      {aus.length > 0 && (
        <div className={`fixed left-0 right-0 bottom-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up stagger-4' : 'opacity-0'}`}
          style={{ padding: 'clamp(20px, 2vw, 32px) clamp(64px, 9vw, 100px)' }}>
          <button
            onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
            disabled={activeIndex === 0}
            className="label-caps disabled:opacity-20 transition-opacity hover:text-white/80"
            style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}
          >
            ← PREV
          </button>
          <div className="flex items-center gap-2">
            {aus.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)}
                className="block transition-all"
                style={{
                  width: i === activeIndex ? '20px' : '4px',
                  height: '4px',
                  borderRadius: '2px',
                  background: i === activeIndex ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
            <span className="ml-3 label-caps text-white/30" style={{ fontSize: '0.5rem', letterSpacing: '0.2em' }}>
              {String(activeIndex + 1).padStart(2, '0')} / {String(aus.length).padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={() => setActiveIndex(i => Math.min(aus.length - 1, i + 1))}
            disabled={activeIndex === aus.length - 1}
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

function AUView({ au }: { au: AU }) {
  const accent = au.themeColor || MANON_COLOR
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="block h-px sketch-jitter-line" style={{
            width: 'clamp(40px, 8vw, 90px)',
            background: 'rgba(255,255,255,0.2)', filter: 'url(#sketchy)',
          }} />
          <span style={{
            color: accent, fontSize: '0.65rem',
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            letterSpacing: '0.15em', opacity: 0.7,
          }}>※</span>
          <span className="block h-px sketch-jitter-line" style={{
            width: 'clamp(40px, 8vw, 90px)',
            background: 'rgba(255,255,255,0.2)', filter: 'url(#sketchy)',
          }} />
        </div>
        <h1 className="heading-display" style={{
          fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          color: 'rgba(255,255,255,0.92)',
          letterSpacing: '-0.01em', lineHeight: 1.1,
        }}>
          {au.title}
        </h1>
        {au.subtitle && (
          <p className="heading-condensed mt-2" style={{
            color: 'rgba(255,255,255,0.4)', fontStyle: 'italic',
            fontSize: 'clamp(0.75rem, 1.05vw, 0.95rem)', letterSpacing: '0.04em',
          }}>
            {au.subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 lg:gap-8 items-stretch min-h-0">
        <CharacterCard
          name={au.manon.name || 'Manon'}
          image={au.manon.image}
          dialogue={au.manon.dialogue}
          color={MANON_COLOR}
          align="left"
        />

        <div className="flex flex-col items-center justify-center gap-3 px-2 md:px-4 min-w-[60px] md:min-w-[100px]">
          <span className="block h-12 w-px sketch-jitter-line" style={{
            background: 'rgba(255,255,255,0.18)', filter: 'url(#sketchy)',
          }} />
          <div className="text-center">
            <span className="heading-display" style={{
              color: accent,
              fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)',
              fontStyle: 'italic', letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>
              {au.relationship || '—'}
            </span>
          </div>
          <span className="block h-12 w-px sketch-jitter-line" style={{
            background: 'rgba(255,255,255,0.18)', filter: 'url(#sketchy)',
          }} />
        </div>

        <CharacterCard
          name={au.dylan.name || 'Dylan'}
          image={au.dylan.image}
          dialogue={au.dylan.dialogue}
          color={DYLAN_COLOR}
          align="right"
        />
      </div>
    </div>
  )
}

function CharacterCard({
  name, image, dialogue, color, align,
}: {
  name: string; image?: string; dialogue?: string; color: string; align: 'left' | 'right'
}) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="relative flex-1 min-h-0 mb-3 sketch-jitter-line" style={{
        border: `1px solid ${color}40`,
        background: 'rgba(255,255,255,0.015)',
        filter: 'url(#sketchy)',
      }}>
        <span className="absolute inset-1 pointer-events-none" style={{ border: `1px solid ${color}15` }} />
        {image ? (
          <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="heading-display" style={{
              color: `${color}25`,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontStyle: 'italic',
            }}>
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className={`mb-2 ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <h2 className="heading-display" style={{
          color, fontSize: 'clamp(1.1rem, 1.7vw, 1.5rem)',
          letterSpacing: '-0.01em', fontStyle: 'italic',
        }}>
          {name}
        </h2>
      </div>

      {dialogue && (
        <div className="relative sketch-jitter-line" style={{
          border: `1px solid ${color}30`,
          background: 'rgba(0,0,0,0.4)',
          padding: '10px 14px',
          filter: 'url(#sketchy)',
        }}>
          <p className="text-editorial whitespace-pre-wrap" style={{
            color: 'rgba(255,255,255,0.78)',
            fontSize: 'clamp(0.78rem, 1.05vw, 0.95rem)',
            lineHeight: 1.7,
            textAlign: align === 'right' ? 'right' : 'left',
          }}>
            {dialogue}
          </p>
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
          No universes yet.
        </p>
        <p className="heading-condensed text-white/20 mt-3" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
          Add an alternate world from the admin panel.
        </p>
      </div>
      <span className="block h-px w-16" style={{ background: 'rgba(255,255,255,0.15)' }} />
    </div>
  )
}
