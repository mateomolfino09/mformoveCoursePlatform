const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const BASE_URL = 'https://api.unsplash.com/photos/random'
const RICK_URL = 'https://rickandmortyapi.com/api/character'
const requests = {
  fetchRandomImages: `${BASE_URL}/?client_id=${API_KEY}`,
  fetchRickAndmort: RICK_URL
}

export default requests