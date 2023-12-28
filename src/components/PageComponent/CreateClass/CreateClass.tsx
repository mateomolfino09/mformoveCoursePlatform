'use client'
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { LoadingSpinner } from '../../LoadingSpinner';
import requests from '../../../utils/requests';
import axios from 'axios';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import CreateCourseStepOne from '../../CreateCourseStepOne';
import CreateCourseStepCero from '../../CreateCourseStepCero';
import CreateCourseStepTwo from '../../CreateCourseStepTwo';
import { courseTypeConst } from '../../../constants/courseType';
import { useAppSelector } from '../../../redux/hooks';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { clearData } from '../../../redux/features/createCoursesSlice';
import { ClassTypes } from '../../../../typings';
import CreateClassStepOne from './CreateClassStepOne';
import CreateClassStepTwo from './CreateClassStepTwo';

interface Props {  
    classTypes: ClassTypes[]
}

const CreateClass = ({ classTypes }: Props) => {
  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false
  });

  const cookies = parseCookies();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch()
  const createCourseReducer = useAppSelector(
    (state) => state.classesModalReducer.value
    );
    const { typeId, image_url, descriptionLength, description, level, name, files, videoId } = createCourseReducer

  console.log(createCourseReducer)

  const { stepCero, stepOne, stepTwo, stepThree } = state;

  const auth = useAuth()

  const step0ToStep1 = () => {
    setState({ ...state, stepCero: false, stepOne: true });
  };
  const step2ToStep3 = () => {
    setState({ ...state, stepTwo: false, stepThree: true });
  };
  const step1ToStep2 = () => {
    setState({ ...state, stepOne: false, stepTwo: true });
  };

  const step1ToStep0 = () => {
    setState({ ...state, stepCero: true, stepOne: false });
  };
  const step3ToStep2 = () => {
    setState({ ...state, stepTwo: true, stepThree: false });
  };
  const step2ToStep1 = () => {
    setState({ ...state, stepOne: true, stepTwo: false });
  };
    
    useEffect(() => {
      
      const cookies: any = Cookies.get('userToken')

      console.log(auth)
      
      if (!cookies ) {
        router.push('/login');
      }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/login');


  }, [auth.user]);

  async function handleSubmit() {
    setLoading(true);
    if (name.length < 5) {
      toast.error('El Nombre de la clase debe tener almenos 5 caracteres');
      setLoading(false);
      return;
    } else if (files.length === 0) {
      toast.error('Debe poner una imágen para la clase');
      setLoading(false);
      return;
    } else if (description.length < 30) {
      toast.error('La descripción de la clase debe tener almenos 30 caracteres');
      setLoading(false);
      return;
    } else if (level == null) {
      toast.error('Debe indicar el nivel de la clase');
      setLoading(false);
      return;
    } else if (typeId == null ) {
        toast.error('Debe indicar el tipo de clase');
        setLoading(false);
        return;
    }
    try {
      const userEmail = auth.user.email;
      const formData = new FormData();
      const formDataDiploma = new FormData();

      for (const file of files) {
        formData.append('file', file);
      }
      formData.append('upload_preset', 'my_uploads');

      if (files[0].size / 1000000 > 10) {
        toast.error('Formato Incorrecto');
        return;
      }

      //image Url -> secure_url
      const imageData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData
      }).then((r) => r.json());

      const imgUrl = imageData.public_id;

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };  

      console.log(videoId)


      const { data } = await axios.post(
        '/api/individualClass/create',
        {       
            name,
            image_url: imgUrl,
            totalTime: 0,
            level,
            typeId,
            userEmail,
            description,
            videoId
        },
        config
      );

      auth.fetchUser()

      toast.success(data.message);
      router.push('/admin/classes')
      dispatch(clearData())

    } catch (error: any) {
      console.log(error)
      toast.error(error.response.data.error);
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
            {stepCero && (
              <>
                <CreateClassStepOne step0ToStep1={step0ToStep1} types={classTypes}/>
              </>
            )                             
            }
            {stepOne && (
              <CreateClassStepTwo step1ToStep0={step1ToStep0} handleSubmitClass={handleSubmit}/>
            )}
          </>
        )}
      </AdmimDashboardLayout>
  );
};


export default CreateClass;
