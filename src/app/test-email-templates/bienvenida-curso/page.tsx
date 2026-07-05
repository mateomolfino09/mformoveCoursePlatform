'use client';

import { useCallback, useEffect, useState } from 'react';
import { EmailType } from '../../../services/email/emailService';

export default function WelcomeCourseEmailPreviewPage() {
  const [email, setEmail] = useState('');
  const [html, setHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setMessage('');
    try {
      const response = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: EmailType.WELCOME_COURSE,
          preview: true,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No se pudo generar la vista previa');
      }
      setHtml(data.html || '');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al cargar la vista previa');
      setHtml('');
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const handleSendTest = async () => {
    if (!email.trim()) {
      setMessage('Ingresá un email de prueba');
      return;
    }

    setSending(true);
    setMessage('');
    try {
      const response = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: EmailType.WELCOME_COURSE,
          testEmail: email.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'No se pudo enviar el email');
      }
      setMessage(`Email enviado a ${email.trim()}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-palette-cream font-montserrat text-palette-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8 rounded-2xl border border-palette-stone/25 bg-white/70 p-6 shadow-sm">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-palette-stone">
            Vista previa local
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Mail de bienvenida — Curso
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-palette-stone md:text-base">
            Probá el template de bienvenida post-compra sin mandar todos los mails del sistema.
            Los datos son de ejemplo (Cuerpo Autónomo).
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium">Enviar prueba a</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@ejemplo.com"
                className="w-full rounded-xl border border-palette-stone/30 bg-white px-4 py-3 text-sm outline-none ring-palette-sage focus:border-palette-sage focus:ring-2"
              />
            </label>
            <button
              type="button"
              onClick={handleSendTest}
              disabled={sending}
              className="rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-palette-cream transition hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink disabled:opacity-60"
            >
              {sending ? 'Enviando...' : 'Enviar prueba'}
            </button>
            <button
              type="button"
              onClick={loadPreview}
              disabled={loadingPreview}
              className="rounded-full border-2 border-palette-stone/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-palette-ink transition hover:border-palette-ink disabled:opacity-60"
            >
              Recargar
            </button>
          </div>

          {message ? (
            <p
              className={`mt-4 text-sm ${message.toLowerCase().includes('error') || message.includes('Ingres') ? 'text-red-600' : 'text-green-700'}`}
            >
              {message}
            </p>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-palette-stone/25 bg-[#eceae6] shadow-sm">
          {loadingPreview ? (
            <div className="flex min-h-[640px] items-center justify-center text-palette-stone">
              Generando vista previa...
            </div>
          ) : html ? (
            <iframe
              title="Vista previa mail bienvenida curso"
              srcDoc={html}
              className="min-h-[900px] w-full bg-white"
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-palette-stone">
              No se pudo cargar la vista previa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
