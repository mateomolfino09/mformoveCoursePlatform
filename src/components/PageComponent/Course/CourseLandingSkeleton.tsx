'use client';

import MainSideBar from '../../MainSidebar/MainSideBar';
import ShimmerBox from '../../ShimmerBox';
import FooterProfile from '../Profile/FooterProfile';
import { CourseSkeletonShimmer } from './CourseSkeletonShimmer';

const CourseLandingSkeleton = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-palette-cream font-montserrat">
      <MainSideBar where="membership">
        <section className="relative min-h-[100vh] bg-palette-cream font-montserrat">
          <div className="absolute left-[3.3rem] top-24 w-full px-7 md:left-[2.3rem] md:top-[3.3rem]">
            <CourseSkeletonShimmer className="mx-auto h-5 w-40 md:mx-0 md:w-52" />
          </div>

          <div className="mx-auto mt-20 w-[85%] max-w-6xl pb-10 pt-24 md:py-14">
            <CourseSkeletonShimmer className="mb-8 h-[60vh] w-full rounded-2xl md:aspect-video md:h-auto md:max-h-[70vh] md:rounded-3xl" />

            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
              <CourseSkeletonShimmer className="h-12 w-56 rounded-full" />
              <CourseSkeletonShimmer className="h-4 w-64 max-w-full" />
              <CourseSkeletonShimmer className="h-4 w-48 max-w-full" />
            </div>
          </div>
        </section>

        <section className="bg-black py-16 md:py-24">
          <div className="mx-auto w-[85%] max-w-6xl space-y-8 px-5 md:px-0">
            <ShimmerBox className="mx-auto h-10 w-4/5 max-w-xl rounded-lg" />
            <ShimmerBox className="mx-auto h-4 w-2/3 max-w-md rounded" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <ShimmerBox className="aspect-[4/3] w-full rounded-2xl md:rounded-3xl" />
              <ShimmerBox className="aspect-[4/3] w-full rounded-2xl md:rounded-3xl" />
            </div>
          </div>
        </section>

        <section className="bg-palette-cream py-14 md:py-20">
          <div className="mx-auto w-[85%] max-w-6xl space-y-6">
            <CourseSkeletonShimmer className="h-9 w-2/3 max-w-md" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 border-b border-palette-stone/10 pb-6">
                  <CourseSkeletonShimmer className="h-12 w-12 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <CourseSkeletonShimmer className="h-4 w-1/3" />
                    <CourseSkeletonShimmer className="h-4 w-full" />
                    <CourseSkeletonShimmer className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-palette-cream py-14 md:py-20">
          <div className="mx-auto w-[85%] max-w-6xl">
            <CourseSkeletonShimmer className="mx-auto mb-10 h-10 w-64" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {[1, 2, 3].map((i) => (
                <CourseSkeletonShimmer
                  key={i}
                  className="min-h-[17.5rem] w-full rounded-2xl md:min-h-[20rem] md:rounded-3xl"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-palette-cloud py-14 md:py-20">
          <div className="mx-auto w-[85%] max-w-3xl space-y-4">
            <CourseSkeletonShimmer className="mx-auto mb-8 h-10 w-48" />
            {[1, 2, 3, 4].map((i) => (
              <CourseSkeletonShimmer key={i} className="h-16 w-full rounded-2xl md:rounded-[1.35rem]" />
            ))}
          </div>
        </section>

        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default CourseLandingSkeleton;
