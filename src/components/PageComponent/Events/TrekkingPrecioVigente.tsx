'use client';

import React from 'react';
import { TarifasTrekking } from '../../../lib/trekkingPrecios';

type Tono = 'cream' | 'ink' | 'overview' | 'list' | 'chip';

interface Props {
  tarifas: TarifasTrekking;
  tono: Tono;
}

const TrekkingPrecioVigente: React.FC<Props> = ({ tarifas, tono }) => {
  if (tono === 'chip') {
    return (
      <div>
        <div className="text-white font-light text-sm leading-snug">
          {tarifas.comunidadTexto} comunidad
        </div>
        <div className="text-white font-light text-sm leading-snug">
          {tarifas.generalTexto} general
        </div>
        {tarifas.etiqueta && (
          <div className="mt-1 text-[11px] text-gray-300">{tarifas.etiqueta}</div>
        )}
      </div>
    );
  }

  if (tono === 'list') {
    return (
      <div className="space-y-2">
        {tarifas.etiqueta && (
          <p className="font-montserrat text-[11px] font-medium uppercase tracking-[0.14em] text-palette-stone">
            {tarifas.etiqueta}
          </p>
        )}
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-montserrat text-[13px] text-palette-ink/75">Alumnos de la comunidad</span>
          <span className="font-montserrat text-[18px] font-medium text-palette-ink">{tarifas.comunidadTexto}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-montserrat text-[13px] text-palette-ink/75">Público general</span>
          <span className="font-montserrat text-[18px] font-medium text-palette-ink">{tarifas.generalTexto}</span>
        </div>
      </div>
    );
  }

  const claro = tono === 'ink';
  const etiqueta = claro
    ? 'font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70'
    : 'font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-palette-ink/70';
  const fila = claro
    ? 'flex items-baseline justify-between gap-3 border-white/10'
    : 'flex items-baseline justify-between gap-3 border-palette-stone/15';
  const concepto = claro
    ? 'font-montserrat text-sm text-white/80'
    : 'font-montserrat text-sm text-palette-ink/75';
  const monto = claro
    ? 'font-montserrat text-2xl font-light tracking-tight text-white md:text-3xl'
    : tono === 'overview'
      ? 'font-montserrat text-2xl font-light tracking-tight text-gray-900'
      : 'font-montserrat text-2xl font-extrabold tracking-tight text-palette-ink md:text-3xl';

  return (
    <div className="space-y-3 text-left">
      {tarifas.etiqueta && <p className={`text-center ${etiqueta}`}>{tarifas.etiqueta}</p>}
      <div className={`${fila} border-b pb-3`}>
        <span className={concepto}>Alumnos de la comunidad</span>
        <span className={monto}>{tarifas.comunidadTexto}</span>
      </div>
      <div className={fila}>
        <span className={concepto}>Público general</span>
        <span className={monto}>{tarifas.generalTexto}</span>
      </div>
    </div>
  );
};

export default TrekkingPrecioVigente;
