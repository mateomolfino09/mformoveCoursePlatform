import { Archive, IndividualClass, Link as Linke } from '../../../../typings';
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useDeleteFileMutation, useDeleteLinkMutation, useGetClassQuery } from "../../../redux/services/individualClassApi";
import { DocumentTextIcon, LinkIcon, TrashIcon, ArrowDownTrayIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from '../../../hooks/useToast';
import AddResources from './AddResources';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';



interface Props {
  clase: IndividualClass;
}

const ClassResources = ({ clase }: Props) => {
  const auth = useAuth()
  const router = useRouter()
  const [add, setAdd] = useState<boolean>(false)
  const [render, setRender] = useState<string>('')
  const { isLoading, isFetching, data: claseRedux, error } = useGetClassQuery({id: clase.id});
  const [deleteFile] = useDeleteFileMutation()
  const [deleteLink] = useDeleteLinkMutation()

  // Memoizar recursos para evitar recálculos
  const attachedFiles = useMemo(() => {
    return claseRedux?.atachedFiles || clase?.atachedFiles || [];
  }, [claseRedux?.atachedFiles, clase?.atachedFiles]);

  const links = useMemo(() => {
    return claseRedux?.links || clase?.links || [];
  }, [claseRedux?.links, clase?.links]);

  const hasResources = useMemo(() => {
    return attachedFiles.length > 0 || links.length > 0;
  }, [attachedFiles.length, links.length]);

  const handleAdd = useCallback(() => {
    if (render === 'link' || render === 'file') {
      setRender('');
    } else {
      setAdd(!add);
    }
  }, [add, render]);

  const handleDownloadFile = useCallback((file: Archive) => {
    try {
    const doc_url = file.document_url;
      const url = doc_url.substring(0, doc_url.indexOf('upload') + 7) + 'fl_attachment/' + doc_url.substring(doc_url.indexOf('upload') + 7);
    const fileName = file.name;
    const aTag = document.createElement('a');
    aTag.href = url;
      aTag.setAttribute('download', fileName);
      document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
      toast.success('Descarga iniciada');
    } catch (error) {
      toast.error('Error al descargar el archivo');
    }
  }, []);

  const handleDeleteFile = useCallback(async (file: Archive) => {
    try {
      await deleteFile({ file, clase }).unwrap();
      toast.success(`${file.name} eliminado correctamente`);
    } catch (error: any) {
      toast.error(error?.data?.error || 'Error al eliminar el archivo');
    }
  }, [deleteFile, clase]);

  const handleDeleteLink = useCallback(async (link: Linke) => {
    try {
      await deleteLink({ link, clase }).unwrap();
      toast.success('Link eliminado correctamente');
    } catch (error: any) {
      toast.error(error?.data?.error || 'Error al eliminar el link');
    }
  }, [deleteLink, clase]);

  const formatLinkUrl = useCallback((url: string) => {
    if (!url) return '';
    return url.includes('http') ? url : `http://${url}`;
  }, []);


  if (add) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className='w-full'
      >
        <div className='mb-6'>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className='flex items-center gap-2 text-white/70 hover:text-white font-montserrat font-medium transition-colors mb-4'
          >
            <ArrowLeftIcon className='h-5 w-5' />
            Volver
          </motion.button>
        </div>
        <AddResources 
          clase={clase} 
          handleAdd={handleAdd} 
          render={render} 
          setRender={(data: string) => setRender(data)}
        />
      </motion.div>
    );
  }

  return (
    <div className='w-full space-y-8'>
      {/* Header con botón de añadir para Admin */}
            {auth?.user?.rol === 'Admin' && (
        <div className='flex justify-end'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className='bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/40 text-white px-6 py-3 rounded-full font-montserrat font-medium hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 flex items-center gap-2'
          >
            <PlusIcon className='h-5 w-5' />
            Añadir Recursos
          </motion.button>
                </div>
      )}

      {/* Estado vacío */}
      {!hasResources && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative rounded-2xl border border-amber-300/20 bg-gradient-to-br from-white/5 via-amber-500/5 to-orange-500/5 backdrop-blur-md p-12 overflow-hidden text-center'
        >
          <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl' />
          <div className='relative z-10'>
            <DocumentTextIcon className='h-16 w-16 text-white/20 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-white font-montserrat mb-2'>
              No hay recursos disponibles
            </h3>
            <p className='text-gray-400 font-montserrat text-sm'>
              {auth?.user?.rol === 'Admin' 
                ? 'Comienza añadiendo archivos o enlaces útiles para esta clase'
                : 'Esta clase aún no tiene recursos adicionales'}
            </p>
                </div>           
        </motion.div>
      )}

      {/* Archivos adjuntos */}
      {attachedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='space-y-4'
        >
          <h3 className='text-xl md:text-2xl font-extrabold text-white font-montserrat mb-6'>
            Lecturas Recomendadas
          </h3>
          <div className='space-y-3'>
            <AnimatePresence mode="popLayout">
              {attachedFiles.map((file: Archive, index: number) => (
                <motion.div
                  key={`${file.id || file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className='relative rounded-xl border border-gray-800/50 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-sm p-5 overflow-hidden group hover:border-amber-300/30 transition-all duration-300'
                >
                  <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-full blur-2xl' />
                  
                  <div className='relative z-10 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-4 flex-1 min-w-0'>
                      <div className='flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-300/30 flex items-center justify-center'>
                        <DocumentTextIcon className='h-6 w-6 text-white/90' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-white font-montserrat font-medium truncate'>
                          {file.name}
                        </p>
                        {file.format && (
                          <p className='text-gray-400 text-sm font-montserrat'>
                            {file.format.toUpperCase()}
                          </p>
                        )}
                      </div>
                </div>           

                    <div className='flex items-center gap-2'>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownloadFile(file)}
                        className='p-2 rounded-lg bg-gray-800/50 hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 transition-all duration-200'
                        title='Descargar'
                      >
                        <ArrowDownTrayIcon className='h-5 w-5' />
                      </motion.button>
                      
                      {auth?.user?.rol === 'Admin' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteFile(file)}
                          className='p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200'
                          title='Eliminar'
                        >
                          <TrashIcon className='h-5 w-5' />
                        </motion.button>
                              )}
                              </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Links relacionados */}
      {links.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className='space-y-4'
        >
          <h3 className='text-xl md:text-2xl font-extrabold text-white font-montserrat mb-6'>
            Enlaces Relacionados
          </h3>
          <div className='space-y-3'>
            <AnimatePresence mode="popLayout">
              {links.map((link: Linke, index: number) => (
                <motion.div
                  key={`link-${link.id || index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className='relative rounded-xl border border-gray-800/50 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-sm p-5 overflow-hidden group hover:border-amber-300/30 transition-all duration-300'
                >
                  <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-full blur-2xl' />
                  
                  <div className='relative z-10 flex items-center justify-between gap-4'>
                    <Link
                      href={formatLinkUrl(link.link_url)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-4 flex-1 min-w-0 group/link'
                    >
                      <div className='flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-300/30 flex items-center justify-center'>
                        <LinkIcon className='h-6 w-6 text-white/90' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-white font-montserrat font-medium truncate group-hover/link:text-amber-300 transition-colors'>
                          {link.link_url}
                        </p>
                        <p className='text-gray-400 text-sm font-montserrat'>
                          Enlace externo
                        </p>
                      </div>
                    </Link>

                    {auth?.user?.rol === 'Admin' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteLink(link)}
                        className='p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 flex-shrink-0'
                        title='Eliminar'
                      >
                        <TrashIcon className='h-5 w-5' />
                      </motion.button>
                    )}
                    </div>
                </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </motion.div>
            )}
            
      {/* Loading state */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <div className='h-10 w-10 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin' />
        </div>
      )}
    </div>
  );
};

export default ClassResources;
