import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type InitialState = {
    value: HeaderLibrary;
}

type HeaderLibrary = {
    scrollHeader: boolean
}

const initialState: InitialState = {
    value: {
        scrollHeader: false
    },
}

export const headerLibrarySlice = createSlice({
    name: "headerLibrary",
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

export const { clearData, toggleScroll } = headerLibrarySlice.actions;
export default headerLibrarySlice.reducer;
