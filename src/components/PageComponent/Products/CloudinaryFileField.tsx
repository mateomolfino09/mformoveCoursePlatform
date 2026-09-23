'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { uploadFileToCloudinary, type CloudinaryUploadedFile } from '../../../lib/cloudinaryFiles';

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

function dropzoneAccept(accept: string) {
  const map: Record<string, string[]> = {};
  for (const part of accept.split(',').map((item) => item.trim()).filter(Boolean)) {
    if (part.startsWith('.')) {
      const mime =
        part === '.pdf'
          ? 'application/pdf'
          : part === '.zip'
            ? 'application/zip'
            : part === '.doc'
              ? 'application/msword'
              : part === '.docx'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/octet-stream';
      map[mime] = [...(map[mime] || []), part];
    } else {
      map[part] = map[part] || [];
    }
  }
  return map;
}

export default function CloudinaryFileField({
  label,
  url,
  filename,
  accept = 'application/pdf,.pdf',
  onUploaded,
  onClear,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [localName, setLocalName] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const uploaded = await uploadFileToCloudinary(file);
      setLocalName(uploaded.filename || file.name);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    disabled: uploading,
    accept: dropzoneAccept(accept),
    onDrop: (files) => {
      void upload(files[0]);
    },
  });

  const shownName = localName || filename || '';

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-[var(--admin-input-bg)] px-4 py-6 text-center text-[var(--admin-input-fg)] ${
          isDragActive ? 'border-[var(--admin-fg)]' : 'border-[var(--admin-input-border)]'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} className="bg-white text-gray-900" />
        <ArrowUpTrayIcon className="h-6 w-6" />
        <span className="text-sm font-medium">
          {uploading ? 'Subiendo…' : isDragActive ? 'Soltá el archivo' : 'Arrastrá el archivo o hacé click'}
        </span>
        <span className="text-xs opacity-70">Se sube a Cloudinary al soltarlo</span>
      </div>
      {url ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a href={url} target="_blank" rel="noreferrer" className="font-medium text-gray-900 underline">
            {shownName || 'Ver archivo'}
          </a>
          <button type="button" onClick={onClear} className="font-medium text-red-600 hover:text-red-700">
            Quitar
          </button>
        </div>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
