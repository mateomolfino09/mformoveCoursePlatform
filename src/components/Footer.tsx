'use client'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { CiInstagram, CiMail, CiYoutube } from 'react-icons/ci'
import { SITE_CONTACT_EMAIL, getSitePhoneDisplay, getSiteWhatsappUrl } from '../lib/siteContact'

const Footer = () => {
  const auth = useAuth()
  const email = SITE_CONTACT_EMAIL
  const phoneDisplay = getSitePhoneDisplay()
  const whatsappUrl = getSiteWhatsappUrl()
  const subject = encodeURIComponent('Consulta sobre tus servicios')
  const body = encodeURIComponent(
    `Hola Mateo,\n\nEstoy interesado en conocer más sobre tus servicios y tengo algunas dudas.\n\nEspecíficamente, me gustaría saber sobre:\n- [Especifica aquí tu consulta]\n\nTambién quisiera saber si hay opciones para solucionar [cualquier problema o inquietud].\n\n¡Gracias de antemano! Espero tu respuesta.\n\nSaludos,\n[Tu Nombre]`
  )
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`

  return (
    <footer className="w-full border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href={auth?.user?.subscription?.active || auth?.user?.isVip ? '/biblioteca' : '/'}
            className="text-sm font-medium tracking-[0.2em] text-black/80 transition hover:text-black"
          >
            MMOVE ACADEMY
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="https://www.instagram.com/mateo.move/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/50 transition hover:text-black"
              aria-label="Instagram @mateo.move"
            >
              <CiInstagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.youtube.com/@mateomolfino4254"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/50 transition hover:text-black"
              aria-label="Canal YouTube Mateo Molfino"
            >
              <CiYoutube className="h-5 w-5" />
            </Link>
            <a
              href={mailtoLink}
              className="text-black/50 transition hover:text-black"
              aria-label={`Enviar email a ${email}`}
            >
              <CiMail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-black/5 pt-5 text-xs text-black/70 md:justify-between">
          <div className="flex max-w-xl flex-col items-center gap-1 text-center md:items-start md:text-left">
            <span className="font-medium text-black/85">Contacto</span>
            <a href={mailtoLink} className="text-[#234C8C] hover:underline">
              {email}
            </a>
            {phoneDisplay ? (
              <a href={`tel:${phoneDisplay.replace(/\s/g, '')}`} className="hover:underline">
                {phoneDisplay}
              </a>
            ) : null}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              WhatsApp
            </a>
            <Link href="/contacto" className="font-medium text-[#234C8C] hover:underline">
              Formulario de contacto
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-black/55 md:justify-end">
            <Link href="/preguntas-frecuentes" className="hover:text-black hover:underline">
              FAQ
            </Link>
            <Link href="/terminos" className="hover:text-black hover:underline">
              Términos
            </Link>
            <a
              target="_blank"
              href="/documents/terms-and-conditions.pdf"
              download
              rel="noopener noreferrer"
              className="hover:text-black hover:underline"
            >
              Descargar Términos
            </a>
            <Link href="/privacidad" className="hover:text-black hover:underline">
              Privacidad
            </Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
