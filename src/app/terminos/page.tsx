import type { Metadata } from 'next'
import Link from 'next/link'
import MainSideBar from '../../components/MainSidebar/MainSideBar'
import FooterProfile from '../../components/PageComponent/Profile/FooterProfile'
import { SITE_CONTACT_EMAIL, getSitePhoneDisplay, getSiteWhatsappUrl } from '../../lib/siteContact'
import { getLegalRegistry } from '../../lib/siteLegal'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | MMOVE Academy',
  description:
    'Condiciones de uso del servicio digital MMOVE Academy: contratación, acceso, suscripciones y contacto.',
}

const linkClass =
  'font-medium text-palette-ink underline underline-offset-2 decoration-palette-ink/35 hover:text-palette-stone hover:decoration-palette-stone/50 transition-colors'

const sectionHeading =
  'mt-10 first:mt-0 mb-3 text-[1.05rem] font-semibold tracking-tight text-palette-ink sm:text-lg'

const bodyText = 'text-[14px] font-light leading-[1.75] text-palette-ink/90 md:text-[15px]'

export default function TerminosPage() {
  const legal = getLegalRegistry()
  const phone = getSitePhoneDisplay()
  const wa = getSiteWhatsappUrl()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-palette-cream font-montserrat">
      <MainSideBar where="mentorship">
        <main className="bg-palette-cream pb-16 pt-24 md:pb-24 md:pt-28">
          <div className={`mx-auto w-[92%] max-w-3xl px-3 sm:px-4 ${bodyText}`}>
            <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-palette-stone/80">
              Legal
            </p>
            <h1 className="mt-3 text-[1.65rem] font-semibold leading-[1.1] tracking-tight text-palette-ink sm:text-[2rem] md:text-[2.35rem]">
              Términos y Condiciones
            </h1>
            <p className="mt-4 max-w-2xl">
              MMOVE Academy / MforMove — servicios digitales educativos de movimiento, entrenamiento y bienestar.
            </p>

            <section>
              <h2 className={sectionHeading}>1. Identificación del prestador del servicio</h2>
              {legal?.kind === 'pf' ? (
                <>
                  <p>
                    Este sitio y la prestación descrita están a cargo de:{' '}
                    <strong className="font-medium text-palette-ink">{legal.administratorName}</strong>.
                  </p>
                  <p className="mt-3">
                    {legal.identificationKind === 'email'
                      ? 'Correo electrónico registrado en dLocal Go (en sustitución del documento de identificación):'
                      : 'Documento de identificación (según registrado en dLocal Go):'}{' '}
                    <strong className="font-medium text-palette-ink">{legal.identification}</strong>.
                  </p>
                </>
              ) : legal?.kind === 'pj' ? (
                <>
                  <p>
                    Razón social o denominación conforme tu registro:{' '}
                    <strong className="font-medium text-palette-ink">{legal.legalName}</strong>.
                  </p>
                  <p className="mt-3">
                    Identificación fiscal / tributaria (RUT/NIT/CUIT/RUC/EIN/CNPJ u otro aplicable según país):{' '}
                    <strong className="font-medium text-palette-ink">{legal.taxId}</strong>.
                  </p>
                </>
              ) : (
                <p>
                  Los datos identificativos del titular del servicio (nombre y documento como persona física, o razón social y
                  número de identificación fiscal como persona jurídica) deben coincidir exactamente con el registro en dLocal Go
                  y aparecen aquí cuando están cargados en la configuración del sitio. Para consultas, escribí a{' '}
                  <a className={linkClass} href={`mailto:${SITE_CONTACT_EMAIL}`}>
                    {SITE_CONTACT_EMAIL}
                  </a>
                  . El contenido siguiente regula la relación con los usuarios con independencia de esa mención formal.
                </p>
              )}
              <p className="mt-3">
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
              <h2 className={sectionHeading}>2. Qué vendemos</h2>
              <p>
                MMOVE Academy es un servicio de{' '}
                <strong className="font-medium text-palette-ink">contenidos educativos en formato digital</strong> orientados al
                movimiento, el entrenamiento y el bienestar. Incluye, según cada oferta vigente publicada en el sitio en el momento
                de la compra: acceso por tiempo determinado o recurrente (membresía), programas por módulos, clases y materiales
                complementarios dentro de la plataforma web. Algunos productos pueden ofrecerse como pago único y otros como
                suscripción; la condición concreta se muestra en la página del producto o del plan antes de pagar.
              </p>
              <p className="mt-3">
                Cuando ofrezcamos{' '}
                <strong className="font-medium text-palette-ink">mentoría u otros servicios personalizados</strong>, el alcance, la
                duración y la forma de entrega (videollamada, seguimiento, etc.) se indican en la propia oferta o en la
                comunicación previa a la contratación. Ese servicio solo se presta una vez confirmado el pago y acordados los
                canales que indiquemos.
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>3. Cómo contratás y cómo se concreta la compra</h2>
              <ol className="list-decimal space-y-2 pl-5">
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
              <p className="mt-3">
                Sos responsable de la veracidad de los datos que ingresás y de mantener segura tu contraseña. Los menores de edad
                deben contar con autorización de quien corresponda según la ley aplicable.
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>4. Entrega, acceso y uso del contenido</h2>
              <p>
                El servicio se entrega por acceso en línea a la plataforma. No enviamos productos físicos salvo que en el futuro
                se ofrezca explícitamente otra modalidad en el sitio. El acceso es personal e intransferible salvo disposición
                expresa en contrario. Está prohibido compartir credenciales, revender el acceso o reproducir el contenido fuera de
                lo permitido por la ley.
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>5. Suscripciones, renovación y baja</h2>
              <p>
                Las suscripciones se renuevan automáticamente al final de cada período de facturación si así se indica en la
                oferta, hasta que canceles desde tu cuenta o por los medios que indiquemos. La cancelación evita nuevos cobros
                futuros; el acceso puede permanecer activo hasta el fin del período ya abonado, según la configuración del plan.
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>6. Cambios de precio y del servicio</h2>
              <p>
                Podemos modificar precios, planes o funcionalidades con aviso razonable cuando sea posible. Los cambios no afectan
                de forma retroactiva lo ya pagado por un período en curso, salvo que la ley exija otra cosa.
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>7. Reembolsos y reclamos</h2>
              <p>
                Los contenidos digitales consumidos o a los que ya se haya accedido de forma sustancial pueden no ser elegibles
                para reembolso, de acuerdo con la normativa aplicable en tu país. Si hubo un error de cobro, un fallo técnico que
                impida el acceso o un supuesto amparado por ley de defensa del consumidor, escribinos a{' '}
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
              <h2 className={sectionHeading}>8. Limitación de responsabilidad</h2>
              <p>
                Los programas son de carácter educativo y de bienestar. No sustituyen diagnóstico ni tratamiento médico. Consultá
                a un profesional de la salud ante dudas. No nos hacemos responsables por interrupciones ajenas a nuestro control
                (Internet, terceros) ni por el uso indebido del servicio.
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>9. Privacidad</h2>
              <p>
                El tratamiento de datos personales se describe en la{' '}
                <Link className={linkClass} href="/privacidad">
                  Política de privacidad
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className={sectionHeading}>10. Legislación y contacto</h2>
              <p>
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
              <p className="mt-3 text-palette-stone">
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
          </div>
        </main>

        <FooterProfile />
      </MainSideBar>
    </div>
  )
}
