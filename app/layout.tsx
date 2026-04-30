import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import CustomCursor from '@/components/CustomCursor'

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
      <body className="bg-bg text-ink min-h-screen">
        <CustomCursor />
        <Sidebar />
        <main className="pt-[44px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
