'use client'

import { createContext, useContext, Dispatch, SetStateAction, useState } from "react"
import { CoursesDB } from "../../../typings"

type DataType = {
    firstname: string
}

interface ContextProps {
    courses: any
    setCourses: Dispatch<SetStateAction<any>>
    listCourse: any
    setListCourse: Dispatch<SetStateAction<any>>
}

const GlobalContext = createContext<ContextProps>({
    courses: [],
    setCourses: (): DataType[] => [],
    listCourse: [],
    setListCourse: (): DataType[] => [] 
})

export const GlobalContextProvider = ({ children }: any) => {
    const [listCourse, setListCourse] = useState<CoursesDB[]>([]);
    const [courses, setCourses] = useState<CoursesDB[]>([]);

    return (
        <GlobalContext.Provider value={{ courses, setCourses, listCourse, setListCourse}}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext)