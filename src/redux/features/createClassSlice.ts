import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// Tipo extendido para archivos serializables
type SerializedFile = {
    name: string; // Nombre del archivo
    size: number; // Tamaño del archivo
    type: string; // Tipo MIME del archivo
    preview: string; // URL para previsualización
    path?: string; // Propiedad opcional (puede estar o no presente)
  };

// Tipo inicial del estado
type InitialState = {
  value: RegisterState;
};

type RegisterState = {
  name: string;
  files: SerializedFile[]; // Cambiado a archivos serializables
  description: string;
  descriptionLength: number;
  level: number;
  typeId: string | null;
  image_url: string | null;
  videoId: string;
  isFree: boolean;
  tags: string[];
};

const initialState: InitialState = {
  value: {
    name: '',
    videoId: '',
    files: [], // Inicializamos como un arreglo vacío
    description: '',
    descriptionLength: 0,
    level: 0,
    image_url: null,
    typeId: null,
    isFree: false,
    tags: []
  }
};

export const createClassesSlice = createSlice({
  name: 'classesModal',
  initialState,
  reducers: {
    // Reducer para manejar el paso 1 (Step One)
    addStepOne: (state, action: PayloadAction<any>) => {
      // Serializamos los archivos antes de almacenarlos en el estado
      const serializedFiles = action.payload.files.map((file: any) => ({
        path: file.path || file.name, // Aseguramos que `path` o `name` sea serializable
        preview: file.preview // Aseguramos que `preview` es una cadena
      }));

      return {
        value: {
          ...state.value,
          name: action.payload.name,
          typeId: action.payload.typeId,
          files: serializedFiles // Almacenamos solo los datos serializables
        }
      };
    },

    // Reducer para manejar el paso 2 (Step Two)
    addStepTwo: (
      state,
      action: PayloadAction<{
        description: string;
        descriptionLength: number;
        level: number;
        videoId: string;
        isFree: boolean;
        tags: string[];
      }>
    ) => {
      return {
        value: {
          ...state.value,
          description: action.payload.description,
          descriptionLength: action.payload.descriptionLength,
          level: action.payload.level,
          videoId: action.payload.videoId,
          isFree: action.payload.isFree,
          tags: action.payload.tags
        }
      };
    },

    // Reducer para limpiar el estado (Clear)
    clearData: () => {
      return initialState;
    }
  }
});

export const { addStepOne, addStepTwo, clearData } = createClassesSlice.actions;
export default createClassesSlice.reducer;
