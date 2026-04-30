import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import CustomCursor from '@/components/CustomCursor'
import SketchyFilter from '@/components/SketchyFilter'

export const metadata: Metadata = {
  title: 'SOMBRE',
  description: 'SOMBRE Archive',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white min-h-screen">
        <SketchyFilter />
        <CustomCursor />
        <Sidebar />
        <main className="pt-[44px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
