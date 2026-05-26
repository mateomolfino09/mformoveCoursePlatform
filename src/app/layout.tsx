import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import { ProviderAuth } from '../hooks/useAuth';
import ToasterProvider from '../hooks/toastProvider';
import ProgressBarProvider from '../hooks/progressBar';
import Providers from '../redux/providers';
import { BoldFont, MontserratFont, LoraFont, RalewayFont } from '../utils/customFonts';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import OnboardingChecker from '../components/OnboardingChecker';
import WeeklyPathNavigator from '../components/WeeklyPathNavigator/WeeklyPathNavigator';
import { globalSiteMetadata } from '../lib/siteMetadata';

export const metadata: Metadata = globalSiteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${BoldFont.variable} ${MontserratFont.variable} ${LoraFont.variable} ${RalewayFont.variable}`}
      >
        <ProviderAuth>
          <Providers>
            <ToasterProvider>
              <ProgressBarProvider>
                <OnboardingChecker />
                {children}
                <WeeklyPathNavigator />
              </ProgressBarProvider>
            </ToasterProvider>
          </Providers>
        </ProviderAuth>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
