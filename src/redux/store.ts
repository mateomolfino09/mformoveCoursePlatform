import filterClass from "./features/filterClass"; 
import filterProduct from "./features/filterProduct"; 
import { configureStore } from "@reduxjs/toolkit";
import courseModalReducer from './features/courseModalSlice';
import classesModalReducer from './features/createClassSlice';
import headerHomeReducer from './features/headerHomeSlice';
import createCourseReducer from './features/createCoursesSlice';
import { courseModalApi } from "./services/courseModalApi";
import { classApi } from "./services/classApi";
import { individualClassApi } from "./services/individualClassApi";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import registerReducer from './features/register'

import productIdReducer from "./features/productId"
import oneTymePaymentReducer from "./features/oneTimePayment"
export const store = configureStore({
  reducer: {
    courseModalReducer,
    classesModalReducer,
    registerReducer,
    createCourseReducer,
    filterClass,
    filterProduct,
    headerHomeReducer,
    [courseModalApi.reducerPath]: courseModalApi.reducer,
    [classApi.reducerPath]: classApi.reducer,

    [individualClassApi.reducerPath]: individualClassApi.reducer,
    productIdReducer,

    oneTymePaymentReducer
  },
  middleware: (getDefaultMiddleware: any) => getDefaultMiddleware().concat([courseModalApi.middleware , classApi.middleware, individualClassApi.middleware])
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


