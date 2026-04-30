'use client'

import { useEffect, useRef } from 'react'

let mounted = 0

export default function SketchyFilter() {
  const turbRef = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    mounted++
    let frame: number
    let last = 0
    const tick = (t: number) => {
      if (t - last > 100) {
        turbRef.current?.setAttribute('seed', String(Math.floor(Math.random() * 200)))
        last = t
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); mounted-- }
  }, [])

  // Only render once globally
  if (typeof window !== 'undefined' && mounted > 1) return null

  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden>
      <defs>
        <filter id="sketchy">
          <feTurbulence ref={turbRef} type="turbulence" baseFrequency="0.015" numOctaves="3" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
