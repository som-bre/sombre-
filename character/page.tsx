'use client'

import { useState } from 'react'

type Phase = 'media-0' | 'media-1' | 'media-2' | 'sadham-0' | 'sadham-1' | 'sadham-2'

interface PhaseData {
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
}

const mediaData: Record<string, PhaseData> = {
  'media-0': {
    symbol: '毒',
    label: 'PHASE 00',
    name: '[ 마녀 ]',
    quote: '" 비밀이야. "',
    nameKr: '메디아 아우렐리우스',
    nameEn: 'MEDIA AURELIUS',
    age: '13세',
    height: '143cm',
    weight: '37kg',
    personality: ['불가해', '냉소', '강박'],
    abilityName: '과잉 생장',
    abilityDesc: '계절과 시간을 무시하고 제멋대로 피어나는 찰나의 초록색. 가장 능숙하게 다룰 수 있는 것들은 가시덩굴과 독초들. 패널티는 어지럼증과 고열.',
    mainQuote: '"상대가 나를 멸시하면서도 나를 필요로 하게 만드는 것. 그 모순을 지배하는 게 내 힘이야."',
  },
  'media-1': {
    symbol: '種',
    label: 'PHASE 01',
    name: '[ 씨앗 ]',
    quote: '" 신경 쓰지 마. "',
    nameKr: '메디아',
    nameEn: 'MEDIA',
    age: '19세',
    height: '172cm',
    weight: '68kg',
    personality: ['유기', '침묵', '균열'],
    abilityName: '과잉 생장',
    abilityDesc: '덩굴로 사람 두 명 정도를 강하게 옭아맬 수 있다. 작은 풀 정도는 순식간에 피워낼 수 있고. 그 어떤 것에도 쉽게 절단되지 않을 강도를 원하는 듯싶다.',
    mainQuote: '"모두가 나를 필요로 하게 하기 위해서. 나를 증오하고 멸시하면서도 필요로 해서, \'나\'라는 존재의 가치를 이 세상이 되새기게 하는 것."',
    stats: [
      { label: '근력', value: 4 },
      { label: '체력', value: 1 },
      { label: '민첩', value: 5 },
      { label: '이능력', value: 6 },
    ],
  },
  'media-2': {
    symbol: '長',
    label: 'PHASE 02',
    name: '[ 생장 ]',
    quote: '" 속죄 따윈 안 해. "',
    nameKr: '메디아',
    nameEn: 'MEDIA',
    age: '19세',
    height: '172cm',
    weight: '68kg',
    personality: ['유기', '침묵', '균열'],
    abilityName: '과잉 생장',
    abilityDesc: '균열난 화분이 깨져도 그것을 조각조각 맞추어 본래의 태가 나도록 만들었으니, 그 흔적만이 마음 속 깊게 남아 과거로 되돌아갈 수 없게 된다.',
    mainQuote: '"어떤 것도 나를 정확하게 표현할 수 없으나, 당신들은 내가 어떤 사람인지 알고 있으므로."',
    stats: [
      { label: '근력', value: 4 },
      { label: '체력', value: 1 },
      { label: '민첩', value: 5 },
      { label: '이능력', value: 8 },
    ],
  },
}

const sadhamData: Record<string, PhaseData> = {
  'sadham-0': {
    symbol: '修',
    label: 'PHASE 00',
    name: '[ 修羅道 ]',
    quote: '" 그만. 그 이상 접근하지 마라…. "',
    nameKr: '사드함 눈',
    nameEn: 'SAKDĀGĀMI NOON',
    age: '11세',
    height: '150cm',
    weight: '45kg',
    personality: ['억제', '반골', '방관'],
    abilityName: '아수라 — 삼독三毒',
    abilityDesc: '세 번째 눈의 개안과 함께 삼독(탐욕, 진에, 우치)에 따른 세 가지 저주를 내릴 수 있다. 현재로서는 탐貪만 사용 가능. 문지방에 발가락을 찧게 하는 수준에 그친다.',
    mainQuote: '"힘은 진정한 나 자신을 나타내는, 가장 순수하고도 강력한 증명이라고 할 수 있을 것이다."',
  },
  'sadham-1': {
    symbol: '人',
    label: 'PHASE 01',
    name: '[ 人間道 ]',
    quote: '" 그만. 실없는 소리를 하는군…. "',
    nameKr: '사드함 눈',
    nameEn: 'SAKDĀGĀMI NOON',
    age: '17세',
    height: '180cm',
    weight: '75kg',
    personality: ['억제', '비탈', '간섭'],
    abilityName: '아수라 — 삼독三毒',
    abilityDesc: '탐貪과 진瞋의 저주를 사용할 수 있다. 이능력을 일정 이상 사용할 경우, 신체의 일부가 까맣게 물들어간다.',
    mainQuote: '"나의 힘은 속죄하기 위해 존재한다. 그러니 세상이 바란다면 기꺼이 움직일 뿐이다."',
    stats: [
      { label: '근력', value: 3 },
      { label: '체력', value: 5 },
      { label: '민첩', value: 2 },
      { label: '이능력', value: 6 },
    ],
  },
  'sadham-2': {
    symbol: '鬼',
    label: 'PHASE 02',
    name: '[ 餓鬼道 ]',
    quote: '" 그만. 아무 것도 듣고 싶지 않다…. "',
    nameKr: '사드함 눈',
    nameEn: 'SAKDĀGĀMI NOON',
    age: '17세',
    height: '180cm',
    weight: '75kg',
    personality: ['억제', '혼란', '강박'],
    abilityName: '아수라 — 삼독三毒',
    abilityDesc: '혼란, 혼돈, 혼동. 여전히 온갖 번뇌에서 벗어나지 못한 채 지상에 얽매여 있는 가엾은 중생. 전투 시에는 의도적으로 말수를 줄인다.',
    mainQuote: '"돌아오지 말아라."',
    stats: [
      { label: '근력', value: 3 },
      { label: '체력', value: 5 },
      { label: '민첩', value: 2 },
      { label: '이능력', value: 6 },
    ],
  },
}

export default function CharacterPage() {
  const [character, setCharacter] = useState<'media' | 'sadham'>('media')
  const [phase, setPhase] = useState<Phase>('media-0')

  const data = character === 'media' ? mediaData[phase] : sadhamData[phase]
  const isMedia = character === 'media'

  const handleCharacterChange = (char: 'media' | 'sadham') => {
    setCharacter(char)
    setPhase(char === 'media' ? 'media-0' : 'sadham-0')
  }

  return (
    <div className="min-h-screen bg-[#0D0B0A] pb-20 md:pb-0 text-white">
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        
        {/* 캐릭터 선택 탭 */}
        <div className="flex gap-1.5 mb-6 pb-4 border-b border-white/[0.06]">
          <button
            onClick={() => handleCharacterChange('media')}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              isMedia
                ? 'bg-[#8B1538] border-[#8B1538] text-white'
                : 'bg-transparent border border-white/12 text-white/45 hover:text-white/70'
            }`}
          >
            메디아
          </button>
          <button
            onClick={() => handleCharacterChange('sadham')}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              !isMedia
                ? 'bg-[#A0522D] border-[#A0522D] text-white' // 🟤 [강제적용] 갈색
                : 'bg-transparent border border-white/12 text-white/45 hover:text-white/70'
            }`}
          >
            사드함 눈
          </button>
        </div>

        {/* Phase(차수) 선택 탭 */}
        <div className="flex gap-1 mb-5">
          {(isMedia
            ? [
                { id: 'media-0', label: '0차 · 마녀' },
                { id: 'media-1', label: '1차 · 씨앗' },
                { id: 'media-2', label: '2차 · 생장' },
              ]
            : [
                { id: 'sadham-0', label: '0차 · 修羅道' },
                { id: 'sadham-1', label: '1차 · 人間道' },
                { id: 'sadham-2', label: '2차 · 餓鬼道' },
              ]
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setPhase(p.id as Phase)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                phase === p.id
                  ? isMedia
                    ? 'bg-[#8B1538]/25 border border-[#8B1538]/60 text-[#A62045]'
                    : 'bg-[#A0522D]/25 border border-[#A0522D]/60 text-[#CD853F]' // 🟤 [강제적용] 갈색 배경/글씨
                  : 'bg-white/[0.02] border border-white/[0.06] text-white/35 hover:bg-white/[0.05]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 프로필 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
          
          {/* 왼쪽: 캐릭터 비주얼 */}
          <div
            className={`relative h-[500px] border border-white/[0.05] flex items-center justify-center overflow-hidden ${
              isMedia
                ? 'bg-gradient-to-b from-[#8B1538]/[0.12] to-[#2D1F1A]/35'
                : 'bg-gradient-to-b from-[#A0522D]/[0.12] to-[#2D1F1A]/35' // 🟤 [강제적용] 갈색 그라데이션
            }`}
          >
            <span className="text-[10rem] text-white/[0.035] font-serif select-none">
              {data.symbol}
            </span>
            <div className="absolute top-4 left-4 font-display text-[0.65rem] text-white/25 tracking-[0.08em]">
              {data.label}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="font-accent text-base text-white/65 mb-1">{data.name}</div>
              <div className="font-accent text-sm text-white/35">{data.quote}</div>
            </div>
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="space-y-5">
            
            {/* 기본 정보 */}
            <div className="pb-5 border-b border-white/[0.05]">
              <h2 className={`text-2xl font-semibold mb-1 ${isMedia ? 'text-[#8B1538]' : 'text-[#A0522D]'}`}>
                {/* 🟤 [강제적용] 이름 갈색 */}
                {data.nameKr}
              </h2>
              <p className="font-display text-xs text-white/30 tracking-[0.1em] mb-4">{data.nameEn}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '나이', value: data.age },
                  { label: '키', value: data.height },
                  { label: '몸무게', value: data.weight },
                ].map((item) => (
                  <div key={item.label} className="bg-white/[0.02] p-2.5 border border-white/[0.04]">
                    <div className="text-[0.6rem] text-white/30 mb-1">{item.label}</div>
                    <div className="text-sm text-white/80 font-medium">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 스탯 (Stats) */}
            {data.stats && (
              <div className="pb-5 border-b border-white/[0.05]">
                <h3 className="font-display text-[0.65rem] text-white/35 tracking-[0.08em] mb-3">STATS</h3>
                {data.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5 mb-2">
                    <span className="text-xs text-white/45 w-12">{stat.label}</span>
                    <div className="flex-1 h-[5px] bg-white/[0.06]">
                      <div
                        className={`h-full ${isMedia ? 'bg-[#8B1538]' : 'bg-[#A0522D]'}`} // 🟤 [강제적용] 게이지 갈색
                        style={{ width: `${stat.value * 10}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/50 w-4 text-right">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 성격 (Personality) */}
            <div className="pb-5 border-b border-white/[0.05]">
              <h3 className="font-display text-[0.65rem] text-white/35 tracking-[0.08em] mb-3">PERSONALITY</h3>
              <div className="flex gap-1.5 flex-wrap">
                {data.personality.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-3 py-1.5 ${
                      isMedia
                        ? 'bg-[#8B1538]/[0.12] border border-[#8B1538]/25 text-[#A62045]'
                        : 'bg-[#A0522D]/[0.12] border border-[#A0522D]/25 text-[#CD853F]' // 🟤 [강제적용] 태그 갈색
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 능력 (Ability) */}
            <div className="pb-5 border-b border-white/[0.05]">
              <h3 className="font-display text-[0.65rem] text-white/35 tracking-[0.08em] mb-3">ABILITY</h3>
              <div className="font-accent text-base text-white/80 mb-1.5">{data.abilityName}</div>
              <p className="font-accent text-sm text-white/45 leading-relaxed">{data.abilityDesc}</p>
            </div>

            {/* 메인 대사 (Quote) */}
            <div className={`bg-white/[0.02] p-4 border-l-2 ${isMedia ? 'border-[#8B1538]' : 'border-[#A0522D]'}`}>
              {/* 🟤 [강제적용] 인용구 라인 갈색 */}
              <p className="font-accent text-sm text-white/60 leading-relaxed">{data.mainQuote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}