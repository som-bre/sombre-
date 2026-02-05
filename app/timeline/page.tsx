export default function TimelinePage() {
  const events = [
    {
      era: '7학년',
      title: '호그와트에서의 만남',
      period: '1988-1989',
      desc: '슬리데린의 마농 브레슈와 그리핀도르의 딜런 토리 섬너. 서로 다른 기숙사, 서로 다른 세계에서 온 두 사람의 이야기가 시작되다.',
    },
    {
      era: '졸업 후',
      title: '각자의 길',
      period: '1989-',
      desc: '마농은 파리 오페라 발레단으로, 딜런은 지팡이 장인의 길로. 멀어진 거리만큼 깊어지는 마음.',
    },
    {
      era: '현재',
      title: '함께하는 시간',
      period: '현재',
      desc: '마농 브레슈(섬너)와 딜런 토리 섬너. 그리고 그들의 아이, 루드베키아 섬너.',
    },
    {
      era: '???',
      title: 'To be continued...',
      desc: '아직 끝나지 않은 이야기. 두 사람의 여정은 계속된다.',
      future: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      {/* Aura 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-x-[-10vw] top-[-20vh] h-[55vh] opacity-70"
          style={{
            background: `
              radial-gradient(120% 90% at 50% 0%, rgba(255,153,187,0.1) 0%, transparent 60%),
              radial-gradient(120% 90% at 90% 10%, rgba(255,204,221,0.08) 0%, transparent 60%)
            `,
            filter: 'blur(40px) saturate(110%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-12 md:p-16">
        <span className="text-xs text-white/35 tracking-wider font-mono">03</span>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-[0.1em] mt-2">
          Timeline
        </h1>
        <p className="font-accent text-white/45 mt-2">연대기</p>
      </header>

      {/* Timeline */}
      <div className="max-w-[700px] mx-auto px-6 py-8 pl-16 relative z-10">
        {/* Line */}
        <div 
          className="absolute left-[18px] md:left-[calc(50%-350px+18px)] top-0 bottom-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, #ff99bb 0%, #cc6f90 50%, rgba(255,255,255,0.15) 100%)'
          }}
        />

        {/* Events */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="relative pl-10">
              {/* Marker */}
              <div 
                className={`absolute left-0 top-1 w-[9px] h-[9px] rounded-full border-2 border-[#0d0d0f] ${
                  event.future 
                    ? 'bg-transparent border-white/25' 
                    : 'bg-[#ff99bb] shadow-[0_0_8px_rgba(255,153,187,0.5)]'
                }`}
              />

              {/* Content */}
              <div 
                className={`p-5 border rounded-xl transition-all duration-300 hover:bg-white/[0.04] ${
                  event.future 
                    ? 'bg-transparent border-dashed border-white/[0.06]' 
                    : 'bg-white/[0.025] border-white/[0.06] hover:border-[#ff99bb]/50'
                }`}
              >
                <span className="font-mono text-[0.68rem] font-semibold text-[#ff99bb] tracking-[0.04em]">
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
      <footer className="relative z-10 py-12 text-center border-t border-white/[0.025] mt-16">
        <span className="font-mono text-sm text-[#ff99bb] tracking-[0.15em]">✦ Sombre</span>
        <p className="font-accent text-[0.82rem] text-white/35 mt-2">
          마농 브레슈 × 딜런 토리 섬너
        </p>
      </footer>
    </div>
  )
}
