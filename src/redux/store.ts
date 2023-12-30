import filterClass from "./features/filterClass"; 
import { configureStore } from "@reduxjs/toolkit";
import courseModalReducer from './features/courseModalSlice';
import classesModalReducer from './features/createClassSlice';
import headerHomeReducer from './features/headerHomeSlice';
import createCourseReducer from './features/createCoursesSlice';
import { courseModalApi } from "./services/courseModalApi";
import { classApi } from "./services/classApi";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import registerReducer from './features/register'

export const store = configureStore({
  reducer: {
    courseModalReducer,
    classesModalReducer,
    registerReducer,
    createCourseReducer,
    filterClass,
    headerHomeReducer,
    [courseModalApi.reducerPath]: courseModalApi.reducer,
    [classApi.reducerPath]: classApi.reducer

  },
  middleware: (getDefaultMiddleware: any) => getDefaultMiddleware().concat([courseModalApi.middleware , classApi.middleware])
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


