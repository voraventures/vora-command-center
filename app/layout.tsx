import type { Metadata } from 'next'
import { Playfair_Display, DM_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import AmbientCanvas from '@/components/ambient-canvas'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-display',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Vora Command Center',
  description: 'Vora Ventures Internal Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmMono.variable}`}>
      <body>
        <AmbientCanvas />
        <div className="flex h-screen overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto bg-vbg p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
