'use client';

import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { clearData } from '../../../redux/features/filterClass';
import requests from '../../../utils/requests';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import CreateProductStep2 from './CreateProductStep2';
import CreateProductStep1 from './CreateProductStep1';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const CreateProduct = () => {
  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false
  });

  const cookies = parseCookies();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const { stepCero, stepOne, stepTwo, stepThree } = state;

  const step0ToStep1 = () => {
    setState({ ...state, stepCero: false, stepOne: true });
  };

  const [productCreado, setProductCreado] = useState({})

  const auth = useAuth();

  // Función para comprimir imágenes
  const compressImage = (file: File, maxSizeMB: number = 1, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        const maxDimension = 1920; // Máxima dimensión

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/login');
  }, [auth.user]);

  async function handleSubmit(
    name: string,
    description: string,
    productVimeoId: string,
    productType: string,
    currency: string = 'USD',
    price: number,
    portraitImageArray: any,
    portraitMobileImageArray: any,
    diplomaImageArray: any,
    galleryImageArray: any = [],
    earlyBirdPrice?: number,
    earlyBirdStart?: string,
    earlyBirdEnd?: string,
    generalPrice?: number,
    generalStart?: string,
    generalEnd?: string,
    lastTicketsPrice?: number,
    lastTicketsStart?: string,
    lastTicketsEnd?: string,
    fecha?: string,
    ubicacionObj?: any,
    online?: boolean,
    linkEvento?: string,
    cupo?: number,
    beneficios?: string[],
    aprendizajes?: string[],
    paraQuien?: string[],
    descuentoObj?: any,
    pdfPresentacion?: any,
    esProgramaTransformacional?: boolean,
    programaTransformacionalData?: any
  ) {
    setLoading(true);



    // Validaciones robustas de imágenes
    if (!portraitImageArray || !portraitImageArray[0]) {
      toast.error('Debes subir una imagen de portada');
      setLoading(false);
      return;
    }
    if (productType !== 'evento' && (!diplomaImageArray || !diplomaImageArray[0])) {
      toast.error('Debes subir una imagen de diploma');
      setLoading(false);
      return;
    }
    // Validar tipo de archivo (solo imágenes jpg/png/jpeg)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(portraitImageArray[0].type)) {
      toast.error('La imagen de portada debe ser JPG o PNG');
      setLoading(false);
      return;
    }
    if (productType !== 'evento' && !allowedTypes.includes(diplomaImageArray[0].type)) {
      toast.error('La imagen de diploma debe ser JPG o PNG');
      setLoading(false);
      return;
    }
    // Validar tamaño (máx 5MB por imagen)
    if (portraitImageArray[0].size / 1000000 > 5) {
      toast.error('La imagen de portada es demasiado grande (máx 5MB). Por favor, comprime la imagen.');
      setLoading(false);
      return;
    }
    if (productType !== 'evento' && diplomaImageArray[0].size / 1000000 > 5) {
      toast.error('La imagen de diploma es demasiado grande (máx 5MB). Por favor, comprime la imagen.');
      setLoading(false);
      return;
    }
    
    // Validar tamaño total del payload
    let totalSize = portraitImageArray[0].size;
    if (productType !== 'evento' && diplomaImageArray[0]) {
      totalSize += diplomaImageArray[0].size;
    }
    if (portraitMobileImageArray && portraitMobileImageArray[0]) {
      totalSize += portraitMobileImageArray[0].size;
    }
    if (galleryImageArray && galleryImageArray.length > 0) {
      galleryImageArray.forEach((img: any) => totalSize += img.size);
    }
    if (pdfPresentacion) {
      totalSize += pdfPresentacion.size;
    }
    
    // Verificar que el total no exceda 20MB (para acomodar PDFs grandes)
    if (totalSize / 1000000 > 20) {
      toast.error('El tamaño total de todos los archivos excede 20MB. Por favor, reduce el tamaño de los archivos.');
      setLoading(false);
      return;
    }

    // Validar PDF si existe
    if (pdfPresentacion) {
      const pdfSize = pdfPresentacion.size / 1000000; // MB
      if (pdfSize > 20) {
        toast.error(`El PDF es demasiado grande (${pdfSize.toFixed(1)}MB). Máximo 20MB.`);
        setLoading(false);
        return;
      }
      console.log('📄 Tamaño del PDF:', pdfSize.toFixed(2), 'MB');
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Comprimir y subir portada
      const compressedPortraitFile = await compressImage(portraitImageArray[0], 1, 0.8);
      const formData = new FormData();
      formData.append('file', compressedPortraitFile);
      formData.append('upload_preset', 'my_uploads');
      const portraitData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData
      }).then((r) => r.json());
      const portada = portraitData.public_id;

      // Comprimir y subir portada móvil (opcional)
      let portadaMobile = null;
      if (portraitMobileImageArray && portraitMobileImageArray[0]) {
        const compressedMobileFile = await compressImage(portraitMobileImageArray[0], 1, 0.8);
        const mobileFormData = new FormData();
        mobileFormData.append('file', compressedMobileFile);
        mobileFormData.append('upload_preset', 'my_uploads');
        const mobilePortraitData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: mobileFormData
        }).then((r) => r.json());
        portadaMobile = mobilePortraitData.public_id;
      }

      // Subir galería de imágenes (imagenes)
      let imagenes = [];
      if (Array.isArray(galleryImageArray) && galleryImageArray.length > 0) {
        for (const file of galleryImageArray) {
          const galeriaFormData = new FormData();
          galeriaFormData.append('file', file);
          galeriaFormData.append('upload_preset', 'my_uploads');
          const galeriaData = await fetch(requests.fetchCloudinary, {
            method: 'POST',
            body: galeriaFormData
          }).then((r) => r.json());
          imagenes.push(galeriaData.public_id);
        }
      }

      // Subir diploma si corresponde
      let diplomaUrl = '';
      if (productType !== 'evento') {
        const formData2 = new FormData();
        for (const file of diplomaImageArray) {
          formData2.append('file', file);
        }
        formData2.append('upload_preset', 'my_uploads');
        const diplomaData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: formData2
        }).then((r) => r.json());
        diplomaUrl = diplomaData.public_id;
      }

      // Armar objeto de precios escalonados para eventos y programas transformacionales
      let precios = undefined;
      if (productType === 'evento' || productType === 'programa_transformacional') {
        precios = {
          earlyBird: {
            price: earlyBirdPrice,
            start: earlyBirdStart,
            end: earlyBirdEnd
          },
          general: {
            price: generalPrice,
            start: generalStart,
            end: generalEnd
          },
          lastTickets: {
            price: lastTicketsPrice,
            start: lastTicketsStart,
            end: lastTicketsEnd
          }
        };
      }

      const userEmail = auth.user.email;

      // Preparar datos para el envío
      const productData = {
        nombre: name,
        descripcion: description,
        moneda: currency,
        precio: price,
        userEmail,
        portada,
        portadaMobile,
        imagenes,
        precios,
        tipo: productType,
        productVimeoId,
        diplomaUrl,
        // Campos de evento y programa transformacional
        ...((productType === 'evento' || productType === 'programa_transformacional') && {
          fecha,
          ubicacion: ubicacionObj,
          online,
          linkEvento,
          cupo,
          beneficios: beneficios || [],
          aprendizajes: aprendizajes || [],
          paraQuien: paraQuien || [],
        }),
        // Programa Transformacional
        ...(productType === 'programa_transformacional' && {
          esProgramaTransformacional: true,
          programaTransformacional: programaTransformacionalData
        }),
        // Descuento
        ...(descuentoObj && { descuento: descuentoObj })
      };



      // Subir PDF a Cloudinary si existe (antes de crear el producto)
      let pdfPresentacionUrl = undefined;
      if ((productType === 'evento' || productType === 'programa_transformacional') && pdfPresentacion) {
        console.log('📄 Subiendo PDF a Cloudinary...');
        const pdfFormData = new FormData();
        pdfFormData.append('file', pdfPresentacion);
        pdfFormData.append('upload_preset', 'my_uploads');
        
        try {
          const pdfResponse = await fetch(requests.fetchCloudinary, {
            method: 'POST',
            body: pdfFormData
          });
          const pdfData = await pdfResponse.json();
          pdfPresentacionUrl = pdfData.public_id;
          console.log('✅ PDF subido:', pdfPresentacionUrl);
        } catch (pdfError) {
          console.error('❌ Error subiendo PDF:', pdfError);
          toast.error('Error al subir el PDF. Intenta con un archivo más pequeño.');
          setLoading(false);
          return;
        }
      }

      // Agregar la URL del PDF a los datos del producto
      if (pdfPresentacionUrl) {
        productData.pdfPresentacionUrl = pdfPresentacionUrl;
      }

      // Ahora enviar solo los datos JSON (sin archivos)
      const response = await axios.post('/api/product/createProduct', productData, config);

      const { data } = response;
      setProductCreado(data.product);
      auth.fetchUser();

      toast.success(data.message);
      
      // Si el producto no es de tipo curso, redirigir directamente a la tabla de productos
      if (productType !== 'curso') {
        router.push('/admin/products/allProducts');
      }
      
      // Limpiar arrays de imágenes y estado tras éxito
      setProductCreado({});
      // Aquí podrías agregar lógica para limpiar el formulario en CreateProductStep1 usando un callback o estado global si lo deseas
    } catch (error: any) {
      if (error.response && error.response.data) {
        if (error.response.status === 413) {
          toast.error('El tamaño de las imágenes es demasiado grande. Por favor, reduce el tamaño de las imágenes a menos de 5MB cada una.');
        } else if (error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Ocurrió un error inesperado al crear el producto.');
        }
      } else if (error.message && error.message.includes('413')) {
        toast.error('El tamaño de las imágenes es demasiado grande. Por favor, reduce el tamaño de las imágenes.');
      } else {
        toast.error('Ocurrió un error inesperado al crear el producto.');
      }
    }
    setLoading(false);
  }

  return (
    <AdmimDashboardLayout>
      {loading ? (
        <div className='md:h-[100vh] w-full flex flex-col justify-center items-center'>
          <LoadingSpinner />
          <p className='font-light text-xs text-[gray] mt-4'>
            Esto puede demorar unos segundos...
          </p>
        </div>
      ) : (
        <>
          {stepCero && <CreateProductStep1 handleSubmit={handleSubmit} />}
          {stepOne && <CreateProductStep2  productCreado={productCreado} />}
        </>
      )}
    </AdmimDashboardLayout>
  );
};

export default CreateProduct;
