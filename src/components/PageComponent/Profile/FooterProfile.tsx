'use client'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { usePathname } from 'next/navigation'
import { CiInstagram, CiMail, CiYoutube } from 'react-icons/ci'
import { routes } from '../../../constants/routes'

const FooterProfile = () => {
  const auth = useAuth()
  const path = usePathname()
  const email = 'info@mateomove.com'
  const subject = encodeURIComponent('Consulta sobre tus servicios')
  const body = encodeURIComponent(
    `Hola Mateo,\n\nEstoy interesado en conocer más sobre tus servicios y tengo algunas dudas.\n\nEspecíficamente, me gustaría saber sobre:\n- [Especifica aquí tu consulta]\n\nTambién quisiera saber si hay opciones para solucionar [cualquier problema o inquietud].\n\n¡Gracias de antemano! Espero tu respuesta.\n\nSaludos,\n[Tu Nombre]`
  )
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`

  const homeHref =
    auth?.user?.subscription?.active || auth?.user?.isVip
      ? '/library'
      : path === routes.navegation.selectPlan
        ? routes.navegation.membership.library
        : path === routes.navegation.membership.library
          ? '/'
          : '/'

  return (
    <div role="contentinfo" className="w-full border-t border-white/10 bg-palette-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:py-6">
        <Link
          href={homeHref}
          className="text-sm font-medium tracking-[0.2em] text-palette-cream/80 transition hover:text-palette-cream"
        >
          MMOVE ACADEMY
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="https://www.instagram.com/mateo.move/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-palette-cream/50 transition hover:text-palette-cream"
            aria-label="Instagram"
          >
            <CiInstagram className="h-5 w-5" />
          </Link>
          <Link
            href="https://www.youtube.com/@mateomolfino4254"
            target="_blank"
            rel="noopener noreferrer"
            className="text-palette-cream/50 transition hover:text-palette-cream"
            aria-label="YouTube"
          >
            <CiYoutube className="h-5 w-5" />
          </Link>
          <a
            href={mailtoLink}
            className="text-palette-cream/50 transition hover:text-palette-cream"
            aria-label="Email"
          >
            <CiMail className="h-5 w-5" />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-palette-cream/50 md:justify-end">
          <Link href="/faq" className="hover:text-palette-cream hover:underline">
            FAQ
          </Link>
          
          <a
            target="_blank"
            href="/documents/terms-and-conditions.pdf"
            download
            rel="noopener noreferrer"
            className="hover:text-palette-cream hover:underline"
          >
            Términos
          </a>
          <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-palette-cream hover:underline">
            Privacidad
          </Link>
          <span>© 2025</span>
        </div>
      </div>
    </div>
  )
}

export default FooterProfile
