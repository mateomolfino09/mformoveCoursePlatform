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
  isNew }: Props) {
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const snap = useSnapshot(state);
  const [isTouching, setIsTouching] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // Estado separado para mostrar el video con delay
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
    
    // Debug: verificar que se extraiga el ID correctamente
    if (extractedId) {
      console.log('Video ID extraído:', extractedId, 'para clase:', c.name);
    } else {
      console.log('No se pudo extraer Video ID de:', c.link, 'para clase:', c.name);
    }
    
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
  

  const ComponentToRender = ({ children }: any) =>  (
    <>
      {(auth.user && ((auth?.user?.subscription?.active || auth?.user?.rol === "Admin" || auth?.user?.isVip) || c.isFree))  ? (
        <>
        <Link href={`/classes/${c.id}`}>
            {children}
          </Link>
        </>
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
            {/* Tarjeta principal con fondo negro y overlay naranja de baja opacidad */}
            <div className="relative bg-black/80 rounded-2xl md:rounded-3xl border border-gray-700/50 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.6)] transition-all duration-300 h-full w-full flex flex-col min-h-0">
              {/* Overlay naranja con opacidad baja */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-orange-900/40 to-amber-900/40 pointer-events-none z-0" />

      
              
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
                      key={videoId}
                      src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=0&controls=0&background=1&responsive=1&start=0`}
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
                
                {/* Loading indicator - se muestra mientras carga el video o durante el delay, sobre la imagen */}
                {shouldLoadVideo && (!videoReady || !showVideo) && (
                  <div className="absolute inset-0 flex items-center justify-center z-[5]">
                    <div className="flex flex-col items-center gap-3">
                      {/* Spinner gris */}
                      <div className="w-12 h-12 border-4 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                      <p className="text-gray-300 text-sm font-montserrat font-light drop-shadow-lg">Cargando video...</p>
                    </div>
                </div>
                )}
                
                
                {/* Overlay para lock */}
                {isLocked && (
                  <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center backdrop-blur-sm z-30">
                    <CiLock className="w-12 h-12 text-gray-300/80" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 right-[110px] flex flex-row gap-1.5 items-center flex-wrap z-20">
                  {c.isFree && (
                    <div className="bg-gradient-to-r from-amber-800/80 via-amber-900/80 to-orange-900/80 text-white px-1.5 py-0.5 whitespace-nowrap rounded-full text-[10px] font-montserrat font-semibold shadow-[0_3px_12px_rgba(245,158,11,0.4)] border border-amber-600/50 transition-all shrink-0 flex items-center">
                      <span>GRATIS</span>
                  </div>
                )}
                {isNew && !c.isFree && (
                    <div className="bg-gradient-to-r from-rose-800/80 via-amber-900/80 to-orange-900/80 text-white px-1.5 py-0.5 whitespace-nowrap rounded-full text-[10px] font-montserrat font-semibold shadow-[0_3px_12px_rgba(249,115,22,0.4)] border border-amber-600/50 transition-all shrink-0 flex items-center">
                      <span>NUEVA</span>
                    </div>
                  )}
                </div>
                
                {/* Tipo de clase */}
                <div className="absolute top-3 right-3 max-w-[95px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded-full text-[10px] font-montserrat font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex items-center z-20">
                  <span>{c.type?.toUpperCase()}</span>
                </div>
                
 
                
                {/* Barra de progreso si fue vista */}
                {isSeen && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-900/60 backdrop-blur-md overflow-hidden z-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/70 via-gray-500/65 to-gray-600/65" />
                  </div>
                )}
              </div>
              
              {/* Contenido de la tarjeta */}
              <div className="relative z-10 bg-black/90 border-t border-gray-700/40 p-4 md:p-5 flex flex-col flex-grow min-h-0">
                {/* Overlay naranja sutil en el contenido */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-orange-900/20 to-amber-900/20 pointer-events-none" />
                <h3 className="relative z-10 font-montserrat font-light text-base sm:text-lg md:text-xl text-gray-100 mb-3 md:mb-4 line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] h-[3rem] md:h-[3.5rem]">
                  {c.name}
                </h3>
                <p className="relative z-10 text-gray-400 font-montserrat font-light text-sm mb-3 md:mb-4 line-clamp-2 h-[2.5rem] overflow-hidden">{c.description}</p>
                
                <div className="relative z-10 flex flex-wrap items-center gap-1.5 md:gap-2.5 mt-auto">
                  <m.div 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-800/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group/item relative overflow-hidden border border-gray-700/40"
                  >
                    <m.div 
                      className="p-1.5 rounded-xl bg-gray-700/60 backdrop-blur-md flex items-center justify-center shadow-sm transition-all relative overflow-hidden border border-gray-600/30"
                    >
                      <FaClock className="w-2 h-2 text-gray-300 drop-shadow-sm relative z-10" />
                    </m.div>
                    <span className="text-[11px] md:text-xs text-gray-300 font-montserrat font-light relative z-10">{c.minutes} min</span>
                  </m.div>
                  
                  <m.div 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-800/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all group/item relative overflow-hidden border border-gray-700/40"
                  >
                    <m.div 
                      className="p-1.5 rounded-xl bg-gray-700/60 backdrop-blur-md flex items-center justify-center shadow-sm transition-all relative overflow-hidden border border-gray-600/30"
                    >
                      <FaLevelUpAlt className="w-2 h-2 text-gray-300 drop-shadow-sm relative z-10" />
                    </m.div>
                    <span className="text-[11px] md:text-xs text-gray-300 font-montserrat font-light relative z-10">Nivel {c.level}</span>
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
