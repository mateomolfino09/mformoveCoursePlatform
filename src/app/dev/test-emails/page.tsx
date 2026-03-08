'use client';

import { FormEvent, useState } from 'react';

export default function TestEmailsPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'account' | 'welcome'>('account');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const endpoint = type === 'account' ? '/api/dev/test-account-email' : '/api/dev/test-welcome-email';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar email');
      }
      setStatus('Enviado. Revisá tu inbox/spam.');
    } catch (error: any) {
      setStatus(error.message || 'Error al enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-montserrat px-4 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Prueba emails</h1>
          <p className="text-sm text-gray-600">Envía el correo de cuenta creada o el de bienvenida/confirmación del registro largo.</p>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              type="button"
              onClick={() => setType('account')}
              className={`w-full rounded-lg border px-3 py-2 font-semibold transition ${
                type === 'account'
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
              }`}
            >
              Cuenta creada (reset)
            </button>
            <button
              type="button"
              onClick={() => setType('welcome')}
              className={`w-full rounded-lg border px-3 py-2 font-semibold transition ${
                type === 'welcome'
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
              }`}
            >
              Bienvenida / confirmación
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Nombre (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white py-2.5 text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" aria-hidden />}
            {loading ? 'Enviando...' : 'Enviar email de prueba'}
          </button>
        </form>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>
    </main>
  );
}
