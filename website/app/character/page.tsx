'use client'

import { useState } from 'react'

interface CharacterData {
  symbol: string
  name: string
  nameEn: string
  subtitle: string
  quote: string
  profile: {
    birth: string
    gender: string
    blood: string
    school: string
    house: string
    wand: string
    job: string
    spouse: string
    child: string
  }
}

const manonData: CharacterData = {
  symbol: '♠',
  name: '마농 브레슈',
  nameEn: 'MANON BRESCH',
  subtitle: '추모, 사랑했던 지젤을 위하여.',
  quote: '"⋯그래. 뛰고 있어."',
  profile: {
    birth: '1972년 1월 24일\n영국 버밍엄',
    gender: '시스젠더 여성',
    blood: '혼혈',
    school: '호그와트 마법학교',
    house: '슬리데린',
    wand: '서어나무, 불사조 깃털, 11인치',
    job: '파리 오페라 발레단',
    spouse: '딜런 토리 섬너',
    child: '루드베키아 섬너',
  },
}

const dylanData: CharacterData = {
  symbol: '♣',
  name: '딜런 토리 섬너',
  nameEn: 'DYLAN TORY SUMNER',
  subtitle: 'WIZARD',
  quote: '"가슴에 손을 얹어. ——심장이 뛰나?"',
  profile: {
    birth: '1972년 5월 3일\n영국 런던',
    gender: '시스젠더 남성',
    blood: '머글 태생',
    school: '호그와트 마법학교',
    house: '그리핀도르',
    wand: '흑단, 용의 심근, 11인치',
    job: '지팡이 장인 견습생',
    spouse: '마농 브레슈(섬너)',
    child: '루드베키아 섬너',
  },
}

export default function CharacterPage() {
  const [character, setCharacter] = useState<'manon' | 'dylan'>('manon')

  const data = character === 'manon' ? manonData : dylanData
  const isManon = character === 'manon'

  // 색상 상수
  const MANON_COLOR = '#ff99bb'
  const MANON_BG = 'rgba(255, 153, 187, 0.1)'
  const DYLAN_COLOR = '#8888aa'
  const DYLAN_BG = 'rgba(136, 136, 170, 0.1)'

  const activeColor = isManon ? MANON_COLOR : DYLAN_COLOR
  const activeBg = isManon ? MANON_BG : DYLAN_BG

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-20 md:pb-0">
      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-x-[-10vw] top-[-20vh] h-[55vh] opacity-70 transition-all duration-500"
          style={{
            background: isManon
              ? `radial-gradient(120% 90% at 50% 0%, rgba(255,153,187,0.3) 0%, transparent 60%)`
              : `radial-gradient(120% 90% at 50% 0%, rgba(136,136,170,0.2) 0%, transparent 60%)`,
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-10 relative z-10">
        
        {/* 캐릭터 선택 탭 */}
        <div className="flex gap-1.5 mb-6 pb-4 border-b border-white/[0.06]">
          <button
            onClick={() => setCharacter('manon')}
            className={`px-5 py-2 text-sm font-medium transition-all rounded-lg ${
              isManon
                ? `bg-[#ff99bb] text-black`
                : 'bg-transparent border border-white/12 text-white/45 hover:text-white/70 hover:border-white/20'
            }`}
          >
            마농 브레슈
          </button>
          <button
            onClick={() => setCharacter('dylan')}
            className={`px-5 py-2 text-sm font-medium transition-all rounded-lg ${
              !isManon
                ? `bg-[#8888aa] text-white`
                : 'bg-transparent border border-white/12 text-white/45 hover:text-white/70 hover:border-white/20'
            }`}
          >
            딜런 토리 섬너
          </button>
        </div>

        {/* 프로필 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          
          {/* 왼쪽: 캐릭터 비주얼 */}
          <div
            className="relative h-[500px] border border-white/[0.05] flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(to bottom, ${activeBg}, rgba(26,26,28,0.35))`
            }}
          >
            {/* 장식 코너 */}
            <div className="absolute top-3 left-3 w-5 h-5 border-l border-t opacity-30" style={{ borderColor: activeColor }} />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b opacity-30" style={{ borderColor: activeColor }} />
            
            <span className="text-[10rem] text-white/[0.035] font-serif select-none">
              {data.symbol}
            </span>
            
            <div className="absolute top-4 left-4 font-mono text-[0.65rem] text-white/25 tracking-[0.08em]">
              {isManon ? 'SLYTHERIN' : 'GRYFFINDOR'}
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="font-accent text-base text-white/65 mb-1">{data.subtitle}</div>
              <div className="font-accent text-sm text-white/35">{data.quote}</div>
            </div>
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="space-y-5">
            
            {/* 기본 정보 */}
            <div className="pb-5 border-b border-white/[0.05]">
              <h2 className="text-2xl font-semibold mb-1 transition-colors" style={{ color: activeColor }}>
                {data.name}
              </h2>
              <p className="font-mono text-xs text-white/30 tracking-[0.1em] mb-4">{data.nameEn}</p>
            </div>

            {/* 프로필 카드 */}
            <div 
              className="p-5 rounded-xl border border-white/[0.06] transition-all"
              style={{ background: activeBg }}
            >
              <h3 className="font-mono text-[0.65rem] text-white/35 tracking-[0.08em] mb-4">PROFILE</h3>
              <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-sm">
                {[
                  { label: '출생', value: data.profile.birth },
                  { label: '성별', value: data.profile.gender },
                  { label: '혈통', value: data.profile.blood },
                  { label: '학력', value: data.profile.school },
                  { label: '기숙사', value: data.profile.house },
                  { label: '지팡이', value: data.profile.wand },
                  { label: '현직', value: data.profile.job },
                  { label: '배우자', value: data.profile.spouse },
                  { label: '자식', value: data.profile.child },
                ].map((item) => (
                  <>
                    <dt key={`dt-${item.label}`} className="text-white/40 text-xs flex items-start">
                      {item.label}
                      <span className="ml-auto opacity-50">·</span>
                    </dt>
                    <dd key={`dd-${item.label}`} className="text-white/80 whitespace-pre-line">
                      {item.value}
                    </dd>
                  </>
                ))}
              </dl>
            </div>

            {/* 메뉴 섹션 */}
            <div className="space-y-2">
              <h3 className="font-mono text-[0.65rem] text-white/35 tracking-[0.08em] mb-3">MENU</h3>
              {['예언자일보', '호그스미드 상점', '마법약 상점', '창고'].map((menu) => (
                <button
                  key={menu}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/70 text-sm hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                >
                  <span>{menu}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: activeColor }}>→</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/[0.04] mt-12">
        <span className="font-mono text-sm tracking-[0.15em]" style={{ color: MANON_COLOR }}>✦ Sombre</span>
        <p className="font-accent text-[0.82rem] text-white/35 mt-2">
          마농 브레슈 × 딜런 토리 섬너
        </p>
      </footer>
    </div>
  )
}
