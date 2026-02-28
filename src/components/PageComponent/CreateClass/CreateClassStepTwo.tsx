import { levels } from '../../../constants/classLevels';
import { addStepTwo } from '../../../redux/features/createClassSlice';
import { useAppSelector } from '../../../redux/hooks';
import { AppDispatch } from '../../../redux/store';
import IsFreeComponent from './IsFreeComponent';
import React, { useEffect, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import { toast as t } from '../../../hooks/useToast';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { RxCrossCircled } from 'react-icons/rx';
import { useDispatch } from 'react-redux';

interface Props {
  step1ToStep0: any;
  handleSubmitClass: any;
  getDescripcion: any;
  getTags: any;
  getVideoId:any;
  getIsFree:any;
  getLevel:any;
}

const CreateClassStepTwo = ({ step1ToStep0, handleSubmitClass, getDescripcion, getTags, getVideoId, getIsFree, getLevel }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const createClass = useAppSelector((state) => state.classesModalReducer.value);
  const {
    description: descriptionReg,
    descriptionLength: descriptionLengthReg,
    level: levelReg,
    videoId: videoIdOr,
    isFree: isFreeReg,
  } = createClass;

  const [description, setDescription] = useState(descriptionReg);
  const [descriptionLength, setDescriptionLength] = useState<number>(
    descriptionLengthReg ? descriptionLengthReg : 0
  );
  const [level, setLevel] = useState(levelReg);
  const [levelName, setLevelName] = useState('');
  const [videoId, setVideoId] = useState(videoIdOr);
  const [isFree, setIsFree] = useState<boolean>(isFreeReg);
  const [tags, setTags] = useState<string[]>([]);

  const colourStyles: StylesConfig<any> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#333',
      height: 55,
      borderRadius: 6,
      padding: 0,
    }),
    option: (styles) => ({ ...styles, color: '#808080' }),
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles) => ({ ...styles, color: '#808080' }),
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputTags = e.target.value.split(',').map((tag) => tag.trim());
    setTags(inputTags);
    getTags(inputTags); // Pasar las tags al padre si es necesario
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 30) {
      t.error('La descripción del curso debe tener al menos 30 caracteres');
      return;
    } else if (!level) {
      t.error('Debe indicar el nivel del curso');
      return;
    }

    dispatch(
      addStepTwo({ description, descriptionLength, level, videoId, isFree, tags })
    );
    handleSubmitClass();
  };

  const handleBack = () => {
    dispatch(
      addStepTwo({ description, descriptionLength, level, videoId, isFree, tags })
    );
    step1ToStep0();
  };

  return (
    <div className="relative flex w-full items-start flex-col bg-transparent md:items-center md:justify-center md:bg-transparent">
      <div className="h-full w-full relative flex flex-col md:items-center md:justify-center">
        <div className="w-full flex pt-12 justify-between items-center">
          <h1 className="text-4xl font-light">Agregar una Clase</h1>
          <p>Paso 2</p>
        </div>
        <form
          className="relative mt-16 space-y-12 rounded px-8 md:max-w-[40rem] md:px-14"
          autoComplete="nope"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <p>Elige el nivel de la clase</p>
            <Select
              options={levels}
              styles={colourStyles}
              placeholder={levelName || 'Nivel de clase'}
              className="w-full sm:w-full"
              value={levelName}
              onChange={(e) => {
                setLevelName(e.label);
                setLevel(e.value);
                getLevel(e.value);
              }}
            />
          </div>

          <IsFreeComponent handleIsFree={ getIsFree} isFree={isFree} />

          <label className="flex flex-col space-y-3 w-full">
            <p>Introduce el Id del video</p>
            <input
              type="text"
              placeholder="ID Del video"
              className="input"
              value={videoId || ''}
              onChange={(e) =>{ setVideoId(e.target.value);
                 getVideoId(e.target.value)}}
            />
          </label>

          <div className="flex flex-col justify-center items-start space-y-4">
            <p>Escribe una descripción para la clase</p>
            <label className="inline-block w-full">
              <textarea
                placeholder="Descripción"
                className="input"
                value={description}
                onChange={(e) => {
                  getDescripcion(e.target.value);
                  setDescription(e.target.value);
                  setDescriptionLength(e.target.value.length);
                }}
              />
            </label>
            <div className="flex flex-row justify-center items-center space-x-2">
              <p className="font-light text-xs text-[gray]">Largo mínimo 30 caracteres</p>
              {descriptionLength < 30 ? (
                <RxCrossCircled className="text-xs text-red-600" />
              ) : (
                <AiOutlineCheckCircle className="text-xs text-green-600" />
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center items-start space-y-4">
            <p>Escribe las etiquetas para la clase (separadas por comas)</p>
            <label className="inline-block w-full">
              <textarea
                placeholder="Ejemplo: tag1, tag2, tag3"
                className="input"
                onChange={handleTagsChange}
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold"
          >
            Crear
          </button>
          <div className="text-[gray]">
            Volver al Inicio
            <button
              type="button"
              className="text-white hover:underline ml-2"
              onClick={handleBack}
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassStepTwo;
