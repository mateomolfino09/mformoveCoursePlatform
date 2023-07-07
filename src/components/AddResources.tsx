import React, { useEffect, useState } from 'react'
import { MdAdd, MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { ClassesDB } from '../../typings';
import requests from '../utils/requests';
import { useGetClassQuery, useAddFilesMutation, useAddLinksMutation } from '../redux/services/classApi';
import { toast } from 'react-toastify';
import FileUploader from './FileUploader';
import LinkUploader from './LinkUploader';

interface Props {
    clase: ClassesDB
    handleAdd: any
    render: any
    setRender: any
}

const AddResources = ({ clase, handleAdd, render, setRender }: Props) => {
    const auth = useAuth()
    const { isLoading, isFetching, data, error } = useGetClassQuery({id: clase._id});
    const [addLinks] = useAddLinksMutation();

    const handleBack = () => {
        setRender('')
    }


  return (
    <>
        {render === '' && (
            <div className='mt-4 flex flex-col space-y-6 items-center'>
                <div className=''>
                    <button className='w-72 h-12 bg-white text-black rounded-md' onClick={() => setRender('file')}> Archivos</button>
                </div>
                <div className=''>
                    <button className='w-72 h-12 bg-white text-black rounded-md' onClick={() => setRender('link')}> Links</button>
                </div>
            </div>
        )}
        {render === 'file' && (
            <FileUploader clase={clase} handleAdd={handleAdd} handleBack={handleBack}/>
        )}
        {render === 'link' && (
         <LinkUploader clase={clase} handleAdd={handleAdd}/>
        )}
    
    </>
  )
}

export default AddResources