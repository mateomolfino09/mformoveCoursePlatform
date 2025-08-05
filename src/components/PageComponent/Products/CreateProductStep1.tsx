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
      const citiesData = module.default;
      setCities(Array.isArray(citiesData) ? citiesData : []);
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
  const [galleryImageArray, setGalleryImageArray] = useState<any[]>([]);
  
  // Log del estado inicial
  
  const [cursosIncluidos, setCursosIncluidos] = useState<string>(''); // IDs separados por coma
  const [fecha, setFecha] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [online, setOnline] = useState<boolean>(false);
  const [linkEvento, setLinkEvento] = useState<string>('');
  const [cupo, setCupo] = useState<number | undefined>(undefined);
  const [beneficios, setBeneficios] = useState<string[]>(['Acceso completo al evento', 'Material de apoyo']);
  const [nuevoBeneficio, setNuevoBeneficio] = useState<string>('');
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
  const [portraitMobileImageArray, setPortraitMobileImage] = useState<any>([]);
  const [diplomaImageArray, setDiplomaImage] = useState<any>([]);
  const [ubicacionSugerencias, setUbicacionSugerencias] = useState<any[]>([]);

  // Estados para Programas Transformacionales
  const [esProgramaTransformacional, setEsProgramaTransformacional] = useState<boolean>(false);
  const [duracionSemanas, setDuracionSemanas] = useState<number>(8);
  const [fechaFin, setFechaFin] = useState<string>('');
  const [cupoDisponible, setCupoDisponible] = useState<number>(50);
  const [estadoCohorte, setEstadoCohorte] = useState<string>('abierta');
  const [semanas, setSemanas] = useState<Array<{
    numero: number;
    titulo: string;
    descripcion: string;
    contenido: Array<{
      tipo: string;
      titulo: string;
      url?: string;
      duracion?: number;
      descripcion?: string;
      orden: number;
    }>;
    desbloqueado: boolean;
    fechaDesbloqueo?: string;
  }>>([]);
  const [sesionesEnVivo, setSesionesEnVivo] = useState<Array<{
    fecha: string;
    titulo: string;
    descripcion: string;
    linkZoom?: string;
    grabacionUrl?: string;
    duracion?: number;
    tipo: string;
  }>>([]);
  const [comunidad, setComunidad] = useState<{
    grupoWhatsapp?: string;
    grupoTelegram?: string;
    foroUrl?: string;
    descripcion?: string;
  }>({});
  const [resultadosEsperados, setResultadosEsperados] = useState<string[]>([]);
  const [requisitosPrevios, setRequisitosPrevios] = useState<string[]>([]);
  const [materialesNecesarios, setMaterialesNecesarios] = useState<string[]>([]);

  // Estados para agregar elementos dinámicos
  const [nuevoResultado, setNuevoResultado] = useState<string>('');
  const [nuevoRequisito, setNuevoRequisito] = useState<string>('');
  const [nuevoMaterial, setNuevoMaterial] = useState<string>('');
  const [nuevaSesion, setNuevaSesion] = useState<{
    fecha: string;
    titulo: string;
    descripcion: string;
    duracion: number;
    tipo: string;
  }>({
    fecha: '',
    titulo: '',
    descripcion: '',
    duracion: 60,
    tipo: 'q&a'
  });

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
    setGalleryImageArray(Array.from(e.target.files));
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

    // Datos del programa transformacional
    const programaTransformacionalData = esProgramaTransformacional ? {
      duracionSemanas,
      fechaFin: fechaFin || (fecha ? new Date(new Date(fecha).getTime() + duracionSemanas * 7 * 24 * 60 * 60 * 1000).toISOString()) : undefined,
      cupoDisponible: cupoDisponible || cupo,
      estadoCohorte,
      semanas: semanas.length > 0 ? semanas : undefined,
      sesionesEnVivo: sesionesEnVivo.length > 0 ? sesionesEnVivo : undefined,
      comunidad: Object.keys(comunidad).length > 0 ? comunidad : undefined,
      resultadosEsperados: resultadosEsperados.length > 0 ? resultadosEsperados : undefined,
      requisitosPrevios: requisitosPrevios.length > 0 ? requisitosPrevios : undefined,
      materialesNecesarios: materialesNecesarios.length > 0 ? materialesNecesarios : undefined
    } : undefined;

    
    handleSubmit(
      name,
      description,
      vimeoGallery, // productVimeoId
      tipo,         // productType
      'USD',        // currency
      price,
      portraitImageArray,
      portraitMobileImageArray,
      diplomaImageArray,
      galleryImageArray, // <-- PASAR galleryImageArray
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
      tipo === 'evento' ? beneficios : undefined,
      tipo === 'evento' ? aprendizajes : undefined,
      tipo === 'evento' ? paraQuien : undefined,
      // Descuento
      descuentoObj,
      // PDF de presentación
      tipo === 'evento' ? pdfPresentacion : undefined,
      // Programa Transformacional
      esProgramaTransformacional,
      programaTransformacionalData
    );
  };

  function handleOnChangePortraitMobilePicture(changeEvent: any) {
    setPortraitMobileImage([changeEvent.target.files[0]]);
  }

  function handleOnChangeDiplomaPicture(changeEvent: any) {
    setDiplomaImage([changeEvent.target.files[0]]);
  }

  const onDropImagenes = (acceptedFiles: any[]) => {

    
    setGalleryImageArray((prev: any[]) => {
      const newArray = [
        ...prev,
        ...acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ];
      
      return newArray;
    });
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

  const { getRootProps: getRootPropsPortrait, getInputProps: getInputPropsPortrait, isDragActive: isDragActivePortrait } = useDropzone({
    onDrop: (acceptedFiles) => setPortraitImage(acceptedFiles),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

  const {
    getRootProps: getRootPropsPortraitMobile,
    getInputProps: getInputPropsPortraitMobile,
    isDragActive: isDragActivePortraitMobile,
  } = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setPortraitMobileImage(
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

    setGalleryImageArray((prev: any[]) => {
      const newArray = prev.filter((_: any, i: number) => i !== idx);
      
      return newArray;
    });
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

  const agregarBeneficio = () => {
    if (nuevoBeneficio.trim() && !beneficios.includes(nuevoBeneficio.trim())) {
      setBeneficios([...beneficios, nuevoBeneficio.trim()]);
      setNuevoBeneficio('');
    }
  };

  const eliminarBeneficio = (index: number) => {
    setBeneficios(beneficios.filter((_, i) => i !== index));
  };

  const [aprendizajes, setAprendizajes] = useState<string[]>([]);
  const [nuevoAprendizaje, setNuevoAprendizaje] = useState<string>('');
  const agregarAprendizaje = () => {
    if (nuevoAprendizaje.trim() && !aprendizajes.includes(nuevoAprendizaje.trim())) {
      setAprendizajes([...aprendizajes, nuevoAprendizaje.trim()]);
      setNuevoAprendizaje('');
    }
  };
  const eliminarAprendizaje = (index: number) => {
    setAprendizajes(aprendizajes.filter((_, i) => i !== index));
  };

  const [paraQuien, setParaQuien] = useState<string[]>([]);
  const [nuevoParaQuien, setNuevoParaQuien] = useState<string>('');
  const agregarParaQuien = () => {
    if (nuevoParaQuien.trim() && !paraQuien.includes(nuevoParaQuien.trim())) {
      setParaQuien([...paraQuien, nuevoParaQuien.trim()]);
      setNuevoParaQuien('');
    }
  };
  const eliminarParaQuien = (index: number) => {
    setParaQuien(paraQuien.filter((_, i) => i !== index));
  };

  // Funciones para Programas Transformacionales
  const agregarResultado = () => {
    if (nuevoResultado.trim()) {
      setResultadosEsperados([...resultadosEsperados, nuevoResultado.trim()]);
      setNuevoResultado('');
    }
  };

  const eliminarResultado = (index: number) => {
    setResultadosEsperados(resultadosEsperados.filter((_, i) => i !== index));
  };

  const agregarRequisito = () => {
    if (nuevoRequisito.trim()) {
      setRequisitosPrevios([...requisitosPrevios, nuevoRequisito.trim()]);
      setNuevoRequisito('');
    }
  };

  const eliminarRequisito = (index: number) => {
    setRequisitosPrevios(requisitosPrevios.filter((_, i) => i !== index));
  };

  const agregarMaterial = () => {
    if (nuevoMaterial.trim()) {
      setMaterialesNecesarios([...materialesNecesarios, nuevoMaterial.trim()]);
      setNuevoMaterial('');
    }
  };

  const eliminarMaterial = (index: number) => {
    setMaterialesNecesarios(materialesNecesarios.filter((_, i) => i !== index));
  };

  const agregarSesionEnVivo = () => {
    if (nuevaSesion.titulo.trim() && nuevaSesion.fecha) {
      setSesionesEnVivo([...sesionesEnVivo, { ...nuevaSesion }]);
      setNuevaSesion({
        fecha: '',
        titulo: '',
        descripcion: '',
        duracion: 60,
        tipo: 'q&a'
      });
    }
  };

  const eliminarSesionEnVivo = (index: number) => {
    setSesionesEnVivo(sesionesEnVivo.filter((_, i) => i !== index));
  };

  const generarSemanasAutomaticas = () => {
    const semanasGeneradas = [];
    for (let i = 1; i <= duracionSemanas; i++) {
      semanasGeneradas.push({
        numero: i,
        titulo: `Semana ${i}`,
        descripcion: `Descripción de la semana ${i}`,
        contenido: [],
        desbloqueado: i === 1,
        fechaDesbloqueo: i === 1 ? fecha : undefined
      });
    }
    setSemanas(semanasGeneradas);
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
                <option value='programa_transformacional'>Programa Transformacional</option>
                <option value='recurso'>Recurso descargable</option>
              </select>
            </label>
            
            {/* Checkbox para marcar como programa transformacional */}
            {tipo === 'evento' && (
              <label className='flex items-center space-x-3 w-full'>
                <input
                  type='checkbox'
                  checked={esProgramaTransformacional}
                  onChange={e => setEsProgramaTransformacional(e.target.checked)}
                  className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>
                  Es un programa transformacional de 8 semanas
                </span>
              </label>
            )}
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
                {/* Imagen de portada móvil para evento como dropzone */}
                <label className='flex flex-col space-y-3 w-full'>
                  <p>Imagen de portada móvil (opcional)</p>
                  <div
                    {...getRootPropsPortraitMobile()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActivePortraitMobile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-500'}`}
                  >
                    <input {...getInputPropsPortraitMobile()} />
                    <span className='text-gray-500 mb-2'>Arrastra la imagen aquí o haz click para seleccionar</span>
                    <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG. Solo una imagen. Recomendado: 9:16 ratio.</span>
                    {portraitMobileImageArray[0] && (
                      <img
                        src={portraitMobileImageArray[0].preview || URL.createObjectURL(portraitMobileImageArray[0])}
                        alt='Portada Móvil'
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

                {/* Beneficios del evento */}
                <label>
                  <p>Beneficios incluidos</p>
                  <div className='space-y-3'>
                    {/* Lista de beneficios actuales */}
                    <div className='space-y-2'>
                      {beneficios.map((beneficio, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='flex-1'>{beneficio}</span>
                          <button
                            type='button'
                            onClick={() => eliminarBeneficio(index)}
                            className='text-red-500 hover:text-red-700 text-sm'
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Agregar nuevo beneficio */}
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        value={nuevoBeneficio}
                        onChange={(e) => setNuevoBeneficio(e.target.value)}
                        placeholder='Agregar nuevo beneficio...'
                        className='input flex-1'
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarBeneficio())}
                      />
                      <button
                        type='button'
                        onClick={agregarBeneficio}
                        className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </label>
                {/* Aprendizajes del evento */}
                <label>
                  <p>¿Qué vas a aprender? (uno por línea)</p>
                  <div className='space-y-3'>
                    {/* Lista de aprendizajes actuales */}
                    <div className='space-y-2'>
                      {aprendizajes.map((apr, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                          <span className='flex-1'>{apr}</span>
                          <button
                            type='button'
                            onClick={() => eliminarAprendizaje(index)}
                            className='text-red-500 hover:text-red-700 text-sm'
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Agregar nuevo aprendizaje */}
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        value={nuevoAprendizaje}
                        onChange={(e) => setNuevoAprendizaje(e.target.value)}
                        placeholder='Agregar nuevo aprendizaje...'
                        className='input flex-1'
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarAprendizaje())}
                      />
                      <button
                        type='button'
                        onClick={agregarAprendizaje}
                        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </label>
                {/* Para quién es este evento */}
                <label>
                  <p>¿Para quién es este evento? (uno por línea)</p>
                  <div className='space-y-3'>
                    {/* Lista de paraQuien actuales */}
                    <div className='space-y-2'>
                      {paraQuien.map((pq, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-[#234C8C] rounded-full'></div>
                          <span className='flex-1'>{pq}</span>
                          <button
                            type='button'
                            onClick={() => eliminarParaQuien(index)}
                            className='text-red-500 hover:text-red-700 text-sm'
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Agregar nuevo paraQuien */}
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        value={nuevoParaQuien}
                        onChange={(e) => setNuevoParaQuien(e.target.value)}
                        placeholder='Agregar nuevo destinatario...'
                        className='input flex-1'
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarParaQuien())}
                      />
                      <button
                        type='button'
                        onClick={agregarParaQuien}
                        className='px-4 py-2 bg-[#234C8C] text-white rounded hover:bg-blue-600 transition-colors'
                      >
                        Agregar
                      </button>
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
            {/* Galería de imágenes (opcional) - Disponible para todos los tipos de productos */}
            <label>
              <p>Galería de imágenes (opcional)</p>
              <div
                {...getRootPropsImagenes()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActiveImagenes ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                onClick={() => {}}
              >
                <input {...getInputPropsImagenes()} />
                <span className='text-gray-500 mb-2'>Arrastra imágenes aquí o haz click para seleccionar</span>
                <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG, etc. Puedes subir varias.</span>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {galleryImageArray.map((img: any, idx: number) => (
                    <div key={idx} className='relative w-20 h-20'>
                      <img src={img.preview || URL.createObjectURL(img)} alt={`img-${idx}`} className='object-cover w-full h-full rounded' />
                      <button type='button' onClick={() => eliminarImagen(idx)} className='absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </label>
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

            {/* Campos específicos para Programas Transformacionales */}
            {esProgramaTransformacional && (
              <div className='border rounded p-6 mt-6 bg-blue-50'>
                <h3 className='text-lg font-bold text-blue-900 mb-4'>Configuración del Programa Transformacional</h3>
                
                {/* Información básica del programa */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                  <label>
                    <span>Duración en semanas</span>
                    <input
                      type='number'
                      className='input'
                      min={1}
                      max={52}
                      value={duracionSemanas}
                      onChange={e => setDuracionSemanas(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    <span>Cupo disponible</span>
                    <input
                      type='number'
                      className='input'
                      min={1}
                      value={cupoDisponible}
                      onChange={e => setCupoDisponible(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    <span>Estado de la cohorte</span>
                    <select className='input' value={estadoCohorte} onChange={e => setEstadoCohorte(e.target.value)}>
                      <option value='abierta'>Abierta</option>
                      <option value='cerrada'>Cerrada</option>
                      <option value='en_curso'>En Curso</option>
                      <option value='finalizada'>Finalizada</option>
                    </select>
                  </label>
                  <label>
                    <span>Fecha de finalización (opcional)</span>
                    <input
                      type='datetime-local'
                      className='input'
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                    />
                  </label>
                </div>

                {/* Generar semanas automáticamente */}
                <div className='mb-6'>
                  <button
                    type='button'
                    onClick={generarSemanasAutomaticas}
                    className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                  >
                    Generar {duracionSemanas} semanas automáticamente
                  </button>
                </div>

                {/* Resultados esperados */}
                <div className='mb-6'>
                  <label>
                    <span>Resultados esperados</span>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        className='input flex-1'
                        value={nuevoResultado}
                        onChange={e => setNuevoResultado(e.target.value)}
                        placeholder='Ej: Mayor consciencia corporal'
                      />
                      <button
                        type='button'
                        onClick={agregarResultado}
                        className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                      >
                        Agregar
                      </button>
                    </div>
                  </label>
                  <div className='mt-2 space-y-1'>
                    {resultadosEsperados.map((resultado, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <span className='flex-1'>{resultado}</span>
                        <button
                          type='button'
                          onClick={() => eliminarResultado(index)}
                          className='text-red-500 hover:text-red-700 text-sm'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requisitos previos */}
                <div className='mb-6'>
                  <label>
                    <span>Requisitos previos</span>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        className='input flex-1'
                        value={nuevoRequisito}
                        onChange={e => setNuevoRequisito(e.target.value)}
                        placeholder='Ej: No se requiere experiencia previa'
                      />
                      <button
                        type='button'
                        onClick={agregarRequisito}
                        className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                      >
                        Agregar
                      </button>
                    </div>
                  </label>
                  <div className='mt-2 space-y-1'>
                    {requisitosPrevios.map((requisito, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <span className='flex-1'>{requisito}</span>
                        <button
                          type='button'
                          onClick={() => eliminarRequisito(index)}
                          className='text-red-500 hover:text-red-700 text-sm'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materiales necesarios */}
                <div className='mb-6'>
                  <label>
                    <span>Materiales necesarios</span>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        className='input flex-1'
                        value={nuevoMaterial}
                        onChange={e => setNuevoMaterial(e.target.value)}
                        placeholder='Ej: Espacio cómodo para moverte'
                      />
                      <button
                        type='button'
                        onClick={agregarMaterial}
                        className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
                      >
                        Agregar
                      </button>
                    </div>
                  </label>
                  <div className='mt-2 space-y-1'>
                    {materialesNecesarios.map((material, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                        <span className='flex-1'>{material}</span>
                        <button
                          type='button'
                          onClick={() => eliminarMaterial(index)}
                          className='text-red-500 hover:text-red-700 text-sm'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sesiones en vivo */}
                <div className='mb-6'>
                  <h4 className='font-semibold mb-3'>Sesiones en vivo</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                    <input
                      type='datetime-local'
                      className='input'
                      value={nuevaSesion.fecha}
                      onChange={e => setNuevaSesion({...nuevaSesion, fecha: e.target.value})}
                      placeholder='Fecha y hora'
                    />
                    <input
                      type='text'
                      className='input'
                      value={nuevaSesion.titulo}
                      onChange={e => setNuevaSesion({...nuevaSesion, titulo: e.target.value})}
                      placeholder='Título de la sesión'
                    />
                    <input
                      type='text'
                      className='input'
                      value={nuevaSesion.descripcion}
                      onChange={e => setNuevaSesion({...nuevaSesion, descripcion: e.target.value})}
                      placeholder='Descripción'
                    />
                    <select
                      className='input'
                      value={nuevaSesion.tipo}
                      onChange={e => setNuevaSesion({...nuevaSesion, tipo: e.target.value})}
                    >
                      <option value='q&a'>Q&A</option>
                      <option value='practica'>Práctica</option>
                      <option value='reflexion'>Reflexión</option>
                      <option value='comunidad'>Comunidad</option>
                    </select>
                  </div>
                  <button
                    type='button'
                    onClick={agregarSesionEnVivo}
                    className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
                  >
                    Agregar Sesión
                  </button>
                  <div className='mt-3 space-y-2'>
                    {sesionesEnVivo.map((sesion, index) => (
                      <div key={index} className='flex items-center justify-between p-3 bg-white rounded border'>
                        <div>
                          <div className='font-medium'>{sesion.titulo}</div>
                          <div className='text-sm text-gray-600'>
                            {new Date(sesion.fecha).toLocaleDateString('es-ES')} - {sesion.tipo}
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => eliminarSesionEnVivo(index)}
                          className='text-red-500 hover:text-red-700'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comunidad */}
                <div className='mb-6'>
                  <h4 className='font-semibold mb-3'>Información de comunidad</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <label>
                      <span>Grupo de WhatsApp (opcional)</span>
                      <input
                        type='url'
                        className='input'
                        value={comunidad.grupoWhatsapp || ''}
                        onChange={e => setComunidad({...comunidad, grupoWhatsapp: e.target.value})}
                        placeholder='https://chat.whatsapp.com/...'
                      />
                    </label>
                    <label>
                      <span>Grupo de Telegram (opcional)</span>
                      <input
                        type='url'
                        className='input'
                        value={comunidad.grupoTelegram || ''}
                        onChange={e => setComunidad({...comunidad, grupoTelegram: e.target.value})}
                        placeholder='https://t.me/...'
                      />
                    </label>
                    <label className='md:col-span-2'>
                      <span>Descripción de la comunidad</span>
                      <textarea
                        className='input'
                        rows={3}
                        value={comunidad.descripcion || ''}
                        onChange={e => setComunidad({...comunidad, descripcion: e.target.value})}
                        placeholder='Describe cómo funciona la comunidad...'
                      />
                    </label>
                  </div>
                </div>
              </div>
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
