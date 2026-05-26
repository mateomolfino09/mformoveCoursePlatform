'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import InfoModalField from '../../InfoModalField';
import InfoModalSection from '../../InfoModalSection';
import { toast } from '../../../hooks/useToast';
import { toDatetimeLocalValue } from '../../../lib/cursoLandingPublication';
import type { CursoLandingConfig } from '../../../types/cursoLanding';
import { routes } from '../../../constants/routes';

type Props = {
  cursoConfig?: CursoLandingConfig | null;
  portada?: string;
  stripeProductId?: string;
  precio?: number;
  moneda?: string;
};

const copyToClipboard = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado al portapapeles`);
  } catch {
    toast.error('No se pudo copiar al portapapeles');
  }
};

const LinkField = ({ label, href }: { label: string; href: string }) => (
  <InfoModalField
    label={label}
    value={
      <div className="flex items-center justify-between gap-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#234C8C] hover:text-[#1A1A1A] underline text-sm break-all"
        >
          {href}
        </a>
        <button
          type="button"
          onClick={() => copyToClipboard(href, label)}
          className="text-gray-600 hover:text-[#234C8C] text-sm whitespace-nowrap"
        >
          Copiar
        </button>
      </div>
    }
    showBorder={false}
  />
);

const TextList = ({ items, emptyLabel }: { items: string[]; emptyLabel: string }) => {
  if (!items.length) {
    return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="text-sm text-gray-700">
          {item}
        </li>
      ))}
    </ul>
  );
};

export default function CursoProductDetails({
  cursoConfig,
  portada,
  stripeProductId,
  precio,
  moneda,
}: Props) {
  if (!cursoConfig) {
    return (
      <InfoModalSection title="Landing del curso">
        <p className="text-sm text-gray-500">Este producto no tiene configuración de landing cargada.</p>
      </InfoModalSection>
    );
  }

  const landingPath = cursoConfig.slug ? routes.navegation.membership.curso(cursoConfig.slug) : null;
  const checkoutImage = cursoConfig.imagenCheckoutPublicId || portada;
  const opcionesPago = cursoConfig.planes?.opcionesPago || [];

  return (
    <>
      <InfoModalSection title="Publicación y acceso">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField
            label="Estado"
            value={cursoConfig.publicado ? 'Publicada' : 'No publicada'}
            showBorder={false}
          />
          <InfoModalField
            label="Publicación programada"
            value={
              cursoConfig.fechaPublicacion
                ? toDatetimeLocalValue(cursoConfig.fechaPublicacion).replace('T', ' ')
                : 'Sin fecha programada'
            }
            showBorder={false}
          />
          <InfoModalField label="Slug" value={cursoConfig.slug || 'Sin slug'} showBorder={false} />
          <InfoModalField
            label="Ruta pública"
            value={
              landingPath ? (
                <Link href={landingPath} target="_blank" className="text-[#234C8C] hover:underline">
                  {landingPath}
                </Link>
              ) : (
                'Sin ruta'
              )
            }
            showBorder={false}
          />
          <InfoModalField
            label="Galería Vimeo"
            value={cursoConfig.vimeoGaleriaId || 'Sin galería'}
            showBorder={false}
          />
          <InfoModalField
            label="Imagen checkout (Cloudinary)"
            value={cursoConfig.imagenCheckoutPublicId || portada || 'Sin imagen'}
            showBorder={false}
          />
        </div>
      </InfoModalSection>

      <InfoModalSection title="Checkout y pagos">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField
            label="Precio comercial"
            value={`${precio ?? '—'} ${moneda || 'USD'}`}
            showBorder={false}
          />
          <InfoModalField
            label="Stripe product ID"
            value={stripeProductId || 'Sin ID de Stripe'}
            showBorder={false}
          />
        </div>
        {checkoutImage && (
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-sm aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <CldImage
                src={checkoutImage}
                alt="Imagen de checkout del curso"
                className="object-cover w-full h-full"
                width={480}
                height={480}
                crop="fill"
              />
            </div>
          </div>
        )}
        {opcionesPago.length > 0 ? (
          <div className="mt-4 space-y-3">
            {opcionesPago.map((plan) => (
              <div key={plan.proveedor} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <InfoModalField
                  label={plan.etiqueta}
                  value={
                    <span className="text-sm text-gray-700">
                      {plan.activo ? 'Activo' : 'Inactivo'} · {plan.monto} {plan.moneda}
                    </span>
                  }
                  showBorder={false}
                />
                {plan.paymentLink ? (
                  <LinkField label={plan.etiqueta} href={plan.paymentLink} />
                ) : (
                  <p className="text-sm text-gray-500">Sin link de pago generado.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Todavía no hay links de pago asociados al curso.</p>
        )}
      </InfoModalSection>

      <InfoModalSection title="Hero y bloques principales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField
            label="Vimeo del hero"
            value={cursoConfig.hero.videoPresentacionVimeoId || 'Sin video'}
            showBorder={false}
          />
          <InfoModalField label="Tagline del hero" value={cursoConfig.hero.tagline || '—'} showBorder={false} />
          <InfoModalField label="CTA principal" value={cursoConfig.hero.ctaTexto || '—'} showBorder={false} />
          <InfoModalField label="Subcopy del CTA" value={cursoConfig.hero.ctaSubcopy || '—'} showBorder={false} />
          <InfoModalField
            label="Ruta suscriptor"
            value={cursoConfig.hero.rutaUsuarioSuscriptor || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Ancla de planes"
            value={cursoConfig.hero.anclaPlanesId || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Eyebrow bloque intermedio"
            value={cursoConfig.betweenHero.eyebrow || '—'}
            showBorder={false}
          />
        </div>
        <div className="mt-4 space-y-3">
          <InfoModalField label="Bloque intermedio" value={cursoConfig.betweenHero.titulo || '—'} showBorder={false} />
          <TextList items={cursoConfig.betweenHero.parrafos} emptyLabel="Sin párrafos intermedios." />
          <InfoModalField label="Banner ancho" value={cursoConfig.bannerAncho.cuerpo || '—'} showBorder={false} />
          <InfoModalField
            label="CTA barra móvil"
            value={cursoConfig.navegacion.ctaBarraMovil || '—'}
            showBorder={false}
          />
        </div>
      </InfoModalSection>

      <InfoModalSection title="Presentación de testimonios">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField
            label="Título videos"
            value={cursoConfig.presentacionTestimonios.tituloVideos || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Título escritos"
            value={cursoConfig.presentacionTestimonios.tituloEscritos || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Eyebrow escritos"
            value={cursoConfig.presentacionTestimonios.eyebrowEscritos || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Ancla videos"
            value={cursoConfig.presentacionTestimonios.anclaVideos || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Ancla escritos"
            value={cursoConfig.presentacionTestimonios.anclaEscritos || '—'}
            showBorder={false}
          />
        </div>
        <InfoModalField
          label="Placeholder sin video"
          value={cursoConfig.presentacionTestimonios.textoPlaceholderVideo || '—'}
          showBorder={false}
        />
      </InfoModalSection>

      <InfoModalSection title="Intro, resultados y timeline">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField label="Intro título" value={cursoConfig.introHighlights.titulo || '—'} showBorder={false} />
          <InfoModalField label="Intro subtítulo" value={cursoConfig.introHighlights.subtitulo || '—'} showBorder={false} />
          <InfoModalField
            label="Imagen intro móvil"
            value={cursoConfig.introHighlights.imagenMobilePublicId || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Imagen intro desktop"
            value={cursoConfig.introHighlights.imagenDesktopPublicId || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Alt imagen intro"
            value={cursoConfig.introHighlights.imagenAlt || '—'}
            showBorder={false}
          />
          <InfoModalField label="Outcomes título" value={cursoConfig.outcomes.titulo || '—'} showBorder={false} />
          <InfoModalField
            label="Imagen outcomes"
            value={cursoConfig.outcomes.imagenPublicId || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Alt imagen outcomes"
            value={cursoConfig.outcomes.imagenAlt || '—'}
            showBorder={false}
          />
        </div>
        <div className="mt-4 space-y-3">
          <InfoModalField label="Intro cuerpo" value={cursoConfig.introHighlights.cuerpo || '—'} showBorder={false} />
          <TextList items={cursoConfig.highlights.titulos} emptyLabel="Sin títulos del timeline." />
          <InfoModalField label="Puente del timeline" value={cursoConfig.highlights.puente || '—'} showBorder={false} />
          <InfoModalField label="CTA timeline eyebrow" value={cursoConfig.highlights.ctaEyebrow || '—'} showBorder={false} />
          <InfoModalField label="CTA timeline título" value={cursoConfig.highlights.ctaTitulo || '—'} showBorder={false} />
          <InfoModalField label="CTA timeline descripción" value={cursoConfig.highlights.ctaDescripcion || '—'} showBorder={false} />
          <InfoModalField label="CTA timeline botón" value={cursoConfig.highlights.ctaBoton || '—'} showBorder={false} />
          <InfoModalField
            label="CTA timeline imagen"
            value={cursoConfig.highlights.ctaImagenPublicId || '—'}
            showBorder={false}
          />
          <p className="text-sm font-medium text-gray-700">Resultados ({cursoConfig.outcomes.items.length})</p>
          {cursoConfig.outcomes.items.map((item, index) => (
            <div key={`outcome-${index}`} className="rounded-lg border border-gray-200 p-3">
              <p className="font-medium text-gray-900">{item.titulo}</p>
              <p className="text-sm text-gray-600 mt-1">{item.cuerpo}</p>
            </div>
          ))}
          <p className="text-sm font-medium text-gray-700">Highlights ({cursoConfig.highlights.items.length})</p>
          {cursoConfig.highlights.items.map((item, index) => (
            <div key={`highlight-${index}`} className="rounded-lg border border-gray-200 p-3">
              <p className="font-medium text-gray-900">{item.titulo}</p>
              <p className="text-sm text-gray-600 mt-1">{item.resumen}</p>
              <p className="text-sm text-gray-500 mt-2">{item.detalle}</p>
              <p className="text-xs text-gray-400 mt-2">Imagen (Cloudinary): {item.imagenPublicId?.trim() || '— (usa módulo mismo título o CTA timeline)'}</p>
            </div>
          ))}
        </div>
      </InfoModalSection>

      <InfoModalSection title="Precios de preventa">
        {cursoConfig.preciosPreventa?.length ? (
          <div className="space-y-3">
            {cursoConfig.preciosPreventa.map((tier, index) => (
              <div key={`preventa-${index}`} className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-2">
                <p className="font-medium text-gray-900">{tier.etiqueta || `Tier ${index + 1}`}</p>
                <p className="text-sm text-gray-600">
                  {tier.monto} {tier.moneda} · fin{' '}
                  {tier.fechaFin
                    ? toDatetimeLocalValue(tier.fechaFin).replace('T', ' ')
                    : '—'}{' '}
                  · cupos {tier.cuposUsados}/{tier.cuposLimite}
                </p>
                <p className="text-sm text-gray-500">{tier.descripcion || '—'}</p>
                {(tier.opcionesPago || []).map((plan) => (
                  <p key={plan.proveedor} className="text-xs text-gray-500 break-all">
                    {plan.etiqueta}: {plan.paymentLink || 'sin link'}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin tiers de preventa configurados.</p>
        )}
      </InfoModalSection>

      <InfoModalSection title="Módulos de contenido (entrega)">
        {cursoConfig.contenidoModulos?.length ? (
          <div className="space-y-3">
            {cursoConfig.contenidoModulos.map((modulo, index) => (
              <div key={`contenido-${index}`} className="rounded-lg border border-gray-200 p-3">
                <p className="font-medium text-gray-900">
                  {index + 1}. {modulo.titulo || 'Sin título'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Tipo: {modulo.bundleTipo === 'vimeo_playlist' ? 'Playlist Vimeo' : 'Videos individuales'}
                </p>
                {modulo.bundleTipo === 'vimeo_playlist' ? (
                  <p className="text-xs text-gray-500 mt-1">Playlist: {modulo.vimeoPlaylistId || '—'}</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    {(modulo.clases || []).map((clase, ci) => {
                      const name = clase.name || clase.titulo || 'Clase';
                      const videoId = clase.videoId || clase.vimeoVideoId || '—';
                      const mins =
                        clase.duration > 0
                          ? Math.round(clase.duration / 60)
                          : clase.duracionMinutos;
                      return (
                        <li key={`clase-${ci}`} className="rounded border border-gray-100 px-2 py-1.5">
                          <span className="font-medium text-gray-800">{name}</span>
                          <span className="text-gray-500"> — Vimeo {videoId}</span>
                          {mins ? <span className="text-gray-500"> ({mins} min)</span> : null}
                          <span className="text-gray-500"> · Nivel {clase.level ?? 1}</span>
                          {clase.materials?.length ? (
                            <span className="block text-xs text-gray-500 mt-0.5">
                              Materiales: {clase.materials.join(', ')}
                            </span>
                          ) : null}
                          {clase.courseClassId ? (
                            <span className="block text-xs text-gray-400">
                              CourseClass: {clase.courseClassId}
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin módulos de contenido. Se sincronizan desde el timeline.</p>
        )}
      </InfoModalSection>

      <InfoModalSection title="Qué incluye">
        <InfoModalField label="Título" value={cursoConfig.queIncluye.titulo || '—'} showBorder={false} />
        <InfoModalField label="Ancla de sección" value={cursoConfig.queIncluye.anclaId || '—'} showBorder={false} />
        <p className="text-sm font-medium text-gray-700 mt-4">Bloques de oferta ({cursoConfig.queIncluye.offerBlocks.length})</p>
        {cursoConfig.queIncluye.offerBlocks.map((block, index) => (
          <div key={`offer-${index}`} className="rounded-lg border border-gray-200 p-3 mt-2">
            <TextList items={block.lineas} emptyLabel="Sin líneas." />
            <p className="text-sm text-gray-500 mt-2">{block.hint}</p>
            <p className="text-xs text-gray-400 mt-1">Icono: {block.iconKey || '—'}</p>
            {typeof block.lineaDestacadaIndice === 'number' ? (
              <p className="text-xs text-gray-400 mt-1">Línea destacada: {block.lineaDestacadaIndice + 1}</p>
            ) : null}
          </div>
        ))}
        <p className="text-sm font-medium text-gray-700 mt-4">Módulos ({cursoConfig.queIncluye.modulos.length})</p>
        {cursoConfig.queIncluye.modulos.map((modulo, index) => (
          <div key={`module-${index}`} className="rounded-lg border border-gray-200 p-3 mt-2">
            <p className="font-medium text-gray-900">{modulo.titulo}</p>
            <p className="text-sm text-gray-600 mt-1">{modulo.descripcion}</p>
            <p className="text-xs text-gray-400 mt-1">Imagen: {modulo.imagenPublicId || '—'}</p>
            {modulo.imagenPublicId ? (
              <div className="relative mt-3 aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg bg-gray-100">
                <CldImage
                  src={modulo.imagenPublicId}
                  alt={modulo.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        ))}
      </InfoModalSection>

      <InfoModalSection title="Testimonios">
        <p className="text-sm font-medium text-gray-700">Escritos ({cursoConfig.testimoniosEscritos.length})</p>
        {cursoConfig.testimoniosEscritos.map((item, index) => (
          <div key={`written-${index}`} className="rounded-lg border border-gray-200 p-3 mt-2">
            <p className="font-medium text-gray-900">{item.nombre}</p>
            <p className="text-sm text-gray-500">{item.planEtiqueta}</p>
            <p className="text-sm text-gray-600 mt-2">{item.texto}</p>
          </div>
        ))}
        <p className="text-sm font-medium text-gray-700 mt-4">Grabados ({cursoConfig.testimoniosGrabados.length})</p>
        {cursoConfig.testimoniosGrabados.map((item, index) => (
          <div key={`recorded-${index}`} className="rounded-lg border border-gray-200 p-3 mt-2">
            <p className="font-medium text-gray-900">{item.titulo || `Video ${index + 1}`}</p>
            <p className="text-sm text-gray-600">Vimeo: {item.videoVimeoId || '—'}</p>
          </div>
        ))}
      </InfoModalSection>

      <InfoModalSection title="Planes, WhatsApp, FAQ y CTA">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField label="Título planes" value={cursoConfig.planes.titulo || '—'} showBorder={false} />
          <InfoModalField label="Ancla planes" value={cursoConfig.planes.anclaId || '—'} showBorder={false} />
          <InfoModalField
            label="Días de urgencia"
            value={String(cursoConfig.planes.diasUrgencia ?? '—')}
            showBorder={false}
          />
          <InfoModalField
            label="Etiqueta formas de pago"
            value={cursoConfig.planes.etiquetaFormasPago || '—'}
            showBorder={false}
          />
          <InfoModalField
            label="Email sin planes"
            value={cursoConfig.planes.emailSinPlanes || '—'}
            showBorder={false}
          />
          <InfoModalField label="CTA sin planes" value={cursoConfig.planes.ctaSinPlanes || '—'} showBorder={false} />
        </div>
        <TextList items={cursoConfig.planes.parrafosValor} emptyLabel="Sin párrafos de valor." />
        <InfoModalField label="Copy Uruguay y Latam" value={cursoConfig.planes.copyUruguayLatam || '—'} showBorder={false} />
        <InfoModalField label="Copy resto del mundo" value={cursoConfig.planes.copyRestoMundo || '—'} showBorder={false} />
        <InfoModalField label="Copy cuotas" value={cursoConfig.planes.copyCuotasTarjeta || '—'} showBorder={false} />
        <InfoModalField label="Mensaje sin planes" value={cursoConfig.planes.mensajeSinPlanes || '—'} showBorder={false} />
        <InfoModalField
          label="Imagen medios de pago"
          value={`${cursoConfig.planes.imagenPagosUrl || '—'} (${cursoConfig.planes.imagenPagosAlt || 'sin alt'})`}
          showBorder={false}
        />
        <InfoModalField label="WhatsApp título" value={cursoConfig.whatsapp.titulo || '—'} showBorder={false} />
        <InfoModalField label="WhatsApp CTA" value={cursoConfig.whatsapp.ctaTexto || '—'} showBorder={false} />
        <InfoModalField label="WhatsApp alt de imagen" value={cursoConfig.whatsapp.imagenAlt || '—'} showBorder={false} />
        <InfoModalField
          label="WhatsApp imágenes"
          value={`${cursoConfig.whatsapp.imagenMobilePublicId || '—'} / ${cursoConfig.whatsapp.imagenDesktopPublicId || '—'}`}
          showBorder={false}
        />
        {cursoConfig.whatsapp.enlace ? (
          <LinkField label="WhatsApp" href={cursoConfig.whatsapp.enlace} />
        ) : (
          <InfoModalField label="WhatsApp" value="—" showBorder={false} />
        )}
        <InfoModalField label="FAQ título" value={cursoConfig.faq.titulo || '—'} showBorder={false} />
        <InfoModalField label="FAQ ancla" value={cursoConfig.faq.anclaId || '—'} showBorder={false} />
        <InfoModalField label="FAQ intro" value={cursoConfig.faq.intro || '—'} showBorder={false} />
        <p className="text-sm font-medium text-gray-700 mt-4">Preguntas frecuentes ({cursoConfig.faq.items.length})</p>
        {cursoConfig.faq.items.map((item, index) => (
          <div key={`faq-${index}`} className="rounded-lg border border-gray-200 p-3 mt-2">
            <p className="font-medium text-gray-900">{item.pregunta}</p>
            <p className="text-sm text-gray-600 mt-1">{item.respuesta}</p>
          </div>
        ))}
        <InfoModalField label="CTA final" value={cursoConfig.ctaFinal.titulo || '—'} showBorder={false} />
        <InfoModalField label="CTA final cuerpo" value={cursoConfig.ctaFinal.cuerpo || '—'} showBorder={false} />
        <InfoModalField label="CTA final botón" value={cursoConfig.ctaFinal.boton || '—'} showBorder={false} />
        <InfoModalField label="CTA final ancla" value={cursoConfig.ctaFinal.anclaId || '—'} showBorder={false} />
      </InfoModalSection>
    </>
  );
}
