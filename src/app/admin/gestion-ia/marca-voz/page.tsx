'use client';

import React from 'react';
import Link from 'next/link';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminCard, AdminNavGrid } from '../../../../components/admin';

export default function VoiceBrandManagementPage() {
  return (
    <AdmimDashboardLayout>
      <AdminPage>
        <Link
          href="/admin/gestion-ia"
          className="mb-4 inline-block text-[12px] text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
        >
          ← IA
        </Link>
        <AdminPageHeader
          title="Voz de marca"
          description="Configurá el tono para emails automáticos."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminCard>
            <h2 className="mb-2 text-[13px] font-medium">Vista previa</h2>
            <p className="text-[13px] leading-relaxed text-[var(--admin-muted)]">
              “Hola. Te comparto este contenido que creo que te va a servir…”
            </p>
            <p className="mt-2 text-[12px] text-[var(--admin-subtle)]">
              Ejemplo de cómo podría verse un email con la voz configurada.
            </p>
          </AdminCard>
          <AdminCard>
            <h2 className="mb-2 text-[13px] font-medium">Consejos</h2>
            <ul className="list-disc space-y-1 pl-4 text-[12px] text-[var(--admin-muted)]">
              <li>Usá palabras que reflejen tu personalidad</li>
              <li>Definí un tono consistente</li>
              <li>Analizá Instagram para más precisión</li>
            </ul>
          </AdminCard>
        </div>
        <div className="mt-4">
          <AdminNavGrid
            columns={2}
            items={[
              { href: '/admin/gestion-ia/instagram', title: 'Analizar Instagram' },
              { href: '/admin/gestion-ia/generador-correos', title: 'Probar generación' },
            ]}
          />
        </div>
      </AdminPage>
    </AdmimDashboardLayout>
  );
}
