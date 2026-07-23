'use client'
import React, { Suspense, useEffect } from 'react'
import MainSideBar from '../../MainSidebar/MainSideBar'
import FooterProfile from '../Profile/FooterProfile'
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerLibrarySlice'
import { useAuth } from '../../../hooks/useAuth'
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics'
import MentorshipIntro from './MentorshipIntro'
import MentorshipPlans from './MentorshipPlans'
import MentorshipProcess from './MentorshipProcess'
import MentorshipFAQ from './MentorshipFAQ'
import MentorshipCTA from './MentorshipCTA'
import MentorshipTestimonials from './MentorshipTestimonials'
import MentorshipIsForYou from './MentorshipIsForYou'
import MentorshipIncludes from './MentorshipIncludes'
import MentorshipBio from './MentorshipBio'
import { MentorshipProps } from '../../../types/mentorship'

const Mentorship = ({ plans, origin, plansLoading = false, plansError = null }: MentorshipProps) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { trackScrollDepth } = useMentorshipAnalytics();
  const lastTrackedDepth = React.useRef(-1);

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  const handleScroll = (event: any) => {
    const isScrolled = event.target.scrollTop;

    if (isScrolled === 0) {
      dispatch(toggleScroll(false));
    } else {
      dispatch(toggleScroll(true));
    }

    const max = event.target.scrollHeight - event.target.clientHeight;
    if (max <= 0) return;
    const scrollPercentage = Math.round((isScrolled / max) * 100);
    const bucket = Math.floor(scrollPercentage / 25) * 25;
    if (bucket > 0 && bucket !== lastTrackedDepth.current && bucket % 25 === 0) {
      lastTrackedDepth.current = bucket;
      trackScrollDepth(bucket);
    }
  };

  return (
    <div 
      className='relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden' 
      onScroll={(event: any) => handleScroll(event)}
    >
      <MainSideBar where={'mentorship'}>
        <MentorshipIntro />
        <MentorshipIsForYou />
        <MentorshipIncludes />
        <MentorshipProcess />
        <MentorshipTestimonials />
        <MentorshipBio />
        <Suspense
          fallback={
            <section
              id="mentorship-plans"
              className="border-t border-palette-stone/20 bg-palette-cream py-16 md:py-24"
            >
              <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-stone/25 border-t-palette-ink" />
              </div>
            </section>
          }
        >
          <MentorshipPlans
            plans={plans}
            origin={origin}
            plansLoading={plansLoading}
            plansError={plansError}
          />
        </Suspense>
        <MentorshipFAQ />
        <MentorshipCTA />
        
        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default Mentorship;
