import type { Metadata } from 'next'
import Link from 'next/link'
import MainSideBar from '../../components/MainSidebar/MainSideBar'
import Footer from '../../components/Footer'
import { SITE_CONTACT_EMAIL, getSitePhoneDisplay, getSiteWhatsappUrl } from '../../lib/siteContact'
import { getLegalRegistry } from '../../lib/siteLegal'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | MMOVE Academy',
  description:
    'Condiciones de uso del servicio digital MMOVE Academy: contratación, acceso, suscripciones y contacto.',
}

export default function TerminosPage() {
  const legal = getLegalRegistry()
  const phone = getSitePhoneDisplay()
  const wa = getSiteWhatsappUrl()

  return (
    <MainSideBar where={''}>
      <main className="relative min-h-screen bg-white pt-28 pb-16 font-montserrat text-gray-800">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-2 text-3xl font-bold text-[#141411] md:text-4xl">Términos y Condiciones</h1>
          <p className="mb-8 text-sm text-gray-600">MMOVE Academy / MforMove — servicios digitales educativos</p>

          <div className="space-y-6 text-[15px] leading-relaxed">
            <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5">
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">1. Identificación del prestador del servicio</h2>
              {legal?.kind === 'pf' ? (
                <ul className="list-inside list-disc space-y-1 text-gray-700">
                  <li>
                    Este sitio y la prestación descrita están a cargo de:{' '}
                    <strong>{legal.administratorName}</strong>.
                  </li>
                  <li>
                    Documento de identificación (según registrado ante el medio de cobro utilizado):{' '}
                    <strong>{legal.idDocument}</strong>.
                  </li>
                </ul>
              ) : legal?.kind === 'pj' ? (
                <ul className="list-inside list-disc space-y-1 text-gray-700">
                  <li>
                    Razón social o denominación conforme tu registro: <strong>{legal.legalName}</strong>.
                  </li>
                  <li>
                    Identificación fiscal / tributaria (RUT/NIT/CUIT/RUC/EIN/CNPJ u otro aplicable según país):{' '}
                    <strong>{legal.taxId}</strong>.
                  </li>
                </ul>
              ) : (
                <p className="text-gray-700">
                  Los datos identificativos del titular del servicio (nombre y documento como persona física, o razón social y
                  número de identificación fiscal como persona jurídica) deben coincidir exactamente con el registro en dLocal Go
                  y aparecen aquí cuando están cargados en la configuración del sitio. Para consultas, escribí a{' '}
                  <a className="font-medium text-[#234C8C] underline" href={`mailto:${SITE_CONTACT_EMAIL}`}>
                    {SITE_CONTACT_EMAIL}
                  </a>
                  . El contenido siguiente regula la relación con los usuarios con independencia de esa mención formal.
                </p>
              )}
              <p className="mt-4 text-gray-700">
                Contacto: correo electrónico <a className="text-[#234C8C] underline" href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>
                .
                {phone ? (
                  <>
                    {' '}Teléfono:{' '}
                    <a className="text-[#234C8C] underline" href={`tel:${phone.replace(/\s/g, '')}`}>
                      {phone}
                    </a>
                    .
                  </>
                ) : null}{' '}
                WhatsApp:&nbsp;
                <a className="text-[#234C8C] underline" href={wa} target="_blank" rel="noopener noreferrer">
                  escribinos por WhatsApp
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">2. Qué vendemos</h2>
              <p>
                MMOVE Academy es un servicio de <strong>contenidos educativos en formato digital</strong> orientados al movimiento,
                el entrenamiento y el bienestar. Incluye, según cada oferta vigente publicada en el sitio en el momento de la
                compra: acceso por tiempo determinado o recurrente (membresía), programas por módulos, clases y materiales
                complementarios dentro de la plataforma web. Algunos productos pueden ofrecerse como pago único y otros como
                suscripción; la condición concreta se muestra en la página del producto o del plan antes de pagar.
              </p>
              <p className="mt-3">
                Cuando ofrezcamos <strong>mentoría u otros servicios personalizados</strong>, el alcance, la duración y la forma
                de entrega (videollamada, seguimiento, etc.) se indican en la propia oferta o en la comunicación previa a la
                contratación. Ese servicio solo se presta una vez confirmado el pago y acordados los canales que indiquemos.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">3. Cómo contratás y cómo se concreta la compra</h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Creás una cuenta en el sitio o iniciás el flujo desde la página del producto (por ejemplo &quot;Empezar&quot; o
                  equivalente).
                </li>
                <li>
                  Revisás el resumen del plan o curso, el precio y la periodicidad (si aplica).
                </li>
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
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">4. Entrega, acceso y uso del contenido</h2>
              <p>
                El servicio se entrega por acceso en línea a la plataforma. No enviamos productos físicos salvo que en el futuro
                se ofrezca explícitamente otra modalidad en el sitio. El acceso es personal e intransferible salvo disposición
                expresa en contrario. Está prohibido compartir credenciales, revender el acceso o reproducir el contenido fuera
                de lo permitido por la ley.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">5. Suscripciones, renovación y baja</h2>
              <p>
                Las suscripciones se renuevan automáticamente al final de cada período de facturación si así se indica en la
                oferta, hasta que canceles desde tu cuenta o por los medios que indiquemos. La cancelación evita nuevos cobros
                futuros; el acceso puede permanecer activo hasta el fin del período ya abonado, según la configuración del plan.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">6. Cambios de precio y del servicio</h2>
              <p>
                Podemos modificar precios, planes o funcionalidades con aviso razonable cuando sea posible. Los cambios no
                afectan de forma retroactiva lo ya pagado por un período en curso, salvo que la ley exija otra cosa.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">7. Reembolsos y reclamos</h2>
              <p>
                Los contenidos digitales consumidos o a los que ya se haya accedido de forma sustancial pueden no ser elegibles
                para reembolso, de acuerdo con la normativa aplicable en tu país. Si hubo un error de cobro, un fallo técnico que
                impida el acceso o un supuesto amparado por ley de defensa del consumidor, escribinos a{' '}
                <a className="text-[#234C8C] underline" href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> o usá el{' '}
                <Link className="text-[#234C8C] underline" href="/contacto">
                  formulario de contacto
                </Link>{' '}
                con nombre, correo y detalle del caso. Analizamos cada solicitud y respondemos por el mismo canal.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">8. Limitación de responsabilidad</h2>
              <p>
                Los programas son de carácter educativo y de bienestar. No sustituyen diagnóstico ni tratamiento médico. Consultá
                a un profesional de la salud ante dudas. No nos hacemos responsables por interrupciones ajenas a nuestro control
                (Internet, terceros) ni por el uso indebido del servicio.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">9. Privacidad</h2>
              <p>
                El tratamiento de datos personales se describe en la{' '}
                <Link className="text-[#234C8C] underline" href="/privacidad">
                  Política de privacidad
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-[#234C8C]">10. Legislación y contacto</h2>
              <p>
                Cualquier consulta sobre estos términos o el funcionamiento del servicio:{' '}
                <Link className="text-[#234C8C] underline" href="/contacto">
                  formulario de contacto
                </Link>{' '}
                (nombre, correo y mensaje) o correo a{' '}
                <a className="text-[#234C8C] underline" href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Podés además descargar los términos en PDF:{' '}
                <a
                  className="text-[#234C8C] underline"
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
        </div>
      </main>
      <Footer />
    </MainSideBar>
  )
}
