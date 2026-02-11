import { ClassTypes, ClassModule } from '../../../../typings';
import { addStepOne } from '../../../redux/features/createClassSlice';
import { useAppSelector } from '../../../redux/hooks';
import { AppDispatch } from '../../../redux/store';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import Select, { StylesConfig } from 'react-select';
import { toast } from '../../../hooks/useToast';

interface Props {
  step0ToStep1: any;
  types: ClassTypes[];
  classModules?: ClassModule[];
}

const CreateClassStepOne = ({ step0ToStep1, types, classModules = [] }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [name, setName] = useState<string>('');
  const [typeId, setTypeId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);

  const mapTypes = useMemo(() => {
    if (classModules.length > 0) {
      return classModules.map((m) => ({ value: m._id, label: m.name, isModule: true }));
    }
    const firstFilter = types[0];
    const values = (firstFilter as any)?.values;
    if (Array.isArray(values)) {
      return values.map((v: { value: string; label: string }) => ({ value: v.value, label: v.label, isModule: false }));
    }
    return [];
  }, [classModules, types]);

  // Dropzone para imágenes
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  // Renderizar imágenes
  const images = files.map((file, index) => (
    <div key={index} className="relative">
      <img
        src={URL.createObjectURL(file)}
        alt={`Preview ${index + 1}`}
        className="max-w-full h-auto rounded-lg"
        style={{ maxHeight: '200px' }}
      />
    </div>
  ));

  // Función de envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('El nombre de la clase es requerido');
      return;
    }
    
    if (classModules.length > 0 ? !moduleId : !typeId) {
      toast.error('Debes seleccionar un tipo de clase');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Debes subir una imagen de portada');
      return;
    }

    const selectedOption = mapTypes.find((t: any) => t.value === (moduleId || typeId));
    dispatch(addStepOne({
      name,
      typeId: classModules.length > 0 ? null : typeId,
      moduleId: classModules.length > 0 ? moduleId : null,
      typeName: selectedOption?.label ?? typeName,
      files
    }));

    // Continuar al siguiente paso
    step0ToStep1();
  };

  return (
    <div className="relative flex w-full min-h-screen flex-col md:items-center md:justify-center">
      <div className="h-full w-full relative flex flex-col md:items-center md:justify-center">
        {/* Header mejorado */}
        <div className="w-full flex pt-8 justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Agregar una Clase</h1>
            <p className="text-gray-200">Completa la información básica de la clase</p>
          </div>
          <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-blue-700 font-medium">Paso 1</span>
          </div>
        </div>

        {/* Formulario principal con mejor estructura */}
        <form
          className="relative space-y-6 rounded-xl bg-white shadow-lg px-8 py-8 md:min-w-[50rem] md:px-12 md:py-10"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          {/* Sección: Información Básica */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              Información Básica
            </h2>
            
            <div className="space-y-6">
              <label className="flex flex-col space-y-2">
                <p className="text-sm font-medium text-gray-700">Nombre de la clase</p>
                <input
                  type="text"
                  placeholder="Ingresa el nombre de la clase"
                  value={name}
                  className="input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              
              <label className="flex flex-col space-y-2">
                <p className="text-sm font-medium text-gray-700">Tipo de clase</p>
                <Select
                  options={mapTypes}
                  styles={{
                    control: (styles) => ({
                      ...styles,
                      backgroundColor: 'white',
                      borderColor: '#d1d5db',
                      borderRadius: '6px',
                      height: '44px',
                      '&:hover': {
                        borderColor: '#3b82f6'
                      }
                    }),
                    option: (styles, { isFocused }) => ({
                      ...styles,
                      backgroundColor: isFocused ? '#f3f4f6' : 'white',
                      color: '#374151'
                    }),
                    input: (styles) => ({ ...styles, color: '#374151' }),
                    placeholder: (styles) => ({ ...styles, color: '#9ca3af' }),
                    singleValue: (styles) => ({ ...styles, color: '#374151' })
                  }}
                  value={mapTypes.find((t: any) => t.value === (moduleId || typeId)) ?? null}
                  placeholder={typeName || 'Selecciona el módulo o tipo de clase'}
                  className="w-full"
                  onChange={(e: any) => {
                    setTypeName(e?.label || '');
                    if (e?.isModule) {
                      setModuleId(e?.value || null);
                      setTypeId(null);
                    } else {
                      setTypeId(e?.value || null);
                      setModuleId(null);
                    }
                  }}
                />
              </label>
              
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Imagen de portada</p>
                {files.length > 0 ? (
                  <div
                    className="border-2 border-dashed border-blue-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-blue-50 hover:bg-blue-100 relative h-80"
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} />
                    <ArrowUpTrayIcon className="w-12 h-12 text-blue-400 mb-4" />
                    <span className="text-blue-600 text-sm text-center mb-2">Imagen cargada</span>
                    <span className="text-xs text-blue-500 text-center">Click para cambiar la imagen</span>
                    {images}
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 h-80"
                    {...getRootProps()}
                  >
                    <input {...getInputProps()} />
                    <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 text-sm text-center mb-2">Arrastra la imagen aquí o haz click</span>
                    <span className="text-xs text-gray-500 text-center">Formatos: JPG, PNG</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón de envío mejorado */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Siguiente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassStepOne;
