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
    <div className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'>
      <form
        className='relative mt-16 space-y-4 rounded px-8 md:min-w-[40rem] md:px-14'
        autoComplete='nope'
        onSubmit={handleSubmitLocal}
      >
        <div className='space-y-8'>
          <label className='flex flex-col space-y-3 w-full'>
            <p className='text-white'>Nombre del producto</p>
            <input
              type='text'
              placeholder='Nombre'
              value={name}
              className='input text-white'
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          
          <label className='flex flex-col space-y-3 w-full'>
            <p className='text-white'>Descripción</p>
            <textarea
              placeholder='Descripción'
              className='input text-white'
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
            <p className='text-white'>Tipo de producto</p>
            <select className='input text-white' value={tipo} onChange={e => setTipo(e.target.value)}>
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
              <span className='text-sm text-white'>
                Es un programa transformacional de 8 semanas
              </span>
            </label>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <label className='flex flex-col space-y-3 w-full'>
              <p className='text-white'>Precio</p>
              <input
                type='number'
                placeholder='0.00'
                min='0'
                step='0.01'
                value={price}
                className='input text-white'
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
            
            <label className='flex flex-col space-y-3 w-full'>
              <p className='text-white'>Moneda</p>
              <select className='input text-white' value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value='USD'>USD</option>
                <option value='EUR'>EUR</option>
                <option value='ARS'>ARS</option>
              </select>
            </label>
          </div>

          {/* Imagen de portada actual */}
          {product.portada && (
            <label className='flex flex-col space-y-3 w-full'>
              <p className='text-white'>Imagen de portada actual</p>
              <div className='border rounded p-4 bg-[#333]'>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => product.portada && openImageModal(product.portada, 'Imagen de Portada')}
                >
                  <CldImage
                    src={product.portada}
                    alt="Portada actual"
                    width={200}
                    height={150}
                    className="rounded"
                  />
                </div>
                <p className='text-sm text-gray-400 mt-2'>Click en la imagen para ver en tamaño grande. Para cambiar la imagen, sube una nueva abajo</p>
              </div>
            </label>
          )}

          {/* Imagen de portada móvil actual */}
          {product.portadaMobile && (
            <label className='flex flex-col space-y-3 w-full'>
              <p className='text-white'>Imagen de portada móvil actual</p>
              <div className='border rounded p-4 bg-[#333]'>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => product.portadaMobile && openImageModal(product.portadaMobile, 'Imagen de Portada Móvil')}
                >
                  <CldImage
                    src={product.portadaMobile}
                    alt="Portada móvil actual"
                    width={200}
                    height={150}
                    className="rounded"
                  />
                </div>
                <p className='text-sm text-gray-400 mt-2'>Click en la imagen para ver en tamaño grande. Para cambiar la imagen, sube una nueva abajo</p>
              </div>
            </label>
          )}

          {/* Campos dinámicos según tipo */}
          {tipo === 'bundle' && (
            <label className='flex flex-col space-y-3 w-full'>
              <p className='text-white'>IDs de cursos incluidos (separados por coma)</p>
              <input
                type='text'
                placeholder='Ej: 64a1..., 64a2..., 64a3...'
                value={cursosIncluidos}
                className='input text-white'
                onChange={e => setCursosIncluidos(e.target.value)}
              />
            </label>
          )}

          {tipo === 'evento' && (
            <div className='flex flex-col space-y-3 w-full'>
              {/* Imagen de portada para evento como dropzone */}
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Nueva imagen de portada (opcional)</p>
                <div
                  {...getRootPropsPortrait()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActivePortrait ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                >
                  <input {...getInputPropsPortrait()} />
                  <span className='text-gray-500 mb-2'>Arrastra la imagen aquí o haz click para seleccionar</span>
                  <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG. Solo una imagen.</span>
                  {portraitImageArray[0] && (
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(portraitImageArray[0].preview || URL.createObjectURL(portraitImageArray[0]), 'Nueva Imagen de Portada')}
                    >
                      <img
                        src={portraitImageArray[0].preview || URL.createObjectURL(portraitImageArray[0])}
                        alt='Portada'
                        className='w-32 h-32 object-cover mt-2 rounded'
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Imagen de portada móvil para evento como dropzone */}
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Nueva imagen de portada móvil (opcional)</p>
                <div
                  {...getRootPropsPortraitMobile()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActivePortraitMobile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-500'}`}
                >
                  <input {...getInputPropsPortraitMobile()} />
                  <span className='text-gray-500 mb-2'>Arrastra la imagen aquí o haz click para seleccionar</span>
                  <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG. Solo una imagen. Recomendado: 9:16 ratio.</span>
                  {portraitMobileImageArray[0] && (
                    <div 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(portraitMobileImageArray[0].preview || URL.createObjectURL(portraitMobileImageArray[0]), 'Nueva Imagen de Portada Móvil')}
                    >
                      <img
                        src={portraitMobileImageArray[0].preview || URL.createObjectURL(portraitMobileImageArray[0])}
                        alt='Portada Móvil'
                        className='w-32 h-32 object-cover mt-2 rounded'
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* PDF de presentación (opcional) */}
              <label>
                <p className='text-white'>PDF de presentación (opcional)</p>
                
                {/* Mostrar PDF actual si existe */}
                {product.pdfPresentacionUrl && !pdfPresentacion && (
                  <div className='mb-4 p-4 border rounded bg-[#333]'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className='text-white'>PDF actual: {product.nombre || product.name}-informacion.pdf</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          if (product.pdfPresentacionUrl) {
                            const link = document.createElement('a');
                            link.href = product.pdfPresentacionUrl;
                            link.download = `${product.nombre || product.name}-informacion.pdf`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors'
                      >
                        Descargar
                      </button>
                    </div>
                    <p className='text-sm text-gray-400 mt-2'>Para cambiar el PDF, sube uno nuevo abajo</p>
                  </div>
                )}
                
                <div
                  {...getRootPropsPdfPresentacion()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActivePdfPresentacion ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                >
                  <input {...getInputPropsPdfPresentacion()} />
                  <span className='text-gray-500 mb-2'>
                    {pdfPresentacion ? 'PDF seleccionado' : 'Arrastra el PDF aquí o haz click para seleccionar'}
                  </span>
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
                <p className='text-white'>Beneficios incluidos</p>
                <div className='space-y-3'>
                  {/* Lista de beneficios actuales */}
                  <div className='space-y-2'>
                    {beneficios.map((beneficio, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-white rounded-full'></div>
                        <span className='flex-1 text-white'>{beneficio}</span>
                        <button
                          type='button'
                          onClick={() => eliminarBeneficio(index)}
                          className='text-red-400 hover:text-red-300 text-sm'
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
                      className='input text-white flex-1'
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarBeneficio())}
                    />
                    <button
                      type='button'
                      onClick={agregarBeneficio}
                      className='px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors'
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </label>
              {/* Aprendizajes del evento */}
              <label>
                <p className='text-white'>¿Qué vas a aprender? (uno por línea)</p>
                <div className='space-y-3'>
                  {/* Lista de aprendizajes actuales */}
                  <div className='space-y-2'>
                    {aprendizajes.map((apr, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <span className='flex-1 text-white'>{apr}</span>
                        <button
                          type='button'
                          onClick={() => eliminarAprendizaje(index)}
                          className='text-red-400 hover:text-red-300 text-sm'
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
                      className='input text-white flex-1'
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
                <p className='text-white'>¿Para quién es este evento? (uno por línea)</p>
                <div className='space-y-3'>
                  {/* Lista de paraQuien actuales */}
                  <div className='space-y-2'>
                    {paraQuien.map((pq, index) => (
                      <div key={index} className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-[#234C8C] rounded-full'></div>
                        <span className='flex-1 text-white'>{pq}</span>
                        <button
                          type='button'
                          onClick={() => eliminarParaQuien(index)}
                          className='text-red-400 hover:text-red-300 text-sm'
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
                      className='input text-white flex-1'
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

              {/* Galería de imágenes actuales */}
              {existingGalleryImages && existingGalleryImages.length > 0 && (
                <label className='flex flex-col space-y-3 w-full'>
                  <p className='text-white'>Imágenes de galería actuales</p>
                  <div className='flex flex-wrap gap-2 border rounded p-4 bg-[#333]'>
                    {existingGalleryImages.map((img, idx) => (
                      <div key={"galeria-"+idx} className='relative w-20 h-20'>
                        <CldImage
                          src={img}
                          alt={`Imagen galería ${idx+1}`}
                          width={80}
                          height={80}
                          className='object-cover w-full h-full rounded cursor-pointer hover:opacity-80 transition-opacity'
                          onClick={() => openImageModal(img, `Imagen galería ${idx+1}`)}
                        />
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            setExistingGalleryImages(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className='absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className='text-sm text-gray-400 mt-2'>Las imágenes aquí se mantendrán salvo que las elimines o subas nuevas.</p>
                </label>
              )}

              {/* Galería de imágenes (opcional) */}
              <label>
                <p className='text-white'>Galería de imágenes (opcional)</p>
                <div
                  {...getRootPropsImagenes()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActiveImagenes ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                >
                  <input {...getInputPropsImagenes()} />
                  <span className='text-gray-500 mb-2'>Arrastra imágenes aquí o haz click para seleccionar</span>
                  <span className='text-xs text-gray-400'>Formatos permitidos: JPG, PNG, etc. Puedes subir varias.</span>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {/* Imágenes nuevas (archivos locales) */}
                    {galleryImageArray.map((img, idx) => (
                      <div key={"new-"+idx} className='relative w-20 h-20'>
                        <img 
                          src={img.preview || URL.createObjectURL(img)} 
                          alt={`img-nuevo-${idx}`} 
                          className='object-cover w-full h-full rounded cursor-pointer hover:opacity-80 transition-opacity'
                          onClick={() => openImageModal(img.preview || URL.createObjectURL(img), `Imagen nueva ${idx + 1}`)}
                        />
                        <button 
                          type='button' 
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarImagen(idx);
                          }} 
                          className='absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {/* Imágenes existentes (Cloudinary) */}
                    {existingGalleryImages.map((img, idx) => (
                      <div key={"existente-"+idx} className='relative w-20 h-20'>
                        <img 
                          src={img} 
                          alt={`img-existente-${idx}`} 
                          className='object-cover w-full h-full rounded cursor-pointer hover:opacity-80 transition-opacity'
                          onClick={() => openImageModal(img, `Imagen existente ${idx + 1}`)}
                        />
                        <button 
                          type='button' 
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarImagen(galleryImageArray.length + idx);
                          }} 
                          className='absolute top-0 right-0 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </label>

              {/* Precios y fechas escalonados */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Early Bird */}
                <div className='flex flex-col border rounded p-3'>
                  <p className='font-bold mb-1 text-white'>Early Bird</p>
                  <label>
                    <span className='text-white'>Precio (USD)</span>
                    <input type='number' className='input text-white' min={0} value={earlyBirdPrice} onChange={e => setEarlyBirdPrice(Number(e.target.value))} />
                  </label>
                  <label>
                    <span className='text-white'>Desde</span>
                    <input type='datetime-local' className='input text-white' value={earlyBirdStart} onChange={e => setEarlyBirdStart(e.target.value)} />
                  </label>
                  <label>
                    <span className='text-white'>Hasta</span>
                    <input type='datetime-local' className='input text-white' value={earlyBirdEnd} onChange={e => setEarlyBirdEnd(e.target.value)} />
                  </label>
                </div>
                {/* General */}
                <div className='flex flex-col border rounded p-3'>
                  <p className='font-bold mb-1 text-white'>General</p>
                  <label>
                    <span className='text-white'>Precio (USD)</span>
                    <input type='number' className='input text-white' min={0} value={generalPrice} onChange={e => setGeneralPrice(Number(e.target.value))} />
                  </label>
                  <label>
                    <span className='text-white'>Desde</span>
                    <input type='datetime-local' className='input text-white' value={generalStart} onChange={e => setGeneralStart(e.target.value)} />
                  </label>
                  <label>
                    <span className='text-white'>Hasta</span>
                    <input type='datetime-local' className='input text-white' value={generalEnd} onChange={e => setGeneralEnd(e.target.value)} />
                  </label>
                </div>
                {/* Last Tickets */}
                <div className='flex flex-col border rounded p-3'>
                  <p className='font-bold mb-1 text-white'>Last Tickets</p>
                  <label>
                    <span className='text-white'>Precio (USD)</span>
                    <input type='number' className='input text-white' min={0} value={lastTicketsPrice} onChange={e => setLastTicketsPrice(Number(e.target.value))} />
                  </label>
                  <label>
                    <span className='text-white'>Desde</span>
                    <input type='datetime-local' className='input text-white' value={lastTicketsStart} onChange={e => setLastTicketsStart(e.target.value)} />
                  </label>
                  <label>
                    <span className='text-white'>Hasta</span>
                    <input type='datetime-local' className='input text-white' value={lastTicketsEnd} onChange={e => setLastTicketsEnd(e.target.value)} />
                  </label>
                </div>
              </div>

              {/* Fecha y hora del evento */}
              <label>
                <p className='text-white'>Fecha y hora</p>
                <input type='datetime-local' className='input text-white' value={fecha} onChange={e => setFecha(e.target.value)} />
              </label>

              {/* ¿Es online? */}
              <label>
                <p className='text-white'>¿Es online?</p>
                <input type='checkbox' checked={online} onChange={e => setOnline(e.target.checked)} />
              </label>

              {/* Autocomplete de ubicación */}
              {!online ? (
                <label className='relative'>
                  <p className='text-white'>Ubicación</p>
                  <input
                    type='text'
                    className='input text-white'
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
                <label>
                  <p className='text-white'>Link del evento</p>
                  <input
                    type='url'
                    className='input text-white'
                    value={linkEvento}
                    onChange={e => setLinkEvento(e.target.value)}
                    placeholder='https://zoom.us/j/...'
                  />
                </label>
              )}

              {/* Cupo */}
              <label>
                <p className='text-white'>Cupo</p>
                <input
                  type='number'
                  className='input text-white'
                  value={cupo || ''}
                  onChange={e => setCupo(Number(e.target.value))}
                  placeholder='Número de cupos'
                  min='1'
                />
              </label>
            </div>
          )}

          {tipo === 'recurso' && (
            <div className='flex flex-col space-y-3 w-full'>
              <label>
                <p className='text-white'>Archivo del recurso</p>
                <div
                  {...getRootPropsArchivo()}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${isDragActiveArchivo ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-black'}`}
                >
                  <input {...getInputPropsArchivo()} />
                  <span className='text-gray-500 mb-2'>Arrastra el archivo aquí o haz click para seleccionar</span>
                  <span className='text-xs text-gray-400'>Formatos permitidos: PDF, ZIP, MP4, MP3, etc.</span>
                  {archivo && (
                    <span className='mt-2 text-sm text-black font-semibold'>
                      {archivo.name}
                    </span>
                  )}
                </div>
              </label>
            
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Tipo de archivo</p>
                <select className='input text-white' value={tipoArchivo} onChange={e => setTipoArchivo(e.target.value)}>
                  <option value='pdf'>PDF</option>
                  <option value='video'>Video</option>
                  <option value='audio'>Audio</option>
                  <option value='zip'>ZIP</option>
                </select>
              </label>
            </div>
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

          {/* Código de descuento */}
          <div className='space-y-4'>
            <h4 className='font-bold text-white'>Código de descuento (opcional)</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Código</p>
                <input
                  type='text'
                  placeholder='Ej: FAMILIA20'
                  value={codigoDescuento}
                  className='input text-white'
                  onChange={e => setCodigoDescuento(e.target.value)}
                />
              </label>
              
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Porcentaje de descuento</p>
                <input
                  type='number'
                  placeholder='20'
                  min='1'
                  max='100'
                  value={descuentoPorcentaje}
                  className='input text-white'
                  onChange={e => setDescuentoPorcentaje(Number(e.target.value))}
                />
              </label>
              
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Máximo de usos</p>
                <input
                  type='number'
                  placeholder='100'
                  min='1'
                  value={descuentoMaxUsos}
                  className='input text-white'
                  onChange={e => setDescuentoMaxUsos(Number(e.target.value))}
                />
              </label>
              
              <label className='flex flex-col space-y-3 w-full'>
                <p className='text-white'>Fecha de expiración</p>
                <input
                  type='datetime-local'
                  value={descuentoExpiracion}
                  className='input text-white'
                  onChange={e => setDescuentoExpiracion(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className='flex justify-end space-x-4 pt-6'>
            <button
              type='button'
              onClick={() => window.history.back()}
              className='px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Actualizar Producto
            </button>
          </div>
        </div>
      </form>

      {/* Modal de imagen grande */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{imageModal.title}</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex justify-center">
              <CldImage
                src={imageModal.imageUrl}
                alt={imageModal.title}
                width={800}
                height={600}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductStep1; 