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
    // Validar tamaño (máx 10MB)
    if (portraitImageArray[0].size / 1000000 > 10) {
      toast.error('La imagen de portada es demasiado grande (máx 10MB)');
      setLoading(false);
      return;
    }
    if (productType !== 'evento' && diplomaImageArray[0].size / 1000000 > 10) {
      toast.error('La imagen de diploma es demasiado grande (máx 10MB)');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Subir portada
      const formData = new FormData();
      for (const file of portraitImageArray) {
        formData.append('file', file);
      }
      formData.append('upload_preset', 'my_uploads');
      const portraitData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData
      }).then((r) => r.json());
      const portada = portraitData.public_id;

      // Subir portada móvil (opcional)
      let portadaMobile = null;
      if (portraitMobileImageArray && portraitMobileImageArray[0]) {
        const mobileFormData = new FormData();
        for (const file of portraitMobileImageArray) {
          mobileFormData.append('file', file);
        }
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

      // Armar objeto de precios escalonados para eventos
      let precios = undefined;
      if (productType === 'evento') {
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
        // Campos de evento
        ...(productType === 'evento' && {
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
        ...(esProgramaTransformacional && {
          esProgramaTransformacional: true,
          programaTransformacional: programaTransformacionalData
        }),
        // Descuento
        ...(descuentoObj && { descuento: descuentoObj })
      };



      let response;
      if (productType === 'evento' && pdfPresentacion) {
        // Usar FormData para enviar archivos
        const formData = new FormData();
        formData.append('data', JSON.stringify(productData));
        formData.append('pdfPresentacion', pdfPresentacion);
        
        response = await axios.post('/api/product/createProduct', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Usar JSON para datos sin archivos
        response = await axios.post('/api/product/createProduct', productData, config);
      }

      const { data } = response;
      setProductCreado(data.product);
      auth.fetchUser();

      toast.success(data.message);
      // Limpiar arrays de imágenes y estado tras éxito
      setProductCreado({});
      // Aquí podrías agregar lógica para limpiar el formulario en CreateProductStep1 usando un callback o estado global si lo deseas
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
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
