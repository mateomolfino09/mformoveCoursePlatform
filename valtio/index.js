import { proxy } from 'valtio'

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
  classHeaders: 'Temario'
})

export default state
