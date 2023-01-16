const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const BASE_URL = 'https://api.unsplash.com/photos/random'
const RICK_URL = 'https://rickandmortyapi.com/api/character'
const YOUTUBE_PLAYLIST_ITEMS_API = 'https://www.googleapis.com/youtube/v3/playlistItems';
const playlistId = 'PLuq6IKQNFh1HRIqNW-JZAn_4mCQgxHayh'
const CloudinaryKey = process.env.NEXT_PUBLIC_CLOUDINARY_KEY
const CLOUDINARY = `https://api.cloudinary.com/v1_1/${CloudinaryKey}/image/upload`
const result = 20;

var finalURL = `${YOUTUBE_PLAYLIST_ITEMS_API}?part=snippet&playlistId=${playlistId}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`


const requests = {
  fetchRandomImages: `${BASE_URL}/?client_id=${API_KEY}`,
  fetchRickAndmort: RICK_URL,
  fetchYT: finalURL,
  fetchCloudinary: CLOUDINARY,
  playlistYTAPI: YOUTUBE_PLAYLIST_ITEMS_API,
  
}

export default requests