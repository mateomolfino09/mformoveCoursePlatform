import '../styles/globals.css';
import { CoursesDB, User } from '../../typings';
import { ProviderAuth } from '../hooks/useAuth';
import ToasterProvider from '../hooks/toastProvider';
import ProgressBarProvider from '../hooks/progressBar';
import Providers from '../redux/providers';
import { GlobalContextProvider } from './context/store';

export const metadata = {
  title: 'Mformove',
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
      <body>
      <ProviderAuth>
          <Providers>
          <GlobalContextProvider>
          <ToasterProvider>
            <ProgressBarProvider>
              {children}
            </ProgressBarProvider>
            </ToasterProvider>
            </GlobalContextProvider>
          </Providers>
      </ProviderAuth>
      </body>
    </html>
  )
}
