'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import requests from '../../../utils/requests';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import FreeSequentialClassFields from './FreeSequentialClassFields';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const labelClass = 'text-sm font-medium text-gray-700';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateFreeSequentialProduct() {
  const router = useRouter();
  const auth = useAuth();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [publicado, setPublicado] = useState(true);
  const [ctaProductId, setCtaProductId] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [cursoOptions, setCursoOptions] = useState<Array<{ _id: string; nombre: string }>>([]);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<{
    _id: string;
    nombre: string;
    slug: string;
  } | null>(null);

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
    if (!slugEditedManually) {
      setSlug(slugify(nombre));
    }
  }, [nombre, slugEditedManually]);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => setPortadaFile(accepted[0] ?? null),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false,
  });

  async function handleCreate(e: FormEvent) {
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
      let portada: string | undefined;
      if (portadaFile) {
        const formData = new FormData();
        formData.append('file', portadaFile);
        formData.append('upload_preset', 'my_uploads');
        const portadaData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: formData,
        }).then((r) => r.json());
        portada = portadaData.public_id;
      }

      const res = await fetch('/api/product/createProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion,
          tipo: 'clases_gratuitas_secuenciales',
          precio: 0,
          userEmail: auth.user?.email,
          portada,
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
        throw new Error(data?.error || 'No se pudo crear el producto');
      }

      toast.success('Producto creado. Ahora agregá las clases.');
      setCreatedProduct({
        _id: data.product._id,
        nombre: data.product.nombre,
        slug: slug.trim().toLowerCase(),
      });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ocurrió un error al crear el producto'));
    } finally {
      setSubmitting(false);
    }
  }

  if (createdProduct) {
    return (
      <AdmimDashboardLayout>
        <div className="w-full py-8">
          <div className="mb-8">
            <h1 className="mb-2 font-montserrat text-3xl font-bold text-gray-900">
              {createdProduct.nombre}
            </h1>
            <p className="text-gray-600">
              Producto creado. Agregá y ordená las clases de la secuencia.
            </p>
          </div>
          <div className="max-w-3xl">
            <FreeSequentialClassFields
              productId={createdProduct._id}
              slug={createdProduct.slug}
            />
          </div>
          <div className="mt-8 flex gap-4">
            <Link
              href="/admin/productos/clases-gratis/todas"
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Terminar
            </Link>
          </div>
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <div className="w-full py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-montserrat text-3xl font-bold text-gray-900">
            Crear clases gratuitas secuenciales
          </h1>
          <p className="text-gray-600">
            Producto gratuito, evergreen, sin fechas. Se accede desde /clases-gratis/[slug].
          </p>
        </div>
        <form
          onSubmit={handleCreate}
          className="max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-lg"
        >
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Nombre del producto</span>
            <input
              className={inputClass}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Serie gratuita de movilidad"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Descripción</span>
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe la serie de clases (mínimo 20 caracteres)"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className={labelClass}>Slug de la página pública</span>
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => {
                setSlugEditedManually(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="serie-gratuita-movilidad"
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
                  ctaProductId
                    ? 'Ej: Conocer el curso'
                    : 'Ej: Conocer mentoría'
                }
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelClass}>Portada (opcional)</span>
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragActive
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <span className="text-sm text-gray-600">
                {portadaFile ? portadaFile.name : 'Arrastrá una imagen o hacé click'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
            <Link
              href="/admin/productos/clases-gratis"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? 'Creando…' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </AdmimDashboardLayout>
  );
}

