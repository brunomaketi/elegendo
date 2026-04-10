import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata = {
  title: 'Elegendo — Marketing político que faz diferença nas urnas',
  description: 'Plataforma de marketing político digital para candidatos sérios.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter), sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
