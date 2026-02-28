import { useAppDispatch, useAppSelector } from '../redux/hooks'
import imageLoader from '../../imageLoader';
import { IndividualClass, Ricks, User } from '../../typings';
import {
  ChevronDownIcon,
  PlayIcon,
  TrashIcon,
  ClockIcon,
  SignalIcon,
  Bars3Icon
} from '@heroicons/react/24/solid';
import zIndex from '@mui/material/styles/zIndex';
import axios from 'axios';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AiOutlineCheckCircle, AiOutlineMinusCircle } from 'react-icons/ai';
import { MdAdd, MdBlock, MdOutlineClose, MdRemove } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import { CiLock } from 'react-icons/ci';
import { setOpenModal } from '../redux/features/filterClass';
import state from '../valtio';
import { useSnapshot } from 'valtio';
import { useRouter } from 'next/navigation';
import { classFilters } from '../constants/classFilters';
import { FaClock, FaLevelUpAlt } from 'react-icons/fa';
import { PiClock, PiClockCounterClockwiseThin } from 'react-icons/pi';
import { routes } from '../constants/routes';

// Colores del botón FILTER para uso consistente en la página
const FILTER_COLORS = {
  amber: 'rgba(245, 158, 11)', // amber-500
  orange: 'rgba(249, 115, 22)', // orange-500
  rose: 'rgba(244, 63, 94)', // rose-500
  amberLight: 'rgba(252, 211, 77)', // amber-300
};

interface Props {
  c: IndividualClass;
  isNew: boolean;
  /** Estilo library: paleta cream/ink/sage/stone. Por defecto estilo oscuro. */
  variant?: 'default' | 'library';
  /** Base URL para el enlace (ej. /library/individual-classes). Si no se pasa, se usa /library/individual-classes. */
  linkBase?: string;
}

const notify = (message: String, agregado: boolean, like: boolean) =>
  toast.custom(
    (t) => (
      <div
        className={`${
          like ? 'notificationWrapperLike' : 'notificationWrapper'
        } ${t.visible ? 'top-0' : '-top-96'}`}
      >
        <div className={'iconWrapper'}>
          {agregado ? <AiOutlineCheckCircle /> : <AiOutlineMinusCircle />}
        </div>
        <div className={`contentWrapper`}>
          <h1>{message}</h1>
          {like ? (
            <p>Le has dado {message} a este curso</p>
          ) : (
            <p>Este curso ha sido {message} exitosamente</p>
          )}
        </div>
        <div className={'closeIcon'} onClick={() => toast.dismiss(t.id)}>
          <MdOutlineClose />
        </div>
      </div>
    ),
    { id: 'unique-notification', position: 'top-center' }
  );

// Función para extraer el ID de Vimeo del link
const extractVimeoId = (link: string): string | null => {
  if (!link) return null;
  
  // Buscar patrones comunes de Vimeo
  const patterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /^(\d+)$/ // Si es solo el ID
  ];
  
  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Función para obtener la URL del thumbnail de Vimeo
const getVimeoThumbnail = (vimeoId: string | null): string | null => {
  if (!vimeoId) return null;
  return `https://vumbnail.com/${vimeoId}.jpg`;
};

function CarouselClassesThumbnail({
  c,
  isNew,
  variant = 'default',
  linkBase,
}: Props) {
  const isLibraryStyle = variant === 'library';
  const classHref = linkBase ? `${linkBase.replace(/\/$/, '')}/${c.id ?? c._id}` : `/library/individual-classes/${c.id}`;
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const snap = useSnapshot(state);
  const [isTouching, setIsTouching] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // Estado separado para mostrar el video con delay
  const [privateToken, setPrivateToken] = useState<string | null>(null);
  const videoLoadedRef = React.useRef<boolean>(false); // Ref para recordar si el video ya se cargó
  const touchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoShowTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Determinar si este video está activo usando estado global (usar _id como identificador único)
  const isThisVideoActive = snap.activeVideoId === c._id;

  const filterClassSlice = useAppSelector(
    (state) => state.filterClass.value
    );

    const checkLogin = () => {
      if(!auth.user) {
        state.loginForm = true;
        return false;
      }
      else {
        state.loginForm = false;
        return true
      }
    }

  // Extraer ID de Vimeo y generar thumbnail al cargar el componente
  useEffect(() => {
    const extractedId = extractVimeoId(c.link);
    setVideoId(extractedId);
    
    // Priorizar image_base_link si existe y es una URL válida, sino usar thumbnail de Vimeo
    if (c.image_base_link) {
      // Verificar si es una URL completa o solo un public_id
      if (c.image_base_link.startsWith('http://') || c.image_base_link.startsWith('https://')) {
        setThumbnailUrl(c.image_base_link);
      } else if (extractedId) {
        // Si image_base_link no es URL válida, usar thumbnail de Vimeo
        setThumbnailUrl(getVimeoThumbnail(extractedId));
      }
    } else if (extractedId) {
      setThumbnailUrl(getVimeoThumbnail(extractedId));
    }
  }, [c.link, c.image_base_link, c.name]);

  // Obtener token privado para videos UNLISTED cuando cambie el videoId
  useEffect(() => {
    if (!videoId) {
      setPrivateToken(null);
      return;
    }

    const fetchPrivateToken = async () => {
      try {
        const res = await fetch('/api/vimeo/getPrivateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setPrivateToken(data.privateToken);
        }
      } catch (error) {
        console.error('Error obteniendo token privado:', error);
      }
    };

    fetchPrivateToken();
  }, [videoId]);
  

  const ComponentToRender = ({ children }: any) =>  (
    <>
      {(auth.user && ((auth?.user?.subscription?.active || auth?.user?.rol === "Admin" || auth?.user?.isVip) || c.isFree))  ? (
        <Link href={classHref}>
          {children}
        </Link>
      ) : (
        <div onClick={() => {
          checkLogin() ? router.push(routes.navegation.moveCrew) : null;
        }}>
          {children}
        </div>
      )}
    </>
  )

  const isLocked = !auth?.user?.subscription?.active && auth?.user?.rol !== "Admin" && c.isFree == false && !auth?.user?.isVip;
  const isSeen = auth?.user && auth.user?.classesSeen?.includes(c._id);

  // Handlers para eventos táctiles (mobile)
  const handleTouchStart = () => {
    // Limpiar timeout anterior si existe
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Mostrar preview después de un pequeño delay para evitar que aparezca inmediatamente
    touchTimeoutRef.current = setTimeout(() => {
      if (videoId) {
        setIsTouching(true);
        // Activar este video en el estado global (desactiva automáticamente otros)
        (state as any).activeVideoId = c._id;
        // Iniciar carga del video cuando se toca
        setVideoReady(false);
      }
    }, 300); // 300ms delay para detectar un toque intencional
  };

  const handleTouchEnd = () => {
    // Limpiar timeout si el usuario quita el dedo antes del delay
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Ocultar preview después de un pequeño delay
    setTimeout(() => {
      setIsTouching(false);
      // Desactivar este video en el estado global
      if (state.activeVideoId === c._id) {
        state.activeVideoId = null;
      }
      setVideoReady(false);
    }, 200);
  };

  const handleTouchCancel = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    setIsTouching(false);
    // Desactivar este video en el estado global
    if (state.activeVideoId === c._id) {
      state.activeVideoId = null;
    }
    setVideoReady(false);
  };

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (videoShowTimeoutRef.current) {
        clearTimeout(videoShowTimeoutRef.current);
      }
    };
  }, []);

  // Determinar si debe intentar cargar el video (solo si este video está activo en el estado global)
  const shouldLoadVideo = (isThisVideoActive || isTouching) && videoId;
  
  // Determinar si mostrar el video (con delay después de que esté listo)
  const shouldDisplayVideo = shouldLoadVideo && showVideo;
  
  // Resetear estados cuando este video se desactiva
  useEffect(() => {
    if (!isThisVideoActive && !isTouching) {
      // Limpiar timeout si existe
      if (videoShowTimeoutRef.current) {
        clearTimeout(videoShowTimeoutRef.current);
        videoShowTimeoutRef.current = null;
      }
      // Ocultar video inmediatamente
      setShowVideo(false);
      // Mantener videoReady en true si el video ya se cargó
      if (!videoLoadedRef.current) {
        setVideoReady(false);
      }
    }
  }, [isThisVideoActive, isTouching]);
  
  // Delay para mostrar el video después de que esté listo - esperar 2 segundos de reproducción
  useEffect(() => {
    if (videoReady && shouldLoadVideo && (isThisVideoActive || isTouching)) {
      // Limpiar timeout anterior si existe
      if (videoShowTimeoutRef.current) {
        clearTimeout(videoShowTimeoutRef.current);
      }
      // Esperar 2 segundos (2000ms) antes de mostrar el video para asegurar que esté reproduciéndose
      videoShowTimeoutRef.current = setTimeout(() => {
        // Verificar que aún es el video activo antes de mostrarlo
        if (state.activeVideoId === c._id || isTouching) {
          setShowVideo(true);
        }
      }, 2000);
    }
    
    return () => {
      if (videoShowTimeoutRef.current) {
        clearTimeout(videoShowTimeoutRef.current);
      }
    };
  }, [videoReady, shouldLoadVideo, isThisVideoActive, isTouching, c._id]);

  return (
    <AnimatePresence>
        <ComponentToRender>
            <m.div
            className="group relative w-full h-full flex"
            onMouseEnter={() => {
              // Activar este video en el estado global (desactiva automáticamente otros)
              (state as any).activeVideoId = c._id;
              // Si el video ya se cargó previamente, marcarlo como listo inmediatamente
              if (videoId && videoLoadedRef.current) {
                setVideoReady(true);
              } else if (videoId) {
                // Solo resetear si no se ha cargado antes
                setVideoReady(false);
              }
            }}
            onMouseLeave={() => {
              // Desactivar este video en el estado global
              if (state.activeVideoId === c._id) {
                state.activeVideoId = null;
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
          >
            {/* Tarjeta principal: library = cream/ink/sage; default = oscuro con overlay naranja */}
            <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 h-full w-full flex flex-col min-h-0 ${
              isLibraryStyle
                ? 'bg-white/80 border border-palette-stone/15 shadow-lg'
                : 'bg-black/80 border border-gray-700/50 shadow-[0_15px_45px_rgba(0,0,0,0.6)]'
            }`}>
              {!isLibraryStyle && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-orange-900/40 to-amber-900/40 pointer-events-none z-0" />
              )}

      
              
              {/* Contenedor de imagen */}
              <div className="relative w-full h-[12rem] sm:h-[14rem] md:h-[16rem] overflow-hidden" id={`image-container-${c.id}`}>
                {/* Imagen de fondo - siempre visible (incluso mientras carga el video), se oculta cuando el video se muestra */}
                <div className={`absolute inset-0 w-full h-full ${shouldDisplayVideo ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                  {thumbnailUrl && (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) ? (
                    // Si thumbnailUrl es una URL completa (de Vimeo), usar img normal
                    <img
                      src={thumbnailUrl}
                      alt={c?.description}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        // Fallback a image_url de Cloudinary si el thumbnail falla
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : c.image_base_link ? (
                    // Si image_base_link existe, usar CldImage (Cloudinary)
                    <CldImage
                      src={c.image_base_link}
                      preserveTransformations
                      className="object-cover w-full h-full"
                      alt={c?.description}
                      loader={imageLoader}
                      fill={true}
                    />
                  ) : (
                    // Fallback a image_url original
                <CldImage
                  src={c?.image_url}
                  preserveTransformations
                      className="object-cover w-full h-full"
                  alt={c?.description}
                  loader={imageLoader}
                  fill={true}
                />
                  )}
                </div>
                
                {/* Iframe del video - se renderiza cuando hay hover/touch para que cargue */}
                {shouldLoadVideo && (
                  <div className={`absolute inset-0 w-full h-full overflow-hidden ${shouldDisplayVideo ? 'opacity-100 z-[1]' : 'opacity-0 z-0'} transition-opacity duration-300`}>
                    <iframe
                      key={`${videoId}-${privateToken || 'no-token'}`}
                      src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=0&controls=0&background=1&responsive=1&start=0${privateToken ? `&h=${privateToken}` : ''}`}
                      className="absolute top-1/2 left-1/2 w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      style={{ 
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%) scale(1.2)',
                        minWidth: '100%',
                        minHeight: '100%',
                        width: '50.77777778vh', // 16:9 aspect ratio para cubrir altura
                        height: '16.25vw' // 16:9 aspect ratio para cubrir ancho
                      }}
                      onLoad={() => {
                        // Cuando el iframe carga, marcar el video como listo y recordarlo
                        setVideoReady(true);
                        videoLoadedRef.current = true;
                      }}
                    />
                  </div>
                )}
                
                {/* Loading indicator - solo spinner sobre la imagen mientras carga el preview */}
                {shouldLoadVideo && (!videoReady || !showVideo) && (
                  <div className={`absolute inset-0 z-[5] flex items-center justify-center ${isLibraryStyle ? 'bg-palette-ink/60' : 'bg-black/70'} backdrop-blur-[2px]`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 border-[3px] rounded-full animate-spin ${isLibraryStyle ? 'border-palette-cream/30 border-t-palette-cream' : 'border-white/30 border-t-white'}`} />
                  </div>
                )}
                
                
                {/* Overlay para lock */}
                {isLocked && (
                  <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm z-30 ${isLibraryStyle ? 'bg-palette-ink/70' : 'bg-gray-950/70'}`}>
                    <CiLock className={`w-12 h-12 ${isLibraryStyle ? 'text-palette-cream/90' : 'text-gray-300/80'}`} />
                  </div>
                )}
                
                {/* Badges: fondo sólido o alto contraste para leerse bien sobre la imagen */}
                <div className="absolute top-3 left-3 right-[110px] flex flex-row gap-1.5 items-center flex-wrap z-20">
                  {c.isFree && (
                    <div className={`px-2 py-1 whitespace-nowrap rounded-full text-[10px] font-montserrat font-semibold transition-all shrink-0 flex items-center ${
                      isLibraryStyle
                        ? 'bg-palette-sage text-palette-ink shadow-md'
                        : 'bg-gradient-to-r from-amber-800/80 via-amber-900/80 to-orange-900/80 text-white shadow-[0_3px_12px_rgba(245,158,11,0.4)] border border-amber-600/50'
                    }`}>
                      <span>GRATIS</span>
                    </div>
                )}
                {isNew && !c.isFree && (
                    <div className={`px-2 py-1 whitespace-nowrap rounded-full text-[10px] font-montserrat font-semibold transition-all shrink-0 flex items-center ${
                      isLibraryStyle
                        ? 'bg-palette-sage text-palette-cream shadow-md'
                        : 'bg-gradient-to-r from-rose-800/80 via-amber-900/80 to-orange-900/80 text-white shadow-[0_3px_12px_rgba(249,115,22,0.4)] border border-amber-600/50'
                    }`}>
                      <span>NUEVA</span>
                    </div>
                  )}
                </div>
                
                {/* Tipo de clase */}
                <div className={`absolute top-3 right-3 max-w-[95px] px-2 py-1 rounded-full text-[10px] font-montserrat font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex items-center z-20 ${
                  isLibraryStyle ? 'bg-palette-ink/95 text-palette-cream shadow-md' : 'bg-black/80 text-gray-200'
                }`}>
                  <span>{c.type?.toUpperCase()}</span>
                </div>
                
 
                
                {/* Barra de progreso si fue vista */}
                {isSeen && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 backdrop-blur-md overflow-hidden z-20 ${isLibraryStyle ? 'bg-palette-stone/20' : 'bg-gray-900/60'}`}>
                    <div className={`absolute inset-0 ${isLibraryStyle ? 'bg-palette-sage' : 'bg-gradient-to-r from-gray-600/70 via-gray-500/65 to-gray-600/65'}`} />
                  </div>
                )}
              </div>
              
              {/* Contenido de la tarjeta */}
              <div className={`relative z-10 border-t p-4 md:p-5 flex flex-col flex-grow min-h-0 ${
                isLibraryStyle ? 'bg-white/90 border-palette-stone/15' : 'bg-black/90 border-gray-700/40'
              }`}>
                {!isLibraryStyle && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-orange-900/20 to-amber-900/20 pointer-events-none" />
                )}
                <h3 className={`relative z-10 font-montserrat font-light text-base sm:text-lg md:text-xl mb-3 md:mb-4 line-clamp-2 h-[3rem] md:h-[3.5rem] ${
                  isLibraryStyle ? 'text-palette-ink' : 'text-gray-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                }`}>
                  {c.name}
                </h3>
                <p className={`relative z-10 font-montserrat font-light text-sm mb-3 md:mb-4 line-clamp-2 h-[2.5rem] overflow-hidden ${isLibraryStyle ? 'text-palette-stone' : 'text-gray-400'}`}>{c.description}</p>
                
                <div className="relative z-10 flex flex-wrap items-center gap-1.5 md:gap-2.5 mt-auto">
                  <m.div 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all group/item relative overflow-hidden ${
                      isLibraryStyle
                        ? 'bg-palette-stone/10 border border-palette-stone/20'
                        : 'bg-gray-800/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-gray-700/40'
                    }`}
                  >
                    <m.div 
                      className={`p-1.5 rounded-xl flex items-center justify-center transition-all relative overflow-hidden ${
                        isLibraryStyle ? 'bg-palette-sage/20 border border-palette-sage/30' : 'bg-gray-700/60 backdrop-blur-md shadow-sm border border-gray-600/30'
                      }`}
                    >
                      <FaClock className={`w-2 h-2 relative z-10 ${isLibraryStyle ? 'text-palette-ink' : 'text-gray-300 drop-shadow-sm'}`} />
                    </m.div>
                    <span className={`text-[11px] md:text-xs font-montserrat font-light relative z-10 ${isLibraryStyle ? 'text-palette-ink' : 'text-gray-300'}`}>{c.minutes} min</span>
                  </m.div>
                  
                  <m.div 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all group/item relative overflow-hidden ${
                      isLibraryStyle
                        ? 'bg-palette-stone/10 border border-palette-stone/20'
                        : 'bg-gray-800/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-gray-700/40'
                    }`}
                  >
                    <m.div 
                      className={`p-1.5 rounded-xl flex items-center justify-center transition-all relative overflow-hidden ${
                        isLibraryStyle ? 'bg-palette-sage/20 border border-palette-sage/30' : 'bg-gray-700/60 backdrop-blur-md shadow-sm border border-gray-600/30'
                      }`}
                    >
                      <FaLevelUpAlt className={`w-2 h-2 relative z-10 ${isLibraryStyle ? 'text-palette-ink' : 'text-gray-300 drop-shadow-sm'}`} />
                    </m.div>
                    <span className={`text-[11px] md:text-xs font-montserrat font-light relative z-10 ${isLibraryStyle ? 'text-palette-ink' : 'text-gray-300'}`}>Nivel {c.level}</span>
                  </m.div>
                </div>
              </div>
            </div>
          </m.div>
        </ComponentToRender>
    </AnimatePresence>
  );
}

export default CarouselClassesThumbnail;
