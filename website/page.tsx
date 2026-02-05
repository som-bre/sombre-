export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="h-[70vh] bg-gradient-to-br from-[#2D1F1A] via-[#5C0D24] to-crimson flex items-center justify-center relative overflow-hidden">
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        {/* Decorative characters */}
        <span className="absolute left-[5%] top-[20%] text-[10rem] text-white/[0.025] font-serif select-none">
          毒
        </span>
        <span className="absolute right-[5%] bottom-[20%] text-[10rem] text-white/[0.025] font-serif select-none">
          眼
        </span>

        {/* Content */}
        <div className="text-center relative z-10 animate-fade-in">
          <span className="block text-2xl text-white/60 mb-6">⟡</span>
          <h1 className="font-display text-6xl md:text-8xl font-normal text-white tracking-[0.25em] mb-4">
            SAME
          </h1>
          <p className="font-accent text-base text-white/55 tracking-[0.08em]">
            사드함 눈 × 메디아
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-[1050px] mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-[0.8fr_1.5fr] gap-12 md:gap-20">
        <h2 className="font-display text-3xl md:text-4xl font-normal leading-tight tracking-[0.06em] text-crimson-dark">
          About
          <br />
          Us
        </h2>
        
        <div className="text-white/50 text-[0.92rem] leading-[1.85] tracking-[-0.02em]">
          <blockquote className="font-accent text-[0.95rem] text-white/70 pl-6 border-l-2 border-crimson mb-8 leading-[1.75] tracking-[-0.03em]">
            "독초의 씨앗에서는 오직 독초만이 나는 법이거든. 네가 아무리 이 씨앗을 네 심장 가장 가까운 곳에 심고 네 '결의'로 덮어주어도, 여기서 피어날 건 향기로운 꽃이 아니라 네 목을 조를 가시덩굴뿐이야."
          </blockquote>
          
          <p className="mb-6">
            스스로를 '불량품'이라 부르며 독을 다루는 마녀, <strong className="text-crimson font-semibold">메디아 아우렐리우스</strong>.
          </p>
          
          <p className="mb-6">
            잃어버린 기억을 찾아 진실을 향해 나아가는 <strong className="text-crimson font-semibold">사드함 눈</strong>.
          </p>
          
          <p className="mb-6">
            방관자도, 청취자도 아닌 역할을 직접 청한 것은 사드함이었고, 화분에 씨앗을 심어도 된다고 말한 것은 메디아였다. 그렇게 두 사람은 서로의 업보를 함께 짊어지게 되었다.
          </p>
          
          <p className="font-accent font-bold text-crimson">
            우리가 저지른 죄는 영원히 남을 테니까.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-dark py-12 text-center border-t border-white/[0.04]">
        <span className="font-display text-sm text-crimson tracking-[0.15em]">⟡ SAME</span>
        <p className="font-accent text-[0.82rem] text-white/35 mt-2 tracking-[-0.01em]">
          사드함 눈 × 메디아 아우렐리우스
        </p>
      </footer>
    </div>
  )
}
