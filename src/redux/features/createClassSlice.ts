import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ClassTypes, Exam, Modules, Question, User } from "../../../typings";

type InitialState = {
    value: RegisterState;
}


type RegisterState = {
    name: string,
    files: any[],
    description: string,
    descriptionLength: number,
    level: number,
    typeId: string | null,
    image_url: string | null,
    videoId: string
    isFree: boolean
}

const initialState: InitialState = {
    value : {
        name: "",
        videoId: "",
        files: [],
        description: "",
        descriptionLength: 0,
        level: 0,
        image_url: null,
        typeId: null,
        isFree: false

    }
}

export const createClassesSlice = createSlice({
    name: 'classesModal',
    initialState,
    reducers: {
        addStepOne: (state: any, action: PayloadAction<any>) => {
            console.log(state)

            return {
                value: {
                    ...state.value,
                    name: action.payload.name,
                    typeId: action.payload.typeId,
                    files: action.payload.files,
                }
            }
        },
        addStepTwo: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    description: action.payload.description,
                    descriptionLength: action.payload.descriptionLength,
                    level: action.payload.level,
                    videoId: action.payload.videoId,
                    isFree: action.payload.isFree
                    
                }
            }
        },
        clearData: () => {
            return initialState
        }
    }
})

export const { addStepOne, addStepTwo, clearData } = createClassesSlice.actions
export default createClassesSlice.reducer
