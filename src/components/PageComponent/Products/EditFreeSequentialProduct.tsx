'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import FreeSequentialClassFields from './FreeSequentialClassFields';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const labelClass = 'text-sm font-medium text-gray-700';

type ProductJson = {
  _id: string;
  nombre: string;
  descripcion: string;
  secuenciaConfig?: {
    slug?: string;
    publicado?: boolean;
    ctaProductId?: string | null;
    ctaLabel?: string;
  };
};

type Props = {
  product: ProductJson;
};

export default function EditFreeSequentialProduct({ product }: Props) {
  const router = useRouter();
  const auth = useAuth();

  const [nombre, setNombre] = useState(product.nombre || '');
  const [descripcion, setDescripcion] = useState(product.descripcion || '');
  const [slug, setSlug] = useState(product.secuenciaConfig?.slug || '');
  const [publicado, setPublicado] = useState(product.secuenciaConfig?.publicado ?? true);
  const [ctaProductId, setCtaProductId] = useState(
    product.secuenciaConfig?.ctaProductId
      ? String(product.secuenciaConfig.ctaProductId)
      : ''
  );
  const [ctaLabel, setCtaLabel] = useState(product.secuenciaConfig?.ctaLabel || '');
  const [cursoOptions, setCursoOptions] = useState<Array<{ _id: string; nombre: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get('userToken');
    if (!cookie) {
      router.push('/iniciar-sesion');
      return;
    }
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol !== 'Admin') {
      router.push('/iniciar-sesion');
    }
  }, [auth.user]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/product/getProducts', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((products) => {
        if (cancelled || !Array.isArray(products)) return;
        const cursos = products
          .filter(
            (p: { tipo?: string; _id?: string; nombre?: string; cursoConfig?: { slug?: string } }) =>
              p.tipo === 'curso' && p.cursoConfig?.slug
          )
          .map((p: { _id: string; nombre: string }) => ({
            _id: String(p._id),
            nombre: p.nombre || 'Curso',
          }))
          .sort((a: { nombre: string }, b: { nombre: string }) =>
            a.nombre.localeCompare(b.nombre, 'es')
          );
        setCursoOptions(cursos);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();

    if (nombre.trim().length < 5) {
      toast.error('El nombre debe tener al menos 5 caracteres');
      return;
    }
    if (descripcion.trim().length < 20) {
      toast.error('Debe poner una descripción de 20 caracteres mínimo');
      return;
    }
    if (!slug.trim()) {
      toast.error('Debes definir el slug de la página pública');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/product/updateProduct', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          nombre,
          descripcion,
          tipo: 'clases_gratuitas_secuenciales',
          precio: 0,
          userEmail: auth.user?.email,
          secuenciaConfig: {
            slug: slug.trim().toLowerCase(),
            publicado,
            ctaProductId: ctaProductId || null,
            ctaLabel: ctaLabel.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo actualizar el producto');
      }
      toast.success('Producto actualizado');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ocurrió un error al actualizar el producto'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdmimDashboardLayout>
      <div className="w-full py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-montserrat text-3xl font-bold text-gray-900">
            Editar: {product.nombre}
          </h1>
          <p className="text-gray-600">Clases gratuitas secuenciales — producto evergreen.</p>
        </div>

        <form
          onSubmit={handleSave}
          className="max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg"
        >
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Nombre del producto</span>
            <input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Descripción</span>
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Slug de la página pública</span>
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <span className="text-xs text-gray-500">
              Página pública: /clases-gratis/{slug || '...'}
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={publicado}
              onChange={(e) => setPublicado(e.target.checked)}
            />
            Publicado (visible para usuarios no admin)
          </label>

          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">CTA inferior de las clases</p>
            <p className="text-xs text-gray-500">
              Si no elegís un producto, el botón apunta a mentoría.
            </p>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Producto asociado (opcional)</span>
              <select
                className={inputClass}
                value={ctaProductId}
                onChange={(e) => setCtaProductId(e.target.value)}
              >
                <option value="">Mentoría (default)</option>
                {cursoOptions.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Texto del CTA (opcional)</span>
              <input
                className={inputClass}
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder={
                  ctaProductId ? 'Ej: Conocer el curso' : 'Ej: Conocer mentoría'
                }
              />
            </label>
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
            <Link
              href="/admin/productos/clases-gratis/todas"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Volver
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <div className="mt-8 max-w-3xl">
          <h2 className="mb-4 font-montserrat text-xl font-semibold text-gray-900">
            Clases de la secuencia
          </h2>
          <FreeSequentialClassFields productId={product._id} slug={slug} />
        </div>
      </div>
    </AdmimDashboardLayout>
  );
}
