import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { loadCourse } from "../redux/courseModal/courseModalAction"
import { CourseModal } from "../redux/courseModal/courseModalTypes"
import { State } from "../redux/reducers"
import { Courses, Ricks, CoursesDB, Item } from "../typings"
import CourseThumbnail from "./CourseThumbnail"
import Thumbnail from "./Thumbnail"

interface Props {
    title: string | null,
    courses: CoursesDB[] | null,
    setSelectedCourse: Dispatch<SetStateAction<CoursesDB | null>> | null,
    items: Item[] | null,
    courseDB: CoursesDB | null
    actualCourseIndex: Number
    setRef: any
    isClass: boolean
}

function Row({ title, courses, setSelectedCourse, items, courseDB, actualCourseIndex, setRef, isClass} : Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const[isMoved, setIsMoved] = useState(false);
    const course: CourseModal = useSelector((state: State) => state.courseModalReducer)
    let { loading, error, activeModal, dbCourse  } = course

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
    }, [rowRef])   


    return (
        <div className="h-40 space-y-0.5 md:space-y-2 w-full" ref={listRef}>
                {!activeModal && !isClass ? (
                    <>
                        <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#E5E5E5] transition duration-200 hover:text-white md:text-2xl" >{title}</h2>
                        <div className="group relative md:-ml-2">
                            <ChevronLeftIcon className={`ScrollIcon left-2 ${!isMoved && 'hidden'}`}  onClick={() => handleClick("left")}/>
                            <div ref={rowRef} className="scrollbar-hide flex items-center space-x-0.5 overflow-x-scroll md:space-x-2.5 md:p-2">
                            {courses?.map((course) => (
                                <Thumbnail key={course._id} course={course} setSelectedCourse={setSelectedCourse}/>
                            ))}
                            </div>

                            <ChevronRightIcon className={`ScrollIcon right-2`} onClick={() => handleClick("right")}/>
                            
                        </div>

                    </>

                ) : (
                    <>
                    <div className="group relative w-full">
                        <div ref={rowRef} className="scrollbar-hide flex flex-col items-center space-y-12 bg-[#181818]">
                            <CourseThumbnail items={items} course={courseDB} actualCourseIndex={actualCourseIndex} isClass={isClass}/>
                        </div>
                    </div>
                    </>

                )}


        </div>
  )
}

export default Row