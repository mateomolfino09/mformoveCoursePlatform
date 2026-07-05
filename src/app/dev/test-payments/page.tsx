'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

type DevPaymentsState = {
  baseUrl: string;
  webhooks: { mentorship: string; course: string };
  user: {
    _id: string;
    email: string;
    name?: string;
    mentorship: Record<string, unknown> | null;
    pendingMentorshipDlocal: Record<string, unknown> | null;
  } | null;
  mentorshipPlan: {
    _id: string;
    name: string;
    active: boolean;
    prices: Array<{
      interval: string;
      price: number;
      currency: string;
      stripePriceId?: string;
      hasStripeLink: boolean;
      hasDlocalLink: boolean;
    }>;
  } | null;
};

type ActionResult = {
  ok: boolean;
  message: string;
  data?: unknown;
};

const INTERVALS = ['mensual', 'trimestral', 'anual'] as const;

export default function TestPaymentsPage() {
  const auth = useAuth();
  const [snapshot, setSnapshot] = useState<DevPaymentsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  const [interval, setInterval] = useState<string>('mensual');
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [planId, setPlanId] = useState('');
  const [fulfillUserId, setFulfillUserId] = useState('');

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev/test-payments', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar estado');
      setSnapshot(data);
      if (data.mentorshipPlan?._id) {
        setPlanId((prev) => prev || data.mentorshipPlan._id);
      }
      if (data.user?._id) {
        setFulfillUserId((prev) => prev || data.user._id);
      }
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Error al cargar',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth.user) auth.fetchUser();
  }, [auth.user, auth]);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  const runAction = async (
    key: string,
    fn: () => Promise<{ ok: boolean; message: string; data?: unknown }>,
  ) => {
    setActionLoading(key);
    setResult(null);
    try {
      const out = await fn();
      setResult(out);
      if (out.ok) await loadSnapshot();
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const startStripeCheckout = () =>
    runAction('stripe', async () => {
      if (!auth.user?.email) {
        return { ok: false, message: 'Iniciá sesión para probar Stripe Checkout Session' };
      }
      const res = await fetch('/api/mentorship/stripe/createCheckoutSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          interval,
          userEmail: auth.user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        return { ok: false, message: data.error || 'No se pudo crear la sesión de Stripe' };
      }
      window.location.href = data.url;
      return { ok: true, message: 'Redirigiendo a Stripe…', data };
    });

  const startDlocalCheckout = () =>
    runAction('dlocal', async () => {
      const res = await fetch('/api/payments/mentorship/dlocal-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId, interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        return { ok: false, message: data.error || 'No se pudo abrir dLocal' };
      }
      window.location.href = data.redirectUrl;
      return { ok: true, message: 'Redirigiendo a dLocal GO…', data };
    });

  const checkDlocalPayment = () =>
    runAction('check', async () => {
      const res = await fetch('/api/dev/test-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-dlocal',
          paymentId: paymentId.trim() || undefined,
          orderId: orderId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || 'Error al consultar pago' };
      return { ok: true, message: 'Consulta dLocal OK', data };
    });

  const fulfillMentorship = (provider: 'dlocalgo' | 'stripe') =>
    runAction(`fulfill-${provider}`, async () => {
      const res = await fetch('/api/dev/test-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'fulfill-mentorship',
          provider,
          planId,
          interval,
          userId: fulfillUserId.trim() || undefined,
          paymentId: paymentId.trim() || undefined,
          orderId: orderId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || 'Error al asignar mentoría' };
      return {
        ok: true,
        message: data.alreadyProcessed
          ? 'Mentoría ya estaba asignada (idempotente)'
          : 'Mentoría asignada correctamente',
        data,
      };
    });

  const callCompleteApi = () =>
    runAction('complete', async () => {
      const res = await fetch('/api/payments/mentorship/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: 'dlocalgo',
          planId,
          interval,
          userId: fulfillUserId.trim() || undefined,
          paymentId: paymentId.trim() || undefined,
          orderId: orderId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.error || 'Complete API falló' };
      return { ok: true, message: 'Complete API OK', data };
    });

  const handleCheckSubmit = (e: FormEvent) => {
    e.preventDefault();
    checkDlocalPayment();
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-montserrat px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Prueba de pagos</h1>
              <p className="text-sm text-gray-600 mt-1">
                Herramienta de desarrollo para mentoría (Stripe + dLocal). Solo disponible fuera
                de producción.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadSnapshot()}
              disabled={loading}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? '…' : 'Actualizar'}
            </button>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold">Entorno</h2>
          {snapshot ? (
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-gray-500">Base URL</dt>
                <dd className="font-mono break-all">{snapshot.baseUrl}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Webhook mentoría</dt>
                <dd className="font-mono break-all text-xs">{snapshot.webhooks.mentorship}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Webhook curso</dt>
                <dd className="font-mono break-all text-xs">{snapshot.webhooks.course}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">Cargando…</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold">Usuario actual</h2>
          {snapshot?.user ? (
            <div className="text-sm space-y-2">
              <p>
                <span className="text-gray-500">Email:</span> {snapshot.user.email}
              </p>
              <p>
                <span className="text-gray-500">ID:</span>{' '}
                <span className="font-mono text-xs">{snapshot.user._id}</span>
              </p>
              <pre className="rounded-lg bg-gray-100 p-3 text-xs overflow-auto">
                {JSON.stringify(snapshot.user.mentorship, null, 2) || 'null'}
              </pre>
              {snapshot.user.pendingMentorshipDlocal ? (
                <p className="text-amber-700 text-xs">
                  Orden dLocal pendiente:{' '}
                  <span className="font-mono">
                    {String(snapshot.user.pendingMentorshipDlocal.orderId || '')}
                  </span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-amber-700">
              No hay sesión activa.{' '}
              <Link href="/iniciar-sesion" className="underline">
                Iniciá sesión
              </Link>{' '}
              para probar checkout y asignación.
            </p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold">Plan de mentoría activo</h2>
          {snapshot?.mentorshipPlan ? (
            <>
              <p className="text-sm">
                {snapshot.mentorshipPlan.name}{' '}
                <span className="font-mono text-xs text-gray-500">({planId})</span>
              </p>
              <ul className="text-sm space-y-1">
                {snapshot.mentorshipPlan.prices.map((price) => (
                  <li key={price.interval} className="flex flex-wrap gap-2">
                    <span className="font-medium capitalize">{price.interval}</span>
                    <span>
                      {price.currency} {price.price}
                    </span>
                    <span className={price.hasStripeLink ? 'text-green-700' : 'text-red-600'}>
                      Stripe {price.hasStripeLink ? '✓' : '✗'}
                    </span>
                    <span className={price.hasDlocalLink ? 'text-green-700' : 'text-red-600'}>
                      dLocal {price.hasDlocalLink ? '✓' : '✗'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-500">No hay plan activo en la DB.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <label className="text-sm flex items-center gap-2">
              Intervalo
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1"
              >
                {INTERVALS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <Link
              href={`/mentoria/empezar?interval=${interval}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-center hover:bg-gray-50"
            >
              Abrir /mentoria/empezar
            </Link>
            <button
              type="button"
              onClick={startStripeCheckout}
              disabled={!planId || actionLoading === 'stripe'}
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {actionLoading === 'stripe' ? '…' : 'Stripe Checkout Session'}
            </button>
            <button
              type="button"
              onClick={startDlocalCheckout}
              disabled={!planId || actionLoading === 'dlocal'}
              className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {actionLoading === 'dlocal' ? '…' : 'dLocal GO checkout'}
            </button>
            <Link
              href={`/mentoria/exito?plan_id=${planId}&interval=${interval}&provider=dlocalgo${fulfillUserId ? `&external_id=${fulfillUserId}` : ''}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-center hover:bg-gray-50"
            >
              Simular URL de éxito dLocal
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold">Consultar / asignar pago dLocal</h2>
          <form onSubmit={handleCheckSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Payment ID (dLocal)
                </label>
                <input
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="DP-123456"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Order ID</label>
                <input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="mentoria-…-mensual-r…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Plan ID</label>
                <input
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  User ID (asignación)
                </label>
                <input
                  value={fulfillUserId}
                  onChange={(e) => setFulfillUserId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={actionLoading === 'check'}
                className="rounded-lg border border-gray-400 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {actionLoading === 'check' ? '…' : 'Consultar en dLocal'}
              </button>
              <button
                type="button"
                onClick={() => callCompleteApi()}
                disabled={actionLoading === 'complete'}
                className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm disabled:opacity-50"
              >
                {actionLoading === 'complete' ? '…' : 'POST /mentorship/complete'}
              </button>
              <button
                type="button"
                onClick={() => fulfillMentorship('dlocalgo')}
                disabled={actionLoading === 'fulfill-dlocalgo'}
                className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm disabled:opacity-50"
              >
                {actionLoading === 'fulfill-dlocalgo' ? '…' : 'Forzar asignación (dev)'}
              </button>
            </div>
          </form>
        </section>

        {result ? (
          <section
            className={`rounded-2xl border p-4 text-sm ${
              result.ok
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <p className="font-medium">{result.message}</p>
            {result.data ? (
              <pre className="mt-2 text-xs overflow-auto max-h-64">{JSON.stringify(result.data, null, 2)}</pre>
            ) : null}
          </section>
        ) : null}

        <p className="text-xs text-gray-500 text-center pb-8">
          También podés verificar webhooks con GET directo a{' '}
          <code className="bg-gray-200 px-1 rounded">/api/payments/mentorship/dlocalWebhook</code>
        </p>
      </div>
    </main>
  );
}
