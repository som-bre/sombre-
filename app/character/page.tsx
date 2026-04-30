'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import { BalletRibbon, MagicSparkle } from '@/components/StageMotifs'

interface PhaseData {
  id: string
  symbol: string
  label: string
  name: string
  quote: string
  nameKr: string
  nameEn: string
  age: string
  height: string
  weight: string
  personality: string[]
  abilityName: string
  abilityDesc: string
  mainQuote: string
  stats?: { label: string; value: number }[]
  profileImage?: string
  voiceFile?: string
  voiceLabel?: string
}

const defaultManon: PhaseData[] = [
  {
    id: 'manon-0', symbol: '❀', label: 'VARIATION · I', name: '[ Première ]', quote: '" 비밀이야. "',
    nameKr: 'Manon', nameEn: 'MANON',
    age: '—', height: '—', weight: '—',
    personality: [], abilityName: '', abilityDesc: '', mainQuote: '""',
  },
]

const defaultDylan: PhaseData[] = [
  {
    id: 'dylan-0', symbol: '✦', label: 'INCANTATION · I', name: '[ Cantus ]', quote: '" — "',
    nameKr: 'Dylan', nameEn: 'DYLAN',
    age: '—', height: '—', weight: '—',
    personality: [], abilityName: '', abilityDesc: '', mainQuote: '""',
  },
]

const MANON_COLOR = '#D9809A'
const DYLAN_COLOR = '#C8C8C8'

function VoicePlayer({ src, color }: { src: string; color: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const toggle = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => { if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100) }
    const onEnded = () => { setIsPlaying(false); setProgress(0) }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('ended', onEnded) }
  }, [])

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle}
        className="w-7 h-7 flex items-center justify-center shrink-0 sketch-jitter-line"
        style={{ border: `1px solid ${color}60`, color, filter: 'url(#sketchy)' }}>
        <span className="text-[9px]">{isPlaying ? '||' : '▶'}</span>
      </button>
      <div className="flex-1 h-px bg-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
      <span className="label-caps text-white/25" style={{ fontSize: '0.5rem' }}>VOICE</span>
    </div>
  )
}

export default function CharacterPage() {
  const router = useRouter()
  const [character, setCharacter] = useState<'manon' | 'dylan'>('manon')
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [manonPhases, setManonPhases] = useState<PhaseData[]>(defaultManon)
  const [dylanPhases, setDylanPhases] = useState<PhaseData[]>(defaultDylan)
  const [showDetail, setShowDetail] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => {
        // Backwards compat: API may return media/sadham
        const m = data?.manon?.length ? data.manon : data?.media
        const d = data?.dylan?.length ? data.dylan : data?.sadham
        if (m?.length) setManonPhases(m)
        if (d?.length) setDylanPhases(d)
      })
      .catch(() => {})
  }, [])

  const isManon = character === 'manon'
  const phases = isManon ? manonPhases : dylanPhases
  const data = phases[phaseIndex]

  const handleCharacterChange = (char: 'manon' | 'dylan') => {
    setCharacter(char)
    setPhaseIndex(0)
    setShowDetail(false)
  }

  if (!data) return <div className="fixed inset-0 bg-black" />

  const accentColor = isManon ? MANON_COLOR : DYLAN_COLOR

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <EdgeCurtain side="left" />
      <EdgeCurtain side="right" />

      {/* Top frame line */}
      <div className="fixed pointer-events-none z-[3] sketch-jitter-line" style={{
        top: 'clamp(28px, 3vw, 48px)', left: '7%', right: '7%', height: '1px',
        background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)',
      }} />

      {/* Center divider */}
      <div className="fixed pointer-events-none z-[3] sketch-jitter-line hidden sm:block" style={{
        left: '50%', top: '5%', bottom: '5%', width: '1px',
        background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)',
      }} />

      {/* Top bar */}
      <div className={`fixed top-0 left-0 right-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ padding: 'clamp(28px, 3vw, 44px) clamp(64px, 9vw, 100px) 0' }}>
        <button onClick={() => router.push('/')}
          className="label-caps text-white/40 hover:text-white/80 transition-colors"
          style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}>
          ← BACK
        </button>
        <div className="flex items-baseline gap-2">
          <span className="label-caps text-white/25" style={{ fontSize: '0.5rem', letterSpacing: '0.3em' }}>CHARACTERS</span>
          <span className="text-white/15">·</span>
          <span className="heading-condensed text-white/40" style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
            Manon × Dylan
          </span>
        </div>
      </div>

      {/* Side motifs */}
      <div className="fixed pointer-events-none z-[2]" style={{ top: '12%', left: '8%' }}>
        {isManon ? <BalletRibbon opacity={0.1} size={1.1} /> : <MagicSparkle opacity={0.16} size={1.1} count={5} />}
      </div>

      {/* Main two-column layout */}
      <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2"
        style={{ paddingTop: 'clamp(80px, 9vw, 120px)', paddingBottom: 'clamp(60px, 6vw, 90px)', paddingLeft: '8%', paddingRight: '8%' }}>

        {/* ═══ LEFT: Character image stage ═══ */}
        <div className="flex flex-col min-h-0 px-3 md:px-6">
          {/* Character switcher */}
          <div className={`flex items-baseline gap-5 mb-4 ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}>
            <button
              onClick={() => handleCharacterChange('manon')}
              className="group transition-all"
            >
              <div className="flex flex-col items-start">
                <span className="label-caps" style={{
                  fontSize: '0.4rem', letterSpacing: '0.3em',
                  color: isManon ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
                }}>I</span>
                <span className="heading-display mt-0.5" style={{
                  fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 1.5vw, 1.3rem)',
                  color: isManon ? MANON_COLOR : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.3s',
                }}>
                  Manon
                </span>
              </div>
            </button>
            <span className="text-white/15 text-sm select-none">·</span>
            <button
              onClick={() => handleCharacterChange('dylan')}
              className="group transition-all"
            >
              <div className="flex flex-col items-start">
                <span className="label-caps" style={{
                  fontSize: '0.4rem', letterSpacing: '0.3em',
                  color: !isManon ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
                }}>II</span>
                <span className="heading-display mt-0.5" style={{
                  fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 1.5vw, 1.3rem)',
                  color: !isManon ? DYLAN_COLOR : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.3s',
                }}>
                  Dylan
                </span>
              </div>
            </button>
          </div>

          {/* Image frame */}
          <div className={`relative flex-1 min-h-0 sketch-jitter-line ${mounted ? 'animate-fade-slide-up stagger-2' : 'opacity-0'}`}
            style={{
              border: `1px solid ${accentColor}35`,
              background: 'rgba(255,255,255,0.012)',
              filter: 'url(#sketchy)',
            }}>
            <span className="absolute inset-1 pointer-events-none" style={{ border: `1px solid ${accentColor}10` }} />
            {data.profileImage ? (
              <img src={data.profileImage} alt={data.nameKr}
                className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display select-none leading-none" style={{
                  fontSize: 'clamp(8rem, 18vw, 16rem)',
                  color: `${accentColor}10`,
                  fontStyle: 'italic',
                }}>
                  {data.symbol}
                </span>
              </div>
            )}
            {/* Bottom gradient for legibility */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
          </div>

          {/* Phase tabs + voice */}
          <div className={`mt-4 ${mounted ? 'animate-fade-slide-up stagger-3' : 'opacity-0'}`}>
            <div className="flex items-center gap-4 mb-3">
              {phases.map((p, i) => (
                <button key={p.id}
                  onClick={() => { setPhaseIndex(i); setShowDetail(false) }}
                  className="label-caps transition-colors"
                  style={{
                    color: phaseIndex === i ? accentColor : 'rgba(255,255,255,0.2)',
                    fontSize: '0.5rem', letterSpacing: '0.2em',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
            {data.voiceFile && (
              <div className="mb-2">
                <VoicePlayer src={data.voiceFile} color={accentColor} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: Information panel ═══ */}
        <div className="flex flex-col justify-between px-3 md:px-6 pt-4 md:pt-0 overflow-hidden">

          <div>
            {/* Chapter label */}
            <div className={`label-caps text-white/25 mb-5 flex items-center gap-3 ${mounted ? 'animate-fade-slide-up stagger-1' : 'opacity-0'}`}>
              <span className="w-3 h-px" style={{ background: accentColor, opacity: 0.5 }} />
              <span className="heading-condensed" style={{ fontStyle: 'italic' }}>CHAPTER · II,</span>
              <span style={{ letterSpacing: '0.25em' }}>CHARACTERS</span>
            </div>

            <div className={`relative ${mounted ? 'animate-fade-slide-up stagger-2' : 'opacity-0'}`} style={{ minHeight: '420px' }}>

              {/* Default view: name + quote */}
              <div
                className="cursor-pointer transition-opacity duration-300"
                style={{
                  opacity: showDetail ? 0 : 1,
                  pointerEvents: showDetail ? 'none' : 'auto',
                  position: showDetail ? 'absolute' : 'relative',
                  inset: showDetail ? 0 : 'auto',
                }}
                onClick={() => setShowDetail(true)}
              >
                <p className="label-caps text-white/30 mb-2" style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}>
                  {data.nameEn}
                </p>
                <h2 className="heading-display" style={{
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  color: accentColor,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                }}>
                  {data.nameKr}
                </h2>
                <p className="heading-condensed text-white/40 mt-3 italic" style={{ fontSize: '0.85rem' }}>
                  {data.quote}
                </p>

                {/* Main quote */}
                <div className="relative mt-8 pl-4" style={{ borderLeft: `1px solid ${accentColor}40` }}>
                  <p className="text-editorial text-white/65" style={{
                    fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
                    lineHeight: 1.85,
                    fontStyle: 'italic',
                  }}>
                    {data.mainQuote}
                  </p>
                </div>

                <div className="mt-8 label-caps text-white/30 flex items-center gap-2 group" style={{ fontSize: '0.5rem', letterSpacing: '0.2em' }}>
                  <span>TAP FOR DETAILS</span>
                  <span className="text-white/20 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>

              {/* Detail view */}
              <div
                className="cursor-pointer transition-opacity duration-300"
                style={{
                  opacity: showDetail ? 1 : 0,
                  pointerEvents: showDetail ? 'auto' : 'none',
                  position: showDetail ? 'relative' : 'absolute',
                  inset: showDetail ? 'auto' : 0,
                }}
                onClick={() => setShowDetail(false)}
              >
                {/* Vitals */}
                <div className="flex items-baseline gap-5 mb-7 pb-5 sketch-jitter-line" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', filter: 'url(#sketchy)' }}>
                  {[
                    { label: '나이', value: data.age },
                    { label: '키', value: data.height },
                    { label: '몸무게', value: data.weight },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-baseline gap-2">
                      <span className="label-caps text-white/30" style={{ fontSize: '0.45rem', letterSpacing: '0.25em' }}>{item.label}</span>
                      <span className="font-serif text-white/80" style={{ fontSize: '0.95rem' }}>{item.value}</span>
                      {i < 2 && <span className="text-white/15 ml-3 select-none">·</span>}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                {data.stats && data.stats.length > 0 && (
                  <div className="mb-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="label-caps text-white/30 mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}>Stats</div>
                    <div className="space-y-3">
                      {data.stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-4">
                          <span className="text-xs text-white/45 w-14 shrink-0" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>{stat.label}</span>
                          <div className="flex-1 h-px bg-white/8 relative">
                            <div className="absolute top-[-1px] left-0 h-[3px] transition-all duration-500" style={{ width: `${stat.value * 10}%`, backgroundColor: accentColor }} />
                          </div>
                          <span className="font-display text-sm text-white/40 w-6 text-right tabular-nums">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality */}
                {data.personality.length > 0 && (
                  <div className="mb-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="label-caps text-white/30 mb-3" style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}>Personality</div>
                    <div className="flex items-baseline flex-wrap">
                      {data.personality.map((tag, i) => (
                        <span key={tag} className="flex items-baseline">
                          <span className="font-serif tracking-wide" style={{ color: accentColor, fontSize: '1.05rem' }}>{tag}</span>
                          {i < data.personality.length - 1 && (
                            <span className="mx-3 text-white/20 text-xs select-none">/</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ability */}
                {data.abilityName && (
                  <div className="mb-5">
                    <div className="label-caps text-white/30 mb-3" style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}>Ability</div>
                    <div className="font-display text-white/85 mb-2.5" style={{ fontSize: '1.15rem', fontStyle: 'italic' }}>{data.abilityName}</div>
                    {data.abilityDesc && (
                      <p className="text-editorial text-white/55 leading-[1.85] max-w-[520px]" style={{ fontSize: '0.85rem' }}>
                        {data.abilityDesc}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 label-caps text-white/30 flex items-center gap-2 group" style={{ fontSize: '0.5rem', letterSpacing: '0.2em' }}>
                  <span className="text-white/20 transition-transform group-hover:-translate-x-1">←</span>
                  <span>BACK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: big phase name watermark */}
          <div className="mt-6">
            <div className={`text-right ${mounted ? 'animate-fade-slide-up stagger-4' : 'opacity-0'}`}>
              <span className="heading-display leading-[0.85] select-none" style={{
                fontSize: 'clamp(3.5rem, 9vw, 7rem)',
                color: 'rgba(255,255,255,0.04)',
                fontStyle: 'italic',
              }}>
                {data.name.replace(/[\[\]]/g, '').trim()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`fixed bottom-3 left-0 right-0 z-[5] flex justify-between items-center ${mounted ? 'animate-fade-slide-up stagger-5' : 'opacity-0'}`}
        style={{ padding: '0 clamp(64px, 9vw, 100px)' }}>
        <span className="label-caps text-white/15" style={{ fontSize: '0.45rem', letterSpacing: '0.3em' }}>SOMBRE</span>
        <span className="heading-condensed text-white/25" style={{ fontStyle: 'italic', fontSize: '0.6rem' }}>Characters</span>
      </div>
    </div>
  )
}
