'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface BodyPart {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  dialogue: string
  points?: [number, number][]
}

interface GameSection {
  characterImage?: string
  parts: BodyPart[]
}

export default function ForewordPage() {
  const router = useRouter()
  const [data, setData] = useState<GameSection | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activePart, setActivePart] = useState<BodyPart | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/game-dialogues')
      .then(r => r.json())
      .then(d => { if (d?.foreword) setData(d.foreword) })
      .catch(() => {})
  }, [])

  const handlePartClick = (part: BodyPart) => {
    if (typingRef.current) clearInterval(typingRef.current)

    setActivePart(part)
    setDisplayedText('')
    setIsTyping(true)

    let i = 0
    typingRef.current = setInterval(() => {
      if (i < part.dialogue.length) {
        setDisplayedText(part.dialogue.slice(0, i + 1))
        i++
      } else {
        if (typingRef.current) clearInterval(typingRef.current)
        setIsTyping(false)
      }
    }, 30)
  }

  const skipTyping = () => {
    if (isTyping && activePart) {
      if (typingRef.current) clearInterval(typingRef.current)
      setDisplayedText(activePart.dialogue)
      setIsTyping(false)
    }
  }

  useEffect(() => {
    return () => { if (typingRef.current) clearInterval(typingRef.current) }
  }, [])

  const ACCENT = '#8B1538'

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden">
      {/* 배경 선 */}
      <div className="fixed pointer-events-none z-[1]" style={{ top: 'clamp(28px, 3vw, 48px)', left: 0, right: 0, height: 0, borderTop: '0.5px dashed rgba(20,20,20,0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ bottom: 'clamp(28px, 3vw, 48px)', left: 0, right: 0, height: 0, borderTop: '0.5px dashed rgba(20,20,20,0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20,20,20,0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ right: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20,20,20,0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: '50%', top: 0, bottom: 0, width: 0, borderLeft: '0.5px solid rgba(20,20,20,0.15)' }} />

      {/* 뒤로가기 */}
      <button onClick={() => router.push('/')}
        className={`fixed z-[10] label-caps text-ink/30 hover:text-ink/70 transition-colors ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ top: 'clamp(36px, 4vw, 56px)', left: 'clamp(36px, 4vw, 56px)', fontSize: '0.55rem', letterSpacing: '0.15em' }}>
        ← BACK
      </button>

      {/* 메인 레이아웃 */}
      <div className="h-full w-full flex" style={{ padding: 'clamp(28px, 3vw, 48px)' }}>

        {/* 좌측: 캐릭터 이미지 + 부위 */}
        <div className={`flex-1 flex items-center justify-center ${mounted ? 'animate-fade-slide-up stagger-1' : 'opacity-0'}`}>
          {data?.characterImage ? (
            <div className="relative max-h-[80vh] max-w-[40vw]">
              <img src={data.characterImage} alt="Media" className="max-h-[80vh] max-w-full object-contain" />

              {/* SVG 다각형 클릭 영역 (투명) */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {data.parts.map((part) => {
                  const pts = part.points && part.points.length >= 3 ? part.points : null
                  if (!pts) return null
                  return (
                    <polygon key={part.id}
                      points={pts.map(p => `${p[0]},${p[1]}`).join(' ')}
                      fill="transparent"
                      stroke="transparent"
                      onClick={() => handlePartClick(part)}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                })}
              </svg>
            </div>
          ) : (
            <div className="text-center">
              <p className="heading-condensed text-ink/20" style={{ fontStyle: 'italic', fontSize: 'clamp(1rem, 1.5vw, 1.4rem)' }}>
                No character image set.
              </p>
              <p className="text-ink/10 text-xs mt-2">Admin에서 캐릭터 이미지와 부위를 설정하세요.</p>
            </div>
          )}
        </div>

        {/* 우측: 대사 영역 */}
        <div className={`flex-1 flex flex-col justify-center ${mounted ? 'animate-fade-slide-up stagger-2' : 'opacity-0'}`}
          style={{ paddingLeft: 'clamp(40px, 5vw, 80px)', paddingRight: 'clamp(20px, 3vw, 40px)' }}>

          {/* 타이틀 */}
          <div style={{ marginBottom: 'clamp(24px, 3vw, 48px)' }}>
            <span className="label-caps text-ink/15" style={{ fontSize: '0.5rem', letterSpacing: '0.2em' }}>FOREWORD</span>
            <h1 className="heading-display leading-tight" style={{
              fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
              color: ACCENT,
              letterSpacing: '-0.03em',
              marginTop: '4px',
            }}>
              Media
            </h1>
            <p className="heading-condensed text-ink/30 mt-1" style={{
              fontStyle: 'italic',
              fontSize: 'clamp(0.9rem, 1.3vw, 1.2rem)',
            }}>
              Aurelius
            </p>
          </div>

          {/* 대사 박스 */}
          {activePart ? (
            <div className="relative" onClick={skipTyping}>
              <div className="mb-2 flex items-center gap-2">
                <span className="w-3 h-px" style={{ background: ACCENT, opacity: 0.4 }} />
                <span className="label-caps" style={{ fontSize: '0.5rem', color: ACCENT, opacity: 0.6, letterSpacing: '0.1em' }}>
                  {activePart.label}
                </span>
              </div>
              <div className="relative" style={{ minHeight: '80px' }}>
                <p className="text-editorial text-ink/75 leading-[1.9]" style={{
                  fontSize: 'clamp(0.95rem, 1.3vw, 1.15rem)',
                }}>
                  {displayedText}
                  {isTyping && <span className="inline-block w-[2px] h-[1em] ml-0.5 animate-pulse" style={{ background: ACCENT, verticalAlign: 'text-bottom' }} />}
                </p>
              </div>
              {!isTyping && (
                <p className="mt-4 label-caps text-ink/15 animate-fade-in" style={{ fontSize: '0.45rem', letterSpacing: '0.15em' }}>
                  Click another part to continue
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="heading-condensed text-ink/20" style={{ fontStyle: 'italic', fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>
                {data?.parts && data.parts.length > 0
                  ? 'Click on the character to begin.'
                  : 'No dialogues configured yet.'}
              </p>
            </div>
          )}

          {/* 스페이서 */}
          <div style={{ height: 'clamp(40px, 6vw, 80px)' }} />
        </div>
      </div>

      {/* 하단 페이지 번호 */}
      <div className={`fixed bottom-0 left-0 right-0 flex justify-end px-8 ${mounted ? 'animate-fade-slide-up stagger-4' : 'opacity-0'}`}
        style={{ paddingBottom: 'clamp(12px, 1.5vw, 20px)' }}>
        <div className="flex items-center gap-2">
          <span className="label-caps text-ink/25" style={{ fontSize: '0.5rem', letterSpacing: '0.15em' }}>F</span>
          <span className="text-ink/15" style={{ fontSize: '0.45rem' }}>/</span>
          <span className="heading-condensed text-ink/25" style={{ fontSize: '0.55rem', fontStyle: 'italic' }}>Foreword</span>
        </div>
      </div>
    </div>
  )
}
