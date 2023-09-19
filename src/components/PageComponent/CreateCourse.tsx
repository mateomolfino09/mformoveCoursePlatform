'use client'
import AdmimDashboardLayout from '../AdmimDashboardLayout';
import { LoadingSpinner } from '../LoadingSpinner';
import requests from '../../utils/requests';
import axios from 'axios';
import Head from 'next/head';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import CreateCourseStepOne from '../CreateCourseStepOne';
import CreateCourseStepCero from '../CreateCourseStepCero';
import CreateCourseStepTwo from '../CreateCourseStepTwo';
import { courseTypeConst } from '../../constants/courseType';

interface User {
  id: number;
  name: string;
  rol: string;
  email: string;
  password: string;
}

const CreateCourse = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [image, setImage] = useState<string | ArrayBuffer | null | undefined>(
    null
  );
  const [password, setPassword] = useState('');
  const [state, setState] = useState({
    stepCero: true,
    stepOne: false,
    stepTwo: false,
    stepThree: false
  });

  const clearData = () => {
    setState({
      ...state,
      stepCero: true,
      stepOne: false,
      stepTwo: false,
      stepThree: false
    });
  };
  const cookies = parseCookies();
  const router = useRouter();
  const [files, setFiles] = useState<any>([]);
  const [diploma, setDiploma] = useState<any>([]);
  const [questions, setQuestions] = useState<any>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [cantidadClases, setCantidadClases] = useState<number | null>(null);
  const [modules, setModules] = useState<number | null>(null);
  const [moduleNumbers, setModuleNumbers] = useState<number[]>([]);
  const [classesNumbers, setClassesNumbers] = useState<number[]>([]);
  const [breakpointTitles, setBreakpointTitles] = useState<string[]>([]);
  const [showBreakpoints, setShowBreakpoints] = useState<boolean>(false);
  const [currencys, setCurrency] = useState<string>('$');
  const [loading, setLoading] = useState<boolean>(false);
  const [courseType, setCourseType] = useState<string>('');

  const [descriptionLength, setDescriptionLength] = useState<number>(
    description.length
  );

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

  const setDataStepCero = (
    nombre: string,
    idPlaylist: string,
    files: any,
  ) => {
    setName(nombre);
    setPlaylistId(idPlaylist);
    setFiles(files)

    console.log(nombre, idPlaylist, files)
  };
  
  const setDataStepOne = (
    description: any, 
    descriptionLength: any,
    price: any, 
    modules: any,
    cantidadClases: any, 
    moduleNumbers: any, 
    classesNumbers: any, 
    breakpointTitles: any, 
    currencys: any
    ) => {
      setDescription(description)
      setDescriptionLength(descriptionLength)
      setPrice(price);
      setModules(modules)
      setCantidadClases(cantidadClases)
      setModuleNumbers(moduleNumbers)
      setClassesNumbers(classesNumbers)
      setBreakpointTitles(breakpointTitles)
      setCurrency(currencys)
    };

    const setDataStepTwo = (
      courseType: string,
      diploma: any,
      questions: any
    ) => {
      console.log(courseType)
      setCourseType(courseType)  
      setDiploma(diploma)
      setQuestions(questions)
    };
    
    useEffect(() => {
      
      const cookies: any = Cookies.get('userToken')
      
      if (!cookies ) {
        router.push('/user/login');
      }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/user/login');


  }, [auth.user]);

  const { getRootProps, getInputProps }: any = useDropzone({
    onDrop: (acceptedFiles: any) => {
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    multiple: false,
    accept: { 'image/*': [] }
  });

  const images = files.map((file: any) => (
    <img
      src={file.preview}
      key={file.name}
      alt='image'
      className='cursor-pointer object-cover w-full h-full absolute'
    />
  ));

  useEffect(() => {
    if (cantidadClases !== null && modules != null) {
      const classesNums = [];
      for (let index = 0; index < cantidadClases; index++) {
        classesNums.push(index);
      }
      setClassesNumbers(classesNums);
      setShowBreakpoints(true);
    } else {
      setShowBreakpoints(false);
      setClassesNumbers([]);
    }
  }, [cantidadClases, modules]);

  useEffect(() => {}, [moduleNumbers, setModuleNumbers]);

  const handleModuleSelection = (num: number) => {
    if (moduleNumbers.length === modules) {
      if (moduleNumbers.includes(num) && num != 1) {
        let modules = [...moduleNumbers];
        modules.splice(modules.indexOf(num), 1).sort((a, b) => a - b);
        setModuleNumbers(modules);
      }
    } else {
      if (moduleNumbers.includes(num) && num != 1) {
        let modules = [...moduleNumbers];
        modules.splice(modules.indexOf(num), 1).sort((a, b) => a - b);
        setModuleNumbers(modules);
      } else {
        if (num != 1) {
          let modules = [...moduleNumbers, num].sort((a, b) => a - b);
          setModuleNumbers(modules);
        }
      }
    }
  };

  const handleModuleTitle = (title: string, index: number, value: number) => {
    let breakpointsTitles = [...breakpointTitles];
    breakpointsTitles[index] = title;
    setBreakpointTitles(breakpointsTitles);
  };

  async function handleSubmit(event: any, courseTypeSend: string, diplomaSend: any, questionsSend: any) {
    event.preventDefault();
    console.log(courseTypeSend, courseTypeConst[0])
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
    } else if (courseTypeSend !== courseTypeConst[0] && (!diplomaSend || diplomaSend.length === 0)) {
      toast.error('Debe agregar un diploma');
      setLoading(false);
      return;
    } else if (courseTypeSend === courseTypeConst[2] && !questionsSend) {
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

      let diplomaUrl = null

      if(courseTypeSend !== courseTypeConst[0]) {
        for (const dip of diplomaSend) {
          formDataDiploma.append('file', dip);
        }

        formDataDiploma.append('upload_preset', 'my_uploads');
        if (diplomaSend[0].size / 1000000 > 10) {
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



      console.log(imageData);

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
          questions: questionsSend,
          courseType: courseTypeSend,
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

      toast.success(data.message);
    } catch (error: any) {
      console.log(error)
      toast.error(error.response.data.error);
    }
    setLoading(false);
  }

  function handleOnChange(changeEvent: any) {
    const reader = new FileReader();

    reader.onload = function (onLoadEvent) {
      setImage(onLoadEvent.target?.result);
    };

    reader.readAsDataURL(changeEvent.target.files[0]);
  }

  return (
      <AdmimDashboardLayout>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
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
                <CreateCourseStepCero setDataStepCero={setDataStepCero} step0ToStep1={step0ToStep1} nameOr={name} playlistIdOr={playlistId} filesOr={files}/>
              </>
            )                             
            }
            {stepOne && (
              <CreateCourseStepOne setDataStepOne={setDataStepOne} step1ToStep2={step1ToStep2} step1ToStep0={step1ToStep0} descriptionReg
              ={description} 
              descriptionLengthReg={descriptionLength}
              priceReg= {price} 
              modulesReg={modules}
              cantidadClasesReg= {cantidadClases} 
              moduleNumbersReg= {moduleNumbers} 
              classesNumbersReg= {classesNumbers} 
              breakpointTitlesReg= {breakpointTitles}
              currencysReg= {currencys}
              showBreakpointsReg={showBreakpoints}/>
            )}
            {stepTwo && (
              <CreateCourseStepTwo setDataStepTwo={setDataStepTwo} step2ToStep1={step2ToStep1} courseTypeReg={courseType} createCourse={handleSubmit}/>
            )}
          </>
        )}
      </AdmimDashboardLayout>
  );
};


export default CreateCourse;
