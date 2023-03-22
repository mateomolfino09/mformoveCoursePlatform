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

function Row({ title, coursesDB, setSelectedCourse, items, courseDB, actualCourseIndex, setRef, isClass, user, courseIndex} : Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const[isMoved, setIsMoved] = useState(false);
    const course: CourseModal = useSelector((state: State) => state.courseModalReducer)
    let { loading, error, activeModal, dbCourse  } = course
    const [overflow, setOverflow] = useState('hidden')
    const { courses, setCourses} = useContext( CoursesContext )


    const handleClick = (direction: string) => {
        setIsMoved(true);

        if(rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current

            const scrollTo = direction === "left"
                ? scrollLeft - clientWidth
                : scrollLeft + clientWidth

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
        }
    }
    
    useEffect(() => {
        if(rowRef != null && setRef != null) setRef(rowRef)
    }, [])   


    return (
        <div className="h-48 lg:h-56 space-y-0.5 md:space-y-2 w-full" ref={listRef}>
                {!activeModal && !isClass ? (
                    <>
                        <h2 className="w-56 relative -top-20 md:top-2 lg:top-8 cursor-pointer text-sm font-semibold text-[#E5E5E5] transition duration-200 hover:text-white md:text-2xl" >{title}</h2>
          <div className="group relative md:-ml-2 lg:-top-20">
                            <ChevronLeftIcon className={`ScrollIcon left-2 ${!isMoved && 'hidden'}`}  onClick={() => handleClick("left")}/>
                            <div ref={rowRef} className="h-42 lg:h-72 lg:pb-0 scrollbar-hide flex items-end -top-16 md:-top-0 space-x-0 overflow-y-hidden overflow-x-scroll md:space-x-2.5 md:p-2 relative">  
              {coursesDB?.map((course: CoursesDB) => (
                                <Thumbnail key={course?._id} course={course} setSelectedCourse={setSelectedCourse} user={user} courseIndex={course.id - 1}/>
              ))}
            </div>

                <ChevronRightIcon className={`ScrollIcon right-2`} onClick={() => handleClick("right")}/>
                            
          </div>

        </>

      ) : (
        <>
          <div className="group relative w-full">
                        <div ref={rowRef} className="scrollbar-hide flex flex-col items-center space-y-12 bg-[#181818]">
                            <CourseThumbnail items={items} course={courseDB} actualClassIndex={actualCourseIndex} isClass={isClass} user={user} courseIndex={courseIndex}/>
            </div>
          </div>
        </>

      )}


    </div>
  )
}

export default Row