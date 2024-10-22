import '@/styles/globals.css'

export const metadata = {
  title: 'DEX Exchange',
  description: 'Decentralized Exchange Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-900 antialiased">
        <main className="container mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}