import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'N8N Data Dashboard',
  description: 'A simple dashboard to display data from N8N',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
