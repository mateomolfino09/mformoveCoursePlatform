'use client';

import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { Select } from '@mui/material';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import { countries } from 'countries-list';

interface Props {
  handleSubmit: any;
}

declare const process: any;

const CreateProductStep1 = ({ handleSubmit }: Props) => {
  // Cargar cities dinámicamente para evitar problemas de prerenderizado
  const [cities, setCities] = useState<any[]>([]);
  
  useEffect(() => {
    // Cargar el archivo JSON solo en el cliente
    import('./world-cities.json').then((module) => {
      setCities(module.default || []);
    }).catch((error) => {
      console.error('Error loading cities:', error);
      setCities([]);
    });
  }, []);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [descriptionLength, setDescriptionLength] = useState<number>(0);
  const [price, setPrice] = useState<number>(10);
  const [productVimeoId, setProductVimeoId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('$');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [courseType, setCourseType] = useState<string>('');
  const [diplomaUrl, setDiplomaUrl] = useState<string>('');
  const [tipo, setTipo] = useState<string>('curso');
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [cursosIncluidos, setCursosIncluidos] = useState<string>(''); // IDs separados por coma
  const [fecha, setFecha] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [online, setOnline] = useState<boolean>(false);
  const [linkEvento, setLinkEvento] = useState<string>('');
  const [cupo, setCupo] = useState<number | undefined>(undefined);
  const [archivo, setArchivo] = useState<any>(null);
  const [tipoArchivo, setTipoArchivo] = useState<string>('pdf');
  const [vimeoGallery, setVimeoGallery] = useState<string>('');
  const [vimeoVideos, setVimeoVideos] = useState<any[]>([]);
  const [vimeoError, setVimeoError] = useState<string>('');
  const [pdfPresentacion, setPdfPresentacion] = useState<any>(null);
  const [ubicacionInput, setUbicacionInput] = useState<string>('');
  const ubicacionTimeout = useRef<NodeJS.Timeout | null>(null);
  const [ubicacionLat, setUbicacionLat] = useState<string>('');
  const [ubicacionLon, setUbicacionLon] = useState<string>('');
  const [ubicacionCiudad, setUbicacionCiudad] = useState<string>('');
  const [ubicacionPais, setUbicacionPais] = useState<string>('');

  // Estados para código de descuento (familia y amigos)
  const [codigoDescuento, setCodigoDescuento] = useState<string>('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number | ''>('');
  const [descuentoMaxUsos, setDescuentoMaxUsos] = useState<number | ''>('');
  const [descuentoExpiracion, setDescuentoExpiracion] = useState<string>('');

  // Precios y fechas para tickets escalonados
  const [earlyBirdPrice, setEarlyBirdPrice] = useState<number | ''>('');
  const [earlyBirdEnd, setEarlyBirdEnd] = useState<string>('');
  const [generalPrice, setGeneralPrice] = useState<number | ''>('');
  const [generalStart, setGeneralStart] = useState<string>('');
  const [generalEnd, setGeneralEnd] = useState<string>('');
  const [lastTicketsPrice, setLastTicketsPrice] = useState<number | ''>('');
  const [lastTicketsStart, setLastTicketsStart] = useState<string>('');

  // Al inicio del componente:
  const now = new Date().toISOString().slice(0, 16);
  const [earlyBirdStart, setEarlyBirdStart] = useState<string>(now);
  const [lastTicketsEnd, setLastTicketsEnd] = useState<string>(fecha || "");

  // Estados para imágenes
  const [files, setFiles] = useState<any>([]);
  const [portraitImageArray, setPortraitImage] = useState<any>([]);
  const [diplomaImageArray, setDiplomaImage] = useState<any>([]);
  const [ubicacionSugerencias, setUbicacionSugerencias] = useState<any[]>([]);

  // useEffect para actualizar lastTicketsEnd si cambia la fecha del evento
  useEffect(() => {
    if (tipo === 'evento' && fecha) {
      setLastTicketsEnd(fecha);
    }
  }, [fecha, tipo]);

  // useEffect para sincronizar fechas escalonadas
  useEffect(() => {
    if (earlyBirdEnd) {
      setGeneralStart(earlyBirdEnd);
    }
  }, [earlyBirdEnd]);

  useEffect(() => {
    if (generalEnd) {
      setLastTicketsStart(generalEnd);
    }
  }, [generalEnd]);

  // Al cambiar ciudad, actualizar ubicacion
  useEffect(() => {
    if (ubicacionInput) {
      setUbicacion(ubicacionInput);
    }
  }, [ubicacionInput]);

  const colourStyles: StylesConfig<any> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#333',
      height: 55,
      borderRadius: 6,
      padding: 0
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return { ...styles, color: '#808080' };
    },
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles, { data }) => ({ ...styles, color: '#808080' })
  };

  const handleImagenesChange = (e: any) => {
    setImagenes(Array.from(e.target.files));
  };
  const handleArchivoChange = (e: any) => {
    setArchivo(e.target.files[0]);
  };

  // Fetch videos de Vimeo al cambiar el ID/link
  async function fetchVimeoVideos(galleryInput: string) {
    setVimeoError('');
    setVimeoVideos([]);
    if (!galleryInput) return;
    try {
      const res = await fetch('/api/vimeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vimeoInput: galleryInput }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'No se pudo obtener la galería de Vimeo');
      // El endpoint backend devuelve los videos en result.data.data
      setVimeoVideos(result.data.data || []);
      if (!result.data.data || result.data.data.length === 0) setVimeoError('La galería no tiene videos.');
    } catch (err: any) {
      setVimeoError('Error al obtener videos de Vimeo.');
    }
  }

  const handleSubmitLocal = (e: any) => {
    e.preventDefault();
    // --- VALIDACIONES LIMPIAS Y ROBUSTAS ---
    if (name.length < 5) {
      toast.error('El nombre debe tener al menos 5 caracteres');
      return;
    }
    if (descriptionLength < 20) {
      toast.error('Debe poner una descripción de 20 caracteres mínimo');
      return;
    }
    // Validaciones por tipo
    if (tipo === 'curso') {
      if (!vimeoGallery || vimeoVideos.length === 0) {
        toast.error('Debes ingresar una galería de Vimeo válida con al menos un video');
        return;
      }
    }
    if (tipo === 'bundle') {
      if (!cursosIncluidos) {
        toast.error('Debes ingresar los IDs de los cursos incluidos');
        return;
      }
    }
    if (tipo === 'evento') {
      if (!fecha) {
        toast.error('Debes ingresar la fecha');
        return;
      }
      if (!online && !ubicacion) {
        toast.error('Debes ingresar la ubicación');
        return;
      }
      // Validar precios escalonados (al menos uno)
      if (!earlyBirdPrice && !generalPrice && !lastTicketsPrice) {
        toast.error('Debes ingresar al menos un precio para el evento');
        return;
      }
    }
    if (tipo === 'recurso') {
      if (!archivo) {
        toast.error('Debes subir un archivo para el recurso');
        return;
      }
      if (!tipoArchivo) {
        toast.error('Debes seleccionar el tipo de archivo');
        return;
      }
    }

    console.log(portraitImageArray, diplomaImageArray);
    // Validación de descuento
    let descuentoObj = undefined;
    if (codigoDescuento) {
      if (!descuentoPorcentaje || descuentoPorcentaje < 1 || descuentoPorcentaje > 100) {
        toast.error('El porcentaje de descuento debe ser un número entre 1 y 100');
        return;
      }
      descuentoObj = {
        codigo: codigoDescuento,
        porcentaje: Number(descuentoPorcentaje),
        maxUsos: descuentoMaxUsos ? Number(descuentoMaxUsos) : undefined,
        expiracion: descuentoExpiracion || undefined
      };
    }
    // Llamar a handleSubmit con los argumentos correctos
    let now = new Date().toISOString().slice(0, 16); // formato yyyy-MM-ddTHH:mm
    let earlyBirdStartValue = tipo === 'evento' ? (earlyBirdStart || now) : undefined;
    let lastTicketsEndValue = tipo === 'evento' ? (lastTicketsEnd || fecha) : undefined;
    // Construir objeto ubicacion
    const ubicacionObj = {
      display_name: ubicacion,
      lat: ubicacionLat,
      lon: ubicacionLon,
      ciudad: ubicacionCiudad,
      pais: ubicacionPais
    };
    handleSubmit(
      name,
      description,
      vimeoGallery, // productVimeoId
      tipo,         // productType
      'USD',        // currency
      price,
      portraitImageArray,
      diplomaImageArray,
      imagenes, // galería de imágenes
      tipo === 'evento' ? earlyBirdPrice : undefined,
      tipo === 'evento' ? earlyBirdStartValue : undefined,
      tipo === 'evento' ? earlyBirdEnd : undefined,
      tipo === 'evento' ? generalPrice : undefined,
      tipo === 'evento' ? generalStart : undefined,
      tipo === 'evento' ? generalEnd : undefined,
      tipo === 'evento' ? lastTicketsPrice : undefined,
      tipo === 'evento' ? lastTicketsStart : undefined,
      tipo === 'evento' ? lastTicketsEndValue : undefined,
      // Nuevos campos
      tipo === 'evento' ? fecha : undefined,
      tipo === 'evento' ? ubicacionObj : undefined,
      tipo === 'evento' ? online : undefined,
      tipo === 'evento' ? linkEvento : undefined,
      tipo === 'evento' ? cupo : undefined,
      // Descuento
      descuentoObj
    );
  };

  function handleOnChangePortraitPicture(changeEvent: any) {
    setPortraitImage([changeEvent.target.files[0]]);
  }

  function handleOnChangeDiplomaPicture(changeEvent: any) {
    setDiplomaImage([changeEvent.target.files[0]]);
  }

  const onDropImagenes = (acceptedFiles: any[]) => {
    setImagenes((prev) => [
      ...prev,
      ...acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      ),
    ]);
  };
  const {
    getRootProps: getRootPropsImagenes,
    getInputProps: getInputPropsImagenes,
    isDragActive: isDragActiveImagenes,
  } = useDropzone({
    onDrop: onDropImagenes,
    accept: { 'image/*': [] },
    multiple: true,
  });
  const {
    getRootProps: getRootPropsPortrait,
    getInputProps: getInputPropsPortrait,
    isDragActive: isDragActivePortrait,
  } = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setPortraitImage(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    multiple: false,
    accept: { 'image/*': [] }
  });
  const {
    getRootProps: diplomaRootProps,
    getInputProps: diplomaInputprops
  }: any = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setDiplomaImage(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    multiple: false,
    accept: { 'image/*': [] }
  });

  // Dropzone para archivo de recurso descargable
  const onDropArchivo = (acceptedFiles: any[]) => {
    setArchivo(acceptedFiles[0]);
  };
  const {
    getRootProps: getRootPropsArchivo,
    getInputProps: getInputPropsArchivo,
    isDragActive: isDragActiveArchivo,
  } = useDropzone({
    onDrop: onDropArchivo,
    accept: { 'application/pdf': [], 'video/*': [], 'audio/*': [], 'application/zip': [] },
    multiple: false,
  });

  // Dropzone para PDF de presentación (solo para evento)
  const onDropPdfPresentacion = (acceptedFiles: any[]) => {
    setPdfPresentacion(acceptedFiles[0]);
  };
  const {
    getRootProps: getRootPropsPdfPresentacion,
    getInputProps: getInputPropsPdfPresentacion,
    isDragActive: isDragActivePdfPresentacion,
  } = useDropzone({
    onDrop: onDropPdfPresentacion,
    accept: { 'application/pdf': [] },
    multiple: false,
  });

  // Eliminar imagen del arreglo
  const eliminarImagen = (idx: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== idx));
  };

  const portraitImageShow = portraitImageArray?.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt='image'
      className='cursor-pointer object-cover w-full h-full absolute'
    />
  ));

  const diplomaImageShow = diplomaImageArray?.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt='image'
      className='cursor-pointer object-cover w-full h-full absolute'
    />
  ));

  // Autocomplete de ubicaciones con Nominatim
  const handleUbicacionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUbicacionInput(value);
    if (ubicacionTimeout.current) clearTimeout(ubicacionTimeout.current);
    if (value.length < 3) {
      setUbicacionSugerencias([]);
      return;
    }
    ubicacionTimeout.current = setTimeout(async () => {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setUbicacionSugerencias(data);
    }, 400);
  };
  const handleSelectUbicacion = (sug: any) => {
    setUbicacionInput(sug.display_name);
    setUbicacion(sug.display_name);
    setUbicacionLat(sug.lat || '');
    setUbicacionLon(sug.lon || '');
    setUbicacionCiudad(sug.address?.city || sug.address?.town || sug.address?.village || '');
    setUbicacionPais(sug.address?.country || '');
    setUbicacionSugerencias([]);
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}>
        <div className='w-full flex pt-12 justify-between items-center'>
          <h1 className='text-4xl font-light '>Crear un Producto</h1>
          <p>Paso único</p>
        </div>
        <form
          className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
          autoComplete='nope'
          onSubmit={handleSubmitLocal}
        >
          <div className='space-y-8'>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Nombre del producto</p>
              <input
                type='text'
                placeholder='Nombre'
                value={name}
                className='input'
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Descripción</p>
              <textarea
                placeholder='Descripción'
                className='input'
                onChange={(e) => {
                  setDescriptionLength(e.target.value.length);
                  setDescription(e.target.value);
                }}
                value={description}
              />
              <div className='flex flex-row justify-center items-center space-x-2'>
                <p className='font-light text-xs text-[gray]'>Largo mínimo 20 caracteres</p>
                {descriptionLength < 20 ? (
                  <RxCrossCircled className='text-xs text-red-600' />
                ) : (
                  <AiOutlineCheckCircle className='text-xs text-green-600' />
                )}
              </div>
            </label>
            <label className='flex flex-col space-y-3 w-full'>
              <p>Tipo de producto</p>
              <select className='input' value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value='curso'>Curso</option>
                <option value='bundle'>Bundle de cursos</option>
                <option value='evento'>Evento</option>
                <option value='recurso'>Recurso descargable</option>
              </select>
            </label>
            {/* Campos dinámicos según tipo */}
            {tipo === 'bundle' && (
              <label className='flex flex-col space-y-3 w-full'>
                <p>IDs de cursos incluidos (separados por coma)</p>
                <input
                  type='text'
                  placeholder='Ej: 64a1..., 64a2..., 64a3...'
                  value={cursosIncluidos}
                  className='input'
                  onChange={e => setCursosIncluidos(e.target.value)}
                />
              </label>
            )}
            {tipo === 'evento' && (
              <div className='flex flex-col space-y-3 w-full'>
                {/* Imagen de portada para evento como dropzone */}
                <label className='flex flex-col space-y-3 w-full'>
                  <p>Imagen de portada (requerida)</p>
                  <div
                    {...getRootPropsPortrait()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActivePortrait ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                  >
                    <input {...getInputPropsPortrait()} />
                    <span className='text-gray-500 mb-2'>Arrastra la imagen aquí o haz click para seleccionar</span>
                    <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG. Solo una imagen.</span>
                    {portraitImageArray[0] && (
                      <img
                        src={portraitImageArray[0].preview || URL.createObjectURL(portraitImageArray[0])}
                        alt='Portada'
                        className='w-32 h-32 object-cover mt-2 rounded'
                      />
                    )}
                  </div>
                </label>
                {/* PDF de presentación (opcional) */}
                <label>
                  <p>PDF de presentación (opcional)</p>
                  <div
                    {...getRootPropsPdfPresentacion()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActivePdfPresentacion ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                  >
                    <input {...getInputPropsPdfPresentacion()} />
                    <span className='text-gray-500 mb-2'>Arrastra el PDF aquí o haz click para seleccionar</span>
                    <span className='text-xs text-gray-400'>Solo formato PDF.</span>
                    {pdfPresentacion && (
                      <span className='mt-2 text-sm text-black font-semibold'>
                        {pdfPresentacion.name}
                      </span>
                    )}
                  </div>
                </label>
                {/* Galería de imágenes (opcional) */}
                <label>
                  <p>Galería de imágenes (opcional)</p>
                  <div
                    {...getRootPropsImagenes()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActiveImagenes ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                  >
                    <input {...getInputPropsImagenes()} />
                    <span className='text-gray-500 mb-2'>Arrastra imágenes aquí o haz click para seleccionar</span>
                    <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG, etc. Puedes subir varias.</span>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {imagenes.map((img, idx) => (
                        <div key={idx} className='relative w-20 h-20'>
                          <img src={img.preview || URL.createObjectURL(img)} alt={`img-${idx}`} className='object-cover w-full h-full rounded' />
                          <button type='button' onClick={() => eliminarImagen(idx)} className='absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
                {/* Precios y fechas escalonados */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Early Bird */}
                  <div className='flex flex-col border rounded p-3'>
                    <p className='font-bold mb-1'>Early Bird</p>
                    <label>
                      <span>Precio (USD)</span>
                      <input type='number' className='input' min={0} value={earlyBirdPrice} onChange={e => setEarlyBirdPrice(Number(e.target.value))} />
                    </label>
                    <label>
                      <span>Desde</span>
                      <input type='datetime-local' className='input' value={earlyBirdStart} onChange={e => setEarlyBirdStart(e.target.value)} />
                    </label>
                    <label>
                      <span>Hasta</span>
                      <input type='datetime-local' className='input' value={earlyBirdEnd} onChange={e => setEarlyBirdEnd(e.target.value)} />
                    </label>
                  </div>
                  {/* General */}
                  <div className='flex flex-col border rounded p-3'>
                    <p className='font-bold mb-1'>General</p>
                    <label>
                      <span>Precio (USD)</span>
                      <input type='number' className='input' min={0} value={generalPrice} onChange={e => setGeneralPrice(Number(e.target.value))} />
                    </label>
                    <label>
                      <span>Desde</span>
                      <input type='datetime-local' className='input' value={generalStart} onChange={e => setGeneralStart(e.target.value)} />
                    </label>
                    <label>
                      <span>Hasta</span>
                      <input type='datetime-local' className='input' value={generalEnd} onChange={e => setGeneralEnd(e.target.value)} />
                    </label>
                  </div>
                  {/* Last Tickets */}
                  <div className='flex flex-col border rounded p-3'>
                    <p className='font-bold mb-1'>Last Tickets</p>
                    <label>
                      <span>Precio (USD)</span>
                      <input type='number' className='input' min={0} value={lastTicketsPrice} onChange={e => setLastTicketsPrice(Number(e.target.value))} />
                    </label>
                    <label>
                      <span>Desde</span>
                      <input type='datetime-local' className='input' value={lastTicketsStart} onChange={e => setLastTicketsStart(e.target.value)} />
                    </label>
                    <label>
                      <span>Hasta</span>
                      <input type='datetime-local' className='input' value={lastTicketsEnd} onChange={e => setLastTicketsEnd(e.target.value)} />
                    </label>
                  </div>
                </div>
                {/* Fecha y hora del evento */}
                <label>
                  <p>Fecha y hora</p>
                  <input type='datetime-local' className='input' value={fecha} onChange={e => setFecha(e.target.value)} />
                </label>
                {/* Autocomplete de ubicación */}
                {/* Autocomplete de ubicación */}
                {/* ¿Es online? */}
                <label>
                  <p>¿Es online?</p>
                  <input type='checkbox' checked={online} onChange={e => setOnline(e.target.checked)} />
                </label>
                {/* Autocomplete de ubicación */}
                {!online ? (
                  <label className='relative'>
                    <p>Ubicación</p>
                    <input
                      type='text'
                      className='input'
                      value={ubicacionInput}
                      onChange={handleUbicacionInput}
                      placeholder='Buscar ciudad, dirección, lugar...'
                      autoComplete='off'
                    />
                    {ubicacionSugerencias.length > 0 && (
                      <ul className='absolute z-10 bg-white border border-gray-300 rounded w-full mt-1 max-h-40 overflow-y-auto shadow'>
                        {ubicacionSugerencias.map((sug, idx) => (
                          <li
                            key={idx}
                            className='px-3 py-2 hover:bg-gray-100 cursor-pointer text-black text-sm'
                            onClick={() => handleSelectUbicacion(sug)}
                          >
                            {sug.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </label>
                ) : (
                  <>
                  <label>
                    <p>Link del evento</p>
                    <input type='text' className='input' value={linkEvento} onChange={e => setLinkEvento(e.target.value)} />
                  </label>
                  </>
                )}

                <label>
                  <p>Cupo</p>
                  <input type='number' className='input' value={cupo || ''} onChange={e => setCupo(Number(e.target.value))} min={1} />
                </label>
              </div>
            )}
            {tipo === 'recurso' && (
              <div className='flex flex-col space-y-3 w-full'>
                <label>
                  <p>Archivo</p>
                  <div
                    {...getRootPropsArchivo()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActiveArchivo ? 'border-[#234C8C] bg-blue-50' : 'border-gray-300 bg-white hover:border-[#234C8C]'}`}
                  >
                    <input {...getInputPropsArchivo()} />
                    <span className='text-gray-500 mb-2'>Arrastra el archivo aquí o haz click para seleccionar</span>
                    <span className='text-xs text-gray-400'>Formatos permitidos: PDF, video, audio, ZIP.</span>
                    {archivo && (
                      <span className='mt-2 text-sm text-[#234C8C] font-semibold'>
                        {archivo.name}
                      </span>
                    )}
                  </div>
                </label>
                <label>
                  <p>Tipo de archivo</p>
                  <select className='input' value={tipoArchivo} onChange={e => setTipoArchivo(e.target.value)}>
                    <option value='pdf'>PDF</option>
                    <option value='video'>Video</option>
                    <option value='audio'>Audio</option>
                    <option value='zip'>ZIP</option>
                  </select>
                </label>
              </div>
            )}
            {tipo === 'curso' && (
              <div className='flex flex-col space-y-3 w-full'>
                <label>
                  <p>Galería de Vimeo (ID o link)</p>
                  <input
                    type='text'
                    className='input'
                    value={vimeoGallery}
                    onChange={e => {
                      setVimeoGallery(e.target.value);
                      if (e.target.value.length > 3) fetchVimeoVideos(e.target.value);
                    }}
                    placeholder='Ej: 1234567 o https://vimeo.com/showcase/1234567'
                  />
                </label>
                {vimeoError && <span className='text-red-500 text-sm'>{vimeoError}</span>}
                {vimeoVideos && vimeoVideos.length > 0 && (
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2'>
                    {vimeoVideos.map((video, idx) => (
                      <div key={idx} className='flex flex-col items-center border rounded p-2 bg-gray-50'>
                        <img src={video.pictures.sizes[2]?.link} alt={video.name} className='w-28 h-16 object-cover rounded mb-1' />
                        <span className='text-xs text-gray-700 text-center'>{video.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Campos de descuento para todos los productos */}
            <div className='border rounded p-3 mt-4'>
              <p className='font-bold mb-2'>Código de descuento (familia y amigos)</p>
              <label>
                <span>Código</span>
                <input
                  type='text'
                  className='input'
                  value={codigoDescuento}
                  onChange={e => setCodigoDescuento(e.target.value)}
                  placeholder='Ej: FAMILY2024'
                />
              </label>
              <label>
                <span>Descuento (%)</span>
                <input
                  type='number'
                  className='input'
                  min={1}
                  max={100}
                  value={descuentoPorcentaje}
                  onChange={e => setDescuentoPorcentaje(Number(e.target.value))}
                  placeholder='Ej: 20'
                />
              </label>
              <label>
                <span>Máximo de usos (opcional)</span>
                <input
                  type='number'
                  className='input'
                  min={1}
                  value={descuentoMaxUsos}
                  onChange={e => setDescuentoMaxUsos(Number(e.target.value))}
                  placeholder='Ej: 10'
                />
              </label>
              <label>
                <span>Expira el (opcional)</span>
                <input
                  type='date'
                  className='input'
                  value={descuentoExpiracion}
                  onChange={e => setDescuentoExpiracion(e.target.value)}
                />
              </label>
            </div>
            {/* Imagen de diploma solo si NO es evento */}
            {tipo !== 'evento' && (
              <label className='flex flex-col space-y-3 w-full'>
                <p>Imagen de diploma (requerida)</p>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleOnChangeDiplomaPicture}
                />
                {diplomaImageArray[0] && (
                  <img
                    src={diplomaImageArray[0].preview || URL.createObjectURL(diplomaImageArray[0])}
                    alt='Diploma'
                    className='w-32 h-32 object-cover mt-2 rounded'
                  />
                )}
              </label>
            )}
          </div>
          <button
            type='submit'
            className='bg-black text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-neutral-800 transition-all duration-300 shadow-lg w-full mt-8'
          >
            Crear producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductStep1;
