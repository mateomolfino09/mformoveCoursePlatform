import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  productCreado: any;
}

interface Module {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
  class_code: string;
  image_url: string;
  totalTime: number;
  module: number;
  atachedFiles: any[]; // ajusta este tipo de acuerdo a tu necesidad
  link: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const CreateProductStep2 = ({ productCreado }: Props) => {
  const [modulesQuantity, setModulesQuantuty] = useState(0);
  const [modules, setModules] = useState<Module[]>([]);
  const [clases, setClases] = useState<Class[]>(productCreado?.classes || []);

  const handleModuleNameChange = (id: number, value: string) => {
    setModules((prevModulos) => {
      const updatedModules = [...prevModulos];
      updatedModules[id - 1] = { id, name: value };
      return updatedModules;
    });
  };

  const handleModuleNumberChange = (classId: string, value: number) => {
    if (value <= modulesQuantity) {
      setClases((prevClases) => {
        return prevClases.map((clase) => {
          if (clase._id === classId) {
            return {
              ...clase,
              module: value
            };
          }
          return clase;
        });
      });
    } else {
      handleModuleNumberChange(classId, 0);
    }
  };

  const showModules = () => {
    return modules.map((modulo, index) => (
      <div className='mb-8' key={index + 1}>
        <p className='text-lg'>Indica el nombre para el Módulo {modulo.id}</p>
        <input
          type='text'
          placeholder='Nombre del Módulo'
          className='input'
          onChange={(e) => handleModuleNameChange(modulo.id, e.target.value)}
        />
      </div>
    ));
  };

  useEffect(() => {
    setModules(
      Array.from({ length: modulesQuantity }, (_, index) => ({
        id: index + 1,
        name: ''
      }))
    );
  }, [modulesQuantity]);

  useEffect(() => {
    }, [modules]);

  const router = useRouter()
  async function handleAddModules() {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.put(
        '/api/product/addProductModules',
        {
         productId:productCreado.id,
          modules,
          updatedClasses:clases
        },
        config
      );
      router.push('/admin/products/allProducts')
      } catch (error: any) {
      toast.error(error.response.data.error);
    }
  }

  return (
    <div className='relative flex w-full min-h-screen flex-col bg-transparent md:items-center md:justify-center md:bg-transparent'>
      <div
        className={`h-full w-full relative flex flex-col md:items-center md:justify-center`}
      >
        <div className='mb-8'>
          <p className='text-lg'>¿Cuántos módulos tendrá el producto?</p>
          <input
            type='number'
            placeholder='Cantidad de módulos'
            className='input'
            onChange={(e) => setModulesQuantuty(parseInt(e.target.value, 10))}
          />
        </div>
        {showModules()}
        -----------------------------------------------------------------------------------------------------------------
        {clases.map((classItem: Class, index: number) => (
          <div key={index} className='flex mt-4'>
            <div>
              <p className='text-lg'>Clase: {classItem.id}</p>
            </div>
            <div className='space-y-2 ml-7'>
              <p className='text-sm'>Ingresa el número de módulo de la clase</p>
              <input
                type='number'
                placeholder='Número de módulo'
                className='input'
                max={modulesQuantity}
                min={0}
                onChange={(e) =>
                  handleModuleNumberChange(
                    classItem._id,
                    parseInt(e.target.value, 10)
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          handleAddModules();
        }}
      >
        Confirmar
      </button>
    </div>
  );
};

export default CreateProductStep2;
