'use client';

import { ClassTypes } from '../../../../typings';
import { courseTypeConst } from '../../../constants/courseType';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { clearData } from '../../../redux/features/createCoursesSlice';
import { useAppSelector } from '../../../redux/hooks';
import requests from '../../../utils/requests';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import CreateCourseStepCero from '../../CreateCourseStepCero';
import CreateCourseStepOne from '../../CreateCourseStepOne';
import CreateCourseStepTwo from '../../CreateCourseStepTwo';
import { LoadingSpinner } from '../../LoadingSpinner';
import CreateClassStepOne from './CreateClassStepOne';
import CreateClassStepTwo from './CreateClassStepTwo';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

interface Props {
  classTypes: ClassTypes[];
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
  const dispatch = useAppDispatch();
  const createCourseReducer = useAppSelector(
    (state) => state.classesModalReducer.value
  );
  const {
    typeId,
    image_url,
    descriptionLength,
    description,
    level,
    name,
    files,
    videoId,
    isFree,
    tags
  } = createCourseReducer;

  console.log(createCourseReducer);

  const { stepCero, stepOne, stepTwo, stepThree } = state;

  const auth = useAuth();

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
    const cookies: any = Cookies.get('userToken');

    console.log(auth);

    if (!cookies) {
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/login');
  }, [auth.user]);

  const [descriptionStepTwo, setDescriptionStepTwo] = useState('');

  const getDescripcion = (desc: string) => {
    setDescriptionStepTwo(desc);
  };

  const [tagsStepTwo, setTagsStepTwo] = useState([]);

  const getTags = (tags: []) => {
    setTagsStepTwo(tags);
  };

  const [videoIdStepTwo, setVideoIdStepTwo] = useState([]);

  const getVideoId = (tags: []) => {
    setVideoIdStepTwo(tags);
  };


  async function handleSubmit() {
    setLoading(true);
  
    try {
      const userEmail = auth.user.email;
      const formData = new FormData();
  
      for (const serializedFile of files) {
        const blob = await fetch(serializedFile.preview).then((res) => res.blob());
        const reconstructedFile = new File([blob], serializedFile.path || serializedFile.name, {
          type: serializedFile.type,
        });
        formData.append('file', reconstructedFile);
      }
  
      formData.append('upload_preset', 'my_uploads');
  
      const imageData = await fetch(requests.fetchCloudinary, {
        method: 'POST',
        body: formData,
      }).then((r) => r.json());
  
      const imgUrl = imageData.public_id;
  
      const { data } = await axios.post(
        '/api/individualClass/create',
        {
          name,
          image_url: imgUrl,
          totalTime: 0,
          level,
          typeId,
          userEmail,
          description: descriptionStepTwo,
          videoId:videoIdStepTwo,
          isFree,
          tags: tagsStepTwo,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      toast.success(data.message);
      router.push('/admin/classes');
      dispatch(clearData());
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error al crear la clase');
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
              <CreateClassStepOne
                step0ToStep1={step0ToStep1}
                types={classTypes}
              />
            </>
          )}
          {stepOne && (
            <CreateClassStepTwo
              step1ToStep0={step1ToStep0}
              handleSubmitClass={handleSubmit}
              getDescripcion={getDescripcion}
              getTags={getTags}
              getVideoId={getVideoId}
            />
          )}
        </>
      )}
    </AdmimDashboardLayout>
  );
};

export default CreateClass;
