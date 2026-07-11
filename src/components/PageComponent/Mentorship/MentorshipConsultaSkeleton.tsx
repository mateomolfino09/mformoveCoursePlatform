'use client';

import React from 'react';
import { CldImage } from 'next-cloudinary';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import imageLoader from '../../../../imageLoader';
import { CourseSkeletonShimmer } from '../Course/CourseSkeletonShimmer';

const CONSULTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

function ConsultaBackdropSkeleton() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <CldImage
        src={CONSULTA_BG}
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-[center_42%]"
        loader={imageLoader}
        preserveTransformations
      />
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay bg-palette-ink md:opacity-[0.26]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-palette-ink/[0.78] via-palette-ink/[0.58] to-palette-ink/[0.42]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-palette-cream/[0.06]" aria-hidden />
    </div>
  );
}

export default function MentorshipConsultaSkeleton() {
  return (
    <MainSideBar where="mentorship">
      <div className="relative flex min-h-screen items-center justify-center bg-palette-cream pb-28 pt-[7rem] font-montserrat md:pb-32 md:pt-28">
        <ConsultaBackdropSkeleton />

        <div className="relative z-10 mx-auto mb-8 flex min-h-[58vh] w-full max-w-2xl items-center justify-center px-4 md:px-6">
          <div
            className="w-full space-y-8 rounded-3xl border border-palette-stone/20 bg-white/95 p-7 shadow-[0_14px_48px_rgba(20,20,17,0.08)] backdrop-blur-md md:space-y-9 md:p-12"
            aria-busy="true"
            aria-label="Cargando formulario de mentoría"
          >
            <div className="space-y-3 text-center">
              <CourseSkeletonShimmer className="mx-auto h-3 w-24" />
              <CourseSkeletonShimmer className="mx-auto h-9 w-56 max-w-full sm:w-64" />
            </div>

            <CourseSkeletonShimmer className="mx-auto h-4 w-full max-w-md" />
            <CourseSkeletonShimmer className="mx-auto h-4 w-4/5 max-w-sm" />

            <div className="space-y-3 pt-2">
              <CourseSkeletonShimmer className="h-4 w-3/4 max-w-xs" />
              <CourseSkeletonShimmer className="h-12 w-full rounded-xl" />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
              <CourseSkeletonShimmer className="h-11 w-full rounded-full sm:w-28" />
              <CourseSkeletonShimmer className="h-11 w-full rounded-full sm:ml-auto sm:w-36" />
            </div>

            <div className="mt-8 border-t border-palette-stone/15 pt-6">
              <div className="mb-2 flex items-center justify-between">
                <CourseSkeletonShimmer className="h-3 w-20" />
                <CourseSkeletonShimmer className="h-3 w-8" />
              </div>
              <CourseSkeletonShimmer className="h-[3px] w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </MainSideBar>
  );
}
