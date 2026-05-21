'use client';

import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import requests from '../../../utils/requests';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import EditProductStep1 from './EditProductStep1';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { toast } from '../../../hooks/useToast';
import { ProductDB } from '../../../../typings';

interface Props {
  product: ProductDB;
}

const EditProduct = ({ product }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/iniciar-sesion');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/iniciar-sesion');
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
    programaTransformacionalData?: any,
    cursoConfig?: import('../../../types/cursoLanding').CursoLandingConfig,
    invitacionGrupoWhatsapp?: string,
    bioImageFile?: File | null
  ) {
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Subir nuevas imágenes si se proporcionaron
      let portada = product.portada; // Mantener la imagen actual por defecto
      let portadaMobile = product.portadaMobile; // Mantener la imagen móvil actual por defecto
      let imagenBio = product.imagenBio;
      let imagenes = product.imagenes || []; // Mantener las imágenes actuales por defecto
  
      let diplomaUrl = (product as any).diplomaUrl || ''; // Mantener el diploma actual por defecto

      // Subir nueva portada si se proporcionó
      if (portraitImageArray && portraitImageArray[0]) {
        const formData = new FormData();
        for (const file of portraitImageArray) {
          formData.append('file', file);
        }
        formData.append('upload_preset', 'my_uploads');
        const portraitData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: formData
        }).then((r) => r.json());
        portada = portraitData.public_id;
      }

      // Subir nueva portada móvil si se proporcionó
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

      if (bioImageFile) {
        const bioFormData = new FormData();
        bioFormData.append('file', bioImageFile);
        bioFormData.append('upload_preset', 'my_uploads');
        const bioData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: bioFormData,
        }).then((r) => r.json());
        imagenBio = bioData.public_id;
      }

      // Galería: strings = public_id ya en Cloudinary (edición); File/Blob = subir nuevo
      if (Array.isArray(galleryImageArray) && galleryImageArray.length > 0) {
        const existingIds = galleryImageArray.filter((item): item is string => typeof item === 'string');
        const newFiles = galleryImageArray.filter(
          (item) => item != null && typeof item !== 'string'
        );

        if (existingIds.length === galleryImageArray.length && newFiles.length === 0) {
          imagenes = existingIds;
        } else {
          const newImagenes: string[] = [];
          for (const file of newFiles) {
            if (imagenes.includes(file)) continue;
            const galeriaFormData = new FormData();
            galeriaFormData.append('file', file);
            galeriaFormData.append('upload_preset', 'my_uploads');
            const galeriaData = await fetch(requests.fetchCloudinary, {
              method: 'POST',
              body: galeriaFormData
            }).then((r) => r.json());
            if (galeriaData.public_id) newImagenes.push(galeriaData.public_id);
          }
          imagenes = [...(existingIds.length ? existingIds : imagenes), ...newImagenes];
        }
      }

      // Subir nuevo diploma si se proporcionó
      if (productType !== 'evento' && diplomaImageArray && diplomaImageArray[0]) {
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

      if (!auth.user?.email) {
        toast.error('No se pudo verificar tu sesión. Volvé a iniciar sesión.');
        setLoading(false);
        return;
      }
      const userEmail = auth.user.email;

      // Preparar datos para el envío
      const productData = {
        productId: product._id,
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
        ...(imagenBio ? { imagenBio } : {}),
        // Programa Transformacional
        ...((esProgramaTransformacional || productType === 'programa_transformacional') &&
          programaTransformacionalData && {
            esProgramaTransformacional: true,
            programaTransformacional: programaTransformacionalData,
          }),
        ...(productType === 'curso' && cursoConfig ? { cursoConfig } : {}),
        ...(productType === 'curso' && {
          invitacionGrupoWhatsapp:
            (typeof invitacionGrupoWhatsapp === 'string' ? invitacionGrupoWhatsapp.trim() : '') ||
            cursoConfig?.whatsapp?.invitacionGrupoWhatsapp?.trim() ||
            cursoConfig?.whatsapp?.grupoWhatsapp?.trim() ||
            '',
        }),
        // Descuento
        ...(descuentoObj && { descuento: descuentoObj })
      };

      // Debug: ver qué datos se envían (solo para eventos)
      if (productType === 'evento') {
        
      }

      let response;
      if (productType === 'evento' && pdfPresentacion) {
        // Usar FormData para enviar archivos
        const formData = new FormData();
        formData.append('data', JSON.stringify(productData));
        formData.append('pdfPresentacion', pdfPresentacion);
        
        response = await axios.put('/api/product/updateProduct', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Usar JSON para datos sin archivos
        response = await axios.put('/api/product/updateProduct', productData, config);
      }

      const { data } = response;

      auth.fetchUser();
      toast.success(data.message);
      router.push('/admin/productos/todos-productos');
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        const detail =
          error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al actualizar producto:', error);
        toast.error(`No se pudo actualizar el producto: ${detail}`);
      }
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <div className="">
        <EditProductStep1 handleSubmit={handleSubmit} product={product} />
      </div>
    </AdmimDashboardLayout>
  );
};

export default EditProduct; 