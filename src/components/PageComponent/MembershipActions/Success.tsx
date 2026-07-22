'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Footer from '../../Footer';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { routes } from '../../../constants/routes';
import { WHATSAPP_BUTTON_COLOR } from '../../../constants/community';
import { ArrowRightIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAndClearPendingPreventaRedemption } from '../../../utils/cursoPreventaCheckoutStorage';
import { STRIPE_CHECKOUT_SESSION_PLACEHOLDER } from '../../../lib/cursoPaymentUrls';
import { formatTitleCaseWords } from '../../../lib/formatDisplayTitle';
import {
  clearCursoBienvenidaPendiente,
  saveRedirectUrl,
  setCursoBienvenidaPendiente,
} from '../../../utils/redirectQueue';
import Cookie from 'js-cookie';
import endpoints from '../../../services/api';
import type { User } from '../../../../typings';

function extractProductDisplayName(product: Record<string, unknown> | null | undefined): string | null {
  if (!product) return null;
  const cursoConfig = product.cursoConfig as Record<string, unknown> | undefined;
  const hero = cursoConfig?.hero as Record<string, unknown> | undefined;
  const introHighlights = cursoConfig?.introHighlights as Record<string, unknown> | undefined;
  const raw =
    product.nombre ||
    product.name ||
    hero?.titulo ||
    introHighlights?.eyebrow;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed ? formatTitleCaseWords(trimmed) : null;
}

async function fetchCurrentUser(): Promise<User | null> {
  const token = Cookie.get('userToken');
  if (!token) return null;
  const res = await fetch(endpoints.auth.profile, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ?? null;
}

const Success = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [invitacionGrupoWhatsapp, setInvitacionGrupoWhatsapp] = useState<string | null>(null);
  const [productNombre, setProductNombre] = useState<string | null>(null);
  const preventaCupoRequested = useRef(false);
  const stripeFulfillRequested = useRef(false);

  const tipo = searchParams.get('tipo');
  const isCurso = tipo === 'curso';
  const productId = searchParams.get('productId')?.trim() || '';
  const preventaTierParam = searchParams.get('preventaTier');
  const isPreventaCheckout =
    isCurso && preventaTierParam != null && preventaTierParam !== '';

  useEffect(() => {
    if (auth.user) {
      auth.fetchUser();
    }
  }, [auth]);

  useEffect(() => {
    dispatch(toggleScroll(false));

    const handleScroll = () => {
      if (window.scrollY === 0) {
        dispatch(toggleScroll(false));
      } else {
        dispatch(toggleScroll(true));
      }
    };

    if (window.scrollY === 0) {
      dispatch(toggleScroll(false));
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      dispatch(toggleScroll(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isCurso || !productId || stripeFulfillRequested.current) return;

    const providerParam = searchParams.get('provider');
    if (providerParam === 'dlocalgo' || providerParam === 'mercadopago') return;

    const rawSessionId = searchParams.get('session_id')?.trim();
    const sessionId =
      rawSessionId && rawSessionId !== STRIPE_CHECKOUT_SESSION_PLACEHOLDER
        ? rawSessionId
        : undefined;

    if (!sessionId) return;

    const dedupeKey = `stripe-course-complete:${productId}:${sessionId}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
    } catch {
      /* ignore */
    }

    stripeFulfillRequested.current = true;

    const authUserId = auth.user?._id ? String(auth.user._id) : undefined;

    fetch('/api/payments/course/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        provider: 'stripe',
        productId,
        sessionId,
        ...(authUserId ? { userId: authUserId } : {}),
      }),
    })
      .then(async (res) => {
        if (res.ok || res.status === 409) {
          try {
            sessionStorage.setItem(dedupeKey, '1');
          } catch {
            /* ignore */
          }
        } else {
          stripeFulfillRequested.current = false;
        }
      })
      .catch(() => {
        stripeFulfillRequested.current = false;
      });
  }, [auth.user?._id, isCurso, productId, searchParams]);

  useEffect(() => {
    if (!isCurso || !productId || stripeFulfillRequested.current) return;

    const providerParam = searchParams.get('provider');
    if (providerParam !== 'mercadopago') return;

    const paymentId =
      searchParams.get('payment_id')?.trim() ||
      searchParams.get('collection_id')?.trim() ||
      searchParams.get('id')?.trim();

    if (!paymentId || paymentId === 'null') return;

    const dedupeKey = `mp-course-complete:${productId}:${paymentId}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
    } catch {
      /* ignore */
    }

    stripeFulfillRequested.current = true;
    const authUserId = auth.user?._id ? String(auth.user._id) : undefined;

    fetch('/api/payments/course/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        provider: 'mercadopago',
        productId,
        paymentId,
        externalReference: searchParams.get('external_reference') || undefined,
        ...(authUserId ? { userId: authUserId } : {}),
      }),
    })
      .then(async (res) => {
        if (res.ok || res.status === 409) {
          try {
            sessionStorage.setItem(dedupeKey, '1');
          } catch {
            /* ignore */
          }
        } else {
          stripeFulfillRequested.current = false;
        }
      })
      .catch(() => {
        stripeFulfillRequested.current = false;
      });
  }, [auth.user?._id, isCurso, productId, searchParams]);

  useEffect(() => {
    if (!isCurso || !productId || preventaCupoRequested.current) return;

    const providerParam = searchParams.get('provider');
    const rawSessionId = searchParams.get('session_id')?.trim();
    const sessionIdParam =
      (rawSessionId && rawSessionId !== STRIPE_CHECKOUT_SESSION_PLACEHOLDER
        ? rawSessionId
        : undefined) ||
      searchParams.get('payment_id')?.trim() ||
      searchParams.get('id')?.trim() ||
      undefined;

    if (
      (providerParam === 'dlocalgo' || providerParam === 'mercadopago') &&
      !sessionIdParam
    ) {
      return;
    }

    let preventaTier: number | undefined;
    if (preventaTierParam != null && preventaTierParam !== '') {
      const parsed = Number(preventaTierParam);
      if (!Number.isNaN(parsed) && parsed >= 0) preventaTier = parsed;
    }

    if (preventaTier == null) {
      const pending = getAndClearPendingPreventaRedemption();
      if (pending?.productId === productId) {
        preventaTier = pending.preventaTierIndex;
      }
    }

    if (preventaTier == null) return;

    const dedupeKey = `curso-preventa-cupo-done:${productId}:${sessionIdParam || preventaTier}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
    } catch {
      /* ignore */
    }

    preventaCupoRequested.current = true;

    fetch('/api/product/curso/confirm-preventa-cupo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        preventaTier,
        sessionId: sessionIdParam,
      }),
    })
      .then(async (res) => {
        if (res.ok || res.status === 409) {
          try {
            sessionStorage.setItem(dedupeKey, '1');
          } catch {
            /* ignore */
          }
        }
      })
      .catch((err) => {
        console.error('[Success] confirm-preventa-cupo', err);
        preventaCupoRequested.current = false;
      });
  }, [isCurso, productId, preventaTierParam, searchParams]);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const loadProductContext = async () => {
      setIsContentLoading(true);
      setProductNombre(null);

      try {
        if (isCurso) {
          setCursoBienvenidaPendiente(productId);
        }

        const productRes = await fetch(`/api/product/viewProduct/${productId}`, {
          cache: 'no-store',
        });
        const productData = productRes.ok ? await productRes.json() : null;
        const nombre = extractProductDisplayName(productData?.product);
        if (!cancelled && nombre) {
          setProductNombre(nombre);
        }

        if (isCurso) {
          const cursosRes = await fetch('/api/user/cursos', {
            credentials: 'include',
            cache: 'no-store',
          });
          const cursosData = cursosRes.ok ? await cursosRes.json() : null;
          const match = (cursosData?.cursos || []).find(
            (c: { productoId?: string }) => c.productoId === productId
          );
          if (!cancelled && match?.invitacionGrupoWhatsapp) {
            setInvitacionGrupoWhatsapp(match.invitacionGrupoWhatsapp);
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          setIsContentLoading(false);
        }
      }
    };

    loadProductContext();

    return () => {
      cancelled = true;
    };
  }, [isCurso, productId]);

  useEffect(() => {
    if (productId || isCurso) return;

    let cancelled = false;

    const loadMembershipContext = async () => {
      setIsContentLoading(true);
      setProductNombre(null);

      try {
        const user = auth.user ?? (await fetchCurrentUser());
        const planId = user?.subscription?.planId;
        if (planId) {
          const planRes = await fetch(`/api/user/getUserPlan/${planId}`);
          const planData = planRes.ok ? await planRes.json() : null;
          const planName = planData?.plan?.name;
          if (!cancelled && typeof planName === 'string' && planName.trim()) {
            setProductNombre(formatTitleCaseWords(planName.trim()));
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) {
          setIsContentLoading(false);
        }
      }
    };

    loadMembershipContext();

    return () => {
      cancelled = true;
    };
  }, [isCurso, productId, auth.user]);

  const handlePrimaryCta = async () => {
    setIsLoading(true);
    try {
      if (isCurso && productId) {
        const completeRes = await fetch('/api/user/cursos/completar-bienvenida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId }),
        });

        if (completeRes.status === 401) {
          saveRedirectUrl(`/pago/exito?productId=${productId}&tipo=curso`);
          router.push('/iniciar-sesion');
          return;
        }

        clearCursoBienvenidaPendiente();

        const res = await fetch('/api/user/cursos', {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = res.ok ? await res.json() : null;
        const match = (data?.cursos || []).find(
          (c: { productoId?: string }) => c.productoId === productId
        );
        if (match?.rutaContenido) {
          router.push(match.rutaContenido);
          return;
        }
        router.push(routes.navegation.membership.library);
        return;
      }
      router.push(routes.navegation.membership.library);
    } catch {
      router.push(routes.navegation.membership.library);
    }
  };

  const title = isCurso
    ? isPreventaCheckout
      ? productNombre
        ? `¡Tu lugar en preventa de ${productNombre} está confirmado!`
        : '¡Tu lugar en preventa está confirmado!'
      : productNombre
        ? `Te doy la bienvenida a ${productNombre}`
        : 'Te doy la bienvenida'
    : productNombre
      ? `¡Bienvenido a ${productNombre}!`
      : '¡Bienvenido a MMOVE Online!';

  const mainMessage = isCurso
    ? isPreventaCheckout
      ? 'Tu pago de preventa se procesó correctamente. Te avisaremos cuando el contenido esté disponible en la fecha de lanzamiento.'
      : 'Tu lugar está confirmado. También te enviamos un email con los detalles. Cuando quieras, seguí con el botón de abajo.'
    : 'Tu pago se ha procesado correctamente. Tu membresía está siendo activada y recibirás un email de confirmación en breve.';

  const footerHint = isCurso
    ? isPreventaCheckout
      ? 'Guardamos tu reserva; el acceso al contenido se habilitará en el lanzamiento.'
      : 'El acceso al curso se activará en los próximos minutos.'
    : 'Tu membresía se activará automáticamente en los próximos minutos';

  const ctaLabel = isCurso ? 'Comenzar ahora' : 'Empezar ahora';

  return (
    <MainSideBar where={''}>
      <section className="relative w-full min-h-[100vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-palette-ink">
        <motion.div className="absolute inset-0">
          <CldImage
            src="my_uploads/fondos/DSC01753_qdv9o0"
            alt={isCurso ? 'Bienvenida al curso' : 'Pago confirmado'}
            fill
            priority
            className="object-cover opacity-40"
            style={{ objectPosition: 'center top' }}
            preserveTransformations
            loader={imageLoader}
          />
          <div className="absolute inset-0 bg-palette-ink/50" />
        </motion.div>

        <motion.div className="relative z-10 max-w-5xl mx-auto px-6 text-center font-montserrat text-palette-cream">
          {isContentLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 md:py-24"
              aria-live="polite"
              aria-busy="true"
            >
              <ArrowPathIcon className="h-12 w-12 md:h-14 md:w-14 animate-spin text-palette-sage mb-6" />
              <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-cream/60 mb-3">
                Pago confirmado
              </p>
              <p className="text-base md:text-lg font-light text-palette-cream/80">
                Cargando los detalles de tu compra...
              </p>
            </motion.div>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-cream/60 mb-4"
              >
                Pago confirmado
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="absolute inset-0 rounded-full blur-2xl bg-palette-sage/25"
                  />
                  <CheckCircleIcon className="relative h-20 w-20 md:h-28 md:w-28 drop-shadow-2xl text-palette-sage" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-semibold font-montserrat mb-6 tracking-tight text-palette-cream"
              >
                {title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <p className="text-lg md:text-xl lg:text-2xl font-light max-w-3xl mx-auto mb-6 leading-relaxed text-palette-cream/90">
                  {mainMessage}
                </p>
              </motion.div>

              {!isCurso && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="max-w-2xl mx-auto mb-10"
                >
                  <p className="font-raleway italic text-palette-cream/85 text-base md:text-lg leading-relaxed">
                    Simple, claro y sostenible.{' '}
                    <span className="font-semibold not-italic text-palette-cream">
                      Hecho para acompañar tu día a día.
                    </span>
                  </p>
                  <p className="text-palette-cream/70 text-sm md:text-base font-light mt-4 font-montserrat">
                    — Mateo Molfino
                  </p>
                </motion.div>
              )}

              {isCurso && invitacionGrupoWhatsapp ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="flex justify-center mb-6"
                >
                  <a
                    href={invitacionGrupoWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: WHATSAPP_BUTTON_COLOR }}
                  >
                    Unirme al grupo de WhatsApp
                  </a>
                </motion.div>
              ) : null}

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: isCurso ? 0.5 : 0.6 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handlePrimaryCta}
                  disabled={isLoading}
                  className="font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-8 py-4 md:px-10 md:py-4 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-white hover:border-white transition-all duration-200 flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-palette-cream disabled:hover:border-palette-cream/80"
                  whileHover={!isLoading ? { y: -2, scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <>
                      Cargando...
                      <ArrowPathIcon className="w-5 h-5 md:w-6 md:h-6 animate-spin text-palette-ink" />
                    </>
                  ) : (
                    <>
                      {ctaLabel}
                      <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 text-palette-ink group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-8"
              >
                <p className="text-xs md:text-sm font-light text-palette-cream/60 font-montserrat">
                  {footerHint}
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>
      <Footer />
    </MainSideBar>
  );
};

export default Success;
