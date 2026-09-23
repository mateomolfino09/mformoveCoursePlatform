'use client';

import { useState } from 'react';
import { uploadFileToCloudinary, type CloudinaryUploadedFile } from '../../../lib/cloudinaryFiles';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

type Props = {
  label: string;
  url: string;
  filename?: string;
  accept?: string;
  placeholder?: string;
  onUploaded: (file: CloudinaryUploadedFile) => void;
  onUrlChange: (url: string) => void;
  onClear: () => void;
};

export default function CloudinaryFileField({
  label,
  url,
  filename,
  accept = 'application/pdf,.pdf',
  placeholder = 'https://…/archivo.pdf',
  onUploaded,
  onUrlChange,
  onClear,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const uploaded = await uploadFileToCloudinary(file);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-full file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          void onFile(file);
        }}
      />
      <input
        className={inputClass}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder={placeholder}
      />
      {filename ? <p className="text-xs text-gray-600">{filename}</p> : null}
      {uploading ? <p className="text-xs text-gray-500">Subiendo a Cloudinary…</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {url ? (
        <button type="button" onClick={onClear} className="text-sm font-medium text-red-600 hover:text-red-700">
          Quitar archivo
        </button>
      ) : null}
    </div>
  );
}
