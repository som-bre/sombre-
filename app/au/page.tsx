'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import type { AU, AUData } from '@/app/api/au/route'

const MANON_COLOR = '#D9809A'
const DYLAN_COLOR = '#C8C8C8'

export default function AUPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [aus, setAUs] = useState<AU[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAU, setSelectedAU] = useState<AU | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/au')
      .then(r => r.json())
      .then((d: AUData) => { if (d?.aus) setAUs(d.aus) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <EdgeCurtain side="left" />
      <EdgeCurtain side="right" />

      <div className="fixed pointer-events-none z-[3] sketch-jitter-line" style={{
        top: 'clamp(28px, 3vw, 48px)', left: '7%', right: '7%', height: '1px',
        background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)',
      }} />

      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ padding: 'clamp(28px, 3vw, 44px) clamp(40px, 6vw, 80px) 0' }}>
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

      {/* Card grid */}
      <div className="absolute inset-0 overflow-y-auto" style={{
        paddingTop: 'clamp(72px, 9vw, 110px)',
        paddingBottom: 'clamp(32px, 4vh, 60px)',
        paddingLeft: 'clamp(24px, 5vw, 64px)',
        paddingRight: 'clamp(24px, 5vw, 64px)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        ) : aus.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 22vw, 280px), 1fr))',
            gap: 'clamp(12px, 1.8vw, 24px)',
          }}>
            {aus.map((au, idx) => (
              <AUCard key={au.id} au={au} idx={idx} onClick={() => setSelectedAU(au)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedAU && (
        <AUModal au={selectedAU} onClose={() => setSelectedAU(null)} />
      )}
    </div>
  )
}

function AUCard({ au, idx, onClick }: { au: AU; idx: number; onClick: () => void }) {
  const accent = au.themeColor || MANON_COLOR
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left group transition-all duration-300"
      style={{
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
        border: `1px solid ${hovered ? accent + '50' : 'rgba(255,255,255,0.1)'}`,
        padding: '0',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.4), 0 0 12px ${accent}15` : 'none',
      }}
    >
      {/* Character portraits row */}
      <div className="flex h-[120px] relative overflow-hidden">
        {/* Manon side */}
        <div className="flex-1 relative overflow-hidden" style={{ background: `${MANON_COLOR}08` }}>
          {au.manon.image ? (
            <img src={au.manon.image} alt={au.manon.name || 'Manon'}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ opacity: 0.85 }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="heading-display" style={{
                color: `${MANON_COLOR}30`,
                fontSize: '2.5rem', fontStyle: 'italic',
              }}>
                {(au.manon.name || 'M').charAt(0)}
              </span>
            </div>
          )}
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic', fontSize: '0.65rem',
              color: MANON_COLOR, opacity: 0.9,
            }}>
              {au.manon.name || 'Manon'}
            </span>
          </div>
        </div>

        {/* Center divider + relationship */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            padding: '3px 8px',
            border: `1px solid ${accent}40`,
          }}>
            <span className="heading-display" style={{
              color: accent,
              fontSize: '0.7rem',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
            }}>
              {au.relationship || '—'}
            </span>
          </div>
        </div>

        {/* Dylan side */}
        <div className="flex-1 relative overflow-hidden" style={{ background: `${DYLAN_COLOR}06` }}>
          {au.dylan.image ? (
            <img src={au.dylan.image} alt={au.dylan.name || 'Dylan'}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ opacity: 0.85 }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="heading-display" style={{
                color: `${DYLAN_COLOR}30`,
                fontSize: '2.5rem', fontStyle: 'italic',
              }}>
                {(au.dylan.name || 'D').charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', textAlign: 'right' }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic', fontSize: '0.65rem',
              color: DYLAN_COLOR, opacity: 0.9,
            }}>
              {au.dylan.name || 'Dylan'}
            </span>
          </div>
        </div>
      </div>

      {/* Card info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="label-caps" style={{
            fontSize: '0.38rem', letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.25)',
          }}>
            {String(idx + 1).padStart(2, '0')}
          </span>
          {au.themeColor && (
            <span style={{
              display: 'inline-block', width: '6px', height: '6px',
              borderRadius: '50%', background: au.themeColor, opacity: 0.7,
            }} />
          )}
        </div>
        <h3 className="heading-display" style={{
          fontSize: 'clamp(0.9rem, 1.3vw, 1.1rem)',
          color: 'rgba(255,255,255,0.88)',
          fontStyle: 'italic', lineHeight: 1.2,
        }}>
          {au.title}
        </h3>
        {au.subtitle && (
          <p className="heading-condensed mt-0.5" style={{
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.35)',
            fontStyle: 'italic',
          }}>
            {au.subtitle}
          </p>
        )}
      </div>
    </button>
  )
}

function AUModal({ au, onClose }: { au: AU; onClose: () => void }) {
  const accent = au.themeColor || MANON_COLOR

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl flex flex-col md:flex-row overflow-hidden animate-fade-in"
        style={{
          background: 'rgba(6,6,6,0.98)',
          border: `1px solid ${accent}30`,
          maxHeight: '85vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white/30 hover:text-white/70 transition-colors z-10"
          style={{ fontSize: '1rem', position: 'absolute' }}
        >
          ✕
        </button>

        {/* Manon card */}
        <CharacterPanel
          name={au.manon.name || 'Manon'}
          image={au.manon.image}
          dialogue={au.manon.dialogue}
          color={MANON_COLOR}
          align="left"
        />

        {/* Center: title + relationship */}
        <div className="flex flex-col items-center justify-center px-4 md:px-6 py-6 md:py-0"
          style={{
            minWidth: '120px',
            borderLeft: `1px solid rgba(255,255,255,0.06)`,
            borderRight: `1px solid rgba(255,255,255,0.06)`,
            gap: '16px',
          }}>
          <span className="block w-px h-12 sketch-jitter-line"
            style={{ background: 'rgba(255,255,255,0.15)', filter: 'url(#sketchy)' }} />
          <div className="text-center px-2">
            <p className="label-caps mb-1" style={{
              fontSize: '0.4rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)',
            }}>
              {au.subtitle || 'AU'}
            </p>
            <h2 className="heading-display" style={{
              fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
              color: accent, fontStyle: 'italic',
              whiteSpace: 'nowrap',
            }}>
              {au.relationship || '—'}
            </h2>
            <p className="heading-display mt-1" style={{
              fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)',
              color: 'rgba(255,255,255,0.7)', fontStyle: 'italic',
            }}>
              {au.title}
            </p>
          </div>
          <span className="block w-px h-12 sketch-jitter-line"
            style={{ background: 'rgba(255,255,255,0.15)', filter: 'url(#sketchy)' }} />
        </div>

        {/* Dylan card */}
        <CharacterPanel
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

function CharacterPanel({
  name, image, dialogue, color, align,
}: {
  name: string; image?: string; dialogue?: string; color: string; align: 'left' | 'right'
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Portrait */}
      <div className="relative overflow-hidden" style={{ height: '200px', background: 'rgba(255,255,255,0.015)' }}>
        {image ? (
          <img src={image} alt={name}
            className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="heading-display" style={{
              color: `${color}25`, fontSize: '5rem', fontStyle: 'italic',
            }}>
              {name.charAt(0)}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute bottom-3 px-4" style={{ [align === 'right' ? 'right' : 'left']: 0 }}>
          <h3 className="heading-display" style={{
            color, fontSize: '1.1rem', fontStyle: 'italic',
          }}>
            {name}
          </h3>
        </div>
      </div>

      {/* Dialogue */}
      {dialogue && (
        <div className="flex-1 overflow-y-auto p-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          <div className="sketch-jitter-line mb-3" style={{
            height: '1px', background: `${color}25`, filter: 'url(#sketchy)',
          }} />
          <p className="text-editorial whitespace-pre-wrap" style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 'clamp(0.75rem, 1vw, 0.88rem)',
            lineHeight: 1.8,
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
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <span className="block h-px w-16" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <div className="text-center">
        <p className="heading-display text-white/40" style={{ fontSize: '2rem', fontStyle: 'italic' }}>
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
