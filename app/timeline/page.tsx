'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const menuItems = [
  { href: '/', label: '서장', chapter: 'CHAPTER ONE', en: 'Prologue', page: '01' },
  { href: '/character', label: '캐릭터', chapter: 'CHAPTER TWO', en: 'Characters', page: '03' },
  { href: '/record', label: '기록', chapter: 'CHAPTER THREE', en: 'Records', page: '05' },
  { href: '/timeline', label: '연대기', chapter: 'CHAPTER FOUR', en: 'Timeline', page: '07' },
]

export default function TimelinePage() {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const events = [
    {
      era: '0차',
      title: '대화1',
      period: '11—13',
      desc: '가나다라마바사',
    },
    {
      era: '0차',
      title: '대화2',
      period: '11—13',
      desc: '가나다라마바사',
    },
    {
      era: '???',
      title: 'To be continued',
      desc: '가나다라마바사',
      future: true,
    },
  ]

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden">

      {/* ═══ 내지 레이아웃 선 (세로만) ═══ */}
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ right: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: '50%', top: 0, bottom: 0, width: 0, borderLeft: '0.5px solid rgba(20, 20, 20, 0.15)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'calc(50% - clamp(28px, 3vw, 48px))', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'calc(50% + clamp(28px, 3vw, 48px))', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />

      {/* ═══ 햄버거 메뉴 버튼 ═══ */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-5 right-5 z-[80] w-9 h-9 flex flex-col items-center justify-center gap-[5px] group"
        aria-label="Menu"
      >
        <span className="block w-5 h-px bg-ink/30 group-hover:bg-ink/60 transition-colors" />
        <span className="block w-5 h-px bg-ink/30 group-hover:bg-ink/60 transition-colors" />
        <span className="block w-5 h-px bg-ink/30 group-hover:bg-ink/60 transition-colors" />
      </button>

      {/* ═══ 챕터 메뉴 오버레이 ═══ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-[#141414]/95 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg px-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute -top-12 right-0 text-white/30 hover:text-white/70 transition-colors label-caps"
              style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}
            >
              CLOSE
            </button>
            <div className="mb-12 text-center">
              <span className="label-caps text-white/15" style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}>TABLE OF CONTENTS</span>
            </div>
            <div className="space-y-0">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group block py-5 border-b border-white/[0.06] first:border-t transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <div className="flex items-baseline gap-5">
                      <span className="label-caps text-white/15 shrink-0" style={{ fontSize: '0.45rem', letterSpacing: '0.15em', minWidth: '1.5rem' }}>
                        {item.page}
                      </span>
                      <div>
                        <span className="heading-condensed text-white/25 text-xs" style={{ fontStyle: 'italic', letterSpacing: '0.08em' }}>
                          {item.chapter}
                        </span>
                        <h3 className="heading-display text-[clamp(1.3rem,3vw,1.8rem)] text-white/80 group-hover:text-white transition-colors leading-tight mt-1">
                          {item.label}
                        </h3>
                      </div>
                    </div>
                    <span className="heading-condensed text-white/15 text-sm shrink-0" style={{ fontStyle: 'italic' }}>
                      {item.en}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12 text-center">
              <span className="label-caps text-white/10" style={{ fontSize: '0.45rem', letterSpacing: '0.2em' }}>SAME &middot; 毒眼經</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 메인 컨텐츠 ═══ */}
      <div className="h-full w-full flex flex-col" style={{
        padding: 'clamp(28px, 3vw, 48px)',
      }}>

        <div className="flex-1 flex min-h-0" style={{
          paddingTop: 'clamp(28px, min(3vw, 5vh), 48px)',
        }}>

          {/* ── 왼쪽 페이지 ── */}
          <div className="flex-1 flex flex-col min-h-0" style={{ paddingLeft: 'clamp(6px, 0.8vw, 14px)', paddingRight: 'clamp(28px, 3vw, 48px)' }}>

            <div className={mounted ? 'animate-fade-slide-up' : 'opacity-0'} style={{ marginBottom: 'clamp(12px, min(2vw, 3.2vh), 28px)' }}>
              <span className="heading-condensed text-ink/30" style={{
                fontSize: 'clamp(1rem, min(1.5vw, 2.4vh), 1.5rem)',
                letterSpacing: '-0.02em',
              }}>
                Chapter 04
              </span>
            </div>

            <div className={mounted ? 'animate-fade-slide-up stagger-1' : 'opacity-0'}>
              <h1 className="heading-display text-ink leading-[0.92]" style={{
                fontSize: 'clamp(2.5rem, min(5vw, 8vh), 4.5rem)',
                letterSpacing: '-0.03em',
                marginBottom: 'clamp(4px, 0.5vw, 10px)',
              }}>
                Timeline
              </h1>
              <p className="heading-condensed text-ink/35" style={{
                fontSize: 'clamp(1rem, min(1.8vw, 2.9vh), 1.5rem)',
              }}>
                인과의 수레바퀴
              </p>
            </div>

            <div className="flex-1" />

            <div className={mounted ? 'animate-fade-slide-up stagger-3' : 'opacity-0'}>
              <span className="heading-display text-ink/[0.03] leading-[0.85] block text-right" style={{
                fontSize: 'clamp(4rem, min(10vw, 13vh), 9rem)',
                fontStyle: 'italic',
              }}>
                연대기
              </span>
            </div>
          </div>

          {/* ── 오른쪽 페이지 ── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ paddingLeft: 'clamp(40px, 5vw, 80px)', paddingRight: 'clamp(6px, 0.8vw, 14px)' }}>

            <div className={`label-caps text-ink/20 mb-6 flex items-center gap-3 ${mounted ? 'animate-fade-slide-up stagger-1' : 'opacity-0'}`}>
              <span className="w-3 h-px bg-crimson/30" />
              <span className="heading-condensed" style={{ fontStyle: 'italic' }}>CHAPTER FOUR,</span> TIMELINE
            </div>

            <div className={`flex-1 overflow-y-auto min-h-0 pr-2 ${mounted ? 'animate-fade-slide-up stagger-2' : 'opacity-0'}`}>
              <div className="relative">
                {events.map((event, index) => (
                  <div key={index} className={`flex gap-5 ${index < events.length - 1 ? 'pb-8' : ''} ${event.future ? 'opacity-40' : ''}`}>
                    <div className="shrink-0 w-14 text-right pt-0.5">
                      <div className="label-caps text-crimson mb-0.5" style={{ fontSize: '0.55rem' }}>
                        {event.era}
                      </div>
                      {event.period && (
                        <div className="text-[10px] text-ink/25 font-body">
                          {event.period}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <div
                        className="absolute left-0 top-[5px] w-[5px] h-[5px] -translate-x-[2.5px]"
                        style={{
                          background: event.future ? 'transparent' : '#8B1538',
                          border: event.future ? '1px solid rgba(45,45,45,0.2)' : 'none',
                        }}
                      />
                      <div className="pl-4 border-l border-ink/[0.06]">
                        <h3 className={`font-display text-lg leading-tight mb-1.5 ${
                          event.future ? 'heading-condensed text-ink/30' : 'text-ink'
                        }`}>
                          {event.title}
                        </h3>
                        <p className="font-serif text-sm text-ink/45 leading-relaxed" style={{ textIndent: event.future ? '0' : '1em' }}>
                          {event.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 하단 페이지 번호 ═══ */}
        <div className={`shrink-0 flex ${mounted ? 'animate-fade-slide-up stagger-4' : 'opacity-0'}`} style={{
          paddingBottom: 'clamp(4px, 0.5vw, 10px)',
          paddingTop: 'clamp(8px, 1vw, 16px)',
        }}>
          <div className="flex-1" style={{ paddingLeft: 'clamp(6px, 0.8vw, 14px)' }}>
            <span className="label-caps text-ink/25" style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.6rem)', letterSpacing: '0.15em' }}>07</span>
          </div>
          <div className="flex-1 flex justify-end items-center gap-1.5" style={{ paddingRight: 'clamp(6px, 0.8vw, 14px)' }}>
            <span className="label-caps text-ink/25" style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.6rem)', letterSpacing: '0.15em' }}>08</span>
            <span className="text-ink/15" style={{ fontSize: 'clamp(0.45rem, 0.6vw, 0.55rem)' }}>/</span>
            <span className="heading-condensed text-ink/25" style={{ fontSize: 'clamp(0.55rem, 0.8vw, 0.65rem)', fontStyle: 'italic' }}>Timeline</span>
          </div>
        </div>
      </div>
    </div>
  )
}
