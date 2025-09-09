import './globals.css'
import type { Metadata } from 'next'
import MainNavigation from '@/components/MainNavigation'

export const metadata: Metadata = {
  title: '哈哈的成长记录',
  description: '记录Harvest（哈哈）成长的每一个可爱瞬间',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <div className="flex">
          <MainNavigation />
          <main className="flex-1 lg:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 