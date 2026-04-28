import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Govt. Secondary School, Jiwa',
    default: 'Government Secondary School, Jiwa — Official Website',
  },
  description:
    'Official website of Government Secondary School Jiwa, FCT Abuja. Education for Self Reliance.',
  keywords: ['GSS Jiwa', 'Government Secondary School Jiwa', 'FCT Abuja school', 'Jiwa secondary school'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
