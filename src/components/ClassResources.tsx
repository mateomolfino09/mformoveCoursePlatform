import { ClassesDB } from '../../typings';
import React, { useEffect, useState } from 'react';
import FileUploader from './FileUploader';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { MdAdd } from 'react-icons/md';


interface Props {
  clase: ClassesDB;
}

const ClassResources = ({ clase }: Props) => {
  const auth = useAuth()
  const router = useRouter()
  const [ add, setAdd ] = useState<boolean>(false)
  const [ texto, setTexto ] = useState<string>('Añadir Recursos')


  const handleAdd = () => {
    setAdd(!add)
    if(!add) setTexto('Volver')
    else setTexto('Añadir Recursos')
  }

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
  }, [])

  useEffect(() => {

  }, [texto])

  return (
    <div className='p-8 lg:w-2/3'>
            {auth?.user?.rol === 'Admin' && (
        <div className='relative right-0 bottom-0 p-1 flex justify-end'>
            <button className='rounded-md border bg-white px-2 py-1 text-black hover:bg-black hover:text-white'  onClick={() => handleAdd()}>{texto}</button>
        </div>
      )}
      {add ? (
        <>
         <FileUploader clase={clase}/>

        </>
      ) : (
        <>
          <p className='mt-4'>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam
            aliquam, quidem, ad doloribus repudiandae atque illo a, vitae et
            temporibus ipsa incidunt nisi. Nobis eius dolor, similique facere vitae
            sequi! Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe
            repudiandae sit repellat eaque, illum sequi! Quos laudantium deserunt
            debitis facere nemo laborum, atque, similique doloremque voluptatem
            inventore molestias quisquam magnam! Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Incidunt perspiciatis unde nisi? Neque nam
            autem rerum accusantium, at, ipsam ipsa velit placeat deleniti facilis
            non maiores blanditiis asperiores debitis repudiandae?
          </p>
        </>
      )}


    </div>
  );
};

export default ClassResources;
