import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-syne',
})

export const metadata: Metadata = {
  title: 'Vora Command Center',
  description: 'Vora Ventures Internal Operations Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={syne.variable}>
        <div className="flex h-screen overflow-hidden">
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
