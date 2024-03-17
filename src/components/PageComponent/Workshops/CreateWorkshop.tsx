'use client';

import Link from 'next/link';
import React, { useState } from 'react';

const CreateWorkshop = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [classesQuantity, setClassesQuantity] = useState<number>(0);
  const [courseType, setCourseType] = useState<string>('');
  const [diplomaUrl, setDiplomaUrl] = useState<string>('');
  const [price, setPrice] = useState<number>(10);
  const [currency, setCurrency] = useState<string>('$');

  return (
    <div>
      <h1>Crea tu WorkShop</h1>
      <form>
        <div>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Elige un nombre para el workshop</p>

            <input
              type='nombre'
              placeholder='Nombre'
              value={name}
              className='input'
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          
        </div>
        <div>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Escribe una descripcion del workshop</p>

            <input
              type='description'
              placeholder='Descripcion'
              value={description}
              className='input'
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
        <div>
          <Link href={'/admin/workshops/createWorkshop'}>LINK DE PAGO</Link>
          {/* LINK DE PAGO */}
        </div>
        <div>
          <img
            src={
              'https://img.freepik.com/foto-gratis/vista-posterior-mujer-haciendo-yoga-al-aire-libre_23-2148769551.jpg'
            }
          />
        </div>
        <div>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Cantidad de clases del workshop</p>

            <input
              type='classesQuantity'
              placeholder='Cantidad de clases'
              value={classesQuantity}
              className='input'
              min={0}
              onChange={(e) => setClassesQuantity(parseInt(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Cantidad de clases del workshop</p>

            <input
              type='courseType'
              placeholder='Tipo de curso'
              value={courseType}
              className='input'
              onChange={(e) => setCourseType(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label className='flex flex-col space-y-3 w-full'>
            <p>Cantidad de clases del workshop</p>

            <input
              type='price'
              placeholder='Precio'
              value={price}
              className='input'
              onChange={(e) => setPrice(parseInt(e.target.value))}
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkshop;
