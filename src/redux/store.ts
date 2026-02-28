import filterClass from "./features/filterClass"; 
import filterProduct from "./features/filterProduct"; 
import { configureStore } from "@reduxjs/toolkit";
import classesModalReducer from './features/createClassSlice';
import headerLibraryReducer from './features/headerLibrarySlice';
import createCourseReducer from './features/createCoursesSlice';
import { classApi } from "./services/classApi";
import { individualClassApi } from "./services/individualClassApi";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import registerReducer from './features/register'
import productIdReducer from "./features/productId"
import oneTymePaymentReducer from "./features/oneTimePayment"
import instagramVideosReducer from './features/instagramVideosSlice';

export const store = configureStore({
  reducer: {
    classesModalReducer,
    registerReducer,
    createCourseReducer,
    filterClass,
    filterProduct,
    headerLibraryReducer,
    [classApi.reducerPath]: classApi.reducer,
    [individualClassApi.reducerPath]: individualClassApi.reducer,
    productIdReducer,
    oneTymePaymentReducer,
    instagramVideos: instagramVideosReducer
  },
  middleware: (getDefaultMiddleware: any) => getDefaultMiddleware().concat([classApi.middleware, individualClassApi.middleware])
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


