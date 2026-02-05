export default function TimelinePage() {
  const events = [
    {
      era: '0차',
      title: '첫 만남',
      period: '11-13살',
      desc: '운명을 피해 다니는 사드함에게 다가간 메디아. "언제까지 피해 다니려고?" 두 사람의 첫 대화가 시작되다.',
    },
    {
      era: '0차',
      title: '독초와 올바름',
      period: '11-13살',
      desc: '메디아가 자신의 과거를 털어놓다. 시오크의 아우렐리우스 공방, 차기 공방주라는 화려한 전시품, 그리고 \'불량품\'이라는 낙인.',
    },
    {
      era: '0차',
      title: '씨앗의 약속',
      period: '11-13살',
      desc: '메디아가 바닥에 던진 소돔의 사과 씨앗을 사드함이 주워들다. 방관자에서 개입자로, 청취자에서 공범으로.',
    },
    {
      era: '1차',
      title: '계승자의 길',
      period: '성장 후',
      desc: '"정해진 길을 따라 가지." 계승자가 된 사드함과, 여전히 자신만의 길을 걷는 메디아. 잔소리와 엄살, 걱정과 투덜거림이 일상이 되다.',
    },
    {
      era: '1차',
      title: '시오크를 향해',
      period: '성장 후',
      desc: '아우렐리우스에게 복수하러 시오크로 향하는 메디아. "의무를 저버리는 것보다 그대가 위험해지는 게 더욱 걱정되거든." 두 사람은 서로의 공범이 되다.',
    },
    {
      era: '2차',
      title: '혼란 속에서',
      period: '현재',
      desc: '죽을 뻔한 위기를 넘기고 정체불명의 장소에서 눈을 뜬 두 사람. "잠들 수 없다면 말동무 정도는 해줄 수 있으니까⋯."',
    },
    {
      era: '???',
      title: 'To be continued...',
      desc: '아직 끝나지 않은 이야기. 독초의 씨앗은 어떤 꽃을 피울 것인가.',
      future: true,
    },
  ]

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#0D0B0A] via-[#1A1614] to-[#2D1F1A] p-12 md:p-16">
        <span className="text-xs text-white/35 tracking-wider">04</span>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.1em] mt-2">
          Timeline
        </h1>
        <p className="font-accent text-white/45 mt-2">연대기</p>
      </header>

      {/* Timeline */}
      <div className="max-w-[700px] mx-auto px-6 py-16 pl-16 relative">
        {/* Line */}
        <div 
          className="absolute left-[18px] md:left-[calc(50%-350px+18px)] top-0 bottom-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, #8B1538 0%, #6B4423 50%, rgba(255,255,255,0.15) 100%)'
          }}
        />

        {/* Events */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="relative pl-10">
              {/* Marker */}
              <div 
                className={`absolute left-0 top-1 w-[9px] h-[9px] rounded-full border-2 border-bg-dark ${
                  event.future 
                    ? 'bg-transparent border-white/25' 
                    : 'bg-crimson'
                }`}
              />

              {/* Content */}
              <div 
                className={`p-5 border transition-colors hover:bg-white/[0.04] ${
                  event.future 
                    ? 'bg-transparent border-dashed border-white/[0.06]' 
                    : 'bg-white/[0.025] border-white/[0.06] hover:border-crimson'
                }`}
              >
                <span className="font-body text-[0.68rem] font-semibold text-crimson-light tracking-[0.04em]">
                  {event.era}
                </span>
                <h3 className={`font-body text-lg font-semibold text-white mt-1 mb-1 ${
                  event.future ? 'italic text-white/45 font-normal' : ''
                }`}>
                  {event.title}
                </h3>
                {event.period && (
                  <p className="text-xs text-white/35 mb-2">{event.period}</p>
                )}
                <p className="font-accent text-sm text-white/55 leading-relaxed">
                  {event.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/[0.025]">
        <span className="font-display text-sm text-crimson tracking-[0.15em]">⟡ SAME</span>
        <p className="font-accent text-[0.82rem] text-white/35 mt-2">
          사드함 눈 × 메디아 아우렐리우스
        </p>
      </footer>
    </div>
  )
}
