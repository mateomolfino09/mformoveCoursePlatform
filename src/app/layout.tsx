import React from 'react';
import '../styles/globals.css';
import { ProviderAuth } from '../hooks/useAuth';
import ToasterProvider from '../hooks/toastProvider';
import ProgressBarProvider from '../hooks/progressBar';
import Providers from '../redux/providers';
import GoogleCaptchaWrapper from '../hooks/RecaptchaProvider';
import { BoldFont, MontserratFont } from "../utils/customFonts"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.mateomove.com'),
  title: 'MForMove',
  description: 'Descubre el poder del movimiento consciente. Clases online, eventos presenciales y programas transformacionales para conectar cuerpo, mente y espíritu.',
  keywords: "movimiento, fitness, yoga, meditacion, calistenia, workout, training, bienestar, transformacion personal"
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={`${BoldFont.variable} ${MontserratFont.variable}`}>
      <ProviderAuth>
          <Providers>
          <ToasterProvider>
            <ProgressBarProvider>
              {children}
            </ProgressBarProvider>
            </ToasterProvider>
          </Providers>
      </ProviderAuth>
      <SpeedInsights />
      <Analytics />
      </body>
    </html>
  )
}
