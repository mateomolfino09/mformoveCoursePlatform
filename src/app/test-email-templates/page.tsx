'use client';

import { useState } from 'react';

const palette = {
  ink: '#141411',
  stone: '#787867',
  cream: '#FAF8F4',
  white: '#FAF8F4',
};
const font = "'Source Sans 3', 'Helvetica Neue', Helvetica, Arial, sans-serif";

type TemplateMode = 'weekly_path_preview' | 'send_all';

export default function TestEmailTemplatesPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('María');
  const [mode, setMode] = useState<TemplateMode>('weekly_path_preview');
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const handlePreviewWeeklyPath = async () => {
    setLoading(true);
    setPreviewError(null);
    setPreviewHtml(null);
    try {
      const res = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview: true,
          type: 'weekly_logbook_release',
          data: {
            name: name || undefined,
            weekNumber: 3,
            month: 1,
            year: 2025,
            text: 'Esta semana trabajamos la movilidad de cadera y la conexión con la respiración. El audio intro te guía para enfocar la práctica antes de las clases.',
            videoDurationSeconds: 324,
            coverImage: 'https://res.cloudinary.com/dbeem2avp/image/upload/v1764426772/my_uploads/mails/fondoMoveCrew_2_do594q.png',
            bitacoraLink: typeof window !== 'undefined' ? `${window.location.origin}/weekly-path` : 'https://mateomove.com/weekly-path',
            logbookTitle: 'Camino',
            weekContentsDetail: [
              { type: 'video', title: 'Movilidad de cadera', description: 'Calentamiento y rango de movimiento.', moduleName: 'Movimiento consciente' },
              { type: 'video', title: 'Respiración y postura', description: 'Integración respiración y columna.', moduleName: 'Fundamentos' },
              { type: 'audio', title: 'Reflexión semanal', description: 'Cierre y consigna para los próximos días.', moduleName: 'Práctica' },
            ],
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.html) {
        setPreviewHtml(data.html);
      } else {
        setPreviewError(data.message || 'Error al generar vista previa');
      }
    } catch (e: any) {
      setPreviewError(e?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWeeklyPath = async () => {
    if (!email.trim()) {
      setSendResult({ success: false, message: 'Ingresá un email para enviar.' });
      return;
    }
    setLoading(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'weekly_logbook_release',
          testEmail: email.trim(),
          data: {
            email: email.trim(),
            name: name || 'María',
            weekNumber: 3,
            month: 1,
            year: 2025,
            text: 'Esta semana trabajamos la movilidad de cadera y la conexión con la respiración. El audio intro te guía para enfocar la práctica antes de las clases.',
            videoDurationSeconds: 324,
            coverImage: 'https://res.cloudinary.com/dbeem2avp/image/upload/v1764426772/my_uploads/mails/fondoMoveCrew_2_do594q.png',
            bitacoraLink: typeof window !== 'undefined' ? `${window.location.origin}/weekly-path` : 'https://mateomove.com/weekly-path',
            logbookTitle: 'Camino',
            weekContentsDetail: [
              { type: 'video', title: 'Movilidad de cadera', description: 'Calentamiento y rango de movimiento.', moduleName: 'Movimiento consciente' },
              { type: 'video', title: 'Respiración y postura', description: 'Integración respiración y columna.', moduleName: 'Fundamentos' },
              { type: 'audio', title: 'Reflexión semanal', description: 'Cierre y consigna para los próximos días.', moduleName: 'Práctica' },
            ],
          },
        }),
      });
      const data = await res.json();
      setSendResult({
        success: !!data.success,
        message: data.message || (data.success ? 'Email enviado.' : 'Error al enviar'),
      });
    } catch (e: any) {
      setSendResult({ success: false, message: e?.message || 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendAll = async () => {
    if (!email.trim()) {
      setMessage('Por favor ingresa un email de prueba');
      return;
    }
    setLoading(true);
    setMessage('');
    setResults([]);
    try {
      const res = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setResults(data.results || []);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (e) {
      setMessage('Error al ejecutar la prueba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: 300,
        backgroundColor: palette.cream,
        minHeight: '100vh',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          backgroundColor: palette.white,
          padding: '32px 28px',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(20,20,17,0.04)',
        }}
      >
        <h1
          style={{
            color: palette.ink,
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: '0.02em',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Probar emails
        </h1>
        <p
          style={{
            color: palette.stone,
            fontSize: 14,
            marginBottom: 28,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Vista previa y envío de templates para revisar la estética Move Crew.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 28,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('weekly_path_preview')}
            style={{
              fontFamily: font,
              fontWeight: 400,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 20px',
              borderRadius: 9999,
              border: `1px solid ${mode === 'weekly_path_preview' ? palette.ink : 'rgba(20,20,17,0.2)'}`,
              background: mode === 'weekly_path_preview' ? palette.ink : 'transparent',
              color: mode === 'weekly_path_preview' ? palette.cream : palette.ink,
              cursor: 'pointer',
            }}
          >
            Publicación Weekly Path
          </button>
          <button
            type="button"
            onClick={() => setMode('send_all')}
            style={{
              fontFamily: font,
              fontWeight: 400,
              fontSize: 13,
              letterSpacing: '0.06em',
              padding: '10px 20px',
              borderRadius: 9999,
              border: `1px solid ${mode === 'send_all' ? palette.ink : 'rgba(20,20,17,0.2)'}`,
              background: mode === 'send_all' ? palette.ink : 'transparent',
              color: mode === 'send_all' ? palette.cream : palette.ink,
              cursor: 'pointer',
            }}
          >
            Enviar todos los templates
          </button>
        </div>

        {mode === 'weekly_path_preview' && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: palette.stone, fontWeight: 400 }}>Nombre (destinatario)</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="María"
                  style={{
                    padding: '10px 14px',
                    border: `1px solid rgba(120,120,103,0.3)`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: font,
                    fontWeight: 300,
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: palette.stone, fontWeight: 400 }}>Email (para envío real)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={{
                    padding: '10px 14px',
                    border: `1px solid rgba(120,120,103,0.3)`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: font,
                    fontWeight: 300,
                  }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <button
                type="button"
                onClick={handlePreviewWeeklyPath}
                disabled={loading}
                style={{
                  fontFamily: font,
                  fontWeight: 400,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '12px 24px',
                  borderRadius: 9999,
                  border: `1px solid rgba(20,20,17,0.25)`,
                  background: 'transparent',
                  color: palette.ink,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '…' : 'Ver vista previa'}
              </button>
              <button
                type="button"
                onClick={handleSendWeeklyPath}
                disabled={loading}
                style={{
                  fontFamily: font,
                  fontWeight: 400,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '12px 24px',
                  borderRadius: 9999,
                  border: 'none',
                  background: palette.ink,
                  color: palette.cream,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '…' : 'Enviar a mi email'}
              </button>
            </div>
            {previewError && (
              <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{previewError}</p>
            )}
            {sendResult && (
              <p
                style={{
                  color: sendResult.success ? '#047857' : '#b91c1c',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {sendResult.message}
              </p>
            )}
            {previewHtml && (
              <div
                style={{
                  border: '1px solid rgba(120,120,103,0.2)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: 11,
                    color: palette.stone,
                    borderBottom: '1px solid rgba(120,120,103,0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Vista previa — Publicación Weekly Path
                </div>
                <iframe
                  title="Vista previa email"
                  srcDoc={previewHtml}
                  style={{
                    width: '100%',
                    minHeight: 720,
                    border: 'none',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </>
        )}

        {mode === 'send_all' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: palette.stone, marginBottom: 8 }}>
                Email de prueba
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@ejemplo.com"
                style={{
                  width: '100%',
                  maxWidth: 360,
                  padding: '12px 14px',
                  border: `1px solid rgba(120,120,103,0.3)`,
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: font,
                  fontWeight: 300,
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSendAll}
              disabled={loading}
              style={{
                fontFamily: font,
                fontWeight: 400,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: 9999,
                border: 'none',
                background: palette.ink,
                color: palette.cream,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Enviando…' : 'Enviar todos los templates'}
            </button>
            {message && (
              <p
                style={{
                  marginTop: 16,
                  color: message.includes('Error') ? '#b91c1c' : palette.stone,
                  fontSize: 14,
                }}
              >
                {message}
              </p>
            )}
            {results.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 14, fontWeight: 400, color: palette.ink, marginBottom: 12 }}>
                  Resultados
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {results.map((r, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '12px 14px',
                        marginBottom: 8,
                        borderRadius: 8,
                        border: `1px solid ${r.success ? 'rgba(16,185,129,0.3)' : 'rgba(185,28,28,0.3)'}`,
                        backgroundColor: r.success ? 'rgba(16,185,129,0.06)' : 'rgba(185,28,28,0.06)',
                        fontSize: 13,
                        color: palette.ink,
                      }}
                    >
                      <strong>{r.emailType}</strong> — {r.success ? 'Enviado' : r.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid rgba(120,120,103,0.15)',
            fontSize: 12,
            color: palette.stone,
            lineHeight: 1.6,
          }}
        >
          <strong>Publicación Weekly Path:</strong> usa datos de prueba listos para ver la estética (semana 3, contenidos de ejemplo, imagen y duración). Podés cambiar el nombre y enviar la vista previa a tu email.
        </div>
      </div>
    </div>
  );
}
