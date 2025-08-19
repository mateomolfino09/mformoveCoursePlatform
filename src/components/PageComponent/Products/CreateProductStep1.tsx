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

  // Estados para edición de semanas
  const [semanaEditando, setSemanaEditando] = useState<any>(null);
  const [modalEditarSemana, setModalEditarSemana] = useState<boolean>(false);

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
    let earlyBirdStartValue = (tipo === 'evento' || tipo === 'programa_transformacional') ? (earlyBirdStart || now) : undefined;
    let lastTicketsEndValue = (tipo === 'evento' || tipo === 'programa_transformacional') ? (lastTicketsEnd || fecha) : undefined;
    // Construir objeto ubicacion simple
    const ubicacionObj = {
      display_name: ubicacion
    };

    // Datos del programa transformacional
    const programaTransformacionalData = esProgramaTransformacional ? {
      duracionSemanas,
      fechaFin: fechaFin || (fecha ? new Date(new Date(fecha).getTime() + duracionSemanas * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined),
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
      (tipo === 'evento' || tipo === 'programa_transformacional') ? earlyBirdPrice : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? earlyBirdStartValue : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? earlyBirdEnd : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? generalPrice : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? generalStart : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? generalEnd : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? lastTicketsPrice : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? lastTicketsStart : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? lastTicketsEndValue : undefined,
      // Nuevos campos
      (tipo === 'evento' || tipo === 'programa_transformacional') ? fecha : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? ubicacionObj : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? online : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? linkEvento : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? cupo : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? beneficios : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? aprendizajes : undefined,
      (tipo === 'evento' || tipo === 'programa_transformacional') ? paraQuien : undefined,
      // Descuento
      descuentoObj,
      // PDF de presentación
      (tipo === 'evento' || tipo === 'programa_transformacional') ? pdfPresentacion : undefined,
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
    const file = acceptedFiles[0];
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > 5) {
      toast.error(`El PDF es demasiado grande (${fileSizeMB.toFixed(1)}MB). Máximo 5MB.`);
      return;
    }
    
    setPdfPresentacion(file);
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

  // Manejo simple de ubicación
  const handleUbicacionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUbicacionInput(value);
    setUbicacion(value);
  };

  const agregarBeneficio = () => {
    if (nuevoBeneficio.trim() && !beneficios.includes(nuevoBeneficio.trim())) {
      setBeneficios([...beneficios, nuevoBeneficio.trim()]);
      setNuevoBeneficio('');
    }
  };

  const eliminarBeneficio = (index: number) => {
    setBeneficios((prev) => Array.isArray(prev) ? prev.filter((_, i) => i !== index) : []);
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

  // Función para calcular fecha de finalización automáticamente
  const calcularFechaFinalizacion = () => {
    if (fecha && duracionSemanas) {
      const fechaInicio = new Date(fecha);
      const fechaFinalizacion = new Date(fechaInicio);
      fechaFinalizacion.setDate(fechaFinalizacion.getDate() + (duracionSemanas * 7));
      // Mantener la misma hora que la fecha de inicio
      fechaFinalizacion.setHours(fechaInicio.getHours());
      fechaFinalizacion.setMinutes(fechaInicio.getMinutes());
      setFechaFin(fechaFinalizacion.toISOString().slice(0, 16));
    }
  };

  // Efecto para calcular fecha de finalización cuando cambie fecha o duración
  useEffect(() => {
    calcularFechaFinalizacion();
  }, [fecha, duracionSemanas]);

  const generarSemanasAutomaticas = () => {
    // Verificar si hay fecha de inicio
    if (!fecha) {
      toast.error('Debes configurar una fecha de inicio antes de generar las semanas automáticamente');
      return;
    }

    const fechaInicio = new Date(fecha);
    const semanasGeneradas = [];
    
    for (let i = 1; i <= duracionSemanas; i++) {
      // Calcular fecha de desbloqueo: fecha de inicio + (i-1) semanas
      const fechaDesbloqueo = new Date(fechaInicio);
      fechaDesbloqueo.setDate(fechaDesbloqueo.getDate() + ((i - 1) * 7));
      // Mantener la misma hora que la fecha de inicio
      fechaDesbloqueo.setHours(fechaInicio.getHours());
      fechaDesbloqueo.setMinutes(fechaInicio.getMinutes());
      
      semanasGeneradas.push({
        numero: i,
        titulo: `Semana ${i}`,
        descripcion: `Descripción de la semana ${i}`,
        contenido: [],
        desbloqueado: i === 1,
        fechaDesbloqueo: fechaDesbloqueo.toISOString()
      });
    }
    
    setSemanas(semanasGeneradas);
    toast.success(`Se generaron ${duracionSemanas} semanas automáticamente`);
  };

  // Funciones para edición de semanas
  const abrirModalEditarSemana = (semana: any) => {
    setSemanaEditando({ ...semana });
    setModalEditarSemana(true);
  };

  const cerrarModalEditarSemana = () => {
    setSemanaEditando(null);
    setModalEditarSemana(false);
  };

  const guardarSemanaEditada = () => {
    if (!semanaEditando) return;
    
    const nuevasSemanas = [...semanas];
    const index = nuevasSemanas.findIndex(s => s.numero === semanaEditando.numero);
    
    if (index !== -1) {
      nuevasSemanas[index] = { ...semanaEditando };
      setSemanas(nuevasSemanas);
      toast.success('Semana actualizada correctamente');
    }
    
    cerrarModalEditarSemana();
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center '>
      <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}>
        {/* Header mejorado */}
        <div className='w-full flex pt-8 justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>Crear un Productos</h1>
            <p className='text-gray-200'>Completa la información para crear tu nuevo producto</p>
          </div>
          <div className='flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-lg'>
            <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
            <span className='text-blue-700 font-medium'>Paso único</span>
          </div>
        </div>

        {/* Formulario principal con mejor estructura */}
        <form
          className='relative space-y-6 rounded-xl bg-white shadow-lg px-8 py-8 md:min-w-[50rem] md:px-12 md:py-10'
          autoComplete='nope'
          onSubmit={handleSubmitLocal}
        >
                     {/* Sección: Información Básica */}
           <div className='border-b border-gray-200 pb-6'>
             <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
               <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                 <span className='text-blue-600 font-bold text-sm'>1</span>
               </div>
               Información Básica
             </h2>
             
             <div className='space-y-6'>
               <label className='flex flex-col space-y-2'>
                 <p className='text-sm font-medium text-gray-700'>Nombre del producto</p>
                 <input
                   type='text'
                   placeholder='Ingresa el nombre de tu producto'
                   value={name}
                   className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                   onChange={(e) => setName(e.target.value)}
                 />
               </label>
               
               <label className='flex flex-col space-y-2'>
                 <p className='text-sm font-medium text-gray-700'>Descripción</p>
                 <textarea
                   placeholder='Describe tu producto de manera clara y atractiva'
                   className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors min-h-[100px]'
                   onChange={(e) => {
                     setDescriptionLength(e.target.value.length);
                     setDescription(e.target.value);
                   }}
                   value={description}
                 />
                 <div className='flex flex-row justify-between items-center'>
                   <p className='font-light text-xs text-gray-500'>Largo mínimo 20 caracteres</p>
                   <div className='flex items-center space-x-2'>
                     <span className='text-xs text-gray-500'>{descriptionLength}/20</span>
                     {descriptionLength < 20 ? (
                       <RxCrossCircled className='text-xs text-red-500' />
                     ) : (
                       <AiOutlineCheckCircle className='text-xs text-green-500' />
                     )}
                   </div>
                 </div>
               </label>
               
               <label className='flex flex-col space-y-2'>
                 <p className='text-sm font-medium text-gray-700'>Tipo de producto</p>
                 <select 
                   className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors' 
                   value={tipo} 
                   onChange={e => {
                     const newTipo = e.target.value;
                     setTipo(newTipo);
                     if (newTipo === 'programa_transformacional') {
                       setEsProgramaTransformacional(true);
                     } else {
                       setEsProgramaTransformacional(false);
                     }
                   }}
                 >
                   <option value='curso'>Curso</option>
                   <option value='bundle'>Bundle de cursos</option>
                   <option value='evento'>Evento</option>
                   <option value='programa_transformacional'>Programa Transformacional</option>
                   <option value='recurso'>Recurso descargable</option>
                 </select>
               </label>

               {/* Precio para productos que no son eventos/programas */}
               {(tipo !== 'evento' && tipo !== 'programa_transformacional') && (
                 <label className='flex flex-col space-y-2'>
                   <p className='text-sm font-medium text-gray-700'>Precio (USD) <span className='text-red-500'>*</span></p>
                   <input
                     type='number'
                     placeholder='0.00'
                     value={price}
                     className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                     onChange={(e) => setPrice(Number(e.target.value))}
                     min={0}
                     step={0.01}
                   />
                   <p className='text-xs text-gray-500'>Ingresa el precio en dólares estadounidenses</p>
                 </label>
               )}
             </div>
           </div>

                     {/* Sección: Configuración Específica por Tipo */}
           {tipo === 'bundle' && (
             <div className='border-b border-gray-200 pb-6'>
               <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                 <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                   <span className='text-green-600 font-bold text-sm'>2</span>
                 </div>
                 Configuración de Bundle
               </h2>
               
               <label className='flex flex-col space-y-2'>
                 <p className='text-sm font-medium text-gray-700'>IDs de cursos incluidos</p>
                 <input
                   type='text'
                   placeholder='Ej: 64a1..., 64a2..., 64a3... (separados por coma)'
                   value={cursosIncluidos}
                   className='input border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors'
                   onChange={e => setCursosIncluidos(e.target.value)}
                 />
                 <p className='text-xs text-gray-500'>Ingresa los IDs de los cursos que incluirás en este bundle</p>
               </label>
             </div>
           )}

           {tipo === 'recurso' && (
             <div className='border-b border-gray-200 pb-6'>
               <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                 <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3'>
                   <span className='text-orange-600 font-bold text-sm'>2</span>
                 </div>
                 Configuración de Recurso
               </h2>
               
               <div className='space-y-6'>
                 <label className='flex flex-col space-y-2'>
                   <p className='text-sm font-medium text-gray-700'>Archivo <span className='text-red-500'>*</span></p>
                   <div
                     {...getRootPropsArchivo()}
                     className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                       isDragActiveArchivo 
                         ? 'border-orange-500 bg-orange-50' 
                         : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
                     }`}
                   >
                     <input {...getInputPropsArchivo()} />
                     <ArrowUpTrayIcon className='w-8 h-8 text-gray-400 mb-2' />
                     <span className='text-gray-600 text-sm text-center mb-1'>Arrastra el archivo aquí o haz click</span>
                     <span className='text-xs text-gray-500 text-center'>Formatos: PDF, video, audio, ZIP</span>
                     {archivo && (
                       <div className='mt-3 flex items-center space-x-2 bg-green-50 p-2 rounded-lg'>
                         <AiOutlineCheckCircle className='text-green-500' />
                         <span className='text-sm text-green-700 font-medium'>{archivo.name}</span>
                       </div>
                     )}
                   </div>
                 </label>
                 
                 <label className='flex flex-col space-y-2'>
                   <p className='text-sm font-medium text-gray-700'>Tipo de archivo</p>
                   <select 
                     className='input border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-colors' 
                     value={tipoArchivo} 
                     onChange={e => setTipoArchivo(e.target.value)}
                   >
                     <option value='pdf'>PDF</option>
                     <option value='video'>Video</option>
                     <option value='audio'>Audio</option>
                     <option value='zip'>ZIP</option>
                   </select>
                 </label>
               </div>
             </div>
           )}

           {tipo === 'curso' && (
             <div className='border-b border-gray-200 pb-6'>
               <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                 <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3'>
                   <span className='text-blue-600 font-bold text-sm'>2</span>
                 </div>
                 Configuración de Curso
               </h2>
               
               <div className='space-y-6'>
                 <label className='flex flex-col space-y-2'>
                   <p className='text-sm font-medium text-gray-700'>Galería de Vimeo (ID o link)</p>
                   <input
                     type='text'
                     className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                     value={vimeoGallery}
                     onChange={e => {
                       setVimeoGallery(e.target.value);
                       if (e.target.value.length > 3) fetchVimeoVideos(e.target.value);
                     }}
                     placeholder='Ej: 1234567 o https://vimeo.com/showcase/1234567'
                   />
                   <p className='text-xs text-gray-500'>Ingresa el ID o link de la galería de Vimeo que contiene los videos del curso</p>
                 </label>
                 
                 {vimeoError && (
                   <div className='flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200'>
                     <RxCrossCircled className='text-red-500' />
                     <span className='text-red-700 text-sm'>{vimeoError}</span>
                   </div>
                 )}
                 
                 {vimeoVideos && vimeoVideos.length > 0 && (
                   <div className='space-y-3'>
                     <p className='text-sm font-medium text-gray-700'>Videos encontrados ({vimeoVideos.length})</p>
                     <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                       {vimeoVideos.map((video, idx) => (
                         <div key={idx} className='flex flex-col items-center border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors'>
                           <img 
                             src={video.pictures.sizes[2]?.link} 
                             alt={video.name} 
                             className='w-full h-20 object-cover rounded mb-2' 
                           />
                           <span className='text-xs text-gray-700 text-center line-clamp-2'>{video.name}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>
           )}

          {(tipo === 'evento' || tipo === 'programa_transformacional') && (
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-purple-600 font-bold text-sm'>2</span>
                </div>
                Configuración de {tipo === 'programa_transformacional' ? 'Programa' : 'Evento'}
              </h2>
              
              <div className='space-y-6'>
                {/* Imágenes */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Imagen de portada <span className='text-red-500'>*</span></p>
                    <div
                      {...getRootPropsPortrait()}
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                        isDragActivePortrait 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <input {...getInputPropsPortrait()} />
                      <ArrowUpTrayIcon className='w-8 h-8 text-gray-400 mb-2' />
                      <span className='text-gray-600 text-sm text-center mb-1'>Arrastra la imagen aquí o haz click</span>
                      <span className='text-xs text-gray-500 text-center'>Formatos: JPG, PNG. Solo una imagen.</span>
                      {portraitImageArray[0] && (
                        <img
                          src={portraitImageArray[0].preview || URL.createObjectURL(portraitImageArray[0])}
                          alt='Portada'
                          className='w-24 h-24 object-cover mt-3 rounded-lg shadow-sm'
                        />
                      )}
                    </div>
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Imagen de portada móvil</p>
                    <div
                      {...getRootPropsPortraitMobile()}
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                        isDragActivePortraitMobile 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <input {...getInputPropsPortraitMobile()} />
                      <ArrowUpTrayIcon className='w-8 h-8 text-gray-400 mb-2' />
                      <span className='text-gray-600 text-sm text-center mb-1'>Arrastra la imagen aquí o haz click</span>
                      <span className='text-xs text-gray-500 text-center'>Recomendado: 9:16 ratio</span>
                      {portraitMobileImageArray[0] && (
                        <img
                          src={portraitMobileImageArray[0].preview || URL.createObjectURL(portraitMobileImageArray[0])}
                          alt='Portada Móvil'
                          className='w-24 h-24 object-cover mt-3 rounded-lg shadow-sm'
                        />
                      )}
                    </div>
                  </label>
                </div>

                {/* PDF de presentación */}
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>PDF de presentación</p>
                  <div
                    {...getRootPropsPdfPresentacion()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                      isDragActivePdfPresentacion 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPdfPresentacion()} />
                    <DocumentIcon className='w-8 h-8 text-gray-400 mb-2' />
                    <span className='text-gray-600 text-sm text-center mb-1'>Arrastra el PDF aquí o haz click</span>
                    <span className='text-xs text-gray-500 text-center'>Solo formato PDF</span>
                    {pdfPresentacion && (
                      <div className='mt-3 flex items-center space-x-2 bg-green-50 p-2 rounded-lg'>
                        <AiOutlineCheckCircle className='text-green-500' />
                        <span className='text-sm text-green-700 font-medium'>{pdfPresentacion.name}</span>
                        <span className='text-xs text-gray-500'>
                          ({(pdfPresentacion.size / (1024 * 1024)).toFixed(1)}MB)
                        </span>
                      </div>
                    )}
                  </div>
                </label>

                {/* Beneficios */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium text-gray-700'>Beneficios incluidos</p>
                  <div className='space-y-2'>
                    {beneficios.map((beneficio, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
                        <span className='flex-1 text-gray-700'>{beneficio}</span>
                        <button
                          type='button'
                          onClick={() => eliminarBeneficio(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className='flex space-x-2'>
                    <input
                      type='text'
                      value={nuevoBeneficio}
                      onChange={(e) => setNuevoBeneficio(e.target.value)}
                      placeholder='Agregar nuevo beneficio...'
                      className='input border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors flex-1'
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarBeneficio())}
                    />
                    <button
                      type='button'
                      onClick={agregarBeneficio}
                      className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium'
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Aprendizajes */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium text-gray-700'>¿Qué vas a aprender?</p>
                  <div className='space-y-2'>
                    {aprendizajes.map((apr, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></div>
                        <span className='flex-1 text-gray-700'>{apr}</span>
                        <button
                          type='button'
                          onClick={() => eliminarAprendizaje(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className='flex space-x-2'>
                    <input
                      type='text'
                      value={nuevoAprendizaje}
                      onChange={(e) => setNuevoAprendizaje(e.target.value)}
                      placeholder='Agregar nuevo aprendizaje...'
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors flex-1'
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarAprendizaje())}
                    />
                    <button
                      type='button'
                      onClick={agregarAprendizaje}
                      className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium'
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Para quién */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium text-gray-700'>¿Para quién es este {tipo === 'programa_transformacional' ? 'programa' : 'evento'}?</p>
                  <div className='space-y-2'>
                    {paraQuien.map((pq, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-[#234C8C] rounded-full flex-shrink-0'></div>
                        <span className='flex-1 text-gray-700'>{pq}</span>
                        <button
                          type='button'
                          onClick={() => eliminarParaQuien(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className='flex space-x-2'>
                    <input
                      type='text'
                      value={nuevoParaQuien}
                      onChange={(e) => setNuevoParaQuien(e.target.value)}
                      placeholder='Agregar nuevo destinatario...'
                      className='input border-gray-300 focus:border-[#234C8C] focus:ring-[#234C8C] transition-colors flex-1'
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarParaQuien())}
                    />
                    <button
                      type='button'
                      onClick={agregarParaQuien}
                      className='px-4 py-2 bg-[#234C8C] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Precios escalonados */}
                <div className='space-y-4'>
                  <p className='text-sm font-medium text-gray-700'>Precios escalonados</p>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {/* Early Bird */}
                    <div className='flex flex-col border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100'>
                      <div className='flex items-center mb-3'>
                        <div className='w-3 h-3 bg-green-500 rounded-full mr-2'></div>
                        <p className='font-semibold text-green-800'>Early Bird</p>
                      </div>
                      <div className='space-y-3'>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-green-700 font-medium'>Precio (USD)</span>
                          <input 
                            type='number' 
                            className='input border-green-300 focus:border-green-500 focus:ring-green-500 transition-colors text-sm' 
                            min={0} 
                            value={earlyBirdPrice} 
                            onChange={e => setEarlyBirdPrice(Number(e.target.value))} 
                          />
                        </label>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-green-700 font-medium'>Desde</span>
                          <input 
                            type='datetime-local' 
                            className='input border-green-300 focus:border-green-500 focus:ring-green-500 transition-colors text-sm' 
                            value={earlyBirdStart} 
                            onChange={e => setEarlyBirdStart(e.target.value)} 
                          />
                        </label>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-green-700 font-medium'>Hasta</span>
                          <input 
                            type='datetime-local' 
                            className='input border-green-300 focus:border-green-500 focus:ring-green-500 transition-colors text-sm' 
                            value={earlyBirdEnd} 
                            onChange={e => setEarlyBirdEnd(e.target.value)} 
                          />
                        </label>
                      </div>
                    </div>

                    {/* General */}
                    <div className='flex flex-col border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100'>
                      <div className='flex items-center mb-3'>
                        <div className='w-3 h-3 bg-blue-500 rounded-full mr-2'></div>
                        <p className='font-semibold text-blue-800'>General</p>
                      </div>
                      <div className='space-y-3'>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-blue-700 font-medium'>Precio (USD)</span>
                          <input 
                            type='number' 
                            className='input border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm' 
                            min={0} 
                            value={generalPrice} 
                            onChange={e => setGeneralPrice(Number(e.target.value))} 
                          />
                        </label>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-blue-700 font-medium'>Desde</span>
                          <input 
                            type='datetime-local' 
                            className='input border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm' 
                            value={generalStart} 
                            onChange={e => setGeneralStart(e.target.value)} 
                          />
                        </label>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-blue-700 font-medium'>Hasta</span>
                          <input 
                            type='datetime-local' 
                            className='input border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm' 
                            value={generalEnd} 
                            onChange={e => setGeneralEnd(e.target.value)} 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Last Tickets */}
                    <div className='flex flex-col border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-orange-50 to-orange-100'>
                      <div className='flex items-center mb-3'>
                        <div className='w-3 h-3 bg-orange-500 rounded-full mr-2'></div>
                        <p className='font-semibold text-orange-800'>Last Tickets</p>
                      </div>
                      <div className='space-y-3'>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-orange-700 font-medium'>Precio (USD)</span>
                          <input 
                            type='number' 
                            className='input border-orange-300 focus:border-orange-500 focus:ring-orange-500 transition-colors text-sm' 
                            min={0} 
                            value={lastTicketsPrice} 
                            onChange={e => setLastTicketsPrice(Number(e.target.value))} 
                          />
                        </label>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-orange-700 font-medium'>Desde</span>
                          <input 
                            type='datetime-local' 
                            className='input border-orange-300 focus:border-orange-500 focus:ring-orange-500 transition-colors text-sm' 
                            value={lastTicketsStart} 
                            onChange={e => setLastTicketsStart(e.target.value)} 
                          />
                        </label>
                        <label className='flex flex-col space-y-1'>
                          <span className='text-xs text-orange-700 font-medium'>Hasta</span>
                          <input 
                            type='datetime-local' 
                            className='input border-orange-300 focus:border-orange-500 focus:ring-orange-500 transition-colors text-sm' 
                            value={lastTicketsEnd} 
                            onChange={e => setLastTicketsEnd(e.target.value)} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fecha y ubicación */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Fecha y hora <span className='text-red-500'>*</span></p>
                    <input 
                      type='datetime-local' 
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors' 
                      value={fecha} 
                      onChange={e => setFecha(e.target.value)} 
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Cupo</p>
                    <input 
                      type='number' 
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors' 
                      value={cupo || ''} 
                      onChange={e => setCupo(Number(e.target.value))} 
                      min={1} 
                    />
                  </label>
                </div>

                {/* Online/Offline */}
                <div className='space-y-4'>
                  <label className='flex items-center space-x-3'>
                    <input 
                      type='checkbox' 
                      checked={online} 
                      onChange={e => setOnline(e.target.checked)} 
                      className='w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500'
                    />
                    <span className='text-sm font-medium text-gray-700'>¿Es online?</span>
                  </label>
                  
                  {!online ? (
                    <label className='relative flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Ubicación <span className='text-red-500'>*</span></p>
                      <input
                        type='text'
                        className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors'
                        value={ubicacionInput}
                        onChange={handleUbicacionInput}
                        placeholder='Ej: Montevideo, Uruguay'
                      />

                    </label>
                  ) : (
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Link del evento</p>
                      <input 
                        type='text' 
                        className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors' 
                        value={linkEvento} 
                        onChange={e => setLinkEvento(e.target.value)} 
                        placeholder='https://zoom.us/j/...'
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección: Descuento */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-yellow-600 font-bold text-sm'>3</span>
              </div>
              Código de descuento (familia y amigos)
            </h2>
            
            <div className='space-y-4'>
              <label className='flex flex-col space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Código</p>
                <input
                  type='text'
                  className='input border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 transition-colors'
                  value={codigoDescuento}
                  onChange={e => setCodigoDescuento(e.target.value)}
                  placeholder='Ej: FAMILY2024'
                />
              </label>
              <label className='flex flex-col space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Descuento (%)</p>
                <input
                  type='number'
                  className='input border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 transition-colors'
                  min={1}
                  max={100}
                  value={descuentoPorcentaje}
                  onChange={e => setDescuentoPorcentaje(Number(e.target.value))}
                  placeholder='Ej: 20'
                />
              </label>
              <label className='flex flex-col space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Máximo de usos (opcional)</p>
                <input
                  type='number'
                  className='input border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 transition-colors'
                  min={1}
                  value={descuentoMaxUsos}
                  onChange={e => setDescuentoMaxUsos(Number(e.target.value))}
                  placeholder='Ej: 10'
                />
              </label>
              <label className='flex flex-col space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Expira el (opcional)</p>
                <input
                  type='date'
                  className='input border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 transition-colors'
                  value={descuentoExpiracion}
                  onChange={e => setDescuentoExpiracion(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Sección: Galería de imágenes */}
          <div className='border-b border-gray-200 pb-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
              <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3'>
                <span className='text-indigo-600 font-bold text-sm'>4</span>
              </div>
              Galería de imágenes (opcional)
            </h2>
            
            <div className='space-y-4'>
              <label className='flex flex-col space-y-2'>
                <p className='text-sm font-medium text-gray-700'>Galería de imágenes (opcional)</p>
                <div
                  {...getRootPropsImagenes()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                    isDragActiveImagenes 
                      ? 'border-black bg-gray-100' 
                      : 'border-gray-300 bg-white hover:border-black'
                  }`}
                  onClick={() => {}}
                >
                  <input {...getInputPropsImagenes()} />
                  <ArrowUpTrayIcon className='w-8 h-8 text-gray-400 mb-2' />
                  <span className='text-gray-600 text-sm text-center mb-1'>Arrastra imágenes aquí o haz click</span>
                  <span className='text-xs text-gray-500 text-center'>Formatos: JPG, PNG, etc. Puedes subir varias.</span>
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
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Imagen de diploma (requerida)</p>
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
          </div>

          {/* Sección: Programas Transformacionales */}
          {esProgramaTransformacional && (
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-purple-600 font-bold text-sm'>5</span>
                </div>
                Configuración del Programa Transformacional
              </h2>
              
              <div className='space-y-4'>
                {/* Información básica del programa */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Duración en semanas</p>
                    <input
                      type='number'
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                      min={1}
                      max={52}
                      value={duracionSemanas}
                      onChange={e => setDuracionSemanas(Number(e.target.value))}
                    />
                  </label>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Cupo disponible</p>
                    <input
                      type='number'
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                      min={1}
                      value={cupoDisponible}
                      onChange={e => setCupoDisponible(Number(e.target.value))}
                    />
                  </label>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Estado de la cohorte</p>
                    <select className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm' value={estadoCohorte} onChange={e => setEstadoCohorte(e.target.value)}>
                      <option value='abierta'>Abierta</option>
                      <option value='cerrada'>Cerrada</option>
                      <option value='en_curso'>En Curso</option>
                      <option value='finalizada'>Finalizada</option>
                    </select>
                  </label>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Fecha de finalización</p>
                    <input
                      type='datetime-local'
                      className='input border-gray-300 bg-gray-50 text-gray-600 text-sm'
                      value={fechaFin}
                      readOnly
                    />
                    <p className='text-xs text-gray-500'>Se calcula automáticamente basada en la fecha de inicio y duración</p>
                  </label>
                </div>

                {/* Generar semanas automáticamente */}
                <div className='mb-6'>
                  <button
                    type='button'
                    onClick={generarSemanasAutomaticas}
                    className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium'
                  >
                    Generar {duracionSemanas} semanas automáticamente
                  </button>
                  <p className='text-xs text-gray-500 mt-2'>Esto generará automáticamente la estructura de semanas basada en la duración configurada</p>
                </div>

                {/* Semanas del programa */}
                {semanas.length > 0 && (
                  <div className='mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <p className='text-sm font-medium text-gray-700'>Semanas del programa ({semanas.length})</p>
                      <button
                        type='button'
                        onClick={() => setSemanas([])}
                        className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                      >
                        Limpiar todas
                      </button>
                    </div>
                    
                    <div className='space-y-3'>
                      {semanas.map((semana, index) => (
                        <div key={index} className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='font-medium text-gray-900'>{semana.titulo}</h4>
                            <div className='flex items-center space-x-2'>
                              {semana.desbloqueado && (
                                <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                                  Desbloqueada
                                </span>
                              )}
                              <button
                                type='button'
                                onClick={() => abrirModalEditarSemana(semana)}
                                className='text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors'
                              >
                                Editar
                              </button>
                              <button
                                type='button'
                                onClick={() => setSemanas(semanas.filter((_, i) => i !== index))}
                                className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                          
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <p className='text-xs text-gray-500 mb-1'>Descripción</p>
                              <p className='text-sm text-gray-700'>{semana.descripcion}</p>
                            </div>
                            <div>
                              <p className='text-xs text-gray-500 mb-1'>Fecha de desbloqueo</p>
                              <p className='text-sm text-gray-700'>
                                {semana.fechaDesbloqueo ? new Date(semana.fechaDesbloqueo).toLocaleString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'No configurada'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resultados esperados */}
                <div className='mb-6'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Resultados esperados</p>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        className='input border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors text-sm flex-1'
                        value={nuevoResultado}
                        onChange={e => setNuevoResultado(e.target.value)}
                        placeholder='Ej: Mayor consciencia corporal'
                      />
                      <button
                        type='button'
                        onClick={agregarResultado}
                        className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium'
                      >
                        Agregar
                      </button>
                    </div>
                  </label>
                  <div className='mt-2 space-y-1'>
                    {resultadosEsperados.map((resultado, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
                        <span className='flex-1 text-gray-700'>{resultado}</span>
                        <button
                          type='button'
                          onClick={() => eliminarResultado(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requisitos previos */}
                <div className='mb-6'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Requisitos previos</p>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors text-sm flex-1'
                        value={nuevoRequisito}
                        onChange={e => setNuevoRequisito(e.target.value)}
                        placeholder='Ej: No se requiere experiencia previa'
                      />
                      <button
                        type='button'
                        onClick={agregarRequisito}
                        className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium'
                      >
                        Agregar
                      </button>
                    </div>
                  </label>
                  <div className='mt-2 space-y-1'>
                    {requisitosPrevios.map((requisito, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></div>
                        <span className='flex-1 text-gray-700'>{requisito}</span>
                        <button
                          type='button'
                          onClick={() => eliminarRequisito(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materiales necesarios */}
                <div className='mb-6'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Materiales necesarios</p>
                    <div className='flex space-x-2'>
                      <input
                        type='text'
                        className='input border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors text-sm flex-1'
                        value={nuevoMaterial}
                        onChange={e => setNuevoMaterial(e.target.value)}
                        placeholder='Ej: Espacio cómodo para moverte'
                      />
                      <button
                        type='button'
                        onClick={agregarMaterial}
                        className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium'
                      >
                        Agregar
                      </button>
                    </div>
                  </label>
                  <div className='mt-2 space-y-1'>
                    {materialesNecesarios.map((material, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full flex-shrink-0'></div>
                        <span className='flex-1 text-gray-700'>{material}</span>
                        <button
                          type='button'
                          onClick={() => eliminarMaterial(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sesiones en vivo */}
                <div className='mb-6'>
                  <h4 className='font-semibold mb-3 text-gray-900'>Sesiones en vivo</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                    <input
                      type='datetime-local'
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                      value={nuevaSesion.fecha}
                      onChange={e => setNuevaSesion({...nuevaSesion, fecha: e.target.value})}
                      placeholder='Fecha y hora'
                    />
                    <input
                      type='text'
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                      value={nuevaSesion.titulo}
                      onChange={e => setNuevaSesion({...nuevaSesion, titulo: e.target.value})}
                      placeholder='Título de la sesión'
                    />
                    <input
                      type='text'
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                      value={nuevaSesion.descripcion}
                      onChange={e => setNuevaSesion({...nuevaSesion, descripcion: e.target.value})}
                      placeholder='Descripción'
                    />
                    <select
                      className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
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
                    className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium'
                  >
                    Agregar Sesión
                  </button>
                  <div className='mt-3 space-y-2'>
                    {sesionesEnVivo.map((sesion, index) => (
                      <div key={index} className='flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200'>
                        <div>
                          <div className='font-medium text-gray-900'>{sesion.titulo}</div>
                          <div className='text-sm text-gray-600'>
                            {new Date(sesion.fecha).toLocaleDateString('es-ES')} - {sesion.tipo}
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => eliminarSesionEnVivo(index)}
                          className='text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comunidad */}
                <div className='mb-6'>
                  <h4 className='font-semibold mb-3 text-gray-900'>Información de comunidad</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Grupo de WhatsApp (opcional)</p>
                      <input
                        type='url'
                        className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                        value={comunidad.grupoWhatsapp || ''}
                        onChange={e => setComunidad({...comunidad, grupoWhatsapp: e.target.value})}
                        placeholder='https://chat.whatsapp.com/...'
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Grupo de Telegram (opcional)</p>
                      <input
                        type='url'
                        className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm'
                        value={comunidad.grupoTelegram || ''}
                        onChange={e => setComunidad({...comunidad, grupoTelegram: e.target.value})}
                        placeholder='https://t.me/...'
                      />
                    </label>
                    <label className='md:col-span-2'>
                      <p className='text-sm font-medium text-gray-700'>Descripción de la comunidad</p>
                      <textarea
                        className='input border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors text-sm min-h-[80px]'
                        rows={3}
                        value={comunidad.descripcion || ''}
                        onChange={e => setComunidad({...comunidad, descripcion: e.target.value})}
                        placeholder='Describe cómo funciona la comunidad...'
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de envío mejorado */}
          <div className='pt-6 border-t border-gray-200'>
            <button
              type='submit'
              className='w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
            >
              Crear producto
            </button>
          </div>
        </form>
      </div>

      {/* Modal de edición de semana */}
      {modalEditarSemana && semanaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-2xl w-full mx-4 bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Editar {semanaEditando.titulo}</h3>
              <button
                onClick={cerrarModalEditarSemana}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la semana
                </label>
                <input
                  type="text"
                  value={semanaEditando.titulo}
                  onChange={(e) => setSemanaEditando({...semanaEditando, titulo: e.target.value})}
                  className="w-full input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Título de la semana"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={semanaEditando.descripcion}
                  onChange={(e) => setSemanaEditando({...semanaEditando, descripcion: e.target.value})}
                  className="w-full input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors min-h-[100px]"
                  placeholder="Descripción detallada de la semana"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de desbloqueo
                </label>
                <input
                  type="datetime-local"
                  value={semanaEditando.fechaDesbloqueo ? semanaEditando.fechaDesbloqueo.slice(0, 16) : ''}
                  onChange={(e) => setSemanaEditando({...semanaEditando, fechaDesbloqueo: e.target.value})}
                  className="w-full input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="desbloqueado"
                  checked={semanaEditando.desbloqueado}
                  onChange={(e) => setSemanaEditando({...semanaEditando, desbloqueado: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="desbloqueado" className="text-sm font-medium text-gray-700">
                  Semana desbloqueada
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={cerrarModalEditarSemana}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarSemanaEditada}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductStep1;
