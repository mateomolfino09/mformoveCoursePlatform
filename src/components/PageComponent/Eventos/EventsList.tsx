'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductDB } from '../../../../typings';
import EventCard from './EventCard';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import Footer from '../../Footer';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { useForm } from 'react-hook-form';
import { toast } from '../../../hooks/useToast';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { MENTORSHIP_APPLY_CTA, MENTORSHIP_LANDING_CTA } from '../../../constants/mentorshipCta';
import {
  landingCtaGhostDark,
  landingCtaInverted,
  landingEyebrow,
  landingEyebrowDark,
  landingSectionBody,
  landingSectionBodyDark,
  landingSectionBodyMuted,
  landingSectionContainer,
  landingSectionTitle,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

interface Props {
  eventos: ProductDB[] | ProductDB;
}

const HERO_IMAGE = 'my_uploads/fondos/DSC00708_copy_k9gwfn.jpg';
const AGENDA_IMAGE = 'my_uploads/fondos/DSC01753_qdv9o0';
const MENTORSHIP_IMAGE = 'my_uploads/plaza/DSC03366_ctiejt';
const CUERPO_IMAGE = 'my_uploads/fondos/DSC01642_rioxq5';
const NOTICE_IMAGE = 'my_uploads/plaza/DSC03350_vgjrrh';

const ENCUENTRO = [
  {
    title: 'Entrás y practicás',
    body: 'La clase se sigue desde donde estés. Si hace falta experiencia previa, está escrito en la ficha del evento.',
  },
  {
    title: 'El grupo aclara el movimiento',
    body: 'Ver a otras personas moverse ordena lo que, practicando solo, queda difuso. El ritmo lo marca la sala.',
  },
  {
    title: 'Te llevás una repetición',
    body: 'El encuentro dura un rato. Lo que te queda es una forma de seguir practicando durante la semana.',
  },
] as const;

const FAQS = [
  {
    q: '¿Qué tipo de encuentros hacen?',
    a: 'No hay un único formato. Puede ser un trekking, un taller de movilidad, una práctica de movimiento, una experiencia al aire libre o algo completamente distinto. Cada encuentro tiene su propia propuesta, pero todos parten de la misma idea: movernos, aprender y compartir con otras personas.',
  },
  {
    q: '¿Hace falta experiencia?',
    a: 'En la mayoría, no. La idea es que puedas sumarte desde donde estás, aunque nunca hayas entrenado conmigo. Si algún encuentro necesita experiencia previa o tiene una exigencia física particular, lo vas a encontrar aclarado antes de reservar.',
  },
  {
    q: '¿Puedo ir solo/a?',
    a: 'Sí. De hecho, podés venir sin conocer a nadie. Parte de la gracia de estos encuentros es compartir la experiencia con otras personas que también tienen ganas de moverse, explorar y hacer algo distinto.',
  },
  {
    q: '¿Qué tengo que llevar?',
    a: 'Depende del encuentro. Cuando reserves vas a recibir toda la información necesaria: qué llevar, dónde encontrarnos, horarios y cualquier recomendación específica para ese día.',
  },
  {
    q: '¿Qué pasa si llueve o cambia el clima?',
    a: 'Si el evento depende del clima, vamos a estar atentos al pronóstico y te avisaremos cualquier cambio con tiempo. Cada fecha va a aclarar también qué sucede en caso de reprogramación o cancelación.',
  },
  {
    q: '¿Son online o presenciales?',
    a: 'Hay de los dos. Cada fecha lo aclara antes de que reserves. Los presenciales suelen tener cupos reducidos para que podamos compartir y practicar de verdad; en los online recibís el enlace con la confirmación.',
  },
  {
    q: '¿Esto es parte de Cuerpo Autónomo?',
    a: 'No necesariamente. Cuerpo Autónomo es el espacio para desarrollar una práctica y un proceso en el tiempo. Los eventos son experiencias puntuales: nos encontramos un día, a una hora, alrededor de una propuesta concreta. Podés venir aunque no formes parte del programa.',
  },
  {
    q: '¿Cómo me entero del próximo?',
    a: 'Podés dejar tu correo al final de esta página. Cuando aparezca una nueva fecha, te avisamos por ahí. No hacemos eventos por hacer: cuando haya una propuesta que valga la pena compartir, te vas a enterar.',
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const btnInk =
  'group inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3 text-center font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-palette-cream transition-all duration-200 hover:border-palette-cream hover:bg-palette-cream hover:text-palette-ink sm:w-auto';

const btnOutline =
  'group inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-transparent px-6 py-3 text-center font-montserrat text-sm font-semibold uppercase tracking-[0.16em] text-palette-ink transition-all duration-200 hover:bg-palette-ink hover:text-palette-cream sm:w-auto';

const EventsList: React.FC<Props> = ({ eventos }) => {
  let eventosFiltrados: ProductDB[] = [];
  if (Array.isArray(eventos)) {
    eventosFiltrados = eventos;
  } else if (eventos && typeof eventos === 'object') {
    eventosFiltrados = [eventos as ProductDB];
  }

  const cantidad = eventosFiltrados.length;
  const hayEventos = cantidad > 0;

  const { register, handleSubmit } = useForm();
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function validateEmail(email: string) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  const onSubmitNewsletter = async (data: { email?: string }) => {
    setNewsletterLoading(true);
    const email = data.email || '';

    if (!validateEmail(email)) {
      toast.error('Ingresá un correo válido.');
      setNewsletterLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.status >= 400) {
        if (result.title == 'Member Exists') {
          toast.error('Este correo ya está en la lista.');
        } else {
          toast.error('No pudimos anotarte. Escribinos por Instagram y lo vemos.');
        }
        setNewsletterLoading(false);
        return;
      }

      setNewsletterLoading(false);
      toast.success('Listo. Te avisamos cuando haya una fecha.');
    } catch {
      toast.error('No pudimos anotarte. Escribinos por Instagram y lo vemos.');
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-palette-cream font-montserrat text-palette-ink">
      <MainSideBar where={'events'}>
        <section className="relative min-h-[78vh] overflow-hidden bg-palette-ink text-palette-cream md:min-h-[88vh]">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <CldImage
              src={HERO_IMAGE}
              alt="Práctica de movimiento en sala"
              fill
              className="object-cover object-[center_35%]"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-palette-ink/35" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,20,17,0.72),transparent_62%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-palette-ink/70 via-transparent to-palette-ink/20" />
          </motion.div>

          <motion.div
            className="relative z-10 mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-5 py-28 text-center md:min-h-[88vh] md:px-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
            }}
          >
            <motion.p variants={fadeUp} className={landingEyebrowDark}>
              MMOVE · Encuentros
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 font-montserrat text-[clamp(3.4rem,9vw,6.4rem)] font-bold leading-[0.92] tracking-tight"
            >
              Eventos
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-[17px] font-normal leading-[1.65] text-palette-cream/90 sm:text-[20px] md:text-[22px]"
            >
              Clases, talleres y prácticas en vivo. Un rato con otras personas, online o en el mismo espacio.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              <span className="rounded-full border border-palette-cream/25 bg-palette-ink/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-palette-cream/90 backdrop-blur-sm">
                Online y presenciales
              </span>
              <span className="rounded-full border border-palette-cream/40 bg-palette-cream/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-palette-cream backdrop-blur-sm">
                {hayEventos
                  ? `${cantidad} ${cantidad === 1 ? 'fecha en agenda' : 'fechas en agenda'}`
                  : 'Fechas por confirmar'}
              </span>
            </motion.div>
          </motion.div>

          <a
            href="#agenda"
            className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream/70 transition-colors hover:text-palette-cream"
          >
            Agenda
            <ChevronDownIcon className="h-5 w-5" />
          </a>
        </section>

        <section className="border-t border-palette-ink/10 bg-white py-16 font-montserrat md:py-24">
          <motion.div
            className={`${landingSectionContainer} max-w-3xl text-center`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
          >
            <p className={landingEyebrow}>Por qué un encuentro</p>
            <h2 className={landingSectionTitle}>Practicar solo tiene un techo.</h2>
            <p className={`${landingSectionBody} mx-auto max-w-2xl`}>
              En una sala el grupo marca el ritmo. Ves a otras personas moverse y te vas con una forma
              de repetir lo que hiciste. Llegás el tiempo que dure la clase. Con eso alcanza para empezar.
            </p>
          </motion.div>
        </section>

        <section
          id="agenda"
          className="scroll-mt-20 border-t border-palette-stone/20 bg-palette-cream py-16 font-montserrat md:py-24"
        >
          <div className={landingSectionContainer}>
            <motion.div
              className="mb-10 flex max-w-3xl flex-col gap-2 md:mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
            >
              <p className={landingEyebrow}>Agenda</p>
              <h2 className={landingSectionTitle}>
                {hayEventos ? 'Próximos eventos' : 'Las próximas fechas se están armando'}
              </h2>
              <p className={landingSectionBodyMuted}>
                {hayEventos
                  ? `${cantidad} ${cantidad === 1 ? 'encuentro' : 'encuentros'} con día, modalidad y cupo. Elegí uno y reservá tu lugar.`
                  : 'Cuando haya un encuentro, va a figurar acá con día, modalidad y cupo. La práctica, mientras tanto, sigue en Cuerpo Autónomo.'}
              </p>
            </motion.div>

            {hayEventos ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {eventosFiltrados.map((evento, index) => (
                  <EventCard key={evento._id || evento.id || index} evento={evento} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
                <div>
                  <ul className="divide-y divide-palette-stone/15 border-y border-palette-stone/15">
                    {[
                      ['01', 'Día y horario', 'Confirmados en la ficha, antes de reservar.'],
                      ['02', 'Online o un lugar', 'Cada fecha dice si es en sala o por enlace.'],
                      ['03', 'Cupo chico', 'Para poder practicar, no para llenar un auditorio.'],
                    ].map(([step, title, line]) => (
                      <li key={step} className="flex items-start gap-4 py-5">
                        <span className="mt-0.5 font-montserrat text-sm font-semibold tabular-nums text-palette-stone">
                          {step}
                        </span>
                        <div>
                          <p className="font-montserrat text-[17px] font-semibold tracking-tight text-palette-ink">
                            {title}
                          </p>
                          <p className="mt-1 text-[15px] leading-relaxed text-palette-stone">{line}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a href="/cuerpo-autonomo" className={btnInk}>
                      Formación online
                      <ArrowRightIcon className="h-4 w-4" />
                    </a>
                    <a href={MENTORSHIP_APPLY_CTA.href} className={btnOutline}>
                      {MENTORSHIP_APPLY_CTA.label}
                    </a>
                  </div>
                </div>
                <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-palette-stone/20 shadow-[0_20px_50px_-28px_rgba(20,20,17,0.2)] lg:min-h-[420px]">
                  <CldImage
                    src={AGENDA_IMAGE}
                    alt="Práctica de movilidad"
                    fill
                    className="object-cover object-[center_40%]"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-16 font-montserrat text-palette-cream md:py-24">
          <div className={landingSectionContainer}>
            <motion.div
              className="mb-10 max-w-3xl md:mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
            >
              <p className={landingEyebrowDark}>En la sala</p>
              <h2 className={landingSectionTitleDark}>Qué pasa cuando venís</h2>
              <p className={landingSectionBodyDark}>
                Un evento de MMOVE es una práctica compartida. Tres cosas se repiten en casi todas las fechas.
              </p>
            </motion.div>

            <ol className="mx-auto max-w-3xl space-y-6 md:space-y-8">
              {ENCUENTRO.map((item, index) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: '-40px' }}
                  className="flex items-start gap-4 md:gap-6"
                >
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-palette-cream/70 bg-palette-ink font-montserrat text-sm font-semibold tabular-nums text-palette-cream shadow-[0_0_0_4px_rgba(250,248,244,0.12)] md:size-11">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="min-w-0 pt-1">
                    <h3 className="font-montserrat text-[1.25rem] font-semibold leading-snug tracking-tight text-palette-cream md:text-[1.45rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[16px] leading-[1.7] text-palette-cream/80 md:text-[18px]">
                      {item.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-palette-ink/10 bg-white py-16 font-montserrat md:py-24">
          <div className={landingSectionContainer}>
            <motion.div
              className="mb-10 max-w-3xl md:mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
            >
              <p className={landingEyebrow}>Si querés seguir</p>
              <h2 className={landingSectionTitle}>Dos caminos, según lo que necesitás</h2>
              <p className={landingSectionBody}>
                Un evento es un encuentro. La mentoría es alguien que mira tu proceso. Cuerpo Autónomo es
                el programa para practicar a tu ritmo, con el método y la comunidad.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
              <article className="flex flex-col overflow-hidden rounded-3xl border border-palette-ink/10 bg-palette-cream shadow-[0_18px_50px_-28px_rgba(20,20,17,0.18)]">
                <div className="relative h-52 sm:h-60">
                  <CldImage
                    src={MENTORSHIP_IMAGE}
                    alt="Práctica de handbalance"
                    fill
                    className="object-cover object-[center_45%]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-palette-ink/70 via-palette-ink/10 to-transparent" />
                  <p className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream">
                    Mentoría
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                  <h3 className="font-montserrat text-[clamp(1.7rem,3vw,2.2rem)] font-bold leading-tight tracking-tight">
                    Acompañamiento personal
                  </h3>
                  <p className="text-[16px] leading-[1.7] text-palette-ink/85 md:text-[18px]">
                    Evaluación, un plan armado para vos y seguimiento de cerca. Para cuando un encuentro
                    no alcanza y hace falta alguien que mire tu caso.
                  </p>
                  <ul className="space-y-2.5 text-[15px] text-palette-ink md:text-[16px]">
                    {['Evaluación personal', 'Plan según tus objetivos', 'Seguimiento 1:1', 'Comunidad de movers'].map(
                      (item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-palette-ink" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap">
                    <a href={MENTORSHIP_APPLY_CTA.href} className={btnInk}>
                      {MENTORSHIP_APPLY_CTA.label}
                    </a>
                    <a href={MENTORSHIP_LANDING_CTA.href} className={btnOutline}>
                      {MENTORSHIP_LANDING_CTA.label}
                    </a>
                  </div>
                </div>
              </article>

              <article className="flex flex-col overflow-hidden rounded-3xl border border-palette-cream/15 bg-palette-ink text-palette-cream shadow-[0_18px_50px_-28px_rgba(20,20,17,0.35)]">
                <div className="relative h-52 sm:h-60">
                  <CldImage
                    src={CUERPO_IMAGE}
                    alt="Práctica de Cuerpo Autónomo"
                    fill
                    className="object-cover object-[center_42%]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-palette-ink via-palette-ink/25 to-transparent" />
                  <p className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream">
                    Cuerpo Autónomo
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                  <h3 className="font-montserrat text-[clamp(1.7rem,3vw,2.2rem)] font-bold leading-tight tracking-tight text-palette-cream">
                    El programa para practicar
                  </h3>
                  <p className="text-[16px] leading-[1.7] text-palette-cream/85 md:text-[18px]">
                    Recuperá la capacidad de moverte con libertad. Avanzás a tu ritmo, con el método y
                    la comunidad, el día que puedas sentarte a practicar.
                  </p>
                  <ul className="space-y-2.5 text-[15px] text-palette-cream md:text-[16px]">
                    {[
                      'Práctica ordenada, a tu ritmo',
                      'Material de por vida',
                      'Comunidad para sostener el proceso',
                      'Acceso al empezar',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-palette-cream" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap">
                    <a href="/cuerpo-autonomo" className={`${landingCtaInverted} w-full sm:w-auto`}>
                      Formación online
                      <ArrowRightIcon className="h-4 w-4" />
                    </a>
                    <a href="/cuerpo-autonomo#membership-plans" className={`${landingCtaGhostDark} w-full sm:w-auto`}>
                      Ver el programa
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-t border-palette-stone/20 bg-palette-cream py-16 font-montserrat md:py-24">
          <div className={`${landingSectionContainer} grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16`}>
            <div className="max-w-md">
              <p className={landingEyebrow}>Preguntas frecuentes</p>
              <h2 className={landingSectionTitle}>Antes de anotarte</h2>
              <p className={landingSectionBodyMuted}>
                El formato, si podés sumarte sin experiencia, qué llevar y cómo enterarte del próximo.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-palette-stone/18 bg-white/70">
              {FAQS.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <div key={faq.q} className={index > 0 ? 'border-t border-palette-stone/15' : ''}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left md:px-6"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : index)}
                    >
                      <span className="font-montserrat text-[16px] font-semibold leading-snug tracking-tight text-palette-ink md:text-[18px]">
                        {faq.q}
                      </span>
                      <ChevronDownIcon
                        className={`mt-1 h-5 w-5 shrink-0 text-palette-stone transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {open ? (
                      <p className="px-5 pb-5 text-[15px] leading-[1.7] text-palette-stone md:px-6 md:text-[17px]">
                        {faq.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-16 font-montserrat md:py-20">
          <div className={landingSectionContainer}>
            <div className="relative overflow-hidden rounded-3xl border border-palette-cream/15 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]">
              <CldImage
                src={NOTICE_IMAGE}
                alt=""
                fill
                className="object-cover object-[80%_center]"
                sizes="(max-width: 1152px) 92vw, 1152px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#141411_0%,rgba(20,20,17,0.92)_38%,rgba(20,20,17,0.28)_100%)]" />
              <div className="relative z-10 max-w-xl px-6 py-10 text-palette-cream md:px-10 md:py-14">
                <p className={landingEyebrowDark}>Aviso de fechas</p>
                <h2 className={landingSectionTitleDark}>Te escribimos cuando hay un encuentro</h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-palette-cream/85 md:text-[18px]">
                  Un mail corto cuando se abre una fecha. A veces también llega una práctica o una nota
                  para mirar el cuerpo con más atención.
                </p>
                <form
                  onSubmit={handleSubmit(onSubmitNewsletter)}
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <input
                    placeholder="Correo electrónico"
                    type="email"
                    {...register('email')}
                    className="h-12 w-full flex-1 rounded-full border border-white/80 bg-white px-5 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-white/70 sm:max-w-sm"
                    required
                  />
                  {newsletterLoading ? (
                    <MiniLoadingSpinner />
                  ) : (
                    <button type="submit" className={`${landingCtaInverted} shrink-0`}>
                      Avisame
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </MainSideBar>
    </div>
  );
};

export default EventsList;
