import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { m } from "framer-motion";
import { ClassTypes } from "../../../typings";

type InitialState = {
    value: FilterState;
}

type FilterState = {
    [key: string]: any; // Index signature allowing any string keys
    productType: string
    search: boolean
    searchToggle: boolean
    searchInput: string
    filterNav: boolean
    filters: [ClassTypes] | null
    largo: [string] | null
    nivel: [string] | null
    ordenar: [string] | null
    seen: boolean | null
    products: any | null
    openModal: boolean
}


const initialState: InitialState = {
    value: {
        productType: "all",
        search: false,
        searchToggle: false,
        searchInput: '',
        filterNav: false,
        filters: null,
        products: null,
        largo: null,
        nivel: null,
        ordenar: null,
        seen: null,
        openModal: false

    },

} 

export const filterClassSlice = createSlice({
    name: "filterClass",
    initialState,
    reducers: {
        setType: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    productType: action.payload
                }
            }
        },
        setProducts: (state: any, action: PayloadAction<any>) => {
            return {
                value: {
                    ...state.value,
                    products: action.payload
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
        setFilters: (state: any, action: PayloadAction<ClassTypes[]>) => {
            return {
                value: {
                    ...state.value,
                    filters: action.payload
                }
            }
        },
        setLargo: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    largo: state.value.largo ? [...state.value.largo, action.payload] : [action.payload]
                }
            }
        },
        deleteLargo: (state: any, action: PayloadAction<number>) => {
            return {
                value: {
                    ...state.value,
                    largo: [...state.value.largo.slice(0, action.payload), ...state.value.largo.slice(action.payload + 1)]
                }
            }
        },
        setLevel: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    nivel: state.value.nivel ? [...state.value.nivel, action.payload] : [action.payload]
                }
            }
        },
        deleteLevel: (state: any, action: PayloadAction<number>) => {
            return {
                value: {
                    ...state.value,
                    nivel: [...state.value.nivel.slice(0, action.payload), ...state.value.nivel.slice(action.payload + 1)]
                }
            }
        },
        setOrder: (state: any, action: PayloadAction<string>) => {
            return {
                value: {
                    ...state.value,
                    ordenar: state.value.ordenar ? [...state.value.ordenar, action.payload] : [action.payload]
                }
            }
        },
        deleteOrder: (state: any, action: PayloadAction<number>) => {
            return {
                value: {
                    ...state.value,
                    ordenar: [...state.value.ordenar.slice(0, action.payload), ...state.value.ordenar.slice(action.payload + 1)]
                }
            }
        },
        setSeen: (state: any, action: PayloadAction<boolean>) => {
            return {
                value: {
                    ...state.value,
                    seen: action.payload
                }
            }
        },
        setOpenModal: (state: any, action: PayloadAction<boolean>) => {
            return {
                value: {
                    ...state.value,
                    openModal: action.payload
                }
            }
        },
        clearDataFilters: (state: any) => {
            return {
                value: {
                    ...state.value,
                    largo: null,
                    nivel: null,
                    ordenar: null,
                    seen: null,
                }
            }        },
        clearData: () => {
            return initialState
        }
    }

})

export const { 
    setType ,
    clearData, 
    toggleSearch, 
    changeInput,
    toggleSearchGo, 
    toggleNav, 
    setFilters,
    deleteLargo,
    deleteLevel,
    deleteOrder,
    setLargo,
    setLevel,
    setOrder,
    setSeen,
    setOpenModal,
    setProducts,
    clearDataFilters
} = filterClassSlice.actions;
export default filterClassSlice.reducer;