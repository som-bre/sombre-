'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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

const defaultMedia: PhaseData[] = [
  {
    id: 'media-0', symbol: '毒', label: 'PHASE 00', name: '[ 마녀 ]', quote: '" 비밀이야. "',
    nameKr: '메디아 아우렐리우스', nameEn: 'MEDIA AURELIUS',
    age: '13세', height: '143cm', weight: '37kg',
    personality: ['불가해', '냉소', '강박'],
    abilityName: '과잉 생장',
    abilityDesc: '계절과 시간을 무시하고 제멋대로 피어나는 찰나의 초록색. 가장 능숙하게 다룰 수 있는 것들은 가시덩굴과 독초들. 패널티는 어지럼증과 고열.',
    mainQuote: '"상대가 나를 멸시하면서도 나를 필요로 하게 만드는 것. 그 모순을 지배하는 게 내 힘이야."',
  },
  {
    id: 'media-1', symbol: '種', label: 'PHASE 01', name: '[ 씨앗 ]', quote: '" 신경 쓰지 마. "',
    nameKr: '메디아', nameEn: 'MEDIA',
    age: '19세', height: '172cm', weight: '68kg',
    personality: ['유기', '침묵', '균열'],
    abilityName: '과잉 생장',
    abilityDesc: '덩굴로 사람 두 명 정도를 강하게 옭아맬 수 있다. 작은 풀 정도는 순식간에 피워낼 수 있고. 그 어떤 것에도 쉽게 절단되지 않을 강도를 원하는 듯싶다.',
    mainQuote: '"모두가 나를 필요로 하게 하기 위해서. 나를 증오하고 멸시하면서도 필요로 해서, \'나\'라는 존재의 가치를 이 세상이 되새기게 하는 것."',
    stats: [{ label: '근력', value: 4 }, { label: '체력', value: 1 }, { label: '민첩', value: 5 }, { label: '이능력', value: 6 }],
  },
  {
    id: 'media-2', symbol: '長', label: 'PHASE 02', name: '[ 생장 ]', quote: '" 속죄 따윈 안 해. "',
    nameKr: '메디아', nameEn: 'MEDIA',
    age: '19세', height: '172cm', weight: '68kg',
    personality: ['유기', '침묵', '균열'],
    abilityName: '과잉 생장',
    abilityDesc: '균열난 화분이 깨져도 그것을 조각조각 맞추어 본래의 태가 나도록 만들었으니, 그 흔적만이 마음 속 깊게 남아 과거로 되돌아갈 수 없게 된다.',
    mainQuote: '"어떤 것도 나를 정확하게 표현할 수 없으나, 당신들은 내가 어떤 사람인지 알고 있으므로."',
    stats: [{ label: '근력', value: 4 }, { label: '체력', value: 1 }, { label: '민첩', value: 5 }, { label: '이능력', value: 8 }],
  },
]

const defaultSadham: PhaseData[] = [
  {
    id: 'sadham-0', symbol: '修', label: 'PHASE 00', name: '[ 修羅道 ]', quote: '" 그만. 그 이상 접근하지 마라…. "',
    nameKr: '사드함 눈', nameEn: 'SAKDĀGĀMI NOON',
    age: '11세', height: '150cm', weight: '45kg',
    personality: ['억제', '반골', '방관'],
    abilityName: '아수라 — 삼독三毒',
    abilityDesc: '세 번째 눈의 개안과 함께 삼독(탐욕, 진에, 우치)에 따른 세 가지 저주를 내릴 수 있다. 현재로서는 탐貪만 사용 가능. 문지방에 발가락을 찧게 하는 수준에 그친다.',
    mainQuote: '"힘은 진정한 나 자신을 나타내는, 가장 순수하고도 강력한 증명이라고 할 수 있을 것이다."',
  },
  {
    id: 'sadham-1', symbol: '人', label: 'PHASE 01', name: '[ 人間道 ]', quote: '" 그만. 실없는 소리를 하는군…. "',
    nameKr: '사드함 눈', nameEn: 'SAKDĀGĀMI NOON',
    age: '17세', height: '180cm', weight: '75kg',
    personality: ['억제', '비탈', '간섭'],
    abilityName: '아수라 — 삼독三毒',
    abilityDesc: '탐貪과 진瞋의 저주를 사용할 수 있다. 이능력을 일정 이상 사용할 경우, 신체의 일부가 까맣게 물들어간다.',
    mainQuote: '"나의 힘은 속죄하기 위해 존재한다. 그러니 세상이 바란다면 기꺼이 움직일 뿐이다."',
    stats: [{ label: '근력', value: 3 }, { label: '체력', value: 5 }, { label: '민첩', value: 2 }, { label: '이능력', value: 6 }],
  },
  {
    id: 'sadham-2', symbol: '鬼', label: 'PHASE 02', name: '[ 餓鬼道 ]', quote: '" 그만. 아무 것도 듣고 싶지 않다…. "',
    nameKr: '사드함 눈', nameEn: 'SAKDĀGĀMI NOON',
    age: '17세', height: '180cm', weight: '75kg',
    personality: ['억제', '혼란', '강박'],
    abilityName: '아수라 — 삼독三毒',
    abilityDesc: '혼란, 혼돈, 혼동. 여전히 온갖 번뇌에서 벗어나지 못한 채 지상에 얽매여 있는 가엾은 중생. 전투 시에는 의도적으로 말수를 줄인다.',
    mainQuote: '"돌아오지 말아라."',
    stats: [{ label: '근력', value: 3 }, { label: '체력', value: 5 }, { label: '민첩', value: 2 }, { label: '이능력', value: 6 }],
  },
]

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
    <div className="flex items-center gap-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle} className="w-7 h-7 flex items-center justify-center shrink-0 border" style={{ borderColor: `${color}40`, color }}>
        <span className="text-[9px]">{isPlaying ? '||' : '\u25B6'}</span>
      </button>
      <div className="flex-1 h-px bg-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
      <span className="label-caps text-white/25" style={{ fontSize: '0.5rem' }}>VOICE</span>
    </div>
  )
}

const menuItems = [
  { href: '/', label: '서장', chapter: 'CHAPTER ONE', en: 'Prologue', page: '01' },
  { href: '/character', label: '캐릭터', chapter: 'CHAPTER TWO', en: 'Characters', page: '03' },
  { href: '/record', label: '기록', chapter: 'CHAPTER THREE', en: 'Records', page: '05' },
  { href: '/timeline', label: '연대기', chapter: 'CHAPTER FOUR', en: 'Timeline', page: '07' },
]

export default function CharacterPage() {
  const [character, setCharacter] = useState<'media' | 'sadham'>('media')
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [mediaPhases, setMediaPhases] = useState<PhaseData[]>(defaultMedia)
  const [sadhamPhases, setSadhamPhases] = useState<PhaseData[]>(defaultSadham)
  const [showDetail, setShowDetail] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => {
        if (data?.media?.length) setMediaPhases(data.media)
        if (data?.sadham?.length) setSadhamPhases(data.sadham)
      })
      .catch(() => {})
  }, [])

  const isMedia = character === 'media'
  const phases = isMedia ? mediaPhases : sadhamPhases
  const data = phases[phaseIndex]

  const handleCharacterChange = (char: 'media' | 'sadham') => {
    setCharacter(char)
    setPhaseIndex(0)
    setShowDetail(false)
  }

  if (!data) return <div className="fixed inset-0 bg-bg" />

  const MEDIA_COLOR = '#8B1538'
  const SADHAM_COLOR = '#5E7B97'
  const accentColor = isMedia ? MEDIA_COLOR : SADHAM_COLOR

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden">

      {/* ═══ 내지 레이아웃 선 (다크 톤 — 라이트 배경에서 보임) ═══ */}
      <div className="fixed pointer-events-none z-[1]" style={{ top: 'clamp(28px, 3vw, 48px)', left: 0, right: 0, height: 0, borderTop: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ bottom: 'clamp(28px, 3vw, 48px)', left: 0, right: 0, height: 0, borderTop: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ right: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: '50%', top: 0, bottom: 0, width: 0, borderLeft: '0.5px solid rgba(20, 20, 20, 0.15)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'calc(50% - clamp(28px, 3vw, 48px))', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      <div className="fixed pointer-events-none z-[1]" style={{ left: 'calc(50% + clamp(28px, 3vw, 48px))', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(20, 20, 20, 0.1)' }} />
      {/* ═══ 내지 레이아웃 선 (라이트 톤 — 다크 배경에서 보임) ═══ */}
      <div className="fixed pointer-events-none z-[3]" style={{ top: 'clamp(28px, 3vw, 48px)', left: 0, right: 0, height: 0, borderTop: '0.5px dashed rgba(255, 255, 255, 0.1)' }} />
      <div className="fixed pointer-events-none z-[3]" style={{ bottom: 'clamp(28px, 3vw, 48px)', left: 0, right: 0, height: 0, borderTop: '0.5px dashed rgba(255, 255, 255, 0.1)' }} />
      <div className="fixed pointer-events-none z-[3]" style={{ left: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(255, 255, 255, 0.1)' }} />
      <div className="fixed pointer-events-none z-[3]" style={{ right: 'clamp(28px, 3vw, 48px)', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(255, 255, 255, 0.1)' }} />
      <div className="fixed pointer-events-none z-[3]" style={{ left: '50%', top: 0, bottom: 0, width: 0, borderLeft: '0.5px solid rgba(255, 255, 255, 0.15)' }} />
      <div className="fixed pointer-events-none z-[3]" style={{ left: 'calc(50% - clamp(28px, 3vw, 48px))', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(255, 255, 255, 0.1)' }} />
      <div className="fixed pointer-events-none z-[3]" style={{ left: 'calc(50% + clamp(28px, 3vw, 48px))', top: 0, bottom: 0, width: 0, borderLeft: '0.5px dashed rgba(255, 255, 255, 0.1)' }} />

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
            {/* 닫기 */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute -top-12 right-0 text-white/30 hover:text-white/70 transition-colors label-caps"
              style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}
            >
              CLOSE
            </button>

            {/* 제목 */}
            <div className="mb-12 text-center">
              <span className="label-caps text-white/15" style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}>TABLE OF CONTENTS</span>
            </div>

            {/* 챕터 리스트 */}
            <div className="space-y-0">
              {menuItems.map((item, i) => (
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

            {/* 하단 */}
            <div className="mt-12 text-center">
              <span className="label-caps text-white/10" style={{ fontSize: '0.45rem', letterSpacing: '0.2em' }}>SAME &middot; 毒眼經</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] h-full">

        {/* ═══ 왼쪽 컬럼: 다크 ═══ */}
        <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-between" style={{ backgroundColor: '#141414' }}>

          {/* 상단: 캐릭터 셀렉터 */}
          <div>
            <div className={`flex items-center gap-6 mb-8 ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}>
              <button
                onClick={() => handleCharacterChange('media')}
                className="label-caps transition-colors"
                style={{ color: isMedia ? MEDIA_COLOR : 'rgba(255,255,255,0.15)', fontSize: '0.6rem' }}
              >
                메디아
              </button>
              <span className="text-white/10 text-xs select-none">/</span>
              <button
                onClick={() => handleCharacterChange('sadham')}
                className="label-caps transition-colors"
                style={{ color: !isMedia ? SADHAM_COLOR : 'rgba(255,255,255,0.15)', fontSize: '0.6rem' }}
              >
                사드함 눈
              </button>
            </div>
          </div>

          {/* 중앙: 프로필 이미지 or 심볼 */}
          <div className={`flex-1 flex items-center justify-center ${mounted ? 'animate-fade-slide-up stagger-1' : 'opacity-0'}`}>
            {data.profileImage ? (
              <div className="relative w-full max-w-[320px] aspect-[3/4] overflow-hidden">
                <img src={data.profileImage} alt={data.nameKr} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#141414] to-transparent" />
              </div>
            ) : (
              <span className="font-display select-none text-[clamp(10rem,22vw,18rem)] leading-none" style={{ color: 'rgba(255,255,255,0.03)' }}>
                {data.symbol}
              </span>
            )}
          </div>

          {/* 하단: 페이즈 탭 + 이름 + 인용 */}
          <div>
            {/* 페이즈 탭 */}
            <div className={`flex items-center gap-4 mb-4 ${mounted ? 'animate-fade-slide-up stagger-3' : 'opacity-0'}`}>
              {phases.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setPhaseIndex(i); setShowDetail(false) }}
                  className="label-caps transition-colors"
                  style={{
                    color: phaseIndex === i ? accentColor : 'rgba(255,255,255,0.15)',
                    fontSize: '0.55rem',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 이름 + 인용 */}
            <div className={`mb-4 ${mounted ? 'animate-fade-slide-up stagger-4' : 'opacity-0'}`}>
              <p className="label-caps text-white/30 mb-1" style={{ fontSize: '0.55rem' }}>{data.nameEn}</p>
              <h2 className="heading-display text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.1]" style={{ color: '#EFEFEF' }}>
                {data.nameKr}
              </h2>
              <p className="heading-condensed text-white/25 text-sm mt-2">{data.quote}</p>
            </div>

            {/* 보이스 플레이어 */}
            {data.voiceFile && (
              <div className={`mb-4 ${mounted ? 'animate-fade-slide-up stagger-5' : 'opacity-0'}`}>
                <VoicePlayer src={data.voiceFile} color={accentColor} />
              </div>
            )}

            {/* 페이지 번호 */}
            <div className="pt-4 border-t border-white/6 flex items-center h-7">
              <span className="label-caps text-white/20" style={{ fontSize: '0.55rem', letterSpacing: '0.15em' }}>03</span>
            </div>
          </div>
        </div>

        {/* ═══ 오른쪽 컬럼: 라이트 ═══ */}
        <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-between overflow-hidden">

          {/* 상단: 챕터 라벨 */}
          <div>
            <div className={`label-caps text-ink/20 mb-6 flex items-center gap-3 ${mounted ? 'animate-fade-slide-up stagger-2' : 'opacity-0'}`}>
              <span className="w-3 h-px" style={{ background: accentColor, opacity: 0.3 }} />
              <span className="heading-condensed" style={{ fontStyle: 'italic' }}>CHAPTER TWO,</span> CHARACTERS
            </div>

            {/* 캐릭터 정보 */}
            <div className={`${mounted ? 'animate-fade-slide-up stagger-3' : 'opacity-0'}`}>

              {/* 기본 뷰: 이름 + 인용문 */}
              <div
                className="transition-opacity duration-300 cursor-pointer"
                style={{ opacity: showDetail ? 0 : 1, pointerEvents: showDetail ? 'none' : 'auto', position: showDetail ? 'absolute' : 'relative' }}
                onClick={() => setShowDetail(true)}
              >
                <div className="mb-6">
                  <h2 className="heading-display text-[clamp(2rem,4vw,3.2rem)] leading-[1.05]" style={{ color: accentColor }}>
                    {data.nameEn}
                  </h2>
                </div>

                <div className="relative pl-6 mb-8">
                  <p className="heading-condensed text-[clamp(1rem,1.8vw,1.3rem)] text-ink/45 leading-[1.7]">{data.mainQuote}</p>
                </div>

                <div className="label-caps text-ink/15 flex items-center gap-2" style={{ fontSize: '0.5rem' }}>
                  <span>TAP FOR DETAILS</span>
                  <span className="text-ink/10">→</span>
                </div>
              </div>

              {/* 상세 뷰: Vitals, Stats, Personality, Ability */}
              <div
                className="transition-opacity duration-300 cursor-pointer"
                style={{ opacity: showDetail ? 1 : 0, pointerEvents: showDetail ? 'auto' : 'none', position: showDetail ? 'relative' : 'absolute' }}
                onClick={() => setShowDetail(false)}
              >
                {/* Vitals */}
                <div className="flex items-baseline gap-6 mb-8 pb-6 border-b border-ink/6">
                  {[
                    { label: '나이', value: data.age },
                    { label: '키', value: data.height },
                    { label: '몸무게', value: data.weight },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-baseline gap-2">
                      <span className="label-caps text-ink/20">{item.label}</span>
                      <span className="font-serif text-base text-ink/70">{item.value}</span>
                      {i < 2 && <span className="text-ink/10 ml-4 select-none">&middot;</span>}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                {data.stats && (
                  <div className="mb-8 pb-6 border-b border-ink/6">
                    <div className="label-caps text-ink/20 mb-4">Stats</div>
                    <div className="space-y-3">
                      {data.stats.map((stat) => (
                        <div key={stat.label} className="flex items-center gap-4">
                          <span className="font-body text-xs text-ink/40 w-14 shrink-0">{stat.label}</span>
                          <div className="flex-1 h-px bg-ink/6 relative">
                            <div className="absolute top-[-1px] left-0 h-[3px] transition-all duration-500" style={{ width: `${stat.value * 10}%`, backgroundColor: accentColor }} />
                          </div>
                          <span className="font-display text-sm text-ink/30 w-6 text-right tabular-nums">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality */}
                <div className="mb-8 pb-6 border-b border-ink/6">
                  <div className="label-caps text-ink/20 mb-4">Personality</div>
                  <div className="flex items-baseline flex-wrap">
                    {data.personality.map((tag, i) => (
                      <span key={tag} className="flex items-baseline">
                        <span className="font-serif text-lg tracking-wide" style={{ color: accentColor }}>{tag}</span>
                        {i < data.personality.length - 1 && (
                          <span className="mx-4 text-ink/10 font-body text-xs select-none">/</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ability */}
                <div className="mb-6">
                  <div className="label-caps text-ink/20 mb-4">Ability</div>
                  <div className="font-display text-xl text-ink/75 mb-3">{data.abilityName}</div>
                  <p className="text-editorial text-sm text-ink/45 leading-[1.9] max-w-[520px]">{data.abilityDesc}</p>
                </div>

                <div className="label-caps text-ink/15 flex items-center gap-2" style={{ fontSize: '0.5rem' }}>
                  <span>← BACK</span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단: 큰 페이즈명 + 페이지 번호 */}
          <div>
            <div className={`text-right mb-4 ${mounted ? 'animate-fade-slide-up stagger-5' : 'opacity-0'}`}>
              <span className="heading-display text-[clamp(4.5rem,12vw,9rem)] leading-[0.85] text-ink/[0.04]" style={{ fontStyle: 'italic' }}>
                {data.name.replace(/[\[\]]/g, '').trim()}
              </span>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 h-7">
              <span className="label-caps text-ink/25" style={{ fontSize: '0.55rem', letterSpacing: '0.15em' }}>04</span>
              <span className="text-ink/15" style={{ fontSize: '0.5rem' }}>/</span>
              <span className="heading-condensed text-ink/25" style={{ fontSize: '0.6rem', fontStyle: 'italic' }}>Characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
