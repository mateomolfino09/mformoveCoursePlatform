'use client';

import AdmimDashboardLayout from '../AdmimDashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../hooks/useToast';
import { CUERPO_AUTONOMO_COURSE_SLUG } from '../../constants/mentorshipCuerpoAutonomoDiscount';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  AdminPage,
  AdminPageHeader,
  AdminButton,
  adminFormFieldHeightClass,
  adminFormLabelClass,
} from '../admin';

type GrantableProduct = {
  id: string;
  nombre: string;
  slug: string;
  esSuscripcion: boolean;
  activo: boolean;
};

type LookupUser = {
  id: string;
  name: string;
  email: string;
};

type AccessRow = {
  productId: string;
  vigente: boolean;
  status: string | null;
  expiresAt: string | null;
  viaStripe?: boolean;
};

const AdminGrantAccess = () => {
  const router = useRouter();
  const auth = useAuth();

  const [products, setProducts] = useState<GrantableProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [email, setEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupUser, setLookupUser] = useState<LookupUser | null | undefined>(undefined);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [productId, setProductId] = useState('');
  const [duration, setDuration] = useState<'permanente' | '1' | '4' | 'custom'>('4');
  const [customMonths, setCustomMonths] = useState('4');
  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'gratis'>('transferencia');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const userToken = Cookies.get('userToken');
    if (!userToken) {
      router.push('/iniciar-sesion');
      return;
    }
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol !== 'Admin') {
      router.push('/iniciar-sesion');
    }
  }, [auth.user, router]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/admin/grant-access', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (response.status === 403) {
          router.push('/iniciar-sesion');
          return;
        }
        if (!response.ok) {
          throw new Error('No se pudieron cargar los cursos');
        }
        const data = await response.json();
        const list: GrantableProduct[] = data.products || [];
        setProducts(list);
        const cuerpo = list.find((p) => p.slug === CUERPO_AUTONOMO_COURSE_SLUG);
        const initial = cuerpo || list[0];
        if (initial) {
          setProductId(initial.id);
          setDuration(initial.esSuscripcion ? '4' : 'permanente');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar los cursos otorgables');
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [router]);

  const selectedAccess = useMemo(
    () => access.find((row) => row.productId === productId) || null,
    [access, productId]
  );

  const handleProductChange = (nextId: string) => {
    setProductId(nextId);
    const next = products.find((p) => p.id === nextId);
    if (next?.esSuscripcion) {
      setDuration('4');
    }
  };

  const lookupUserByEmail = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      toast.error('Ingresá un email');
      return;
    }
    setLookupLoading(true);
    try {
      const response = await fetch(
        `/api/admin/grant-access?email=${encodeURIComponent(normalized)}`,
        { credentials: 'include', cache: 'no-store' }
      );
      if (!response.ok) {
        throw new Error('No se pudo buscar el usuario');
      }
      const data = await response.json();
      setLookupUser(data.user || null);
      setAccess(data.access || []);
      if (!data.user) {
        toast.warning('No hay un usuario registrado con ese email.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al buscar el usuario');
    } finally {
      setLookupLoading(false);
    }
  };

  const resolvedMonths = (): number | null => {
    if (duration === 'permanente') return null;
    if (duration === '1') return 1;
    if (duration === '4') return 4;
    const parsed = Number(customMonths);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const canSubmit =
    Boolean(email.trim()) &&
    Boolean(productId) &&
    !selectedAccess?.vigente &&
    !submitting &&
    !loadingProducts;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const months = resolvedMonths();
    if (duration === 'custom' && (months === null || months <= 0)) {
      toast.error('Ingresá una duración válida en meses');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/grant-access', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          productId,
          months,
          metodoPago,
          sendWelcomeEmail,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.error || 'No se pudo otorgar el acceso');
        return;
      }
      if (data?.alreadyHadAccess) {
        toast.info(data.message);
      } else {
        toast.success(data.message);
        if (data.emailSent === false && sendWelcomeEmail) {
          toast.warning('El acceso se otorgó, pero el mail de bienvenida no se pudo enviar.');
        }
      }
      await lookupUserByEmail();
    } catch (error) {
      console.error(error);
      toast.error('Error al otorgar el acceso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedAccess?.vigente || revoking || !email.trim() || !productId) return;
    const productName = products.find((product) => product.id === productId)?.nombre || 'este curso';
    const who = lookupUser?.email || email.trim().toLowerCase();
    const stripeNote = selectedAccess.viaStripe
      ? ' También cancela la suscripción de Stripe, así que deja de cobrarse.'
      : '';
    const confirmed = window.confirm(
      `¿Quitar el acceso de ${who} a ${productName}? Deja de ver el contenido.${stripeNote}`
    );
    if (!confirmed) return;

    setRevoking(true);
    try {
      const response = await fetch('/api/admin/grant-access', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          productId,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.error || 'No se pudo quitar el acceso');
        return;
      }
      toast.success(data?.message || 'Acceso quitado');
      await lookupUserByEmail();
    } catch (error) {
      console.error(error);
      toast.error('Error al quitar el acceso');
    } finally {
      setRevoking(false);
    }
  };

  if (auth.user && auth.user.rol !== 'Admin') {
    return null;
  }

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Accesos | Admin</title>
      </Head>
      <AdminPage>
        <AdminPageHeader
          title="Accesos"
          description="Da un curso a un email que ya tenga cuenta, o quitale el acceso si ya lo tiene."
        />

        <p className="mb-5 text-[12px] text-[var(--admin-muted)]">
          Buscá el usuario antes de otorgar o quitar. Quitar acceso deja de mostrar el contenido de
          inmediato.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
        >
          <div>
            <label htmlFor="grant-email" className={adminFormLabelClass}>
              Email del usuario
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="grant-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLookupUser(undefined);
                  setAccess([]);
                }}
                placeholder="persona@correo.com"
                className={adminFormFieldHeightClass}
              />
              <AdminButton type="button" onClick={lookupUserByEmail} loading={lookupLoading}>
                Buscar
              </AdminButton>
            </div>
            {lookupUser === null ? (
              <p className="mt-2 text-[12px] text-[var(--admin-destructive)]">
                No hay un usuario registrado con ese email. Tiene que crear la cuenta primero.
              </p>
            ) : null}
            {lookupUser ? (
              <p className="mt-2 text-[12px] text-[var(--admin-success)]">
                Encontrado: {lookupUser.name || 'Sin nombre'} ({lookupUser.email})
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="grant-product" className={adminFormLabelClass}>
              Curso o servicio
            </label>
            <select
              id="grant-product"
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              disabled={loadingProducts}
              className={adminFormFieldHeightClass}
            >
              {loadingProducts ? (
                <option value="">Cargando cursos…</option>
              ) : products.length === 0 ? (
                <option value="">No hay cursos para otorgar</option>
              ) : (
                products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre}
                    {product.slug ? ` (${product.slug})` : ''}
                    {product.esSuscripcion ? ' · suscripción' : ''}
                  </option>
                ))
              )}
            </select>
            {selectedAccess?.vigente ? (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-[var(--admin-warning)]">
                  Este usuario ya tiene acceso vigente
                  {selectedAccess.expiresAt
                    ? ` hasta ${new Date(selectedAccess.expiresAt).toLocaleDateString('es-AR')}`
                    : ' (sin vencimiento)'}
                  .
                </p>
                <AdminButton
                  type="button"
                  variant="destructive"
                  onClick={handleRevoke}
                  loading={revoking}
                  disabled={revoking || submitting}
                >
                  Quitar acceso
                </AdminButton>
              </div>
            ) : null}
          </div>

          <div>
            <p className={adminFormLabelClass}>Duración</p>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
              {(
                [
                  ['permanente', 'Permanente'],
                  ['1', '1 mes'],
                  ['4', '4 meses'],
                  ['custom', 'Otra'],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`admin-choice flex cursor-pointer items-center justify-center rounded-[var(--admin-radius)] border px-2 py-1.5 text-[12px] font-medium transition-colors duration-[var(--admin-ease)] ${
                    duration === value
                      ? 'admin-choice--selected'
                      : 'border-[var(--admin-border)] bg-[var(--admin-hover)] text-[var(--admin-fg)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={value}
                    checked={duration === value}
                    onChange={() => setDuration(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
            {duration === 'custom' ? (
              <input
                type="number"
                min={1}
                max={36}
                value={customMonths}
                onChange={(e) => setCustomMonths(e.target.value)}
                placeholder="Meses"
                className={`${adminFormFieldHeightClass} mt-2 max-w-[140px]`}
              />
            ) : null}
            <p className="mt-1.5 text-[11px] text-[var(--admin-muted)]">
              Para Cuerpo Autónomo pagado por transferencia suele usarse 4 meses. Permanente no vence.
            </p>
          </div>

          <div>
            <label htmlFor="grant-motivo" className={adminFormLabelClass}>
              Motivo
            </label>
            <select
              id="grant-motivo"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as 'transferencia' | 'gratis')}
              className={adminFormFieldHeightClass}
            >
              <option value="transferencia">Pagó por fuera (transferencia)</option>
              <option value="gratis">Cortesía / acceso gratuito</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[var(--admin-fg)]">
            <input
              type="checkbox"
              checked={sendWelcomeEmail}
              onChange={(e) => setSendWelcomeEmail(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--admin-fg)]"
            />
            Enviar mail de bienvenida
          </label>

          <AdminButton
            type="submit"
            variant="primary"
            disabled={!canSubmit || revoking}
            loading={submitting}
            className="w-full"
          >
            Otorgar acceso
          </AdminButton>
        </form>
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default AdminGrantAccess;
