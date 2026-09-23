'use client';

import React from 'react';
import Link from 'next/link';
import CopywritingAssistant from '../../../../components/PageComponent/AdminMentorship/CopywritingAssistant';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { AdminPage, AdminPageHeader, AdminCard, AdminNavGrid } from '../../../../components/admin';

const templates = [
  { title: 'Newsletter semanal', description: 'Email informativo con contenido destacado' },
  { title: 'Programa transformacional', description: 'Email semanal para participantes' },
  { title: 'Recordatorio de clase', description: 'Aviso de próxima clase en vivo' },
  { title: 'Email personalizado', description: 'Creá tu propio template' },
];

export default function EmailGeneratorManagementPage() {
  return (
    <AdmimDashboardLayout>
      <AdminPage wide>
        <Link
          href="/admin/ai-management"
          className="mb-4 inline-block text-[12px] text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
        >
          ← IA
        </Link>
        <AdminPageHeader
          title="Generador de emails"
          description="Generá emails con IA usando tu voz de marca."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CopywritingAssistant />
          </div>
          <div className="space-y-4">
            <AdminCard>
              <h2 className="mb-3 text-[13px] font-medium">Templates</h2>
              <ul className="space-y-2">
                {templates.map((item) => (
                  <li key={item.title} className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] px-3 py-2">
                    <p className="text-[13px] font-medium text-[var(--admin-fg)]">{item.title}</p>
                    <p className="text-[12px] text-[var(--admin-muted)]">{item.description}</p>
                  </li>
                ))}
              </ul>
            </AdminCard>
            <AdminNavGrid
              columns={1}
              items={[
                { href: '/admin/ai-management/voice-brand', title: 'Configurar voz', description: 'Voz de marca para emails' },
                { href: '/admin/ai-management/instagram', title: 'Analizar Instagram', description: 'Fuente de tono y contenido' },
              ]}
            />
          </div>
        </div>
      </AdminPage>
    </AdmimDashboardLayout>
  );
}
