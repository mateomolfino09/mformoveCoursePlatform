import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { countries } from '../../../../constants/countries';
import { genders } from '../../../../constants/genders';
import { purchased } from '../../../../constants/purchased';
import { rols } from '../../../../constants/rols';
import { UserContext } from '../../../../hooks/userContext';
import { CourseUser, User } from '../../../../../typings';
import { getUserFromBack } from '../../../api/user/getUserFromBack';
import axios from 'axios';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';

const colourStyles: StylesConfig<any> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: '#333',
    height: 55,
    borderRadius: 6,
    padding: 0
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return { ...styles, color: '#808080' };
  },
  input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
  placeholder: (styles) => ({ ...styles, color: '#fff' }),
  singleValue: (styles, { data }) => ({ ...styles, color: '#808080' })
};

const EditUser = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [userDB, setUserDB] = useState<User>();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [rol, setRol] = useState('');
  const [courses, setCourses] = useState<CourseUser[]>([]);
  const [courseName, setCourseName] = useState<string[]>([]);

  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/src/user/login');


  }, [auth.user]);


  useEffect(() => {
    const getUserDB = async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const userId = id;
        const { data } = await axios.get(`/api/user/${userId}`, config);
        const completeName = data.name.split(' ');
        const name = completeName[0];
        const last = completeName.slice(1).join(' ');
        setFirstname(name);
        setLastname(last);
        setEmail(data.email);
        setGender(data.gender);
        setCountry(data.country);
        setRol(data.rol);
        setCourses(data.courses);
        setUserDB(data);
      } catch (error: any) {
        console.log(error.message);
      }
    };
    getUserDB();
  }, [router, session]);
  useEffect(() => {
    const getCourses = async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const courseArray = await Promise.all(
          courses.map((course) =>
            axios.get(`/api/course/${course.course}`, config).then((res) => {
              return res.data.name;
            })
          )
        );
        setCourseName(courseArray);
      } catch (error) {
        console.log(error);
      }
    };
    getCourses();
  }, [courses]);
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      if (userDB) {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const response = await axios.patch(
          `/api/user/update/${userDB._id}`,
          {
            firstname,
            lastname,
            email,
            gender,
            country,
            rol,
            courses
          },
          config
        );
        if (response) {
          router.push('/src/admin/users');
          toast.success(
            `${firstname + ' ' + lastname} fue editado correctamente`
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  function handleInputChange(event: any, index: number) {
    const str = event.label;
    let purchased: boolean;
    if (str === 'true') {
      purchased = true;
    }
    if (str === 'false') {
      purchased = false;
    }
    setCourses((prevCourses) => {
      const updatedCourses = [...prevCourses];

      updatedCourses[index] = { ...updatedCourses[index], purchased };

      return updatedCourses;
    });
  }

  return (
      <AdmimDashboardLayout>
        {userDB ? (
          <div className='relative flex w-full flex-col bg-black md:items-center md:justify-center md:bg-transparent min-h-screen'>
            <Head>
              <title>Video Streaming</title>
              <meta name='description' content='Stream Video App' />
              <link rel='icon' href='/favicon.ico' />
            </Head>

            <div
              className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
            >
              {/* Logo position */}
              <form
                onSubmit={handleSubmit}
                className='relative mt-24 space-y-4 rounded border-2 border-black/75 bg-black/50 py-12  px-8 md:mt-12 md:max-w-lg md:px-14'
              >
                <h1 className='text-4xl font-semibold'>Editar Usuario</h1>
                <div className='relative space-y-8 md:mt-0 md:max-w-lg'>
                  {' '}
                  <div className='flex '>
                    {' '}
                    <label className='inline-block mr-2 '>
                      {' '}
                      <input
                        type='firstName'
                        id='firstName'
                        name='firstName'
                        value={firstname}
                        placeholder='Nombre'
                        className='input'
                        onChange={(e) => setFirstname(e.target.value)}
                      />
                    </label>
                    <label className='inline-block'>
                      <input
                        name='lastName'
                        id='lastName'
                        type='lastName'
                        value={lastname}
                        placeholder='Apellido'
                        className='input'
                        onChange={(e) => setLastname(e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className='inline-block w-full '>
                      <input
                        type='email'
                        id='email'
                        name='email'
                        placeholder='Email'
                        value={email}
                        className='input'
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <Select
                      options={rols}
                      styles={colourStyles}
                      placeholder={'Rol'}
                      className='w-full '
                      defaultInputValue={rol}
                      onChange={(e) => {
                        return setRol(e.label);
                      }}
                    />
                  </div>
                  <>
                    {courses.map((course, index) => (
                      <div key={index}>
                        <label className='inline-block w-full '>
                          {courseName[index]}
                        </label>

                        <Select
                          options={purchased}
                          styles={colourStyles}
                          placeholder={'Comprado'}
                          className='w-full '
                          defaultInputValue={course.purchased.toString()}
                          onChange={(event) => handleInputChange(event, index)}
                        />
                      </div>
                    ))}
                  </>
                  <div className='flex   '>
                    <Select
                      options={genders}
                      styles={colourStyles}
                      placeholder={'Género'}
                      className='w-52 mr-2'
                      defaultInputValue={gender}
                      onChange={(e) => {
                        return setGender(e.label);
                      }}
                    />
                    <Select
                      options={countries}
                      styles={colourStyles}
                      className=' w-52'
                      placeholder={'País'}
                      defaultInputValue={country}
                      onChange={(e) => {
                        return setCountry(e.label);
                      }}
                    />
                  </div>
                  <div>
                    <button className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'>
                      Editar Usuario{' '}
                    </button>
                  </div>
                  <div className='text-[gray]'>
                    Volver al Inicio
                    <Link href={'/src/admin/users'}>
                      <button
                        type='button'
                        className='text-white hover:underline ml-2'
                      >
                        {' '}
                        Volver
                      </button>
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className='md:h-[100vh] w-full flex flex-col justify-center items-center'>
            <LoadingSpinner />
            <p className='font-light text-xs text-[gray] mt-4'>
              Esto puede demorar unos segundos...
            </p>
          </div>
        )}
      </AdmimDashboardLayout>
  );
};

export default EditUser;
