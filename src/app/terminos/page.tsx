import type { Metadata } from 'next'
import Link from 'next/link'
import MainSideBar from '../../components/MainSidebar/MainSideBar'
import FooterProfile from '../../components/PageComponent/Profile/FooterProfile'
import { SITE_CONTACT_EMAIL, getSitePhoneDisplay, getSiteWhatsappUrl } from '../../lib/siteContact'
import { getLegalRegistry } from '../../lib/siteLegal'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description:
    'Condiciones de uso del servicio digital MMOVE: contratación, acceso, suscripciones y contacto.',
}

const linkClass =
  'font-medium text-palette-ink underline decoration-palette-stone/35 underline-offset-[3px] transition-colors hover:text-palette-steel'

export default function TerminosPage() {
  const legal = getLegalRegistry()
  const phone = getSitePhoneDisplay()
  const wa = getSiteWhatsappUrl()
  const idLabel =
    legal?.kind === 'pf' && legal.idDocument.includes('@')
      ? 'Correo registrado (según medio de cobro utilizado)'
      : 'Documento de identificación (según registrado ante el medio de cobro utilizado)'

  return (
    <MainSideBar where={''}>
      <div className="relative min-h-screen overflow-x-hidden bg-palette-cream font-montserrat pb-28 pt-[7rem] md:pt-28 md:pb-32">
        <div
          className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-palette-stone/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-32 -left-16 h-64 w-64 rounded-full bg-palette-sage/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-3xl px-4 md:px-6">
          <div className="mb-10 text-center md:mb-12">
            <h1 className="font-montserrat text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-palette-ink sm:text-[1.85rem] md:text-[2.05rem]">
              Términos y Condiciones
            </h1>
          </div>

          <article className="space-y-10 text-[15px] leading-relaxed text-palette-ink/90">
            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                1. Identificación del prestador del servicio
              </h2>
              {legal?.kind === 'pf' ? (
                <div className="space-y-3 font-light text-palette-stone">
                  <p>
                    Este sitio y la prestación descrita están a cargo de:{' '}
                    <strong className="font-medium text-palette-ink">{legal.administratorName}</strong>.
                  </p>
                  <p>
                    {idLabel}:{' '}
                    <strong className="font-medium text-palette-ink">{legal.idDocument}</strong>.
                  </p>
                </div>
              ) : legal?.kind === 'pj' ? (
                <div className="space-y-3 font-light text-palette-stone">
                  <p>
                    Razón social o denominación conforme tu registro:{' '}
                    <strong className="font-medium text-palette-ink">{legal.legalName}</strong>.
                  </p>
                  <p>
                    Identificación fiscal / tributaria (RUT/NIT/CUIT/RUC/EIN/CNPJ u otro aplicable según país):{' '}
                    <strong className="font-medium text-palette-ink">{legal.taxId}</strong>.
                  </p>
                </div>
              ) : (
                <p className="font-light text-palette-stone">
                  Los datos identificativos del titular del servicio (nombre y documento como persona física, o razón social y
                  número de identificación fiscal como persona jurídica) deben coincidir exactamente con el registro en dLocal Go
                  y aparecen aquí cuando están cargados en la configuración del sitio. Para consultas, escribí a{' '}
                  <a className={linkClass} href={`mailto:${SITE_CONTACT_EMAIL}`}>
                    {SITE_CONTACT_EMAIL}
                  </a>
                  . El contenido siguiente regula la relación con los usuarios con independencia de esa mención formal.
                </p>
              )}
              <p className="mt-4 font-light text-palette-stone">
                Contacto: correo electrónico{' '}
                <a className={linkClass} href={`mailto:${SITE_CONTACT_EMAIL}`}>
                  {SITE_CONTACT_EMAIL}
                </a>
                .
                {phone ? (
                  <>
                    {' '}
                    Teléfono:{' '}
                    <a className={linkClass} href={`tel:${phone.replace(/\s/g, '')}`}>
                      {phone}
                    </a>
                    .
                  </>
                ) : null}{' '}
                WhatsApp:{' '}
                <a className={linkClass} href={wa} target="_blank" rel="noopener noreferrer">
                  escribinos por WhatsApp
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                2. Qué vendemos
              </h2>
              <div className="space-y-3 font-light text-palette-stone">
                <p>
                  MMOVE es un servicio de <strong className="font-medium text-palette-ink">contenidos educativos en formato digital</strong>{' '}
                  orientados al movimiento, el entrenamiento y el bienestar. Incluye, según cada oferta vigente publicada en el
                  sitio en el momento de la compra: acceso por tiempo determinado o recurrente (membresía), programas por módulos,
                  clases y materiales complementarios dentro de la plataforma web. Algunos productos pueden ofrecerse como pago
                  único y otros como suscripción; la condición concreta se muestra en la página del producto o del plan antes de
                  pagar.
                </p>
                <p>
                  Cuando ofrezcamos <strong className="font-medium text-palette-ink">mentoría u otros servicios personalizados</strong>,
                  el alcance, la duración y la forma de entrega (videollamada, seguimiento, etc.) se indican en la propia oferta o
                  en la comunicación previa a la contratación. Ese servicio solo se presta una vez confirmado el pago y acordados
                  los canales que indiquemos.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                3. Cómo contratás y cómo se concreta la compra
              </h2>
              <ol className="list-decimal space-y-2 pl-5 font-light text-palette-stone">
                <li>
                  Creás una cuenta en el sitio o iniciás el flujo desde la página del producto (por ejemplo &quot;Empezar&quot; o
                  equivalente).
                </li>
                <li>Revisás el resumen del plan o curso, el precio y la periodicidad (si aplica).</li>
                <li>
                  Completás el pago mediante los medios habilitados (por ejemplo dLocal Go, Stripe u otros que figuren en el
                  checkout). El cobro se procesa a nombre del titular identificado en la sección 1.
                </li>
                <li>
                  Tras la aprobación del pago, recibís confirmación por correo electrónico y el acceso digital se habilita en tu
                  cuenta según el producto contratado.
                </li>
              </ol>
              <p className="mt-4 font-light text-palette-stone">
                Sos responsable de la veracidad de los datos que ingresás y de mantener segura tu contraseña. Los menores de edad
                deben contar con autorización de quien corresponda según la ley aplicable.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                4. Entrega, acceso y uso del contenido
              </h2>
              <p className="font-light text-palette-stone">
                El servicio se entrega por acceso en línea a la plataforma. No enviamos productos físicos salvo que en el futuro
                se ofrezca explícitamente otra modalidad en el sitio. El acceso es personal e intransferible salvo disposición
                expresa en contrario. Está prohibido compartir credenciales, revender el acceso o reproducir el contenido fuera de
                lo permitido por la ley.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                5. Suscripciones, renovación y baja
              </h2>
              <p className="font-light text-palette-stone">
                Las suscripciones se renuevan automáticamente al final de cada período de facturación si así se indica en la oferta,
                hasta que canceles desde tu cuenta o por los medios que indiquemos. La cancelación evita nuevos cobros futuros; el
                acceso puede permanecer activo hasta el fin del período ya abonado, según la configuración del plan.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                6. Cambios de precio y del servicio
              </h2>
              <p className="font-light text-palette-stone">
                Podemos modificar precios, planes o funcionalidades con aviso razonable cuando sea posible. Los cambios no afectan
                de forma retroactiva lo ya pagado por un período en curso, salvo que la ley exija otra cosa.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                7. Reembolsos y reclamos
              </h2>
              <p className="font-light text-palette-stone">
                Los contenidos digitales consumidos o a los que ya se haya accedido de forma sustancial pueden no ser elegibles para
                reembolso, de acuerdo con la normativa aplicable en tu país. Si hubo un error de cobro, un fallo técnico que impida
                el acceso o un supuesto amparado por ley de defensa del consumidor, escribinos a{' '}
                <a className={linkClass} href={`mailto:${SITE_CONTACT_EMAIL}`}>
                  {SITE_CONTACT_EMAIL}
                </a>{' '}
                o usá el{' '}
                <Link className={linkClass} href="/contacto">
                  formulario de contacto
                </Link>{' '}
                con nombre, correo y detalle del caso. Analizamos cada solicitud y respondemos por el mismo canal.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                8. Limitación de responsabilidad
              </h2>
              <p className="font-light text-palette-stone">
                Los programas son de carácter educativo y de bienestar. No sustituyen diagnóstico ni tratamiento médico. Consultá a
                un profesional de la salud ante dudas. No nos hacemos responsables por interrupciones ajenas a nuestro control
                (Internet, terceros) ni por el uso indebido del servicio.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                9. Privacidad
              </h2>
              <p className="font-light text-palette-stone">
                El tratamiento de datos personales se describe en la{' '}
                <Link className={linkClass} href="/privacidad">
                  Política de privacidad
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-montserrat text-lg font-semibold tracking-tight text-palette-ink">
                10. Legislación y contacto
              </h2>
              <p className="font-light text-palette-stone">
                Cualquier consulta sobre estos términos o el funcionamiento del servicio:{' '}
                <Link className={linkClass} href="/contacto">
                  formulario de contacto
                </Link>{' '}
                (nombre, correo y mensaje) o correo a{' '}
                <a className={linkClass} href={`mailto:${SITE_CONTACT_EMAIL}`}>
                  {SITE_CONTACT_EMAIL}
                </a>
                .
              </p>
              <p className="mt-4 text-sm font-light text-palette-stone/90">
                Podés además descargar los términos en PDF:{' '}
                <a
                  className={linkClass}
                  href="/documents/terms-and-conditions.pdf"
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                >
                  Descargar Términos
                </a>
                . En caso de discrepancia entre versiones, prevalece la versión publicada en esta página web en la fecha de
                consulta, salvo obligación legal distinta.
              </p>
            </section>
          </article>
        </div>
      </div>
      <FooterProfile />
    </MainSideBar>
  )
}
