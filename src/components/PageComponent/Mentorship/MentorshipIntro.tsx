'use client'
import React from 'react';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import { motion } from 'framer-motion';
import { AcademicCapIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import MentorshipBannerCarousel from './MentorshipBannerCarousel';

const MentorshipIntro = () => {
  return (
    <MentorshipBannerCarousel />
  );
};

export default MentorshipIntro; 