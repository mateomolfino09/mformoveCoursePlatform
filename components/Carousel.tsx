import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Dispatch, RefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { CoursesContext } from "../hooks/coursesContext"
import { loadCourse } from "../redux/courseModal/courseModalAction"
import { CourseModal } from "../redux/courseModal/courseModalTypes"
import { State } from "../redux/reducers"
import { Courses, Ricks, CoursesDB, Item, User } from "../typings"
import CourseThumbnail from "./CourseThumbnail"
import Thumbnail from "./Thumbnail"
import { motion as m } from "framer-motion"
import CarouselThumbnail from "./CarouselThumbnail"

interface Props {
    title: string | null,
    coursesDB: CoursesDB[] | null,
    setSelectedCourse: Dispatch<SetStateAction<CoursesDB | null>> | null,
    items: Item[] | null,
    courseDB: CoursesDB | null
    actualCourseIndex: number
    setRef: any
    isClass: boolean
    user: User | null
    courseIndex: number
}

function Carousel({ title, coursesDB, setSelectedCourse, items, courseDB, actualCourseIndex, setRef, isClass, user, courseIndex} : Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const[isMoved, setIsMoved] = useState(false);
    const course: CourseModal = useSelector((state: State) => state.courseModalReducer)
    const { courses, setCourses} = useContext( CoursesContext )
    const [width, setWidth] = useState<number>(0)
    const theWidth = rowRef.current?.scrollWidth ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth) : 0


    useEffect(() => {
        if(rowRef != null && setRef != null) {
            setRef(rowRef)
        } 
    }, [])   


    return (
    <m.div className="carousel" ref={rowRef}>
        <h2 className="w-56 ml-4 relative cursor-pointer text-lg font-semibold text-[#E5E5E5] transition duration-200 hover:text-white md:text-2xl mb-4" >{title}</h2>
        <m.div className="inner-carousel" drag='x' dragConstraints={{right: 0, left: theWidth}} whileTap={{cursor: 'grabbing'}}>
            {coursesDB?.map((course: CoursesDB) => (
            <>
            <CarouselThumbnail key={course?._id} course={course} setSelectedCourse={setSelectedCourse} user={user} courseIndex={course.id - 1}/>
            </>
              ))}

        </m.div>
    </m.div>
  )
}

export default Carousel