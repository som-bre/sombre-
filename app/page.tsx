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

  // Nitter 인스턴스들 (트위터 우회용)
  const [nitterIndex, setNitterIndex] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const nitterInstances = [
    'https://nitter.poast.org/doomsday1226',
    'https://nitter.privacydev.net/doomsday1226',
    'https://nitter.net/doomsday1226',
    'https://nitter.1d4.us/doomsday1226',
  ]

  // YouTube IFrame API 로드
  useEffect(() => {
    const VIDEO_ID = 'zJSY1WQGtl8'
    
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

  // Nitter 로드 실패시 다음 인스턴스 시도
  const handleNitterError = () => {
    if (nitterIndex < nitterInstances.length - 1) {
      setNitterIndex(prev => prev + 1)
    } else {
      setShowFallback(true)
    }
  }

  return (
    <div className="min-h-screen relative bg-[#0d0d0f] overflow-hidden">
      {/* ✨ 핑크 Aura 배경 효과 (강화됨) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 상단 핑크 그라데이션 */}
        <div 
          className="absolute inset-x-[-20vw] top-[-30vh] h-[70vh]"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,153,187,0.25) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,204,221,0.2) 0%, transparent 60%),
              radial-gradient(ellipse 50% 30% at 20% 10%, rgba(255,102,153,0.15) 0%, transparent 50%)
            `,
            filter: 'blur(60px)',
          }}
        />
        {/* 떠다니는 빛 입자들 */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-pink-300/40 rounded-full animate-float-slow" />
        <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-pink-200/50 rounded-full animate-float-medium" />
        <div className="absolute top-[50%] left-[20%] w-1 h-1 bg-pink-400/30 rounded-full animate-float-fast" />
        <div className="absolute top-[40%] right-[25%] w-2.5 h-2.5 bg-pink-300/20 rounded-full animate-float-slow" />
        <div className="absolute top-[60%] left-[70%] w-1.5 h-1.5 bg-pink-200/40 rounded-full animate-float-medium" />
      </div>

      {/* 장식: 코너 라인 */}
      <div className="fixed top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-pink-400/20 pointer-events-none z-10" />
      <div className="fixed bottom-24 right-8 w-16 h-16 border-r-2 border-b-2 border-pink-400/20 pointer-events-none z-10" />

      {/* Hero Section */}
      <section className="min-h-[45vh] flex items-center justify-center relative pt-8">
        <div className="text-center relative z-10">
          {/* 작은 장식 */}
          <div className="text-pink-300/60 text-sm mb-4 tracking-[0.3em] animate-pulse">✦ ✦ ✦</div>
          
          {/* 메인 타이틀 - 폰트 수정됨 */}
          <h1 
            className="text-[clamp(56px,14vw,180px)] font-black leading-[0.9] tracking-[0.02em] mb-6"
            style={{
              fontFamily: "'Cinzel', 'Times New Roman', serif",
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,153,187,0.8) 50%, rgba(255,102,153,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(255,153,187,0.5)',
              filter: 'drop-shadow(0 4px 20px rgba(255,153,187,0.3))'
            }}
          >
            Sombre
          </h1>
          
          {/* 서브타이틀 */}
          <p className="text-pink-200/50 text-sm tracking-[0.2em] font-light">RESONANCE</p>
        </div>
      </section>

      {/* Main Content - 2열 레이아웃 */}
      <section className="max-w-[1200px] mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* 왼쪽: INFO + PLAYER */}
          <div className="space-y-10">
            {/* INFO */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-400/50 to-transparent" />
              <h2 className="text-xs tracking-[0.18em] font-bold text-pink-300/70 mb-3 font-mono">INFO</h2>
              <p className="text-base leading-[1.9] text-white/70">
                가슴에 손을 얹어. ——심장이 뛰나?<br />
                <span className="text-pink-200/80">⋯그래. 뛰고 있어.</span>
              </p>
            </div>

            {/* PLAYER */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-400/50 to-transparent" />
              <h2 className="text-xs tracking-[0.18em] font-bold text-pink-300/70 mb-5 font-mono">PLAYER</h2>
              <div className="flex items-center gap-6 flex-wrap">
                {/* CD 디스크 */}
                <div 
                  className="relative w-[150px] h-[150px] cursor-pointer select-none group"
                  onClick={togglePlay}
                >
                  {/* 글로우 효과 */}
                  <div className={`absolute inset-0 rounded-full bg-pink-400/20 blur-xl transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
                  
                  <div 
                    className={`relative w-full h-full rounded-full bg-cover bg-center ${isPlaying ? 'animate-spin-slow' : ''}`}
                    style={{
                      backgroundImage: "url('/music.png')",
                      backgroundColor: '#1a1a1a',
                      boxShadow: 'inset 0 0 0 2px rgba(255,153,187,0.2), 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255,153,187,0.1)'
                    }}
                  >
                    {/* 중앙 홀 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 shadow-inner" />
                    {/* 빛 반사 */}
                    <div 
                      className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
                      style={{
                        background: 'conic-gradient(from 0deg, rgba(255,200,220,0.3), transparent 30%, transparent 70%, rgba(255,200,220,0.2))',
                        mixBlendMode: 'overlay'
                      }}
                    />
                  </div>
                  {/* 재생/일시정지 버튼 */}
                  <button 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-pink-300/30 bg-black/80 flex items-center justify-center shadow-lg hover:scale-110 hover:border-pink-300/60 transition-all duration-300"
                    onClick={(e) => { e.stopPropagation(); togglePlay() }}
                  >
                    {isPlaying ? (
                      <div className="flex gap-1">
                        <div className="w-1 h-3.5 bg-pink-200" />
                        <div className="w-1 h-3.5 bg-pink-200" />
                      </div>
                    ) : (
                      <div className="w-0 h-0 border-l-[12px] border-l-pink-200 border-y-[7px] border-y-transparent ml-1" />
                    )}
                  </button>
                </div>

                {/* 메타 정보 */}
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium text-white/80 mb-2 text-sm">{title}</div>
                  <div className="font-mono text-xs text-pink-300/50 mb-3">
                    <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                  </div>
                  {/* 프로그레스 바 */}
                  <div 
                    className="relative h-1 bg-white/10 rounded-full cursor-pointer overflow-hidden group"
                    onClick={handleSeek}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-full transition-all"
                      style={{
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #ff99bb, #ffccdd, #ff99bb)'
                      }}
                    />
                    <div className="absolute inset-0 bg-pink-300/0 group-hover:bg-pink-300/10 transition-colors" />
                  </div>
                </div>
              </div>
              {/* 숨겨진 YouTube 플레이어 */}
              <div id="yt-player" className="hidden" />
            </div>
          </div>

          {/* 오른쪽: UPDATES (트위터 - Nitter 우회) */}
          <div>
            <h2 className="text-xs tracking-[0.18em] font-bold text-pink-300/70 mb-4 font-mono text-right">UPDATES</h2>
            <div 
              className="rounded-xl overflow-hidden border border-pink-300/10 bg-black/30 backdrop-blur-sm"
              style={{ height: '350px' }}
            >
              {!showFallback ? (
                <iframe
                  src={nitterInstances[nitterIndex]}
                  className="w-full h-full border-none"
                  style={{ background: '#0d0d0f' }}
                  onError={handleNitterError}
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  referrerPolicy="no-referrer"
                  title="Twitter Updates"
                />
              ) : (
                /* 폴백 UI */
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-pink-400/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="text-white/80 font-medium mb-2">최신 소식</h3>
                  <p className="text-white/40 text-sm mb-5 leading-relaxed">
                    실시간 업데이트는 트위터에서<br />확인하실 수 있습니다
                  </p>
                  <a 
                    href="https://twitter.com/doomsday1226" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full text-sm font-medium hover:from-pink-400 hover:to-pink-300 transition-all hover:-translate-y-0.5 shadow-lg shadow-pink-500/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    트위터에서 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Footer */}
      <footer className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/95 to-transparent pt-6 pb-3 z-40">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* 상단 라인 */}
          <div className="h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent mb-3" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/40">
            {/* Profiles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-pink-300/60">Profiles:</span>
              <a href="https://docs.google.com/document/d/1re3SEMq6ah7HJhfb6BjreefarrIPyyt0RV1ON_om-Rk/edit?usp=sharing" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">M7</a>
              <span className="text-pink-300/30">·</span>
              <a href="https://docs.google.com/document/d/1xecrEgOP8_gghaTtOhyDaODi960I6JC9sjtzBUKDaM0/edit?usp=sharing" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">D7</a>
              <span className="text-pink-300/30">·</span>
              <a href="https://docs.google.com/document/d/1Q4nNE-ESOTDQUPEtC36y0b58E99Py-1C4hvxOtvtYUA/edit?tab=t.0" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">MA</a>
              <span className="text-pink-300/30">·</span>
              <a href="https://docs.google.com/document/d/1djINFQxXX9OSU4M8lBANnxo8TPKwewQdagpyh2BTkFQ/edit?usp=drivesdk" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">DA</a>
            </div>
            
            {/* 소셜 링크 */}
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/june7th.dm" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">Instagram</a>
              <span className="text-pink-300/20">/</span>
              <a href="https://youtu.be/zJSY1WQGtl8" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">YouTube</a>
              <span className="text-pink-300/20">/</span>
              <a href="http://sombre.ivyro.net/" target="_blank" rel="noopener" className="hover:text-pink-300 transition-colors">Homepage</a>
              <span className="text-pink-300/20">|</span>
              <button 
                onClick={() => setShowLogin(true)}
                className="hover:text-pink-300 transition-colors uppercase tracking-wider"
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
          <div 
            className="bg-gradient-to-b from-[#1a1418] to-[#0d0d0f] border border-pink-300/20 p-8 rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-pink-300/60 text-xs mb-2">✦</div>
              <h3 className="text-pink-200 text-lg tracking-widest">ADMIN LOGIN</h3>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-pink-300/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-300/50 text-center placeholder-white/20"
                autoFocus
              />
              <button className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-pink-500/20">
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
          animation: spin-slow 4s linear infinite;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
          50% { transform: translateY(-15px) translateX(-8px); opacity: 0.9; }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-10px) translateX(5px); opacity: 0.7; }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}