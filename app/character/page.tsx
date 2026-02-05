'use client'

import { useState } from 'react'

interface CharacterData {
  name: string
  nameEn: string
  subtitle: string
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

const manonData: CharacterData = {
  name: '마농 브레슈',
  nameEn: 'MANON BRESCH',
  subtitle: '추모, 사랑했던 지젤을 위하여.',
  birth: '1972년 1월 24일, 영국 버밍엄',
  gender: '시스젠더 여성',
  blood: '혼혈',
  school: '호그와트 마법학교',
  house: '슬리데린',
  wand: '서어나무, 불사조 깃털, 11인치',
  job: '파리 오페라 발레단',
  spouse: '딜런 토리 섬너',
  child: '루드베키아 섬너',
}

const dylanData: CharacterData = {
  name: '딜런 토리 섬너',
  nameEn: 'DYLAN TORY SUMNER',
  subtitle: 'WIZARD',
  birth: '1972년 5월 3일, 영국 런던',
  gender: '시스젠더 남성',
  blood: '머글 태생',
  school: '호그와트 마법학교',
  house: '그리핀도르',
  wand: '흑단, 용의 심근, 11인치',
  job: '지팡이 장인 견습생',
  spouse: '마농 브레슈(섬너)',
  child: '루드베키아 섬너',
}

export default function CharacterPage() {
  const [character, setCharacter] = useState<'manon' | 'dylan'>('manon')
  
  const data = character === 'manon' ? manonData : dylanData
  const isManon = character === 'manon'

  // 색상 상수
  const MANON_COLOR = '#ff99bb'
  const MANON_BG = 'rgba(255, 153, 187, 0.12)'
  const DYLAN_COLOR = '#8888aa'
  const DYLAN_BG = 'rgba(42, 42, 47, 0.5)'

  const accentColor = isManon ? MANON_COLOR : DYLAN_COLOR
  const accentBg = isManon ? MANON_BG : DYLAN_BG

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-20 md:pb-0">
      {/* Aura 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-x-[-10vw] top-[-20vh] h-[55vh] opacity-70 transition-all duration-700"
          style={{
            background: isManon 
              ? `radial-gradient(120% 90% at 50% 0%, rgba(255,153,187,0.15) 0%, transparent 60%),
                 radial-gradient(120% 90% at 90% 10%, rgba(255,204,221,0.1) 0%, transparent 60%)`
              : `radial-gradient(120% 90% at 50% 0%, rgba(42,42,47,0.3) 0%, transparent 60%),
                 radial-gradient(120% 90% at 90% 10%, rgba(136,136,170,0.1) 0%, transparent 60%)`,
            filter: 'blur(40px) saturate(110%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)'
          }}
        />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-10 relative z-10">
        
        {/* 캐릭터 선택 탭 */}
        <div className="flex gap-1.5 mb-8 pb-4 border-b border-white/[0.06]">
          <button
            onClick={() => setCharacter('manon')}
            className={`px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg ${
              isManon
                ? 'bg-[#ff99bb] text-black shadow-[0_0_20px_rgba(255,153,187,0.3)]'
                : 'bg-transparent border border-white/12 text-white/45 hover:text-white/70 hover:border-white/20'
            }`}
          >
            마농 브레슈
          </button>
          <button
            onClick={() => setCharacter('dylan')}
            className={`px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg ${
              !isManon
                ? 'bg-[#2a2a2f] text-white border border-[#8888aa]/50 shadow-[0_0_20px_rgba(136,136,170,0.2)]'
                : 'bg-transparent border border-white/12 text-white/45 hover:text-white/70 hover:border-white/20'
            }`}
          >
            딜런 토리 섬너
          </button>
        </div>

        {/* 프로필 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          
          {/* 왼쪽: 캐릭터 비주얼 */}
          <div
            className="relative h-[500px] border border-white/[0.05] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500"
            style={{
              background: isManon 
                ? 'linear-gradient(to bottom, rgba(255,153,187,0.08), rgba(26,26,28,0.5))'
                : 'linear-gradient(to bottom, rgba(42,42,47,0.3), rgba(17,17,17,0.8))'
            }}
          >
            {/* 장식 코너 */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l border-t opacity-30 transition-colors duration-500"
              style={{ borderColor: accentColor }} />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b opacity-30 transition-colors duration-500"
              style={{ borderColor: accentColor }} />
            
            {/* 이미지 영역 */}
            <div className="text-center">
              <div 
                className="w-48 h-48 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl transition-all duration-500"
                style={{ 
                  background: `linear-gradient(145deg, ${accentBg}, rgba(26,26,28,0.8))`,
                  border: `1px solid ${accentColor}30`
                }}
              >
                {isManon ? '🩰' : '✨'}
              </div>
              <p className="text-white/30 text-sm">이미지 준비중</p>
            </div>

            {/* 하단 정보 */}
            <div className="absolute bottom-4 left-4 right-4">
              <div 
                className="font-medium text-base mb-1 transition-colors duration-500"
                style={{ color: accentColor }}
              >
                {data.subtitle}
              </div>
            </div>
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="space-y-5">
            
            {/* 기본 정보 */}
            <div className="pb-5 border-b border-white/[0.05]">
              <h2 
                className="text-2xl font-semibold mb-1 transition-colors duration-500"
                style={{ color: accentColor }}
              >
                {data.name}
              </h2>
              <p className="font-mono text-xs text-white/30 tracking-[0.1em] mb-5">{data.nameEn}</p>
            </div>

            {/* 프로필 카드 */}
            <div 
              className="rounded-xl p-5 border transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${accentBg}, transparent)`,
                borderColor: `${accentColor}20`
              }}
            >
              {/* 장식 점 */}
              <div 
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: accentColor }}
              />
              
              <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
                <dt className="text-white/40 relative">
                  출생
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.birth}</dd>
                
                <dt className="text-white/40 relative">
                  성별
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.gender}</dd>
                
                <dt className="text-white/40 relative">
                  혈통
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.blood}</dd>
                
                <dt className="text-white/40 relative">
                  학력
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.school}</dd>
                
                <dt className="text-white/40 relative">
                  기숙사
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd 
                  className="font-medium transition-colors duration-500"
                  style={{ color: accentColor }}
                >
                  {data.house}
                </dd>
                
                <dt className="text-white/40 relative">
                  지팡이
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.wand}</dd>
                
                <dt className="text-white/40 relative">
                  현직
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.job}</dd>
                
                <dt className="text-white/40 relative">
                  배우자
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.spouse}</dd>
                
                <dt className="text-white/40 relative">
                  자식
                  <span className="absolute right-0 opacity-50" style={{ color: accentColor }}>·</span>
                </dt>
                <dd className="text-white/80">{data.child}</dd>
              </div>
            </div>

            {/* 추가 정보 박스 */}
            <div 
              className="p-4 rounded-lg border-l-2 transition-all duration-500"
              style={{ 
                borderColor: accentColor,
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <p className="text-sm text-white/60 leading-relaxed">
                {isManon 
                  ? '"추모, 사랑했던 지젤을 위하여." — 무대 위에서 빛나는 그녀의 춤은 언제나 누군가를 향한 헌사였다.'
                  : '"마법은 손끝에서 시작된다." — 지팡이를 만드는 그의 손에는 수많은 이야기가 새겨져 있다.'
                }
              </p>
            </div>

            {/* 외부 프로필 링크 */}
            <div className="flex gap-3 pt-2">
              <a
                href={isManon 
                  ? "https://docs.google.com/document/d/1Q4nNE-ESOTDQUPEtC36y0b58E99Py-1C4hvxOtvtYUA/edit?tab=t.0"
                  : "https://docs.google.com/document/d/1djINFQxXX9OSU4M8lBANnxo8TPKwewQdagpyh2BTkFQ/edit?usp=drivesdk"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-mono rounded-lg border transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  borderColor: `${accentColor}50`,
                  color: accentColor,
                  background: `${accentColor}10`
                }}
              >
                상세 프로필 보기 →
              </a>
              <a
                href={isManon 
                  ? "https://docs.google.com/document/d/1re3SEMq6ah7HJhfb6BjreefarrIPyyt0RV1ON_om-Rk/edit?usp=sharing"
                  : "https://docs.google.com/document/d/1xecrEgOP8_gghaTtOhyDaODi960I6JC9sjtzBUKDaM0/edit?usp=sharing"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-mono rounded-lg border border-white/20 text-white/50 hover:text-white/70 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                7학년 프로필 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
