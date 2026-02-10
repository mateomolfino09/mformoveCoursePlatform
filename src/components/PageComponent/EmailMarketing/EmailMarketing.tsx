'use client'
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { toast } from '../../../hooks/useToast';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import Select, { StylesConfig } from 'react-select';
import { genders } from '../../../constants/genders';
import requests from '../../../utils/requests';
import endpoints from '../../../services/api';
import './emailmarketingStyle.css';
import { LoadingSpinner } from '../../LoadingSpinner';

interface Props {
    courses: any[]
}

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

const EmailMarketing = ({ courses }: Props) => {
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [action, setAction] = useState('');
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [courseGroupId, setCourseGroupId] = useState('');
    const [loading, setLoading] = useState(false);

    const coursesGroup: any = [
        // { value: 'otro', label: 'Otro' }
        ];

    courses.forEach((x: any) => {
        coursesGroup.push({
            value: x.id,
            label: "Usuarios de " + x.name 
        })
    })
      


    const handleSubmit = async (e: any) => {
      e.preventDefault()
      setLoading(true)

      if (
        courseGroupId == '' ||
        title == '' ||
        message.length <= 2 ||
        action == '' ||
        subject.length <= 2 
    ) {
      toast.error(
        'Hay un error en los datos que ingresó, rellene todos los campos o vuelva a intentar'
      )
      setLoading(false)
      return
    };
    
      try {
        const sendEmail = await fetch(endpoints.admin.emailMarketing, {
          method: 'POST',
          body: JSON.stringify({ courseGroupId, link, titulo: title, contenido: message, action: action, subject: subject }),
  
        }).then((r) => r.json());
      } catch (error) {
        toast.error(
          'Hubo un error, vuelva a intentarlo más tarde'
        )
      }
      setLoading(false)

    }

    const handleClick = (e: any) => {
        if (
            courseGroupId == '' ||
            title == '' ||
            message.length <= 2 ||
            action == '' ||
            subject.length <= 2 
        ) {
          toast.error(
            'Hay un error en los datos que ingresó, rellene todos los campos o vuelva a intentar'
          );
        } else {
            handleSubmit(e)
        }
      };
    
      const keyDownHandler = (event: any) => {
        if (event.key === 'Enter') {
          event.preventDefault();
    
          handleClick(event);
        }
      };

  return (
    <AdmimDashboardLayout>

      {!loading ? (
        <>
            <div>
    <div
      className={`sub-container`}
    >
      <div className='container-title'>
        <h1 className='title'>
            Email Marketing
        </h1>
      </div>
      <form
        className='form-container'
        autoComplete='nope'
        onSubmit={handleSubmit}
      >
        <div className='space-y-4'>
          <label className='label-container'>
          <p className='mb-1'>Elige un grupo de usuarios a enviar el mail</p>
          <div className='w-full mb-1 flex justify-start'>
          <Select
            options={coursesGroup}
            styles={colourStyles}
            placeholder={'Cursos'}
            className='w-full sm:w-52'
            onChange={(e) => {
                return setCourseGroupId(e.value);
              }}
              onKeyDown={keyDownHandler}
          />
        </div>
          </label>
        <label className='label-container'>
          <p>Elige un título para el mensaje</p>
            <input
              type='title'
              placeholder='Título'
              value={title}
              className='input'
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
        <label className='label-container'>
          <p>Elige un título para el botón de acción</p>
            <input
              type='title'
              placeholder='Acción'
              value={action}
              className='input'
              onChange={(e) => setAction(e.target.value)}
            />
          </label>
        <label className='label-container'>
          <p>Elige un asunto para el Email</p>
            <input
              type='title'
              placeholder='Asunto'
              value={subject}
              className='input'
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
        <label className='label-container'>
          <p>Elige la url para el botón de acción</p>
            <input
              type='url'
              placeholder='Link'
              value={link}
              className='input'
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <div className='flex flex-col justify-center items-start'>
        <label className='inline-block w-full'>
            <p className='mb-4'>Escribe el mensaje a enviar</p>

            <textarea
                placeholder='Texto Email'
                className='input'
                onChange={(e) => {
                    setMessage(e.target.value);
                }}
                value={message}
            />
            </label>
        </div>
        </div>
        <button
          onClick={(e) => handleSubmit(e)}
          className='enviar-btn'
        >
          Enviar Mail{' '}
        </button>
        <div className='text-[gray]'>
          Volver al Inicio
          <Link href={'/library'}>
            <button
              type='button'
              className='text-white hover:underline ml-2'
            >
              {' '}
              Volver
            </button>
          </Link>
        </div>
      </form>
    </div>
          </div>
        </>
      ) : (
        <>
          <LoadingSpinner />
        </>
      )}


  </AdmimDashboardLayout>
  )
}

export default EmailMarketing