import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Exam, Modules, Question, User } from "../../../typings";

type InitialState = {
    value: RegisterState;
}

type RegisterState = {
    name: string,
    playlist_code: string,
    files: any[],
    description: string,
    descriptionLength: number,
    price: number,
    classesQuantity: number | null,
    image_url: string | null,
    currency: string | null,
    classesNumbers: number[] | [], 
    breakpointTitles: string[] | [], 
    created_by: User | null,
    courseType: string | null,
    diploma: any ,
    questions: Question[] | null,
    modules: number | null,
    modulesNumbers: number[] | [],
    exam: Exam | null
    showBreakpoints: boolean
}

const initialState: InitialState = {
    value : {
        name: "",
        playlist_code: "",
        files: [],
        description: "",
        descriptionLength: 0,
        price: 0,
        classesQuantity: null,
        image_url: null,
        currency: null,
        classesNumbers: [], 
        modulesNumbers: [], 
        breakpointTitles: [], 
        showBreakpoints: false,
        created_by: null,
        courseType: '',
        diploma: null,
        questions: null,
        modules: null,
        exam: {
            id: 0,
            quantityOfQuestions: 0,
            approvalMin: 0,
            class: null,
            questions: [{
                id: 0,
                question: '',
                answers: [],
                correctAnswerIndex: -1

            }]
        }

    }
}

export const createCourseSlice = createSlice({
    name: 'courseModal',
    initialState,
    reducers: {
        addStepOne: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    name: action.payload.name,
                    playlist_code: action.payload.playlist_code,
                    files: action.payload.files,
                }
            }
        },
        addStepTwo: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    classesQuantity: action.payload.classesQuantity,
                    description: action.payload.description,
                    descriptionLength: action.payload.descriptionLength,
                    price: action.payload.price,
                    modules: action.payload.modules,
                    currency: action.payload.currency,
                    classesNumbers: action.payload.classesNumbers,
                    modulesNumbers: action.payload.modulesNumbers,
                    breakpointTitles: action.payload.breakpointTitles
                }
            }
        },
        addStepThree: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    courseType: action.payload.courseType,
                    diploma: action.payload.diploma, 
                    questions: action.payload.questions, 
                }
            }
        },
        clearData: () => {
            return initialState
        }
    }
})

export const { addStepOne, addStepTwo, addStepThree, clearData } = createCourseSlice.actions
export default createCourseSlice.reducer
