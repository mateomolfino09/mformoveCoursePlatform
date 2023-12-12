import React, { useEffect, useState } from 'react'
import { MdAdd, MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { ArrowUpTrayIcon, DocumentIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { ClassesDB, Link } from '../../typings';
import requests from '../utils/requests';
import { useGetClassQuery, useAddFilesMutation, useAddLinksMutation } from '../redux/services/classApi';
import { toast } from 'react-toastify';

interface Props {
    clase: ClassesDB
    handleAdd: any
}

const LinkUploader = ({ clase, handleAdd }: Props) => {
    const [links, setLinks] = useState<any>([]);
    const [link, setLink] = useState<any>('');
    const auth = useAuth()
    const { isLoading, isFetching, data, error } = useGetClassQuery({id: clase._id});
    const [addLinks] = useAddLinksMutation();

    const handleAddLink = () => {
        if(links.length + clase.links.length >= 5 ) return toast.error('La clase no puede superar los 4 links');
        else if(link.length < 5) return toast.error('Elija un link válido');

        console.log(link, links)
        setLinks([...links, link])
        setLink('')
    }

    const handleSubmit = async (e: any) => {
        if(links.length > 0) {
            try {
                e.preventDefault();
                //ALLOW IN CLOUDINARY TO WORK
        
                const userId = auth.user._id;
                const claseId = clase._id;
        
                await addLinks({ links , userId, claseId }).unwrap()
                toast.success(`links agregados correctamente`);
        
                console.log(data)
                
            } catch (error: any) {
                toast.error(error.data.error);
                console.log(error)
            }
        }
        else return toast.error('Debe agregar a lo sumo un link');

    }

    useEffect(() => {
        console.log(links)
    }, [links])

    const handleLinkRemove = (index: number) => {
        const linkMem = [...links]
        setLinks((oldLinks: string[]) => oldLinks.filter((val, i) => i != index))
    }

  return (
        <div className='mt-4 flex flex-col items-center'>
                <div
                    className='flex items-center rounded-md border border-white/80 relative cursor-pointer'
                    
                >                
                <label className='w-full' >
                    <input
                    name='file'
                    placeholder='Agregar Link'
                    multiple
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className='input !py-1 bg-dark focus:bg-[#1d1e20] placeholder:text-white/60 placeholder:text-base'
                    />
                </label>
                <MdAdd className='relative right-2' onClick={handleAddLink}/>
            </div>
            <ul className='mt-4 flex flex-col items-center list-disc'>
            {links.length > 0 && links.map((lin: string, index: number) => (
                <>
                    <div className='flex space-x-2 justify-center items-center' key={index}>
                        <li className='font-bold list-inside w-full'>{lin}</li> <TrashIcon onClick={() => handleLinkRemove(index)} className='h-4 w-4'/>                
                    </div>
                    
                
                </>
                    ))}
            </ul>
            <button onClick={handleSubmit} className='w-full md:w-2/3 lg:w-auto px-2 h-8 border rounded-md mt-4 bg-white text-black'>Adjuntar</button>

        </div>
  )
}

export default LinkUploader