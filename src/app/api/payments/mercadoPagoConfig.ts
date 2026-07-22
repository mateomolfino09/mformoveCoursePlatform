import axios, { AxiosInstance } from 'axios';

const ACCESS_TOKEN =
  process.env.MERCADO_PAGO_ACCESS_TOKEN ||
  process.env.MERCADO_PAGO_PUBLIC_API_KEY ||
  '';

export function getMercadoPagoAccessToken(): string {
  if (!ACCESS_TOKEN.trim()) {
    throw new Error(
      'Falta MERCADO_PAGO_ACCESS_TOKEN (Access Token de Mercado Pago)'
    );
  }
  return ACCESS_TOKEN.trim();
}

const mercadoPagoApi: AxiosInstance = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

mercadoPagoApi.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${getMercadoPagoAccessToken()}`;
  return config;
});

export default mercadoPagoApi;

export const MERCADO_PAGO_MAX_INSTALLMENTS = 12;

export const PAID_MERCADO_PAGO_STATUSES = new Set([
  'approved',
  'AUTHORIZED',
  'authorized',
]);

export function isMercadoPagoPaidStatus(status?: string | null): boolean {
  if (!status) return false;
  return PAID_MERCADO_PAGO_STATUSES.has(status) || status.toLowerCase() === 'approved';
}
