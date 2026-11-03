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
        <div className="text-white font-light text-base">{tarifas.generalTexto}</div>
        {tarifas.etiqueta ? (
          <div className="mt-1 text-[11px] text-gray-300">{tarifas.etiqueta}</div>
        ) : (
          <div className="text-xs text-gray-300">Precio</div>
        )}
      </div>
    );
  }

  if (tono === 'list') {
    return (
      <div className="space-y-1">
        {tarifas.etiqueta && (
          <p className="font-montserrat text-[11px] font-medium uppercase tracking-[0.14em] text-palette-stone">
            {tarifas.etiqueta}
          </p>
        )}
        <p className="font-montserrat text-[18px] font-medium text-palette-ink">{tarifas.generalTexto}</p>
      </div>
    );
  }

  const claro = tono === 'ink';
  const etiqueta = claro
    ? 'mb-2 font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70'
    : 'mb-2 font-montserrat text-[11px] font-semibold uppercase tracking-[0.22em] text-palette-ink/70';
  const monto = claro
    ? 'font-montserrat text-3xl font-light tracking-tight text-white md:text-4xl lg:text-5xl'
    : tono === 'overview'
      ? 'font-montserrat text-2xl font-light tracking-tight text-gray-900'
      : 'font-montserrat text-4xl font-extrabold tracking-tight text-palette-ink md:text-5xl';

  return (
    <div className="text-center">
      {tarifas.etiqueta && <p className={etiqueta}>{tarifas.etiqueta}</p>}
      <p className={monto}>{tarifas.generalTexto}</p>
    </div>
  );
};

export default TrekkingPrecioVigente;
