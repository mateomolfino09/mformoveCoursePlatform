'use client';

import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import LinkInBioImageUpload from './LinkInBioImageUpload';

type DropzoneProps = {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
};

type Props = {
  existingPortada?: string;
  existingPortadaMobile?: string;
  existingImagenBio?: string;
  portraitImageArray: { preview?: string }[];
  portraitMobileImageArray: { preview?: string }[];
  bioImageFile: File | null;
  onBioFileChange: (file: File | null) => void;
  portrait: DropzoneProps;
  portraitMobile: DropzoneProps;
  bio: DropzoneProps;
  portadaRequired?: boolean;
};

export default function ProductImageFields({
  existingPortada,
  existingPortadaMobile,
  existingImagenBio,
  portraitImageArray,
  portraitMobileImageArray,
  bioImageFile,
  onBioFileChange,
  portrait,
  portraitMobile,
  bio,
  portadaRequired = false,
}: Props) {
  return (
    <div className='border-b border-gray-200 pb-6'>
      <h2 className='mb-6 flex items-center text-xl font-semibold text-gray-900'>
        <div className='mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100'>
          <span className='text-sm font-bold text-slate-600'>📷</span>
        </div>
        Imágenes del producto
      </h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <label className='flex flex-col space-y-2'>
            <p className='text-sm font-medium text-gray-700'>
              Imagen de portada
              {portadaRequired && !existingPortada && !portraitImageArray[0] ? (
                <span className='text-red-500'> *</span>
              ) : null}
            </p>
            <div
              {...portrait.getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-200 ${
                portrait.isDragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input {...portrait.getInputProps()} />
              <ArrowUpTrayIcon className='mb-2 h-8 w-8 text-gray-400' />
              <span className='mb-1 text-center text-sm text-gray-600'>
                Arrastra la imagen aquí o haz click
              </span>
              <span className='text-center text-xs text-gray-500'>Formatos: JPG, PNG</span>
            </div>
            {(portraitImageArray[0] || existingPortada) && (
              <div className='relative mt-2 h-24 w-24 overflow-hidden rounded-lg shadow-sm'>
                {portraitImageArray[0] ? (
                  <img
                    src={
                      portraitImageArray[0].preview ||
                      URL.createObjectURL(portraitImageArray[0] as File)
                    }
                    alt='Nueva portada'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <CldImage
                    src={existingPortada!}
                    alt='Portada actual'
                    fill
                    className='object-cover'
                    sizes='96px'
                  />
                )}
              </div>
            )}
          </label>

          <label className='flex flex-col space-y-2'>
            <p className='text-sm font-medium text-gray-700'>Imagen de portada móvil</p>
            <div
              {...portraitMobile.getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all duration-200 ${
                portraitMobile.isDragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input {...portraitMobile.getInputProps()} />
              <ArrowUpTrayIcon className='mb-2 h-8 w-8 text-gray-400' />
              <span className='mb-1 text-center text-sm text-gray-600'>
                Arrastra la imagen aquí o haz click
              </span>
              <span className='text-center text-xs text-gray-500'>Recomendado: 9:16</span>
            </div>
            {(portraitMobileImageArray[0] || existingPortadaMobile) && (
              <div className='relative mt-2 h-24 w-24 overflow-hidden rounded-lg shadow-sm'>
                {portraitMobileImageArray[0] ? (
                  <img
                    src={
                      portraitMobileImageArray[0].preview ||
                      URL.createObjectURL(portraitMobileImageArray[0] as File)
                    }
                    alt='Nueva portada móvil'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <CldImage
                    src={existingPortadaMobile!}
                    alt='Portada móvil actual'
                    fill
                    className='object-cover'
                    sizes='96px'
                  />
                )}
              </div>
            )}
          </label>
        </div>

        <LinkInBioImageUpload
          label='Imagen para página bio (opcional)'
          existingPublicId={existingImagenBio}
          file={bioImageFile}
          onFileChange={onBioFileChange}
          getRootProps={bio.getRootProps}
          getInputProps={bio.getInputProps}
          isDragActive={bio.isDragActive}
        />
      </div>
    </div>
  );
}
