import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
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
}

function Row({ title, courses, setSelectedCourse, items, courseDB} : Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const[isMoved, setIsMoved] = useState(false);
    const course: CourseModal = useSelector((state: State) => state.courseModalReducer)
    let { loading, error, activeModal, dbCourse  } = course

    const handleClick = (direction: string) => {
        setIsMoved(true);

        if(rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current

            console.log(scrollLeft, clientWidth)

            const scrollTo = direction === "left"
                ? scrollLeft - clientWidth
                : scrollLeft + clientWidth

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
        }
    } 

    return (
        <div className="h-40 space-y-0.5 md:space-y-2">
                {!activeModal ? (
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
                    <div className="group relative md:-ml-2">
                        <ChevronLeftIcon className={`ScrollIcon ${!isMoved && 'hidden'} text-[#000000]`}  onClick={() => handleClick("left")}/>
                        <div ref={rowRef} className="scrollbar-hide flex items-center space-x-0.5 overflow-x-scroll md:space-x-2.5 md:p-2">
                            <CourseThumbnail items={items}/>
                        </div>

                        <ChevronRightIcon className={`ScrollIcon right-2 text-[#000000]`} onClick={() => handleClick("right")}/>
                    </div>
                    </>

                )}


        </div>
  )
}

export default Row