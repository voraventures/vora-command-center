import type { Metadata } from 'next'
import { Syne, DM_Mono, Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Vora Command Center',
  description: 'Vora Ventures Internal Operations Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${dmMono.variable} ${inter.variable} bg-vbg text-vtext antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
