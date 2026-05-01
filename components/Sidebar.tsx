'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '서장', en: 'Prologue' },
  { href: '/character', label: '캐릭터', en: 'Characters' },
  { href: '/record', label: '기록', en: 'Records' },
  { href: '/timeline', label: '연대기', en: 'Timeline' },
  { href: '/au', label: '세계관', en: 'Universes' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const current = navItems.find(n => n.href === pathname)

  return (
    <>
      {/* Fixed Top Bar */}
      <nav
        className="fixed top-0 left-0 right-0 h-[44px] flex items-center justify-between px-5 z-50 font-body"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      >
        {/* Bottom sketchy border */}
        <span
          className="absolute bottom-0 left-0 right-0 sketch-jitter-line pointer-events-none"
          style={{ height: '1px', background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)' }}
        />

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="heading-display tracking-[0.02em] hover:opacity-70 transition-opacity"
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.85)',
              fontStyle: 'italic',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            SOMBRE
          </Link>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative transition-colors"
              >
                <span
                  className="heading-condensed transition-colors"
                  style={{
                    fontSize: '0.78rem',
                    fontStyle: 'italic',
                    letterSpacing: '0.04em',
                    color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {item.en}
                </span>
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 sketch-jitter-line"
                    style={{
                      width: '60%', height: '1px',
                      background: 'rgba(255,255,255,0.5)',
                      filter: 'url(#sketchy)',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right: Current section + Korean label */}
        <div className="flex items-center gap-3">
          {current && !isHome && (
            <span
              className="label-caps"
              style={{
                fontSize: '0.5rem',
                letterSpacing: '0.25em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {current.label}
            </span>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-12 flex items-center justify-around z-50"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
      >
        <span
          className="absolute top-0 left-0 right-0 sketch-jitter-line pointer-events-none"
          style={{ height: '1px', background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)' }}
        />
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 px-3 transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
              }}
            >
              {item.en}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
