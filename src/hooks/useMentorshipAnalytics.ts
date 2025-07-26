'use client'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface MentorshipAnalyticsEvent {
  event: string;
  planLevel?: string;
  planPrice?: number;
  userId?: string;
  timestamp: number;
}

export const useMentorshipAnalytics = () => {
  const pathname = usePathname();

  // Track page view
  useEffect(() => {
    if (pathname === '/mentorship') {
      trackEvent('mentorship_page_view');
    }
  }, [pathname]);

  const trackEvent = (event: string, data?: any) => {
    const analyticsEvent: MentorshipAnalyticsEvent = {
      event,
      timestamp: Date.now(),
      ...data
    };

    // Log to console for development


    // Send to analytics service (Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'mentorship',
        event_label: data?.planLevel || 'general',
        value: data?.planPrice || 0,
        custom_parameter_user_id: data?.userId || 'anonymous'
      });
    }

    // Send to your own analytics endpoint
    fetch('/api/analytics/mentorship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsEvent),
    }).catch(error => {
      console.error('Error sending analytics:', error);
    });
  };

  const trackPlanView = (planLevel: string, planPrice: number) => {
    trackEvent('mentorship_plan_view', {
      planLevel,
      planPrice
    });
  };

  const trackPlanClick = (planLevel: string, planPrice: number) => {
    trackEvent('mentorship_plan_click', {
      planLevel,
      planPrice
    });
  };

  const trackFAQView = (questionIndex: number) => {
    trackEvent('mentorship_faq_view', {
      questionIndex
    });
  };

  const trackCTAClick = (ctaType: 'plans' | 'consultation') => {
    trackEvent('mentorship_cta_click', {
      ctaType
    });
  };

  const trackScrollDepth = (depth: number) => {
    trackEvent('mentorship_scroll_depth', {
      depth
    });
  };

  return {
    trackEvent,
    trackPlanView,
    trackPlanClick,
    trackFAQView,
    trackCTAClick,
    trackScrollDepth
  };
}; 