'use client';

import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import { LINK_IN_BIO_CARD_SIZE_HINT } from '../../../constants/linkInBioCard';

type Props = {
  label: string;
  required?: boolean;
  hint?: string;
  existingPublicId?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  accent?: 'purple' | 'blue';
};

export default function LinkInBioImageUpload({
  label,
  required = false,
  hint = LINK_IN_BIO_CARD_SIZE_HINT,
  existingPublicId,
  file,
  onFileChange,
  getRootProps,
  getInputProps,
  isDragActive,
  accent = 'purple',
}: Props) {
  const activeBorder = accent === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-purple-500 bg-purple-50';
  const hoverBorder = accent === 'blue' ? 'hover:border-blue-400 hover:bg-blue-50' : 'hover:border-purple-400 hover:bg-purple-50';
  const previewUrl = file ? URL.createObjectURL(file) : null;
  const showPreview = Boolean(previewUrl || existingPublicId);

  return (
    <div className="flex flex-col space-y-2">
      <p className="text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </p>
      <p className="text-xs leading-snug text-gray-500">{hint}</p>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-200 ${
          isDragActive ? activeBorder : `border-gray-300 bg-gray-50 ${hoverBorder}`
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mb-2 h-8 w-8 text-gray-400" />
        <span className="mb-1 text-center text-sm text-gray-600">Arrastra la imagen aquí o haz click</span>
        <span className="text-center text-xs text-gray-500">Solo JPG o PNG</span>
      </div>
      {showPreview ? (
        <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-lg shadow-sm">
          {previewUrl ? (
            <img src={previewUrl} alt="Vista previa bio" className="h-full w-full object-cover" />
          ) : existingPublicId ? (
            <CldImage src={existingPublicId} alt="Imagen bio actual" fill className="object-cover" sizes="112px" />
          ) : null}
          {previewUrl ? (
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
            >
              Quitar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
