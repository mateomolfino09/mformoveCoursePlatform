import React, { useEffect, useState } from 'react'
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { ClassesDB } from '../../typings';
import requests from '../utils/requests';

interface Props {
    clase: ClassesDB
}

const FileUploader = ({ clase }: Props) => {
    const [files, setFiles] = useState<any>([]);
    const [image, setImage] = useState<any>()
    const auth = useAuth()

    const { getRootProps, getInputProps }: any = useDropzone({
        onDrop: (acceptedFiles: any) => {
        setFiles(
            acceptedFiles.map((file: any) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file)
            })
            )
        );
        console.log(acceptedFiles)
        },
        multiple: true,
        accept: { '*': [] }
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const userEmail = auth.user.email;
        const formData = new FormData();
        let dataFiles: any = [] ;

        await Promise.all(files.map(async (file: any) => {
            formData.append('file', file);
    
            formData.append('upload_preset', 'my_uploads');
            
            if (file.size / 1000000 > 10) {
              console.log('tamanio incorrexcto');
              return;
            }

            const imageData = await fetch(requests.fetchCloudinary, {
                method: 'POST',
                body: formData
            }).then((r) => r.json());

            return imageData
        })).then((res) => 
            dataFiles = [...res]
        );
        

        //ALLOW IN CLOUDINARY TO WORK

        const config = {
            headers: {
              'Content-Type': 'application/json'
            }
        };

        const userId = auth.user._id;
        const claseId = clase.id;

        const { data } = await axios.put(
            '/api/class/addFiles',
            { dataFiles, userId, claseId },
            config
        );

        console.log(data)
    }

    useEffect(() => {

    }, [files])

    function handleOnChange(changeEvent: any) {
        const reader = new FileReader();
    
        reader.onload = function (onLoadEvent) {
          setImage(onLoadEvent.target?.result);
        };
    
        reader.readAsDataURL(changeEvent.target.files[0]);
      }

    const handleFileRemove = (index: number) => {
        const fileMem = [...files]
        console.log(fileMem, fileMem.splice(index, 1))
        setFiles(fileMem.splice(index, 1))
    }

  return (
        <div className='mt-4 flex flex-col items-center'>
                <div
                    className='flex items-center p-2 h-16 min-w-[15rem] rounded-md border border-white/80 relative cursor-pointer'
                    {...getRootProps()}
                >                
                <label className='w-full' onChange={handleOnChange}>
                    <input
                    name='file'
                    placeholder='File'
                    hidden
                    multiple
                    {...getInputProps()}
                    />

                    <label className='flex justify-center items-center my-0 mx-auto text-white/60'>
                    <p className='mr-2'>Agrega elementos</p> <MdCloudUpload className='w-4 h-4'/>
                    </label>
                    <label className='flex justify-center items-center mx-auto text-white/60'>
                    <p>Max Size: 10MB</p>
                    </label>
                        
                </label>
            </div>
            {files.length > 0 && (
                <>
                {files.map((file: any, index:number) => (
                    <div className='flex items-center my-3 justify-between py-4 px-5 rounded-md bg-[#e9f0ff] text-black'>
                        <AiFillFileImage color='#1475cf'/>
                        <span>{file.name}</span>
                        <MdDelete onClick={() => handleFileRemove(index)}/>
                    
                    </div>
                ))}

                <button onClick={handleSubmit} className='w-auto px-2 h-12 border rounded-md mt-4 bg-white text-black'>Adjuntar</button>
                
                </>
            )}
        </div>
  )
}

export default FileUploader