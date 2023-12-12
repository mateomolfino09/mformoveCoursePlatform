import { Archive, ClassesDB, Link as Linke } from '../../typings';
import React, { useEffect, useState } from 'react';
import FileUploader from './FileUploader';
import LinkUploader from './LinkUploader';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { MdAdd, MdDelete, MdDownload, MdUpload } from 'react-icons/md';
import { useAppSelector } from '../redux/hooks';
import { useDeleteFileMutation, useDeleteLinkMutation, useGetClassQuery } from "../redux/services/classApi";
import { AiFillFileImage, AiOutlineLink } from 'react-icons/ai';
import { toast } from 'react-toastify';
import AddResources from './AddResources';
import { BsCloudUpload, BsDownload, BsUpload } from 'react-icons/bs';
import Link from 'next/link';



interface Props {
  clase: ClassesDB;
}

const ClassResources = ({ clase }: Props) => {
  const auth = useAuth()
  const router = useRouter()
  const [ add, setAdd ] = useState<boolean>(false)
  const [render, setRender] = useState<any>('');
  const [ texto, setTexto ] = useState<string>('Añadir Recursos')
  const { isLoading, isFetching, data: claseRedux, error } = useGetClassQuery({id: clase._id});
  const [files, setFiles ] = useState<Archive[] | null>(null)
  const [ deleteFile ] = useDeleteFileMutation()
  const [ deleteLink ] = useDeleteLinkMutation()

  const handleAdd = () => {
    if(render === 'link' || render === 'file' ) {
      setRender('')
    }
    else {
      setAdd(!add)
      if(!add) setTexto('Volver')
      else setTexto('Añadir Recursos')
    }
  }

  const handleDownloadFile = (file: Archive) => {
    const doc_url = file.document_url;
    const url = doc_url.substring(0,  doc_url.indexOf('upload') + 7) + 'fl_attachment/' + doc_url.substring(doc_url.indexOf('upload') + 7)
    console.log(url)
    const fileName = file.name;
    const aTag = document.createElement('a');
    aTag.href = url;
    aTag.setAttribute('download', fileName)
    document.body.appendChild(aTag) 
    aTag.click();
    aTag.remove();
   }


  const handleBack = () => {
    setRender('')
}


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
  }, [])

  useEffect(() => {

  }, [texto, claseRedux])


  return (
    <div className='p-8 lg:w-2/3'>
            {auth?.user?.rol === 'Admin' && (
              <>
                <div className='relative right-0 bottom-0 p-1 flex justify-end'>
                    <button className='rounded-md border bg-white px-2 py-1 text-black'  onClick={() => handleAdd()}>{texto}</button>
                </div>

              </>
      )}
      {add ? (
        <>
         <AddResources clase={clase} handleAdd={handleAdd} render={render} setRender={(data: any) => setRender(data)}/>
        </>
      ) : (
        <div>
            {clase.atachedFiles.length > 0 && (
                <>
                  <div>
                  <h3 className='text-lg lg:text-xl mb-8'>Lecturas recomendadas </h3>
                </div>           
                  {claseRedux?.atachedFiles.map((file: Archive, index:number) => (
                      <div key={index.toString()} className='group flex items-center my-3 justify-between py-4 px-5 rounded-md text-white cursor-pointer hover:bg-white/5 border-b border-[#24385b] border-solid transition duration-200'>
                          <AiFillFileImage className='text-white/30 group-hover:text-[#1475cf] group-hover:scale-105 transition duration-200'/>
                          <span>{file.name}.{file.format}</span>
                          <div className='flex space-x-2'>
                            <BsDownload className='h-5 w-5 text-white/30 group-hover:text-white/80 group-hover:scale-105 transition duration-200' onClick={() => handleDownloadFile(file)}/>
                          {auth.user?.rol === 'Admin' && (
                            <>
                              <MdDelete className='h-5 w-5 text-white/30 group-hover:text-white/80 group-hover:scale-105 transition duration-200' onClick={() => {
                                deleteFile({file, clase})
                                toast.success(`${file.name} eliminado correctamente`);
                              }}/>
                            </>
                              )}
                              </div>
                      
                      </div>
                  ))}
                
                </>
            )}
                {clase.links.length > 0 && (
                <>
                  <div>
                  <h3 className='text-lg lg:text-xl mb-8 mt-8'>Links relacionados </h3>
                </div>           
                  {claseRedux?.links.map((link: Linke, index:number) => (
                      <div key={index}>                     
                        <div className='group flex items-center my-3 justify-between py-4 px-5 rounded-md text-white cursor-pointer hover:bg-white/5 border-b border-[#24385b] border-solid transition duration-200'>
                          <AiOutlineLink color='' className='text-white/30 group-hover:text-[#1475cf] group-hover:scale-105 transition duration-200'/>
                          <Link 
                            href={!link.link_url.includes('http') ? 'http://' + link.link_url : link.link_url}
                            target='_blank'
                            rel='noopener noreferrer'>
                            <p className='hover:underline cursor-pointer'>{link.link_url}</p>
                            </Link>

                            <div className='flex space-x-2'>
                            <Link 
                            href={!link.link_url.includes('http') ? 'http://' + link.link_url : link.link_url}
                            target='_blank'
                            rel='noopener noreferrer'>
                            
                            <BsUpload className='h-5 w-5 text-white/30 group-hover:text-white/80 group-hover:scale-105 transition duration-200' onClick={() => {
                              
                            }}/>
                            </Link>
                            {auth.user?.rol === 'Admin' && (
                              <>
                                <MdDelete className='h-5 w-5 text-white/30 group-hover:text-white/80 group-hover:scale-105 transition duration-200' onClick={() => {
                                  deleteLink({link, clase})
                                  toast.success(`link ${link.id} eliminado correctamente`);
                                }}/>
                              </>
                              )}
                              </div>
                      
                      </div>
                    
                    </div>
                  ))}
                
                </>
            )}
            
        </div>
      )}


    </div>
  );
};

export default ClassResources;
