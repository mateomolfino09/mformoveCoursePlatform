'use client';

import MainSideBar from '../../MainSidebar/MainSideBar';
import FooterProfile from '../Profile/FooterProfile';
import { CourseSkeletonShimmer } from './CourseSkeletonShimmer';

/**
 * Loader de página checkout curso — misma shell que la vista real (sidebar + crema + rejilla checkout).
 */
export default function CourseCheckoutSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-palette-cream font-montserrat text-palette-ink">
      <MainSideBar where="membership" forceStandardHeader>
        <section className="relative min-h-screen bg-palette-cream">
          <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-10 px-5 pb-16 pt-28 md:grid-cols-2 md:items-start md:gap-12 md:px-10 md:pb-20 md:pt-32 lg:gap-16 lg:px-14">
            <div className="order-2 md:order-1 md:sticky md:top-28 md:self-start">
              <CourseSkeletonShimmer className="mb-3 h-3 w-28 rounded md:w-32" />
              <CourseSkeletonShimmer className="mb-2 h-10 w-full max-w-md rounded-lg md:h-12 md:max-w-lg" />
              <CourseSkeletonShimmer className="mb-8 h-7 w-44 rounded-md md:h-8" />
              <div className="mb-6 space-y-2">
                <CourseSkeletonShimmer className="h-4 w-full max-w-xl rounded" />
                <CourseSkeletonShimmer className="h-4 w-full max-w-lg rounded" />
              </div>

              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-palette-stone/15 bg-white/40 px-4 py-4 md:px-5 md:py-4"
                  >
                    <div className="flex items-start gap-3">
                      <CourseSkeletonShimmer className="h-11 w-11 shrink-0 rounded-xl md:h-12 md:w-12" />
                      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                        <CourseSkeletonShimmer className="h-4 w-3/4 max-w-xs rounded" />
                        <CourseSkeletonShimmer className="h-3 w-full max-w-sm rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <CourseSkeletonShimmer className="mt-8 h-12 w-full rounded-full md:h-[3.25rem]" />
            </div>

            <div className="order-1 md:order-2">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-palette-stone/20 bg-palette-stone/10 md:aspect-[3/4] md:max-w-none">
                <CourseSkeletonShimmer className="absolute inset-0 rounded-[inherit]" />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-palette-stone/15 bg-palette-cream py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-10 lg:px-14">
            <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center md:mb-14">
              <CourseSkeletonShimmer className="mx-auto h-3 w-24 rounded md:w-28" />
              <CourseSkeletonShimmer className="mx-auto h-9 w-full max-w-md rounded-lg md:h-11 md:max-w-lg" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col">
                  <div className="mb-4 flex items-baseline gap-3">
                    <CourseSkeletonShimmer className="h-10 w-12 shrink-0 rounded-md md:h-11 md:w-14" />
                    <CourseSkeletonShimmer className="h-6 flex-1 rounded md:h-7" />
                  </div>
                  <CourseSkeletonShimmer className="mb-4 aspect-[4/3] w-full rounded-2xl md:rounded-3xl" />
                  <CourseSkeletonShimmer className="h-4 w-full rounded" />
                  <CourseSkeletonShimmer className="mt-2 h-4 w-full max-w-[92%] rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <FooterProfile />
      </MainSideBar>
    </div>
  );
}
