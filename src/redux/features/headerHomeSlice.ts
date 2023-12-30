import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { m } from "framer-motion";

type InitialState = {
    value: HeaderHome;
}

type HeaderHome = {
    scrollHeader: boolean
}


const initialState: InitialState = {
    value: {
        scrollHeader: false
    },

} 

export const headerHomeSlice = createSlice({
    name: "headerHome",
    initialState,
    reducers: {

        toggleScroll: (state: any, action: PayloadAction<boolean>) => {
            return {
                value: {
                    ...state.value,
                    scrollHeader: action.payload
                }
            }
        },
        clearData: () => {
            return initialState
        }
    }

})

export const { clearData, toggleScroll} = headerHomeSlice.actions;
export default headerHomeSlice.reducer;