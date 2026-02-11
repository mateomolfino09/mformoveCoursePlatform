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
  activeVideoId: null, // ID del video activo actualmente (string | null)
  systemNavOpen: false,
  weeklyPathNavOpen: false, // dropdown del navegador de camino (Move Crew), controlado desde header en móvil
  weeklyPathTutorialHighlightButton: false, // paso 0 del tutorial: resaltar botón Move Crew (sombra celeste + titilar)
});

export default state;
