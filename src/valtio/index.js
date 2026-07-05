import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: '#EFBD48',
  isLogoTexture: true,
  isFullTexture: false,
  logoDecal: '/images/logo.png',
  fullDecal: '/images/logo.png',
  volumeModal: true,
  volumeIndex: false,
  searchBar: false,
  searchToggle: false,
  searchInput: '',
  classHeaders: 'Preguntas',
  loginForm: false,
  /** 'register' | 'login' — modo al abrir LoginModal desde checkout vs header */
  authModalMode: 'register',
  activeVideoId: null, // ID del video activo actualmente (string | null)
  systemNavOpen: false,
  weeklyPathNavOpen: false, // dropdown del navegador de camino (Cuerpo autónomo), controlado desde header en móvil
  bitacoraNavOpen: false, // menú Bitacora/Navegador en home (controlado desde header o barra)
  weeklyPathTutorialHighlightButton: false,
  bitacoraTutorialHighlightButton: false, // paso 0 onboarding Bitacora: resaltar botón Menú
  /** Nombre del curso activo (landing / checkout); lo setea CursoLandingProvider */
  cursoHeaderTitle: null,
});

export default state;
