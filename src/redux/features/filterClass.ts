import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { m } from "framer-motion";

type InitialState = {
    value: FilterState;
}

type FilterState = {
    classType: string
    search: boolean
    searchToggle: boolean
    searchInput: string
    filterNav: boolean
}


const initialState: InitialState = {
    value: {
        classType: "all",
        search: false,
        searchToggle: false,
        searchInput: '',
        filterNav: false
    },

} 

export const filterClassSlice = createSlice({
    name: "filterClass",
    initialState,
    reducers: {
        setClassType: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    classType: action.payload
                }
            }
        },
        toggleSearch: (state: any, action: PayloadAction<boolean>) => {
            return {
                value: {
                    ...state.value,
                    search: action.payload
                }
            }
        },
        changeInput: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    searchInput: action.payload
                }
            }
        },
        toggleSearchGo: (state: any, action: PayloadAction<boolean>) => {
            return {
                value: {
                    ...state.value,
                    searchToggle: action.payload
                }
            }
        },
        toggleNav: (state: any, action: PayloadAction<boolean>) => {
            return {
                value: {
                    ...state.value,
                    filterNav: action.payload
                }
            }
        },
        clearData: () => {
            return initialState
        }
    }

})

export const { setClassType ,clearData, toggleSearch, changeInput, toggleSearchGo, toggleNav } = filterClassSlice.actions;
export default filterClassSlice.reducer;