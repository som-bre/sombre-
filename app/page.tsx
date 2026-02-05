'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  
  // 음악 플레이어 상태
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [title, setTitle] = useState('Loading…')
  const playerRef = useRef<any>(null)
  const [playerReady, setPlayerReady] = useState(false)

  // YouTube IFrame API 로드
  useEffect(() => {
    const VIDEO_ID = 'zJSY1WQGtl8'
    
    // API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: VIDEO_ID,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3 },
        events: {
          onReady: (e: any) => {
            setPlayerReady(true)
            const data = e.target.getVideoData()
            if (data?.title) setTitle(data.title)
            setDuration(e.target.getDuration() || 0)
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else {
              setIsPlaying(false)
            }
          }
        }
      })
    }

    // 이미 로드되어 있으면 바로 실행
    if (window.YT?.Player) {
      window.onYouTubeIframeAPIReady()
    }
  }, [])

  // 재생 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerReady && playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime())
      }
    }, 500)
    return () => clearInterval(interval)
  }, [playerReady])

  const togglePlay = () => {
    if (!playerReady) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerReady || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    playerRef.current.seekTo(ratio * duration, true)
  }

  const formatTime = (sec: number) => {
    sec = Math.max(0, Math.floor(sec))
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? '0' + s : s}`
  }

  // 로그인 처리
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

  return (
    <div className="min-h-screen relative bg-[#0d0d0f]">
      {/* Aura 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-x-[-10vw] top-[-20vh] h-[55vh] opacity-90"
          style={{
            background: `
              radial-gradient(120% 90% at 50% 0%, rgba(255,153,187,0.15) 0%, transparent 60%),
              radial-gradient(120% 90% at 90% 10%, rgba(255,204,221,0.1) 0%, transparent 60%)
            `,
            filter: 'blur(40px) saturate(110%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="min-h-[50vh] flex items-center justify-center relative overflow-hidden pt-8">
        <div className="text-center relative z-10 animate-fade-in">
          <h1 
            className="text-[clamp(64px,16vw,200px)] font-black leading-[0.87] tracking-[0.015em] mb-8"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(127,127,127,0.8)',
              fontFamily: "'Inter', 'Jeju Myeongjo', system-ui, sans-serif"
            }}
          >
            Sombre
          </h1>
        </div>
      </section>

      {/* Main Content - 2열 레이아웃 */}
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* 왼쪽: INFO + PLAYER */}
          <div className="space-y-10">
            {/* INFO */}
            <div>
              <h2 className="text-xs tracking-[0.18em] font-bold text-white/50 mb-3 font-mono">INFO</h2>
              <p className="text-base leading-[1.8] text-white/80">
                가슴에 손을 얹어. ——심장이 뛰나?<br />
                ⋯그래. 뛰고 있어.
              </p>
            </div>

            {/* PLAYER */}
            <div>
              <h2 className="text-xs tracking-[0.18em] font-bold text-white/50 mb-4 font-mono">PLAYER</h2>
              <div className="flex items-center gap-6 flex-wrap">
                {/* CD 디스크 */}
                <div 
                  className="relative w-[160px] h-[160px] cursor-pointer select-none"
                  onClick={togglePlay}
                >
                  <div 
                    className={`w-full h-full rounded-full bg-cover bg-center shadow-lg ${isPlaying ? 'animate-spin-slow' : ''}`}
                    style={{
                      backgroundImage: "url('/music.png')",
                      backgroundColor: '#1a1a1a',
                      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* 중앙 홀 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-inner" />
                    {/* 빛 반사 */}
                    <div 
                      className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                      style={{
                        background: 'conic-gradient(from 0deg, rgba(255,255,255,0.25), transparent 35%, transparent 70%, rgba(255,255,255,0.2))',
                        mixBlendMode: 'overlay'
                      }}
                    />
                  </div>
                  {/* 재생/일시정지 버튼 */}
                  <button 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 bg-[#0d0d0f] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    onClick={(e) => { e.stopPropagation(); togglePlay() }}
                  >
                    {isPlaying ? (
                      <div className="flex gap-1">
                        <div className="w-1 h-4 bg-white" />
                        <div className="w-1 h-4 bg-white" />
                      </div>
                    ) : (
                      <div className="w-0 h-0 border-l-[14px] border-l-white border-y-[9px] border-y-transparent ml-1" />
                    )}
                  </button>
                </div>

                {/* 메타 정보 */}
                <div className="flex-1 min-w-[220px]">
                  <div className="font-bold text-white/90 mb-2 text-sm">{title}</div>
                  <div className="font-mono text-xs text-white/50 mb-3">
                    <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                  </div>
                  {/* 프로그레스 바 */}
                  <div 
                    className="relative h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                    onClick={handleSeek}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-full"
                      style={{
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #ff99bb, #ffccdd)'
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* 숨겨진 YouTube 플레이어 */}
              <div id="yt-player" className="hidden" />
            </div>
          </div>

          {/* 오른쪽: UPDATES (트위터) */}
          <div>
            <h2 className="text-xs tracking-[0.18em] font-bold text-white/50 mb-4 font-mono text-right">UPDATES</h2>
            <div className="bg-[#0d0d0f] rounded-lg overflow-hidden border border-white/10" style={{ height: '320px' }}>
              {/* 트위터 대체 콘텐츠 */}
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-white/80 font-medium mb-3">📱 최신 소식</h3>
                <p className="text-white/50 text-sm mb-5 leading-relaxed">
                  실시간 업데이트는 트위터에서<br />확인하실 수 있습니다
                </p>
                <a 
                  href="https://twitter.com/doomsday1226" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1da1f2] text-white rounded-lg text-sm font-medium hover:bg-[#1991db] transition-all hover:-translate-y-0.5 shadow-lg"
                  style={{ boxShadow: '0 2px 12px rgba(29, 161, 242, 0.3)' }}
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
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/50">
            {/* Profiles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/70">Profiles:</span>
              <a href="https://docs.google.com/document/d/1re3SEMq6ah7HJhfb6BjreefarrIPyyt0RV1ON_om-Rk/edit?usp=sharing" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">M7</a>
              <span className="opacity-50">·</span>
              <a href="https://docs.google.com/document/d/1xecrEgOP8_gghaTtOhyDaODi960I6JC9sjtzBUKDaM0/edit?usp=sharing" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">D7</a>
              <span className="opacity-50">·</span>
              <a href="https://docs.google.com/document/d/1Q4nNE-ESOTDQUPEtC36y0b58E99Py-1C4hvxOtvtYUA/edit?tab=t.0" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">MA</a>
              <span className="opacity-50">·</span>
              <a href="https://docs.google.com/document/d/1djINFQxXX9OSU4M8lBANnxo8TPKwewQdagpyh2BTkFQ/edit?usp=drivesdk" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">DA</a>
            </div>
            
            {/* 소셜 링크 */}
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/june7th.dm" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">Instagram</a>
              <span className="opacity-30">/</span>
              <a href="https://youtu.be/zJSY1WQGtl8" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">YouTube</a>
              <span className="opacity-30">/</span>
              <a href="http://sombre.ivyro.net/" target="_blank" rel="noopener" className="hover:text-[#ff99bb] transition-colors">Homepage</a>
              <span className="opacity-30">|</span>
              <button 
                onClick={() => setShowLogin(true)}
                className="hover:text-[#ff99bb] transition-colors uppercase tracking-wider"
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
          <div className="bg-[#1a1614] border border-white/10 p-8 rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-[#ff99bb] font-display text-center mb-6 tracking-widest">ADMIN LOGIN</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff99bb] text-center placeholder-white/20"
                autoFocus
              />
              <button className="w-full bg-[#ff99bb] hover:bg-[#ff7aa8] text-black py-3 rounded font-bold transition-colors">
                ENTER
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4.5s linear infinite;
        }
        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
