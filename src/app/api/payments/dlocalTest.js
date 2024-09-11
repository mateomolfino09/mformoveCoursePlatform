import axios from 'axios';

let API_BASE_URL;

if (process.env.NODE_ENV != 'production') {
  API_BASE_URL = 'https://api-sbx.dlocalgo.com/v1';
} else {
  API_BASE_URL = "https://api.dlocalgo.com/v1"
}

const dLocalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DLOCAL_API_KEY}:${process.env.DLOCAL_SECRET_KEY}`,
  },
});

export default dLocalApi;

