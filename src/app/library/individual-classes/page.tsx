'use client';

import React, { useEffect, useState } from 'react';
import { ClassTypes, IndividualClass, ValuesFilters } from '../../../../typings';
import OnboardingGuard from '../../../components/OnboardingGuard';
import MainSideBar from '../../../components/MainSidebar/MainSideBar';
import FilterNavWrapper from '../../../components/FilterNavWrapper';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setFilters, setClassType, toggleNav } from '../../../redux/features/filterClass';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import { motion } from 'framer-motion';
import { VscTools } from 'react-icons/vsc';
import { routes } from '../../../constants/routes';
import Head from 'next/head';
import Footer from '../../../components/Footer';
import IndividualClassesSkeleton from '../../../components/IndividualClassesSkeleton';

/** Extrae los minutos del valor del filtro (ej. "menor a 10" → 10, "20" → 20). */
function parseLargoMinutes(value: string): number | null {
  const asNum = Number(value);
  if (!Number.isNaN(asNum)) return asNum;
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function applyFilters(
  classes: IndividualClass[],
  filterState: { largo?: string[] | null; nivel?: string[] | null; ordenar?: string[] | null; seen?: boolean | null; classType?: string },
  authUserId?: string | null,
  classesSeen?: string[]
): IndividualClass[] {
  return classes.filter((c) => {
    let lengthOk = true;
    if (filterState.largo?.length) {
      lengthOk = filterState.largo.some((l) => {
        const num = parseLargoMinutes(l);
        if (num === null) return false;

        const classMinutes = Number(c.minutes);
        if (Number.isNaN(classMinutes)) return false;

        const low = Math.max(0, num - 5);
        const high = num + 5;
        return classMinutes >= low && classMinutes <= high;
      });
    }
    let levelOk = true;
    if (filterState.nivel?.length) {
      levelOk = filterState.nivel.some((n) => String(c.level) === n);
    }
    let orderOk = true;
    if (filterState.ordenar?.length) {
      orderOk = !filterState.ordenar.includes('nuevo') || !!c.new;
    }
    let seenOk = true;
    if (filterState.seen && authUserId && classesSeen) {
      seenOk = classesSeen.includes(c._id);
    }
    const typeOk =
      !filterState.classType || filterState.classType === 'all' || (c.type?.toLowerCase() === filterState.classType?.toLowerCase());
    return lengthOk && levelOk && orderOk && seenOk && typeOk;
  });
}

export default function IndividualClassesPage() {
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [filters, setFiltersState] = useState<ClassTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const filterClassSlice = useAppSelector((state) => state.filterClass.value);
  const auth = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, filtersRes] = await Promise.all([
          fetch('/api/individualClass/getClasses?populateModule=1', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
          }),
          fetch('/api/individualClass/getClassTypes', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
          }),
        ]);
        const classesData = await classesRes.json();
        const filtersData = await filtersRes.json();
        const allClasses = Array.isArray(classesData) ? classesData : [];
        const individualOnly = allClasses.filter((c: IndividualClass) => !c.moduleId);
        setClasses(individualOnly);
        const filtersArray = Array.isArray(filtersData) ? filtersData : [];
        setFiltersState(filtersArray);
        dispatch(setFilters(filtersArray));
      } catch (err) {
        console.error('Error fetching individual classes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dispatch]);

  const filteredClasses = applyFilters(
    classes,
    {
      largo: filterClassSlice.largo,
      nivel: filterClassSlice.nivel,
      ordenar: filterClassSlice.ordenar,
      seen: filterClassSlice.seen,
      classType: filterClassSlice.classType,
    },
    auth.user?.id,
    auth.user?.classesSeen
  );

  const typeValues = filters[0]?.values ?? [];

  if (loading) {
    return (
      <OnboardingGuard>
        <IndividualClassesSkeleton />
      </OnboardingGuard>
    );
  }

  return (
    <OnboardingGuard>
      <FilterNavWrapper>
        <div
          className="relative bg-palette-cream min-h-screen overflow-x-hidden font-montserrat"
          onScroll={(e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement;
            dispatch(toggleScroll(target.scrollTop > 0));
          }}
        >
          <MainSideBar where="library">
            <Head>
              <title>Clases individuales - Move Crew</title>
              <meta name="description" content="Clases guiadas sin módulo" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="relative px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 pt-28 md:pt-32 lg:pt-36 pb-20">
              <div className="max-w-7xl mx-auto">
                {/* Breadcrumb / back */}
                <Link
                  href={routes.navegation.membership.library}
                  className="inline-flex items-center gap-1 text-palette-stone hover:text-palette-ink text-sm mb-8"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Biblioteca
                </Link>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-palette-ink mb-6 lg:mb-8">
                  Clases individuales
                </h1>

                {/* Filtros: tipo + botón Filtros */}
                <div className="flex flex-wrap items-center gap-3 mb-10 md:mb-12">
                  <button
                    type="button"
                    onClick={() => dispatch(setClassType('all'))}
                    className={`px-4 py-2 rounded-full text-sm font-light transition-colors ${
                      filterClassSlice.classType === 'all'
                        ? 'bg-palette-ink text-palette-cream'
                        : 'bg-palette-stone/10 text-palette-ink hover:bg-palette-stone/20'
                    }`}
                  >
                    Todas
                  </button>
                  {typeValues.map((v: ValuesFilters) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => dispatch(setClassType(v.value))}
                      className={`px-4 py-2 rounded-full text-sm font-light transition-colors ${
                        filterClassSlice.classType === v.value
                          ? 'bg-palette-ink text-palette-cream'
                          : 'bg-palette-stone/10 text-palette-ink hover:bg-palette-stone/20'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => dispatch(toggleNav(true))}
                    className="ml-2 flex items-center gap-2 px-4 py-2 rounded-full bg-palette-sage/20 text-palette-ink hover:bg-palette-sage/30 transition-colors text-sm"
                  >
                    <VscTools className="w-4 h-4" />
                    Filtros
                  </button>
                </div>

                {/* Grid de clases */}
                {filteredClasses.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                  >
                    {filteredClasses.map((c) => {
                      const imgUrl =
                        c.image_base_link ||
                        c.image_url ||
                        'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg';
                      return (
                        <Link
                          key={c._id}
                          href={`/library/individual-classes/${c.id}`}
                          className="group flex flex-col rounded-2xl overflow-hidden bg-palette-cream ring-1 ring-palette-stone/10 hover:ring-palette-stone/20 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="relative w-full aspect-video overflow-hidden bg-palette-stone/10">
                            <Image
                              src={imgUrl}
                              alt={c.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              loader={imageLoader}
                            />
                          </div>
                          <div className="p-3 md:p-4 flex flex-col min-h-0">
                            <span className="font-medium text-palette-ink text-sm md:text-base line-clamp-2">
                              {c.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-palette-stone">
                              <span>{c.minutes} min</span>
                              {c.type && (
                                <>
                                  <span>·</span>
                                  <span className="uppercase">{c.type}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                ) : (
                  <p className="text-center text-palette-stone py-16">
                    No hay clases que coincidan con los filtros.
                  </p>
                )}
              </div>
            </main>

            {/* Footer a nivel de toda la sección */}
            <section className="mt-24 md:mt-32 w-full">
              <Footer />
            </section>
          </MainSideBar>
        </div>
      </FilterNavWrapper>
    </OnboardingGuard>
  );
}
