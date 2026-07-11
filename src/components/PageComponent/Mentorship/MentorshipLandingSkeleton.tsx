'use client';

import MainSideBar from '../../MainSidebar/MainSideBar';
import FooterProfile from '../Profile/FooterProfile';
import { CourseSkeletonShimmer } from '../Course/CourseSkeletonShimmer';

const MentorshipLandingSkeleton = () => {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-palette-cream font-montserrat"
      aria-busy="true"
      aria-label="Cargando mentoría"
    >
      <MainSideBar where="mentorship">
        {/* Hero — MentorshipBannerCarousel */}
        <section className="relative w-full bg-palette-cream pt-24 pb-14 md:pt-28 md:pb-20">
          <div className="mx-auto w-[90%] max-w-6xl px-4">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-14">
              <div className="order-2 md:order-2 md:col-span-6 lg:col-span-7">
                <CourseSkeletonShimmer className="mx-auto aspect-[4/5] max-h-[min(78vh,640px)] w-full max-w-lg rounded-3xl md:max-w-none" />
              </div>
              <div className="order-1 space-y-5 md:order-1 md:col-span-6 lg:col-span-5">
                <CourseSkeletonShimmer className="h-3 w-24" />
                <CourseSkeletonShimmer className="h-12 w-full max-w-md" />
                <CourseSkeletonShimmer className="h-12 w-4/5 max-w-sm" />
                <CourseSkeletonShimmer className="h-4 w-full max-w-lg" />
                <CourseSkeletonShimmer className="h-4 w-5/6 max-w-md" />
                <CourseSkeletonShimmer className="mt-4 hidden h-12 w-72 rounded-full md:block" />
              </div>
            </div>
          </div>
        </section>

        {/* IsForYou / Includes — dark band */}
        <section className="bg-palette-ink py-16 md:py-24">
          <div className="mx-auto w-[92%] max-w-6xl space-y-8 px-3 sm:px-4">
            <div className="max-w-3xl space-y-4">
              <CourseSkeletonShimmer className="!bg-white/[0.08] h-3 w-28" />
              <CourseSkeletonShimmer className="!bg-white/[0.08] h-10 w-full max-w-lg" />
              <CourseSkeletonShimmer className="!bg-white/[0.08] h-4 w-full max-w-xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <CourseSkeletonShimmer
                  key={i}
                  className="!bg-white/[0.06] min-h-[5.5rem] w-full rounded-2xl md:rounded-3xl"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Process — bento cream */}
        <section className="border-t border-palette-stone/20 bg-palette-cream py-16 md:py-24">
          <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
            <div className="mb-10 max-w-3xl space-y-4">
              <CourseSkeletonShimmer className="h-3 w-32" />
              <CourseSkeletonShimmer className="h-10 w-full max-w-md" />
              <CourseSkeletonShimmer className="h-4 w-full max-w-lg" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
              <CourseSkeletonShimmer className="min-h-[14rem] rounded-2xl md:col-span-7 md:min-h-[18rem] md:rounded-3xl" />
              <CourseSkeletonShimmer className="min-h-[12rem] rounded-2xl md:col-span-5 md:min-h-[18rem] md:rounded-3xl" />
              <CourseSkeletonShimmer className="min-h-[10rem] rounded-2xl md:col-span-4 md:rounded-3xl" />
              <CourseSkeletonShimmer className="min-h-[10rem] rounded-2xl md:col-span-4 md:rounded-3xl" />
              <CourseSkeletonShimmer className="min-h-[10rem] rounded-2xl md:col-span-4 md:rounded-3xl" />
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="border-t border-palette-stone/20 bg-palette-cream py-16 md:py-24">
          <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
            <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center">
              <CourseSkeletonShimmer className="mx-auto h-3 w-24" />
              <CourseSkeletonShimmer className="mx-auto h-10 w-full max-w-md" />
              <CourseSkeletonShimmer className="mx-auto h-4 w-full max-w-lg" />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {[1, 2, 3].map((i) => (
                <CourseSkeletonShimmer
                  key={i}
                  className="min-h-[22rem] w-full rounded-2xl md:min-h-[24rem] md:rounded-3xl"
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-palette-stone/20 bg-palette-cream py-14 md:py-20">
          <div className="mx-auto w-[92%] max-w-3xl space-y-4 px-3 sm:px-4">
            <CourseSkeletonShimmer className="mx-auto mb-6 h-10 w-48" />
            {[1, 2, 3, 4, 5].map((i) => (
              <CourseSkeletonShimmer key={i} className="h-14 w-full rounded-2xl md:rounded-[1.35rem]" />
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-palette-cream pb-20 pt-6">
          <div className="mx-auto w-[85%] max-w-6xl px-4">
            <CourseSkeletonShimmer className="h-44 w-full rounded-none md:h-52" />
          </div>
        </section>

        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default MentorshipLandingSkeleton;
