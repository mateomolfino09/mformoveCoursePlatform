import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Form',
  description: 'Register Form implements safety via google recaptcha v3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
          {children}
    </section>
  )
}