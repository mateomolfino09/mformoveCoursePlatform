'use client'
import React, { useEffect, useState } from 'react'
import MainSideBar from '../../MainSidebar/MainSideBar'
import FooterProfile from '../Profile/FooterProfile';
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerHomeSlice'
import { useAuth } from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics'
import MentorshipIntro from './MentorshipIntro'
import MentorshipPhilosophy from './MentorshipPhilosophy'
import MentorshipPlans from './MentorshipPlans'
import MentorshipProcess from './MentorshipProcess'
import MentorshipFAQ from './MentorshipFAQ'
import MentorshipCTA from './MentorshipCTA'
import MentorshipTestimonials from './MentorshipTestimonials';
import MentorshipIsForYou from './MentorshipIsForYou';
import MentorshipIncludes from './MentorshipIncludes';
import MentorshipBio from './MentorshipBio';
import { MentorshipPlan, MentorshipProps } from '../../../types/mentorship'

const Mentorship = ({ plans, origin }: MentorshipProps) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const router = useRouter();
  const { trackScrollDepth } = useMentorshipAnalytics();

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  const handleScroll = (event: any) => {
    let isScrolled = event.target.scrollTop;

    if (isScrolled === 0) {
      dispatch(toggleScroll(false));
    } else {
      dispatch(toggleScroll(true));
    }

    // Track scroll depth for analytics
    const scrollPercentage = Math.round((isScrolled / (event.target.scrollHeight - event.target.clientHeight)) * 100);
    if (scrollPercentage % 25 === 0) { // Track every 25%
      trackScrollDepth(scrollPercentage);
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
        <MentorshipBio />
        <MentorshipIncludes />

        {/* <MentorshipPhilosophy /> */}
        <MentorshipProcess />
        <MentorshipPlans plans={plans} origin={origin} />
        <MentorshipTestimonials />
        <MentorshipCTA />
        <MentorshipFAQ />
        
        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default Mentorship; 