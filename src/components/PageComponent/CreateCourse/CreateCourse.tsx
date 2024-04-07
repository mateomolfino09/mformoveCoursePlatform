'use client';

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
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

interface User {
  id: number;
  name: string;
  rol: string;
  email: string;
  password: string;
}

const CreateCourse = () => {
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
    (state) => state.createCourseReducer.value
  );
  const {
    classesQuantity: cantidadClases,
    modules,
    modulesNumbers: moduleNumbers,
    descriptionLength,
    description,
    price,
    classesNumbers,
    breakpointTitles,
    showBreakpoints,
    courseType,
    diploma,
    questions,
    playlist_code: playlistId,
    name,
    currency: currencys,
    files
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

  async function handleSubmit(event: any) {
    console.log(courseType);
    event.preventDefault();
    setLoading(true);
    if (name.length < 5) {
      toast.error('El Nombre del curso debe tener almenos 5 caracteres');
      setLoading(false);
      return;
    } else if (playlistId.length <= 5) {
      toast.error('Debe poner una Playlist Id para el curso');
      setLoading(false);
      return;
    } else if (files.length === 0) {
      toast.error('Debe poner una imágen para el curso');
      setLoading(false);
      return;
    } else if (description.length < 30) {
      toast.error('La descripción del curso debe tener almenos 30 caracteres');
      setLoading(false);
      return;
    } else if (price == null) {
      toast.error('Debe indicar el precio del curso');
      setLoading(false);
      return;
    } else if (cantidadClases == null) {
      toast.error('Debe indicar la cantidad de clases');
      setLoading(false);
      return;
    } else if (modules == null) {
      toast.error('Debe indicar la cantidad de módulos');
      setLoading(false);
      return;
    } else if (modules == null) {
      toast.error('Debe indicar la cantidad de módulos');
      setLoading(false);
      return;
    } else if (moduleNumbers.length != modules) {
      toast.error('Debe indicar los breakpoints de los módulos');
      setLoading(false);
      return;
    } else if (breakpointTitles.length != modules) {
      toast.error('Debe indicar los títulos de los módulos');
      setLoading(false);
      return;
    } else if (
      courseType !== courseTypeConst[0] &&
      (!diploma || diploma.length === 0)
    ) {
      toast.error('Debe agregar un diploma');
      setLoading(false);
      return;
    } else if (courseType === courseTypeConst[2] && !questions) {
      toast.error('Debe agregar las preguntas para el curso');
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

      let diplomaUrl = null;

      if (courseType !== courseTypeConst[0]) {
        for (const dip of diploma) {
          formDataDiploma.append('file', dip);
        }

        formDataDiploma.append('upload_preset', 'my_uploads');
        if (diploma[0].size / 1000000 > 10) {
          toast.error('Formato Incorrecto diploma');
          return;
        }

        const diplomaData = await fetch(requests.fetchCloudinary, {
          method: 'POST',
          body: formDataDiploma
        }).then((r) => r.json());

        diplomaUrl = diplomaData?.public_id;
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

      const { data } = await axios.post(
        '/api/course/createCourse',
        {
          name,
          playlistId,
          imgUrl,
          diplomaUrl,
          questions,
          courseType,
          userEmail,
          description,
          price,
          currencys,
          moduleNumbers,
          breakpointTitles,
          cantidadClases
        },
        config
      );

      auth.fetchUser();

      toast.success(data.message);
      router.push('/admin/courses');
      dispatch(clearData());
    } catch (error: any) {
      console.log(error);
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
              <CreateCourseStepCero step0ToStep1={step0ToStep1} />
            </>
          )}
          {stepOne && (
            <CreateCourseStepOne
              step1ToStep2={step1ToStep2}
              step1ToStep0={step1ToStep0}
            />
          )}
          {stepTwo && (
            <CreateCourseStepTwo
              step2ToStep1={step2ToStep1}
              createCourse={handleSubmit}
            />
          )}
        </>
      )}
    </AdmimDashboardLayout>
  );
};

export default CreateCourse;
