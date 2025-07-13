import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { m } from "framer-motion";

type InitialState = {
    value: RegisterState;
}

type RegisterState = {
    email: string
    firstname: string
    lastname: string
    gender: string
    country: string
    password: string
    confirmPassword: string
}


const initialState: InitialState = {
    value: {
        email: "",
        firstname: "",
        lastname: "",
        gender: "",
        country: "",
        password: "",
        confirmPassword: ""
    },

} 

export const registerSlice = createSlice({
    name: "register",
    initialState,
    reducers: {
        addEmail: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    email: action.payload
                }
            }
        },
        addStepOne: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    firstname: action.payload.firstname,
                    lastname: action.payload.lastname,
                    gender: action.payload.gender,
                    country: action.payload.country,
                }
            }
        },
        addStepTwo: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    password: action.payload.password,
                    confirmPassword: action.payload.confirmPassword,
                }
            }
        },
        clearData: () => {
            return initialState
        }
    }

})

export const { addEmail, addStepOne, addStepTwo ,clearData } = registerSlice.actions;
export default registerSlice.reducer;