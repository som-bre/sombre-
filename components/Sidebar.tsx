'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '서장' },
  { href: '/character', label: '캐릭터' },
  { href: '/record', label: '기록' },
  { href: '/timeline', label: '연대기' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const current = navItems.find(n => n.href === pathname)

  return (
    <>
      {/* Fixed Top Bar */}
      <nav className="fixed top-0 left-0 right-0 h-[44px] bg-bg border-b border-ink/10 flex items-center justify-between px-5 z-50 font-body">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="label-caps text-crimson tracking-[0.2em] hover:opacity-70 transition-opacity" style={{ fontSize: '0.6rem' }}>
            SAME
          </Link>
          {!isHome && (
            <>
              <span className="text-ink/15 text-[10px]">:</span>
              <span className="label-caps text-ink/40" style={{ fontSize: '0.55rem' }}>
                毒眼經
              </span>
            </>
          )}
        </div>

        {/* Center: Navigation links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] tracking-[0.08em] transition-colors ${
                  isActive
                    ? 'text-ink font-medium'
                    : 'text-ink/30 hover:text-ink/60'
                }`}
                style={{ fontFamily: "'Pretendard Variable', sans-serif" }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right: Current section */}
        <div className="flex items-center gap-2">
          {current && !isHome && (
            <span className="label-caps text-ink/30" style={{ fontSize: '0.55rem' }}>
              {current.label}
            </span>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-bg/95 backdrop-blur border-t border-ink/10 flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[10px] tracking-[0.06em] py-2 px-3 font-body ${
                isActive ? 'text-ink font-medium' : 'text-ink/30'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
