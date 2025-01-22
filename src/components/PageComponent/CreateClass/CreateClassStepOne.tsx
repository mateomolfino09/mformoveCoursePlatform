import { ClassTypes } from '../../../../typings';
import { addStepOne } from '../../../redux/features/createClassSlice';
import { useAppSelector } from '../../../redux/hooks';
import { AppDispatch } from '../../../redux/store';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';

interface Props {
  step0ToStep1: any;
  types: ClassTypes[];
}

const CreateClassStepOne = ({ step0ToStep1, types }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const createClassReducer = useAppSelector(
    (state) => state.classesModalReducer.value
  );

  const { name: nameOr, typeId: typeIdOr, files: filesOr } = createClassReducer;
  const [name, setName] = useState(nameOr);
  const [typeId, setTypeId] = useState(typeIdOr);
  const [typeName, setTypeName] = useState('');
  const [files, setFiles] = useState<any[]>(
    filesOr ? [...filesOr] : []
  );

  const colourStyles: StylesConfig<any> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#333',
      height: 55,
      borderRadius: 6,
      padding: 0,
    }),
    option: (styles) => ({ ...styles, color: '#808080' }),
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles) => ({ ...styles, color: '#808080' }),
  };

  const mapTypes = types[0].values.map((v) => ({
    value: v.value,
    label: v.label,
  }));

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const serializedFiles = acceptedFiles.map((file) => ({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
      }));
      setFiles(serializedFiles);
    },
    multiple: false,
    accept: { 'image/*': [] },
  });

  const images = files.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt="image"
      className="cursor-pointer object-cover w-full h-full absolute"
    />
  ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 5) {
      toast.error('El Nombre de la clase debe tener al menos 5 caracteres');
      return;
    } else if (!typeId) {
      toast.error('Debe seleccionar un tipo de clase');
      return;
    } else if (files.length === 0) {
      toast.error('Debe subir una imagen para la clase');
      return;
    }
    dispatch(addStepOne({ name, typeId, files }));
    step0ToStep1();
  };

  return (
    <div className="relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent">
      <div className="h-full w-full relative flex flex-col md:items-center md:justify-center">
        <div className="w-full flex pt-12 justify-between items-center">
          <h1 className="text-4xl font-light">Agregar una Clase</h1>
          <p>Paso 1</p>
        </div>
        <form
          className="relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="space-y-8">
            <label className="flex flex-col space-y-3 w-full">
              <p>Elige un nombre para la clase</p>
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                className="input"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="flex flex-col space-y-3 w-full">
              <p>Elige el tipo de Clase</p>
              <Select
                options={mapTypes}
                styles={colourStyles}
                placeholder={typeName || 'Tipo de Clase'}
                className="w-full sm:w-full"
                onChange={(e) => {
                  setTypeName(e?.label || '');
                  setTypeId(e?.value || null);
                }}
              />
            </label>
            <p>Selecciona la Portada para la clase</p>
            {files.length > 0 ? (
              <div
                className="grid place-items-center input h-80 border-dashed border-2 border-white/80 relative"
                {...getRootProps()}
              >
                <label className="w-full">
                  <input {...getInputProps()} />
                  <DocumentIcon className="flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60 mb-8" />
                </label>
                {images}
              </div>
            ) : (
              <div
                className="grid place-items-center input h-80 border-dashed border-2 border-white/80 !mt-3"
                {...getRootProps()}
              >
                <label className="w-full">
                  <input {...getInputProps()} />
                  <ArrowUpTrayIcon className="flex justify-center items-center h-12 w-12 my-0 mx-auto text-white/60" />
                </label>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold"
          >
            Siguiente
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClassStepOne;
