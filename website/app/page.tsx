'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // 로그인 처리 함수
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "sombre1234") { 
      if (typeof window !== 'undefined') {
        localStorage.setItem('sombre_admin_login', 'true')
      }
      router.push('/admin')
    } else {
      alert('비밀번호가 일치하지 않습니다.')
    }
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? '0' + s : s}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="min-h-screen relative bg-[#0d0d0f]">
      {/* Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-x-[-10vw] top-[-20vh] h-[55vh] opacity-90"
          style={{
            background: `
              radial-gradient(120% 90% at 50% 0%, rgba(255,153,187,0.4) 0%, transparent 60%),
              radial-gradient(120% 90% at 90% 10%, rgba(255,204,221,0.3) 0%, transparent 60%)
            `,
            filter: 'blur(40px) saturate(110%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
          }}
        />
      </div>

      {/* Sparkle Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, rgba(255, 153, 187, 0.4), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255, 214, 229, 0.3), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255, 153, 187, 0.5), transparent)
          `,
          backgroundSize: '150px 150px',
        }}
      />

      {/* Hero Section */}
      <section className="h-[50vh] flex items-center justify-center relative overflow-hidden">
        {/* Content */}
        <div className="text-center relative z-10">
          <h1 
            className="text-[clamp(64px,16vw,200px)] font-black leading-[0.87] tracking-[0.015em] mb-8"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(127,127,127,0.8)',
            }}
          >
            Sombre
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
          
          {/* Left: Info + Player */}
          <div className="space-y-10">
            {/* INFO Section */}
            <div>
              <h2 className="font-mono text-xs tracking-[0.18em] font-bold text-white/50 mb-3">INFO</h2>
              <p className="text-white/80 text-base leading-[1.8]">
                가슴에 손을 얹어. ——심장이 뛰나?<br />
                ⋯그래. 뛰고 있어.
              </p>
            </div>

            {/* PLAYER Section */}
            <div>
              <h2 className="font-mono text-xs tracking-[0.18em] font-bold text-white/50 mb-4">PLAYER</h2>
              <div className="flex items-center gap-6 flex-wrap">
                {/* CD Disc */}
                <div 
                  className="relative w-[160px] h-[160px] cursor-pointer select-none"
                  onClick={togglePlay}
                >
                  <div 
                    className={`w-full h-full rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.15)] ${isPlaying ? 'animate-spin' : ''}`}
                    style={{
                      backgroundImage: 'url(/music.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      animationDuration: '4.5s',
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                    }}
                  >
                    {/* Center hole */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#ddd] to-[#999] shadow-[inset_0_0_0_4px_rgba(0,0,0,0.2)]" />
                    {/* Shine overlay */}
                    <div 
                      className="absolute inset-0 rounded-full mix-blend-overlay opacity-45 pointer-events-none"
                      style={{
                        background: 'conic-gradient(from 0deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 35%, rgba(0,0,0,0) 70%, rgba(255,255,255,0.2))'
                      }}
                    />
                  </div>
                  {/* Play/Pause Button */}
                  <button 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 bg-[#0d0d0f] shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <div className="w-4 h-4 flex gap-1">
                        <div className="w-1.5 h-full bg-white" />
                        <div className="w-1.5 h-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-0 h-0 border-l-[14px] border-l-white border-y-[9px] border-y-transparent ml-1" />
                    )}
                  </button>
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-[200px]">
                  <div className="font-bold text-white mb-2">Loading…</div>
                  <div className="font-mono text-xs text-white/50 mb-3">
                    <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                  </div>
                  <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-full"
                      style={{
                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                        background: 'linear-gradient(90deg, #ff99bb, #ffccdd)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Updates */}
          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] font-bold text-white/50 mb-4 text-right">UPDATES</h2>
            <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02] min-h-[300px]">
              <div className="text-center py-8">
                <h3 className="text-white font-semibold mb-4">📱 최신 소식</h3>
                <p className="text-white/50 text-sm mb-6 leading-relaxed">
                  실시간 업데이트는 트위터에서 확인하실 수 있습니다
                </p>
                <a 
                  href="https://twitter.com/doomsday1226" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1da1f2] text-white rounded-lg text-sm font-medium hover:bg-[#1991db] transition-colors shadow-lg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  트위터에서 보기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Footer */}
      <footer className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-[#0d0d0f] border-t border-white/[0.06] py-3 z-40">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs tracking-[0.06em] text-white/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/70">Profiles:</span>
              <a href="https://docs.google.com/document/d/1re3SEMq6ah7HJhfb6BjreefarrIPyyt0RV1ON_om-Rk/edit?usp=sharing" target="_blank" rel="noopener" className="hover:text-[#ff99bb] hover:underline">M7</a>
              <span className="opacity-50">·</span>
              <a href="https://docs.google.com/document/d/1xecrEgOP8_gghaTtOhyDaODi960I6JC9sjtzBUKDaM0/edit?usp=sharing" target="_blank" rel="noopener" className="hover:text-[#ff99bb] hover:underline">D7</a>
              <span className="opacity-50">·</span>
              <a href="https://docs.google.com/document/d/1Q4nNE-ESOTDQUPEtC36y0b58E99Py-1C4hvxOtvtYUA/edit?tab=t.0" target="_blank" rel="noopener" className="hover:text-[#ff99bb] hover:underline">MA</a>
              <span className="opacity-50">·</span>
              <a href="https://docs.google.com/document/d/1djINFQxXX9OSU4M8lBANnxo8TPKwewQdagpyh2BTkFQ/edit?usp=drivesdk" target="_blank" rel="noopener" className="hover:text-[#ff99bb] hover:underline">DA</a>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://www.instagram.com/june7th.dm" target="_blank" rel="noopener" className="hover:text-[#ff99bb] hover:underline">Instagram</a>
              <span className="opacity-30">/</span>
              <a href="https://youtu.be/zJSY1WQGtl8" target="_blank" rel="noopener" className="hover:text-[#ff99bb] hover:underline">YouTube</a>
              <span className="opacity-30">/</span>
              <button 
                onClick={() => setShowLogin(true)}
                className="hover:text-[#ff99bb] hover:underline cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 로그인 팝업 */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
          <div className="bg-[#111] border border-white/10 p-8 rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-[#ff99bb] font-mono text-center mb-6 tracking-widest text-sm">ADMIN LOGIN</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff99bb] text-center placeholder-white/20"
                autoFocus
              />
              <button className="w-full bg-[#ff99bb] hover:bg-[#ff77aa] text-black py-3 rounded font-bold transition-colors">
                ENTER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
