import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'SAME',
  description: '쉿, 비밀이야.',
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
