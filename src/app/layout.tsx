import '../styles/globals.css';
import { ProviderAuth } from '../hooks/useAuth';
import ToasterProvider from '../hooks/toastProvider';
import ProgressBarProvider from '../hooks/progressBar';
import Providers from '../redux/providers';
import GoogleCaptchaWrapper from '../hooks/RecaptchaProvider';
import { BoldFont, MontserratFont } from "../utils/customFonts"

export const metadata = {
  title: 'MForMove',
  description: 'Bienvenido a mformove!',
  keywords: "movimiento, fitness, yoga, meditacion, calistenia, workout, training"
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
      </body>
    </html>
  )
}
