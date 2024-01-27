import axios from 'axios';

const API_BASE_URL = 'https://api-sbx.dlocalgo.com/v1'; // Replace with the actual base URL

const dLocalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DLOCAL_API_KEY}:${process.env.DLOCAL_SECRET_KEY}`,
  },
});

export default dLocalApi;

