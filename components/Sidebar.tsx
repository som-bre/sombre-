'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home', number: '01' },
  { href: '/character', label: 'Characters', number: '02' },
  { href: '/timeline', label: 'Timeline', number: '03' },
  { href: '/record', label: 'Record', number: '04' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 w-[260px] h-screen bg-[#0d0d0f] border-r border-white/[0.06] flex-col py-12 px-8 z-50">
        {/* 상단 핑크 라인 장식 */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#ff99bb] to-transparent opacity-60" />
        
        <Link href="/" className="flex items-center gap-2.5 mb-16 group">
          <span className="font-mono text-sm tracking-[0.08em] text-[#ff99bb] group-hover:text-[#ffb3cc] transition-colors">
            Resonance
          </span>
          <span className="text-[#ffd6e5] text-[8px] animate-pulse">✦</span>
        </Link>

        <ul className="flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href} className="mb-0">
                <Link
                  href={item.href}
                  className={`flex items-baseline gap-2.5 py-3 relative transition-all duration-300 ${
                    isActive
                      ? 'text-[#ff99bb]'
                      : 'text-white/55 hover:text-white/80 hover:translate-x-1'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-0.5 h-[18px] bg-[#ff99bb] shadow-[0_0_8px_rgba(255,153,187,0.5)]" />
                  )}
                  <span className="font-mono text-[0.8rem] tracking-[0.08em]">
                    {item.label}
                  </span>
                  <span className={`text-[0.65rem] font-medium ${
                    isActive ? 'text-[#ff99bb]' : 'text-white/25'
                  }`}>
                    {item.number}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="pt-6 border-t border-white/[0.06]">
          <p className="font-accent text-[0.82rem] text-white/35 leading-relaxed tracking-[-0.03em]">
            "가슴에 손을 얹어.
            <br />
            ——심장이 뛰나?"
          </p>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d0d0f]/95 backdrop-blur-lg border-t border-white/[0.06] flex items-center justify-around z-50">
        {/* 상단 핑크 라인 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff99bb]/30 to-transparent" />
        
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 transition-all duration-300 ${
                isActive ? 'text-[#ff99bb] scale-105' : 'text-white/45'
              }`}
            >
              <span className="font-mono text-[0.6rem] tracking-[0.03em]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#ff99bb] shadow-[0_0_6px_rgba(255,153,187,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
