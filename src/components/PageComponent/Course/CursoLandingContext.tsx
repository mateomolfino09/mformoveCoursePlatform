'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import state from '../../../valtio';
import {
  CursoLandingConfig,
  createDefaultCursoLandingConfig,
  normalizeCursoLandingConfig,
} from '../../../types/cursoLanding';
import { formatTitleCaseWords } from '../../../lib/formatDisplayTitle';
import { cursoEmpezarPath, cursoLandingPath } from '../../../lib/cursoPaths';

type CursoLandingContextValue = {
  cursoConfig: CursoLandingConfig;
  productName: string;
  slug: string;
  landingPath: string;
  checkoutStartPath: string;
  plansSectionId: string;
  faqSectionId: string;
  scrollToPlans: () => void;
  scrollToSection: (sectionId: string) => void;
};

const CursoLandingContext = createContext<CursoLandingContextValue | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  cursoConfig: CursoLandingConfig;
  productName: string;
  slug: string;
};

export function CursoLandingProvider({
  children,
  cursoConfig,
  productName,
  slug,
}: ProviderProps) {
  const displayProductName = useMemo(
    () => formatTitleCaseWords(productName),
    [productName]
  );

  const resolvedConfig = useMemo(() => {
    const normalized = normalizeCursoLandingConfig(cursoConfig, productName);
    return {
      ...normalized,
      introHighlights: {
        ...normalized.introHighlights,
        titulo: formatTitleCaseWords(normalized.introHighlights.titulo),
      },
    };
  }, [cursoConfig, productName]);
  const plansSectionId = resolvedConfig.planes?.anclaId || 'membership-plans';
  const faqSectionId = resolvedConfig.faq?.anclaId || 'membership-faq';
  const landingPath = cursoLandingPath(slug);
  const checkoutStartPath = cursoEmpezarPath(slug);

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToPlans = useCallback(() => {
    scrollToSection(plansSectionId);
  }, [plansSectionId, scrollToSection]);

  useEffect(() => {
    state.cursoHeaderTitle = displayProductName;
    return () => {
      state.cursoHeaderTitle = null;
    };
  }, [displayProductName]);

  const value = useMemo(
    () => ({
      cursoConfig: resolvedConfig,
      productName: displayProductName,
      slug,
      landingPath,
      checkoutStartPath,
      plansSectionId,
      faqSectionId,
      scrollToPlans,
      scrollToSection,
    }),
    [resolvedConfig, checkoutStartPath, displayProductName, faqSectionId, landingPath, plansSectionId, scrollToPlans, scrollToSection, slug]
  );

  return (
    <CursoLandingContext.Provider value={value}>{children}</CursoLandingContext.Provider>
  );
}

export function useCursoLanding() {
  const context = useContext(CursoLandingContext);
  const fallback = createDefaultCursoLandingConfig();

  if (!context) {
    const plansSectionId = fallback.planes.anclaId || 'membership-plans';
    const faqSectionId = fallback.faq.anclaId || 'membership-faq';

    return {
      cursoConfig: fallback,
      productName: fallback.introHighlights.titulo,
      slug: fallback.slug,
      landingPath: cursoLandingPath(fallback.slug),
      checkoutStartPath: cursoEmpezarPath(fallback.slug),
      plansSectionId,
      faqSectionId,
      scrollToPlans: () => {
        document.getElementById(plansSectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      scrollToSection: (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    };
  }

  return context;
}
