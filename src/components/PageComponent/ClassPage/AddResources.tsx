import React, { useEffect, useState } from 'react'
import { MdAdd, MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { ClassesDB } from '../../../../typings';
import requests from '../../../utils/requests';
import { useGetClassQuery, useAddFilesMutation, useAddLinksMutation } from '../../../redux/services/individualClassApi';
import { toast } from '../../../hooks/useToast';
import FileUploader from './FileUploader';
import LinkUploader from './LinkUploader';
import { IndividualClass } from '../../../../typings';

interface Props {
    clase: IndividualClass
    handleAdd: any
    render: any
    setRender: any
}

const AddResources = ({ clase, handleAdd, render, setRender }: Props) => {
    const auth = useAuth()
    const { isLoading, isFetching, data, error } = useGetClassQuery({id: clase.id});
    const [addLinks] = useAddLinksMutation();

    const handleBack = () => {
        setRender('')
    }


  return (
    <>
        {render === '' && (
            <div className='mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center justify-center'>
                <button
                  className='w-full sm:w-56 h-12 bg-palette-sage/15 border border-palette-sage/40 text-palette-ink rounded-xl font-montserrat font-medium hover:bg-palette-sage/25 hover:border-palette-sage transition-all duration-200'
                  onClick={() => setRender('file')}
                >
                  Archivos
                </button>
                <button
                  className='w-full sm:w-56 h-12 bg-palette-sage/15 border border-palette-sage/40 text-palette-ink rounded-xl font-montserrat font-medium hover:bg-palette-sage/25 hover:border-palette-sage transition-all duration-200'
                  onClick={() => setRender('link')}
                >
                  Links
                </button>
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