/**
 * Utilidades para formatear precios según la ubicación del evento
 */

export interface PrecioFormateado {
  simbolo: string;
  precio: number;
  moneda: string;
  textoCompleto: string;
}

/**
 * Obtiene el tipo de cambio USD a UYU (pesos uruguayos) desde la API de Stripe
 */
export async function obtenerTipoCambioStripe(): Promise<number> {
  try {
    console.log('💱 [FRONTEND] Consultando tipo de cambio USD → UYU...');
    
    const response = await fetch('/api/payments/getExchangeRate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rate || 40.2;
    
    console.log(`💱 [FRONTEND] Tipo de cambio obtenido: ${rate} UYU/USD (${data.fallback ? 'fallback' : data.source})`);
    
    return rate;
  } catch (error) {
    console.error('❌ [FRONTEND] Error obteniendo tipo de cambio:', error);
    return 40.2; // Tasa de cambio por defecto USD→UYU
  }
}

/**
 * Determina la moneda y símbolo según la ubicación del evento
 */
export function determinarMonedaEvento(evento: any): { simbolo: string; moneda: string } {
  // Si el evento es online, usar USD
  if (evento.online) {
    return { simbolo: 'US$', moneda: 'USD' };
  }

  // Si es presencial, verificar ubicación
  if (evento.ubicacion?.pais) {
    const pais = evento.ubicacion.pais.toLowerCase();
    
    // Eventos presenciales en Uruguay
    if (pais === 'uruguay' || pais === 'uy') {
      return { simbolo: '$', moneda: 'UYU' };
    }
  }

  // Por defecto, usar USD
  return { simbolo: 'US$', moneda: 'USD' };
}

/**
 * Formatea un precio según la ubicación del evento (versión síncrona con tasa fija)
 */
export function formatearPrecioEventoSync(precio: number, evento: any): PrecioFormateado {
  const { simbolo, moneda } = determinarMonedaEvento(evento);
  
  // Si la moneda es uruguaya, convertir de USD a pesos uruguayos
  let precioConvertido = precio;
  if (moneda === 'UYU') {
    // Tasa de conversión fija (actualizada al tipo de cambio actual)
    const tasaCambio = 42; // Tasa actual aproximada USD/UYU
    precioConvertido = Math.round(precio * tasaCambio);
  }
  
  return {
    simbolo,
    precio: precioConvertido,
    moneda,
    textoCompleto: `${simbolo}${precioConvertido}`
  };
}

/**
 * Formatea un precio según la ubicación del evento (versión asíncrona con tasa dinámica)
 */
export async function formatearPrecioEvento(precio: number, evento: any): Promise<PrecioFormateado> {
  const { simbolo, moneda } = determinarMonedaEvento(evento);
  
  // Si la moneda es uruguaya, convertir de USD a pesos uruguayos usando Stripe
  let precioConvertido = precio;
  if (moneda === 'UYU') {
    console.log(`💰 [FRONTEND] Convirtiendo ${precio} USD → UYU para evento: ${evento.nombre}`);
    const tasaCambio = await obtenerTipoCambioStripe();
    precioConvertido = Math.round(precio * tasaCambio);
    console.log(`💱 [FRONTEND] Conversión completada: ${precio} USD × ${tasaCambio} = ${precioConvertido} UYU`);
  }
  
  const resultado = {
    simbolo,
    precio: precioConvertido,
    moneda,
    textoCompleto: `${simbolo}${precioConvertido}`
  };
  
  return resultado;
}

/**
 * Formatea un precio con descuento (versión síncrona)
 */
export function formatearPrecioConDescuentoSync(precio: number, precioOriginal: number, evento: any): {
  precioActual: PrecioFormateado;
  precioOriginal: PrecioFormateado;
  ahorro: PrecioFormateado;
} {
  const precioActual = formatearPrecioEventoSync(precio, evento);
  const precioOriginalFormateado = formatearPrecioEventoSync(precioOriginal, evento);
  const ahorro = formatearPrecioEventoSync(precioOriginal - precio, evento);

  return {
    precioActual,
    precioOriginal: precioOriginalFormateado,
    ahorro
  };
}

/**
 * Formatea un precio con descuento (versión asíncrona)
 */
export async function formatearPrecioConDescuento(precio: number, precioOriginal: number, evento: any): Promise<{
  precioActual: PrecioFormateado;
  precioOriginal: PrecioFormateado;
  ahorro: PrecioFormateado;
}> {
  const precioActual = await formatearPrecioEvento(precio, evento);
  const precioOriginalFormateado = await formatearPrecioEvento(precioOriginal, evento);
  const ahorro = await formatearPrecioEvento(precioOriginal - precio, evento);

  return {
    precioActual,
    precioOriginal: precioOriginalFormateado,
    ahorro
  };
} 