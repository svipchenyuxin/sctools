import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SC ToolNexus - 创业工具聚合平台',
  description: '发现并使用更佳工具，提高效率，更多点时间去生活',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  )
}
