import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Sombre — 마농 브레슈 × 딜런 토리 섬너',
  description: '마농 브레슈와 딜런 토리 섬너의 이야기 | Resonance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-bg-dark text-white min-h-screen">
        <Sidebar />
        <main className="ml-0 md:ml-[260px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
