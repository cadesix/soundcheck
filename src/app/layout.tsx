import './globals.css'
import type { Metadata } from 'next'
import Sidebar from './components/Sidebar'
import { ArtistProvider } from './context/ArtistContext'

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
      <body style={{ margin: 0 }}>
        <ArtistProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
          </div>
        </ArtistProvider>
      </body>
    </html>
  )
}
