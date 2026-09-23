'use client';

import React from 'react';
import {
  PhotoIcon,
  MicrophoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminNavGrid } from '../../../components/admin';

export default function AIManagementPage() {
  return (
    <AdmimDashboardLayout>
      <AdminPage>
        <AdminPageHeader
          title="IA"
          description="Voz de marca, Instagram y generación de emails."
        />
        <AdminNavGrid
          columns={2}
          items={[
            {
              href: '/admin/gestion-ia/instagram',
              title: 'Análisis de Instagram',
              description: 'Estilo de comunicación a partir de Instagram',
              icon: PhotoIcon,
            },
            {
              href: '/admin/gestion-ia/marca-voz',
              title: 'Voz de marca',
              description: 'Configuración para emails automáticos',
              icon: MicrophoneIcon,
            },
            {
              href: '/admin/gestion-ia/generador-correos',
              title: 'Generador de emails',
              description: 'Redacción con la voz configurada',
              icon: EnvelopeIcon,
            },
            {
              href: '/admin/correos-automaticos',
              title: 'Analytics de IA',
              description: 'Rendimiento de emails generados',
              icon: ChartBarIcon,
            },
            {
              href: '/admin/gestion-ia/configuracion',
              title: 'Configuración',
              description: 'API keys y servicios',
              icon: CogIcon,
            },
          ]}
        />
      </AdminPage>
    </AdmimDashboardLayout>
  );
}
