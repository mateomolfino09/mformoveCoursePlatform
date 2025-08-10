'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { toast } from 'react-toastify';
import { ProductDB } from '../../../../typings';
import { CldImage } from 'next-cloudinary';
import { Dialog } from '@headlessui/react';

interface Props {
  handleSubmit: any;
  product: ProductDB;
}

const EditProductStep1 = ({ handleSubmit, product }: Props) => {
  // Debug: ver qué datos llegan
  

  // Función helper para formatear fechas
  const formatDateForInput = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Estados básicos inicializados con los valores del producto
  const [name, setName] = useState<string>(product.nombre || product.name || '');
  const [description, setDescription] = useState<string>(product.descripcion || product.description || '');
  const [descriptionLength, setDescriptionLength] = useState<number>((product.descripcion || product.description || '').length);
  const [price, setPrice] = useState<number>(product.precio || product.price || 10);
  const [productVimeoId, setProductVimeoId] = useState<string>(product.intro_video_url || '');
  const [currency, setCurrency] = useState<string>(product.moneda || 'USD');
  const [tipo, setTipo] = useState<string>(product.tipo || 'curso');
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [cursosIncluidos, setCursosIncluidos] = useState<string>('');
  const [fecha, setFecha] = useState<string>(formatDateForInput(product.fecha));
  const [ubicacion, setUbicacion] = useState<string>(product.ubicacion?.display_name || '');
  const [online, setOnline] = useState<boolean>(product.online || false);
  const [linkEvento, setLinkEvento] = useState<string>(product.linkEvento || '');
  const [cupo, setCupo] = useState<number | undefined>(product.cupo);
  const [beneficios, setBeneficios] = useState<string[]>(product.beneficios || ['Acceso completo al evento', 'Material de apoyo']);
  const [nuevoBeneficio, setNuevoBeneficio] = useState<string>('');
  const [archivo, setArchivo] = useState<any>(null);
  const [tipoArchivo, setTipoArchivo] = useState<string>(product.tipoArchivo || 'pdf');
  const [vimeoGallery, setVimeoGallery] = useState<string>('');
  const [vimeoVideos, setVimeoVideos] = useState<any[]>([]);
  const [vimeoError, setVimeoError] = useState<string>('');
  const [pdfPresentacion, setPdfPresentacion] = useState<any>(null);
  const [ubicacionInput, setUbicacionInput] = useState<string>(product.ubicacion?.display_name || '');
  const [ubicacionLat, setUbicacionLat] = useState<string>(product.ubicacion?.lat || '');
  const [ubicacionLon, setUbicacionLon] = useState<string>(product.ubicacion?.lon || '');
  const [ubicacionCiudad, setUbicacionCiudad] = useState<string>(product.ubicacion?.ciudad || '');
  const [ubicacionPais, setUbicacionPais] = useState<string>(product.ubicacion?.pais || '');
  const [ubicacionSugerencias, setUbicacionSugerencias] = useState<any[]>([]);

  // Estados para código de descuento
  const [codigoDescuento, setCodigoDescuento] = useState<string>(product.descuento?.codigo || '');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number | ''>(product.descuento?.porcentaje || '');
  const [descuentoMaxUsos, setDescuentoMaxUsos] = useState<number | ''>(product.descuento?.maxUsos || '');
  const [descuentoExpiracion, setDescuentoExpiracion] = useState<string>(formatDateForInput(product.descuento?.expiracion));

  // Precios y fechas para tickets escalonados
  const [earlyBirdPrice, setEarlyBirdPrice] = useState<number | ''>(product.precios?.earlyBird?.price || '');
  const [earlyBirdStart, setEarlyBirdStart] = useState<string>(formatDateForInput(product.precios?.earlyBird?.start) || new Date().toISOString().slice(0, 16));
  const [earlyBirdEnd, setEarlyBirdEnd] = useState<string>(formatDateForInput(product.precios?.earlyBird?.end));
  const [generalPrice, setGeneralPrice] = useState<number | ''>(product.precios?.general?.price || '');
  const [generalStart, setGeneralStart] = useState<string>(formatDateForInput(product.precios?.general?.start));
  const [generalEnd, setGeneralEnd] = useState<string>(formatDateForInput(product.precios?.general?.end));
  const [lastTicketsPrice, setLastTicketsPrice] = useState<number | ''>(product.precios?.lastTickets?.price || '');
  const [lastTicketsStart, setLastTicketsStart] = useState<string>(formatDateForInput(product.precios?.lastTickets?.start));
  const [lastTicketsEnd, setLastTicketsEnd] = useState<string>(
    formatDateForInput(product.precios?.lastTickets?.end) || formatDateForInput(product.fecha)
  );

  // Estados para imágenes
  const [portraitImageArray, setPortraitImageArray] = useState<any[]>([]);
  const [portraitMobileImageArray, setPortraitMobileImageArray] = useState<any[]>([]);
  const [diplomaImageArray, setDiplomaImageArray] = useState<any[]>([]);
  const [galleryImageArray, setGalleryImageArray] = useState<any[]>([]);
  // Estado para imágenes ya guardadas en la galería
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(product.imagenes || []);
  
  // Estado para modal de imagen
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: ''
  });

  // Estados para Programas Transformacionales
  const [esProgramaTransformacional, setEsProgramaTransformacional] = useState<boolean>(product.esProgramaTransformacional || false);
  const [duracionSemanas, setDuracionSemanas] = useState<number>(product.programaTransformacional?.duracionSemanas || 8);
  const [fechaFin, setFechaFin] = useState<string>(formatDateForInput(product.programaTransformacional?.fechaFin));
  const [cupoDisponible, setCupoDisponible] = useState<number>(product.programaTransformacional?.cupoDisponible || 50);
  const [estadoCohorte, setEstadoCohorte] = useState<string>(product.programaTransformacional?.estadoCohorte || 'abierta');
  const [semanas, setSemanas] = useState<Array<{
    numero: number;
    titulo: string;
    descripcion?: string;
    contenido: Array<{
      tipo: string;
      titulo: string;
      url?: string;
      duracion?: number;
      descripcion?: string;
      orden?: number;
    }>;
    desbloqueado: boolean;
    fechaDesbloqueo?: string;
  }>>(product.programaTransformacional?.semanas || []);
  const [sesionesEnVivo, setSesionesEnVivo] = useState<Array<{
    fecha: string;
    titulo: string;
    descripcion?: string;
    linkZoom?: string;
    grabacionUrl?: string;
    duracion?: number;
    tipo: string;
  }>>(product.programaTransformacional?.sesionesEnVivo || []);
  const [comunidad, setComunidad] = useState<{
    grupoWhatsapp?: string;
    grupoTelegram?: string;
    foroUrl?: string;
    descripcion?: string;
  }>(product.programaTransformacional?.comunidad || {});
  const [resultadosEsperados, setResultadosEsperados] = useState<string[]>(product.programaTransformacional?.resultadosEsperados || []);
  const [requisitosPrevios, setRequisitosPrevios] = useState<string[]>(product.programaTransformacional?.requisitosPrevios || []);
  const [materialesNecesarios, setMaterialesNecesarios] = useState<string[]>(product.programaTransformacional?.materialesNecesarios || []);

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

  // Debug: ver los valores inicializados
  console.log('Valores inicializados:', {
    name, description, price, currency, tipo, fecha,
    earlyBirdPrice, earlyBirdStart, earlyBirdEnd,
    generalPrice, lastTicketsPrice,
    codigoDescuento, descuentoPorcentaje
  });

  // Dropzone hooks
  const { getRootProps: getRootPropsPortrait, getInputProps: getInputPropsPortrait, isDragActive: isDragActivePortrait } = useDropzone({
    onDrop: (acceptedFiles) => setPortraitImageArray(acceptedFiles),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

  const { getRootProps: getRootPropsPortraitMobile, getInputProps: getInputPropsPortraitMobile, isDragActive: isDragActivePortraitMobile } = useDropzone({
    onDrop: (acceptedFiles) => setPortraitMobileImageArray(acceptedFiles),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

  const { getRootProps: getRootPropsImagenes, getInputProps: getInputPropsImagenes, isDragActive: isDragActiveImagenes } = useDropzone({
    onDrop: (acceptedFiles) => setGalleryImageArray(acceptedFiles),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] }
  });

  const { getRootProps: getRootPropsPdfPresentacion, getInputProps: getInputPropsPdfPresentacion, isDragActive: isDragActivePdfPresentacion } = useDropzone({
    onDrop: (acceptedFiles) => setPdfPresentacion(acceptedFiles[0]),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const { getRootProps: getRootPropsArchivo, getInputProps: getInputPropsArchivo, isDragActive: isDragActiveArchivo } = useDropzone({
    onDrop: (acceptedFiles) => setArchivo(acceptedFiles[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false
  });

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
      setVimeoVideos(result.data.data || []);
      if (!result.data.data || result.data.data.length === 0) setVimeoError('La galería no tiene videos.');
    } catch (err: any) {
      setVimeoError('Error al obtener videos de Vimeo.');
    }
  }

  const eliminarImagen = (idx: number) => {
    // Si es una imagen nueva (archivo local)
    if (idx < galleryImageArray.length) {
      const newImagenes = [...galleryImageArray];
      newImagenes.splice(idx, 1);
      setGalleryImageArray(newImagenes);
    } else {
      // Si es una imagen existente (Cloudinary)
      const realIdx = idx - galleryImageArray.length;
      const newExisting = [...existingGalleryImages];
      newExisting.splice(realIdx, 1);
      setExistingGalleryImages(newExisting);
    }
  };

  const handleUbicacionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUbicacionInput(value);
    setUbicacion(value);

    // Autocomplete de ubicación
    if (value.length > 2) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`)
        .then(res => res.json())
        .then(data => setUbicacionSugerencias(data))
        .catch(err => console.error('Error fetching location suggestions:', err));
    } else {
      setUbicacionSugerencias([]);
    }
  };

  const handleSelectUbicacion = (sug: any) => {
    setUbicacionInput(sug.display_name);
    setUbicacion(sug.display_name);
    setUbicacionLat(sug.lat);
    setUbicacionLon(sug.lon);
    setUbicacionCiudad(sug.address?.city || sug.address?.town || '');
    setUbicacionPais(sug.address?.country || '');
    setUbicacionSugerencias([]);
  };

  const openImageModal = (imageUrl: string, title: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      title
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      title: ''
    });
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

  // Estados para aprendizajes y paraQuien
  const [aprendizajes, setAprendizajes] = useState<string[]>(product.aprendizajes || []);
  const [nuevoAprendizaje, setNuevoAprendizaje] = useState<string>('');
  const [paraQuien, setParaQuien] = useState<string[]>(product.paraQuien || []);
  const [nuevoParaQuien, setNuevoParaQuien] = useState<string>('');

  const agregarAprendizaje = () => {
    if (nuevoAprendizaje.trim() && !aprendizajes.includes(nuevoAprendizaje.trim())) {
      setAprendizajes([...aprendizajes, nuevoAprendizaje.trim()]);
      setNuevoAprendizaje('');
    }
  };
  
  const eliminarAprendizaje = (index: number) => {
    setAprendizajes(aprendizajes.filter((_, i) => i !== index));
  };

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

  const handleSubmitLocal = (e: any) => {
    e.preventDefault();
    
    // Validaciones
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
        porcentaje: descuentoPorcentaje,
        maxUsos: descuentoMaxUsos || undefined,
        expiracion: descuentoExpiracion || undefined
      };
    }

    // Construir objeto de ubicación
    let ubicacionObj = undefined;
    if (tipo === 'evento' && !online && ubicacion) {
      ubicacionObj = {
        display_name: ubicacion,
        lat: ubicacionLat,
        lon: ubicacionLon,
        ciudad: ubicacionCiudad,
        pais: ubicacionPais
      };
    }

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
      productVimeoId,
      tipo,
      currency,
      price,
      portraitImageArray,
      portraitMobileImageArray,
      diplomaImageArray,
      galleryImageArray.length > 0 ? galleryImageArray : existingGalleryImages.filter(Boolean),
      earlyBirdPrice,
      earlyBirdStart,
      earlyBirdEnd,
      generalPrice,
      generalStart,
      generalEnd,
      lastTicketsPrice,
      lastTicketsStart,
      lastTicketsEnd,
      fecha,
      ubicacionObj,
      online,
      linkEvento,
      cupo,
      beneficios,
      aprendizajes.length > 0 ? aprendizajes : (product.aprendizajes || []),
      paraQuien.length > 0 ? paraQuien : (product.paraQuien || []),
      descuentoObj,
      pdfPresentacion,
      // Programa Transformacional
      esProgramaTransformacional,
      programaTransformacionalData
    );
  };

  return (
    <div className='relative flex w-full min-h-screen flex-col md:items-center md:justify-center'>
      <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}>
        {/* Header mejorado */}
        <div className='w-full flex pt-8 justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>Editar Producto</h1>
            <p className='text-gray-200'>Modifica la información de tu producto</p>
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
                  onChange={e => setTipo(e.target.value)}
                >
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

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Precio</p>
                  <input
                    type='number'
                    placeholder='0.00'
                    min='0'
                    step='0.01'
                    value={price}
                    className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </label>
                
                <label className='flex flex-col space-y-2'>
                  <p className='text-sm font-medium text-gray-700'>Moneda</p>
                  <select className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors' value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value='USD'>USD</option>
                    <option value='EUR'>EUR</option>
                    <option value='ARS'>ARS</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {/* Sección: Configuración de Precios (para eventos y programas) */}
          {(tipo === 'evento' || tipo === 'programa_transformacional') && (
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-green-600 font-bold text-sm'>2</span>
                </div>
                Configuración de Precios
              </h2>
              
              <div className='space-y-6'>
                {/* Early Bird */}
                <div className='border rounded p-4 bg-gray-50'>
                  <h3 className='font-semibold text-gray-900 mb-4'>Early Bird</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Precio</p>
                      <input
                        type='number'
                        placeholder='0.00'
                        min='0'
                        step='0.01'
                        value={earlyBirdPrice}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setEarlyBirdPrice(Number(e.target.value))}
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Fecha inicio</p>
                      <input
                        type='datetime-local'
                        value={earlyBirdStart}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setEarlyBirdStart(e.target.value)}
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Fecha fin</p>
                      <input
                        type='datetime-local'
                        value={earlyBirdEnd}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setEarlyBirdEnd(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                {/* General */}
                <div className='border rounded p-4 bg-gray-50'>
                  <h3 className='font-semibold text-gray-900 mb-4'>General</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Precio</p>
                      <input
                        type='number'
                        placeholder='0.00'
                        min='0'
                        step='0.01'
                        value={generalPrice}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setGeneralPrice(Number(e.target.value))}
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Fecha inicio</p>
                      <input
                        type='datetime-local'
                        value={generalStart}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setGeneralStart(e.target.value)}
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Fecha fin</p>
                      <input
                        type='datetime-local'
                        value={generalEnd}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setGeneralEnd(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                {/* Last Tickets */}
                <div className='border rounded p-4 bg-gray-50'>
                  <h3 className='font-semibold text-gray-900 mb-4'>Last Tickets</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Precio</p>
                      <input
                        type='number'
                        placeholder='0.00'
                        min='0'
                        step='0.01'
                        value={lastTicketsPrice}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setLastTicketsPrice(Number(e.target.value))}
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Fecha inicio</p>
                      <input
                        type='datetime-local'
                        value={lastTicketsStart}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setLastTicketsStart(e.target.value)}
                      />
                    </label>
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Fecha fin</p>
                      <input
                        type='datetime-local'
                        value={lastTicketsEnd}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setLastTicketsEnd(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección: Detalles del Evento/Programa */}
          {(tipo === 'evento' || tipo === 'programa_transformacional') && (
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-orange-600 font-bold text-sm'>3</span>
                </div>
                Detalles del Evento
              </h2>
              
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Fecha del evento</p>
                    <input
                      type='datetime-local'
                      value={fecha}
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </label>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Cupo</p>
                    <input
                      type='number'
                      placeholder='50'
                      min='1'
                      value={cupo}
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                      onChange={(e) => setCupo(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className='space-y-4'>
                  <label className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={online}
                      onChange={(e) => setOnline(e.target.checked)}
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    />
                    <span className='text-sm font-medium text-gray-700'>Evento online</span>
                  </label>
                  
                  {online && (
                    <label className='flex flex-col space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>Link del evento</p>
                      <input
                        type='url'
                        placeholder='https://meet.google.com/...'
                        value={linkEvento}
                        className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                        onChange={(e) => setLinkEvento(e.target.value)}
                      />
                    </label>
                  )}
                  
                  {!online && (
                    <div className='space-y-4'>
                      <label className='flex flex-col space-y-2'>
                        <p className='text-sm font-medium text-gray-700'>Ubicación</p>
                        <input
                          type='text'
                          placeholder='Buscar ubicación...'
                          value={ubicacion}
                          className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                          onChange={handleUbicacionInput}
                        />
                        {ubicacionSugerencias.length > 0 && (
                          <div className='border border-gray-300 rounded-md bg-white shadow-lg max-h-40 overflow-y-auto'>
                            {ubicacionSugerencias.map((sug, index) => (
                              <div
                                key={index}
                                className='px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0'
                                onClick={() => handleSelectUbicacion(sug)}
                              >
                                {sug.display_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección: Contenido y Beneficios */}
          {(tipo === 'evento' || tipo === 'programa_transformacional') && (
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-purple-600 font-bold text-sm'>4</span>
                </div>
                Contenido y Beneficios
              </h2>
              
              <div className='space-y-6'>
                {/* Beneficios */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium text-gray-700'>Beneficios incluidos</p>
                  <div className='space-y-2'>
                    {beneficios.map((beneficio, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
                        <input
                          type='text'
                          placeholder='Beneficio del evento'
                          value={beneficio}
                          className='flex-1 bg-transparent border-none focus:ring-0 text-gray-700'
                          onChange={(e) => {
                            const nuevosBeneficios = [...beneficios];
                            nuevosBeneficios[index] = e.target.value;
                            setBeneficios(nuevosBeneficios);
                          }}
                        />
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
                    {aprendizajes.map((aprendizaje, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></div>
                        <input
                          type='text'
                          placeholder='Lo que aprenderás'
                          value={aprendizaje}
                          className='flex-1 bg-transparent border-none focus:ring-0 text-gray-700'
                          onChange={(e) => {
                            const nuevosAprendizajes = [...aprendizajes];
                            nuevosAprendizajes[index] = e.target.value;
                            setAprendizajes(nuevosAprendizajes);
                          }}
                        />
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
                    {paraQuien.map((item, index) => (
                      <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-[#234C8C] rounded-full flex-shrink-0'></div>
                        <input
                          type='text'
                          placeholder='Dirigido a...'
                          value={item}
                          className='flex-1 bg-transparent border-none focus:ring-0 text-gray-700'
                          onChange={(e) => {
                            const nuevosParaQuien = [...paraQuien];
                            nuevosParaQuien[index] = e.target.value;
                            setParaQuien(nuevosParaQuien);
                          }}
                        />
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
                      placeholder='Agregar nuevo destinatario...'
                      className='input border-gray-300 focus:border-[#234C8C] focus:ring-[#234C8C] transition-colors flex-1'
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarParaQuien())}
                    />
                    <button
                      type='button'
                      onClick={agregarParaQuien}
                      className='px-4 py-2 bg-[#234C8C] text-white rounded-lg hover:bg-[#1a3a6b] transition-colors font-medium'
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección: Configuración del Programa Transformacional */}
          {(tipo === 'programa_transformacional' || esProgramaTransformacional) && (
            <div className='border-b border-gray-200 pb-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center'>
                <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-indigo-600 font-bold text-sm'>5</span>
                </div>
                Configuración del Programa Transformacional
              </h2>
              
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Duración en semanas</p>
                    <input
                      type='number'
                      placeholder='8'
                      min='1'
                      max='52'
                      value={duracionSemanas}
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                      onChange={(e) => setDuracionSemanas(Number(e.target.value))}
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Estado de la cohorte</p>
                    <select 
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors' 
                      value={estadoCohorte} 
                      onChange={e => setEstadoCohorte(e.target.value)}
                    >
                      <option value='abierta'>Abierta</option>
                      <option value='en_progreso'>En progreso</option>
                      <option value='cerrada'>Cerrada</option>
                      <option value='completada'>Completada</option>
                      <option value='cancelada'>Cancelada</option>
                      <option value='pendiente'>Pendiente</option>
                    </select>
                  </label>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Cupo disponible</p>
                    <input
                      type='number'
                      placeholder='50'
                      min='1'
                      value={cupoDisponible}
                      className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                      onChange={(e) => setCupoDisponible(Number(e.target.value))}
                    />
                  </label>
                  
                  <label className='flex flex-col space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Fecha de finalización</p>
                    <input
                      type='datetime-local'
                      value={fechaFin}
                      className='input border-gray-300 bg-gray-50 text-gray-600'
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
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-gray-700'>Semanas del programa</p>
                    <button
                      type='button'
                      onClick={() => setSemanas([...semanas, {
                        numero: semanas.length + 1,
                        titulo: `Semana ${semanas.length + 1}`,
                        descripcion: '',
                        contenido: [],
                        desbloqueado: false,
                        fechaDesbloqueo: undefined
                      }])}
                      className='px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors'
                    >
                      + Agregar semana
                    </button>
                  </div>
                  
                  <div className='space-y-3'>
                    {semanas.map((semana, index) => (
                      <div key={index} className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                        <div className='flex items-center justify-between mb-3'>
                          <h4 className='font-medium text-gray-900'>Semana {semana.numero}</h4>
                          <div className='flex items-center space-x-2'>
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
                          <label className='flex flex-col space-y-2'>
                            <p className='text-sm font-medium text-gray-700'>Título</p>
                            <input
                              type='text'
                              placeholder='Título de la semana'
                              value={semana.titulo}
                              className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                              onChange={(e) => {
                                const nuevasSemanas = [...semanas];
                                nuevasSemanas[index].titulo = e.target.value;
                                setSemanas(nuevasSemanas);
                              }}
                            />
                          </label>
                          
                          <label className='flex flex-col space-y-2'>
                            <p className='text-sm font-medium text-gray-700'>Fecha de desbloqueo</p>
                            <input
                              type='datetime-local'
                              value={semana.fechaDesbloqueo || ''}
                              className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors'
                              onChange={(e) => {
                                const nuevasSemanas = [...semanas];
                                nuevasSemanas[index].fechaDesbloqueo = e.target.value;
                                setSemanas(nuevasSemanas);
                              }}
                            />
                          </label>
                        </div>
                        
                        <label className='flex flex-col space-y-2 mt-4'>
                          <p className='text-sm font-medium text-gray-700'>Descripción</p>
                          <textarea
                            placeholder='Descripción de la semana'
                            value={semana.descripcion}
                            className='input border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors min-h-[80px]'
                            onChange={(e) => {
                              const nuevasSemanas = [...semanas];
                              nuevasSemanas[index].descripcion = e.target.value;
                              setSemanas(nuevasSemanas);
                            }}
                          />
                        </label>
                      </div>
                    ))}
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
              Actualizar Producto
            </button>
          </div>
        </form>
      </div>
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

export default EditProductStep1; 