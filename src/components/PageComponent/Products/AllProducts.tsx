'use client';

import Head from 'next/head';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import React, { useEffect, useRef, useState } from 'react';
import { ProductDB } from '../../../../typings';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import DeleteProduct from './DeleteProduct';
import { toast } from 'react-toastify';
import endpoints from '../../../services/api';
import { Dialog } from '@headlessui/react';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import InfoModal from '../../InfoModal';
import InfoModalSection from '../../InfoModalSection';
import InfoModalField from '../../InfoModalField';

// Función para formatear fechas
const formatDate = (dateInput: string | Date) => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return String(dateInput); // Si hay error, devolver la fecha original como string
  }
};



interface Props {
    products: ProductDB[];
  }

const AllProducts = ({ products }: Props) => {

  

    let [isOpenDelete, setIsOpenDelete] = useState(false);
    const [elementos, setElementos] = useState<ProductDB[]>([]);
    const ref = useRef(null);
    const [productSelected, setProductSelected] = useState<ProductDB | null>(null);
    const router = useRouter();
    const auth = useAuth();
    let [isOpen, setIsOpen] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoProduct, setInfoProduct] = useState<ProductDB | null>(null);
    const [isOpenInfo, setIsOpenInfo] = useState(false);

  function openInfo(product: ProductDB) {
    setInfoProduct(product);
    setIsOpenInfo(true);
  }

  useEffect(() => {
        const cookies: any = Cookies.get('userToken');
        if (!cookies) {
          router.push('/login');
        }
        if (!auth.user) {
          auth.fetchUser();
        } else if (auth.user.rol != 'Admin') router.push('/login');
      }, [auth.user]);

      useEffect(() => {
        setElementos(products);
      }, [products]);

      function openModal() {
        setIsOpen(true);
      }
    function openModalDelete(product: ProductDB) {
        setProductSelected(product);
        setIsOpenDelete(true);
      }
    
      function openEdit(product: ProductDB) {
        router.push(`/admin/products/editProduct/${product._id}`);
      }

    // Función para abrir el modal informativo
    function openInfoModal(product: ProductDB) {
      setInfoProduct(product);
      setShowInfoModal(true);
    }

      const deleteProduct = async () => {
        if(productSelected) {
    
          const productId = productSelected?._id;
    
          const res = await fetch(endpoints.product.delete(productId.toString()), {
            method: 'DELETE',
            headers: {  
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
               productId
            }),
            })
    
          const data = await res.json()
          await auth.fetchUser()
          const updatedProducts = products.filter(
            (product: ProductDB) => product._id !== productSelected._id
          );
          setElementos(updatedProducts);
          if (data.success) {
            toast.success(`${productSelected.name} fue eliminado correctamente`);
          }
      
          setIsOpenDelete(false);
        }
         
      };

  return (
    <AdmimDashboardLayout>
      <div className="w-full min-h-screen font-montserrat">
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <div className="flex justify-between items-center mb-8 mt-8">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-montserrat">
                      Productos
                    </h1>
                    <p className='text-gray-600 text-lg font-montserrat'>Gestiona todos tus productos</p>
                  </div>
                  <Link href="/admin/products/createProduct">
                    <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md hover:bg-[#234C8C] hover:text-white flex items-center space-x-2 font-montserrat transition-colors duration-300">
                      <PlusCircleIcon className="w-5 h-5" />
                      <span>Crear Producto</span>
                    </button>
                  </Link>
                </div>
                <table className="min-w-full text-left text-sm font-light bg-[#F7F7F7] rounded-xl shadow font-montserrat border border-[#E5E7EB]">
                  <thead className="border-b font-medium border-[#E5E7EB] bg-white">
                    <tr>
                      <th className="px-6 py-4 text-[#1A1A1A]">Nombre</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Id</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Precio</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Moneda</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Tipo</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Activo</th>
                      <th className="px-6 py-4 text-[#1A1A1A]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elementos.map((product) => (
                      <tr key={product._id} ref={ref} className="border-b border-[#E5E7EB] text-[#222] font-montserrat bg-[#F7F7F7]">
                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#1A1A1A]">
                          <button 
                            onClick={() => openInfo(product)}
                            className="hover:text-[#234C8C] hover:underline cursor-pointer transition-colors duration-200"
                          >
                            {product.nombre}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#6B7280]">{product._id}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#1A1A1A]">{product.precio}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#1A1A1A]">{product.moneda}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#1A1A1A]">{product.tipo}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#1A1A1A]">{product.activo ? "Sí" : "No"}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex item-center justify-center border-solid border-transparent border border-collapse text-base">
                            <div className="w-6 mr-2 transform hover:text-[#A7B6C2] hover:scale-110 cursor-pointer">
                              <PencilIcon onClick={() => openEdit(product)}/>
                            </div>
                            <div className="w-6 mr-2 transform hover:text-[#FFD600] hover:scale-110 cursor-pointer border-solid border-transparent border border-collapse ">
                              <TrashIcon onClick={() => openModalDelete(product)}/>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Modal informativo del producto usando InfoModal */}
                <InfoModal
                  isOpen={isOpenInfo}
                  onClose={() => setIsOpenInfo(false)}
                  title={infoProduct?.nombre || 'Detalle del Producto'}
                  subtitle={`Tipo: ${infoProduct?.tipo || 'N/A'}`}
                  maxWidth="max-w-4xl"
                >
                  {/* Precios */}
                  {infoProduct?.tipo === 'evento' && infoProduct?.precios ? (
                    <InfoModalSection title="Precios del Evento">
                      <div className="space-y-3">
                        {infoProduct.precios.earlyBird && (
                          <InfoModalField
                            label="Early Bird"
                            value={
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-[#234C8C]">${infoProduct.precios.earlyBird.price}</span>
                                <span className="text-sm text-gray-600">
                                  {formatDate(infoProduct.precios.earlyBird.start)} - {formatDate(infoProduct.precios.earlyBird.end)}
                                </span>
                              </div>
                            }
                            showBorder={false}
                          />
                        )}
                        {infoProduct.precios.general && (
                          <InfoModalField
                            label="General"
                            value={
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-[#234C8C]">${infoProduct.precios.general.price}</span>
                                <span className="text-sm text-gray-600">
                                  {formatDate(infoProduct.precios.general.start)} - {formatDate(infoProduct.precios.general.end)}
                                </span>
                              </div>
                            }
                            showBorder={false}
                          />
                        )}
                        {infoProduct.precios.lastTickets && (
                          <InfoModalField
                            label="Últimos Tickets"
                            value={
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-[#234C8C]">${infoProduct.precios.lastTickets.price}</span>
                                <span className="text-sm text-gray-600">
                                  {formatDate(infoProduct.precios.lastTickets.start)} - {formatDate(infoProduct.precios.lastTickets.end)}
                                </span>
                              </div>
                            }
                            showBorder={false}
                          />
                        )}
                      </div>
                    </InfoModalSection>
                  ) : (
                    <InfoModalSection title="Precio">
                      <InfoModalField
                        label="Precio"
                        value={
                          <span className="text-2xl font-bold text-[#234C8C]">
                            ${infoProduct?.precio} {infoProduct?.moneda}
                          </span>
                        }
                        showBorder={false}
                      />
                    </InfoModalSection>
                  )}

                  {/* Imagen de portada */}
                  {infoProduct?.portada && (
                    <InfoModalSection title="Imagen de Portada">
                      <div className="flex justify-center">
                        <div className="w-full max-w-md aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <CldImage
                            src={infoProduct.portada} 
                            alt="Imagen de portada" 
                            className="object-cover w-full h-full rounded"
                            width={600}
                            height={400}
                            loading="lazy"
                            crop="fill"
                            quality={80}
                          />
                        </div>
                      </div>
                    </InfoModalSection>
                  )}

                  {/* Descripción */}
                  <InfoModalSection title="Descripción">
                    <InfoModalField
                      label=""
                      value={infoProduct?.descripcion || 'Sin descripción'}
                      showBorder={false}
                    />
                  </InfoModalSection>

                  {/* Links de pagos */}
                  {(() => {

                    return infoProduct?.precios && (
                      <InfoModalSection title="Links de Pagos">
                        <div className="space-y-3">
                          {infoProduct.precios.earlyBird && infoProduct.precios.earlyBird.paymentLink && (
                            <InfoModalField
                              label={`Early Bird - ${infoProduct.precios.earlyBird.price} ${infoProduct.moneda}`}
                              value={
                                <div className="flex items-center justify-between">
                                  <a 
                                    href={infoProduct.precios.earlyBird.paymentLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#234C8C] hover:text-[#1A1A1A] underline text-sm"
                                  >
                                    Ver link
                                  </a>
                                  <button 
                                    onClick={() => {
                                      if (infoProduct.precios?.earlyBird?.paymentLink) {
                                        navigator.clipboard.writeText(infoProduct.precios.earlyBird.paymentLink);
                                        toast.success('Link copiado al portapapeles');
                                      }
                                    }}
                                    className="text-gray-600 hover:text-[#234C8C] text-sm"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              }
                              showBorder={false}
                            />
                          )}
                          {infoProduct.precios.general && infoProduct.precios.general.paymentLink && (
                            <InfoModalField
                              label={`General - ${infoProduct.precios.general.price} ${infoProduct.moneda}`}
                              value={
                                <div className="flex items-center justify-between">
                                  <a 
                                    href={infoProduct.precios.general.paymentLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#234C8C] hover:text-[#1A1A1A] underline text-sm"
                                  >
                                    Ver link
                                  </a>
                                  <button 
                                    onClick={() => {
                                      if (infoProduct.precios?.general?.paymentLink) {
                                        navigator.clipboard.writeText(infoProduct.precios.general.paymentLink);
                                        toast.success('Link copiado al portapapeles');
                                      }
                                    }}
                                    className="text-gray-600 hover:text-[#234C8C] text-sm"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              }
                              showBorder={false}
                            />
                          )}
                          {infoProduct.precios.lastTickets && infoProduct.precios.lastTickets.paymentLink && (
                            <InfoModalField
                              label={`Últimos Tickets - ${infoProduct.precios.lastTickets.price} ${infoProduct.moneda}`}
                              value={
                                <div className="flex items-center justify-between">
                                  <a 
                                    href={infoProduct.precios.lastTickets.paymentLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#234C8C] hover:text-[#1A1A1A] underline text-sm"
                                  >
                                    Ver link
                                  </a>
                                  <button 
                                    onClick={() => {
                                      if (infoProduct.precios?.lastTickets?.paymentLink) {
                                        navigator.clipboard.writeText(infoProduct.precios.lastTickets.paymentLink);
                                        toast.success('Link copiado al portapapeles');
                                      }
                                    }}
                                    className="text-gray-600 hover:text-[#234C8C] text-sm"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              }
                              showBorder={false}
                            />
                          )}
                        </div>
                      </InfoModalSection>
                    );
                  })()}

                  {/* Link del evento o ubicación */}
                  {infoProduct?.linkEvento && (
                    <InfoModalSection title={infoProduct.tipo === 'evento' ? 'Link del Evento' : 'Ubicación'}>
                      <InfoModalField
                        label=""
                        value={
                          <div className="flex items-center justify-between">
                            <span className="text-black truncate flex-1 mr-2">{infoProduct.linkEvento}</span>
                            <div className="flex items-center space-x-2">
                              <a 
                                href={infoProduct.linkEvento} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#234C8C] hover:text-[#1A1A1A] underline text-sm whitespace-nowrap"
                              >
                                {infoProduct.tipo === 'evento' ? 'Unirse' : 'Ver ubicación'}
                              </a>
                              <button 
                                onClick={() => {
                                  if (infoProduct.linkEvento) {
                                    navigator.clipboard.writeText(infoProduct.linkEvento);
                                    toast.success('Link copiado al portapapeles');
                                  }
                                }}
                                className="text-gray-600 hover:text-[#234C8C] text-sm whitespace-nowrap"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                        }
                        showBorder={false}
                      />
                    </InfoModalSection>
                  )}

                  {/* PDF de presentación */}
                  {infoProduct?.pdfPresentacionUrl && (
                    <InfoModalSection title="PDF de Presentación">
                      <InfoModalField
                        label=""
                        value={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700 font-medium">
                                {infoProduct.nombre || infoProduct.name}-informacion.pdf
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a 
                                href={infoProduct.pdfPresentacionUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#234C8C] hover:text-[#1A1A1A] underline text-sm whitespace-nowrap"
                              >
                                Ver PDF
                              </a>
                              <button 
                                onClick={() => {
                                  if (infoProduct.pdfPresentacionUrl) {
                                    const link = document.createElement('a');
                                    link.href = infoProduct.pdfPresentacionUrl;
                                    link.download = `${infoProduct.nombre || infoProduct.name}-informacion.pdf`;
                                    link.target = '_blank';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }}
                                className="text-gray-600 hover:text-[#234C8C] text-sm whitespace-nowrap"
                              >
                                Descargar
                              </button>
                            </div>
                          </div>
                        }
                        showBorder={false}
                      />
                    </InfoModalSection>
                  )}

                  {/* Cupón de descuento */}
                  {infoProduct?.descuento && infoProduct.descuento.codigo && (
                    <InfoModalSection title="Cupón de Descuento">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoModalField
                          label="Código"
                          value={<span className="font-mono bg-gray-100 px-2 py-1 rounded">{infoProduct.descuento.codigo}</span>}
                          showBorder={false}
                        />
                        <InfoModalField
                          label="Porcentaje"
                          value={`${infoProduct.descuento.porcentaje}%`}
                          showBorder={false}
                        />
                        {infoProduct.descuento.maxUsos && (
                          <InfoModalField
                            label="Máximo de usos"
                            value={infoProduct.descuento.maxUsos}
                            showBorder={false}
                          />
                        )}
                        {infoProduct.descuento.expiracion && (
                          <InfoModalField
                            label="Expira"
                            value={formatDate(infoProduct.descuento.expiracion)}
                            showBorder={false}
                          />
                        )}
                      </div>
                    </InfoModalSection>
                  )}

                  {/* Beneficios del evento */}
                  {infoProduct?.tipo === 'evento' && infoProduct?.beneficios && infoProduct.beneficios.length > 0 && (
                    <InfoModalSection title="Beneficios Incluidos">
                      <div className="space-y-2">
                        {infoProduct.beneficios.map((beneficio, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <span className="text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    </InfoModalSection>
                  )}

                  {/* Para quién es este evento */}
                  {infoProduct?.tipo === 'evento' && infoProduct?.paraQuien && infoProduct.paraQuien.length > 0 && (
                    <InfoModalSection title="¿Para quién es este evento?">
                      <div className="space-y-2">
                        {infoProduct.paraQuien.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </InfoModalSection>
                  )}

                  {/* Aprendizajes del evento */}
                  {infoProduct?.tipo === 'evento' && infoProduct?.aprendizajes && infoProduct.aprendizajes.length > 0 && (
                    <InfoModalSection title="¿Qué vas a aprender?">
                      <div className="space-y-2">
                        {infoProduct.aprendizajes.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </InfoModalSection>
                  )}

                  {/* Galería de imágenes */}
                  {infoProduct?.imagenes && infoProduct.imagenes.length > 0 && (
                    <InfoModalSection title="Galería de Imágenes">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {infoProduct.imagenes.map((img, idx) => (
                          <div key={idx} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            <CldImage
                              src={img} 
                              alt={`Imagen ${idx + 1}`} 
                              className="object-cover w-full h-full rounded"
                              width={400}
                              height={400}
                              loading="lazy"
                              crop="fill"
                              quality={80}
                            />
                          </div>
                        ))}
                      </div>
                    </InfoModalSection>
                  )}

                  {/* Etiquetas */}
                  {infoProduct?.etiquetas && infoProduct.etiquetas.length > 0 && (
                    <InfoModalSection title="Etiquetas">
                      <div className="flex flex-wrap gap-2">
                        {infoProduct.etiquetas.map((tag, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </InfoModalSection>
                  )}

                  {/* ID del Producto */}
                  <InfoModalSection title="Información Técnica">
                    <InfoModalField
                      label="ID del Producto"
                      value={infoProduct?._id || 'N/A'}
                      showBorder={false}
                    />
                  </InfoModalSection>
                </InfoModal>
                {/* Modal de confirmación de borrado */}
                {isOpenDelete && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 font-montserrat">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E5E7EB]">
                      <h2 className="text-xl font-bold mb-4 text-[#1A1A1A] font-montserrat">
                        ¿Seguro que deseas eliminar este producto?
                      </h2>
                      <div className="flex justify-end space-x-4">
                        <button className="bg-[#F7F7F7] px-4 py-2 rounded font-montserrat border border-[#E5E7EB] text-[#1A1A1A]" onClick={() => setIsOpenDelete(false)}>Cancelar</button>
                        <button className="bg-[#FFD600] text-[#1A1A1A] px-4 py-2 rounded font-montserrat border border-[#FFD600]" onClick={deleteProduct}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
};

export default AllProducts;
