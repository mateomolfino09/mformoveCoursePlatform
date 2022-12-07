import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { useRef, useState } from "react"
import { Ricks } from "../typings"
import Thumbnail from "./Thumbnail"

interface Props {
    title: string,
    rickAndMorty: Ricks[]
}

function Row({ title, rickAndMorty} : Props) {
    const rowRef = useRef<HTMLDivElement>(null);
    const[isMoved, setIsMoved] = useState(false);

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

    return (
        <div className="h-40 space-y-0.5 md:space-y-2">
            <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#E5E5E5] transition duration-200 hover:text-white md:text-2xl" >{title}</h2>
            <div className="group relative md:-ml-2">
                <ChevronLeftIcon className={`ScrollIcon left-2 ${!isMoved && 'hidden'}`}  onClick={() => handleClick("left")}/>

                <div ref={rowRef} className="scrollbar-hide flex items-center space-x-0.5 overflow-x-scroll md:space-x-2.5 md:p-2">
                    {rickAndMorty.map((character) => (
                        <Thumbnail key={character.id} character={character}/>
                    ))}
                </div>

                <ChevronRightIcon className={`ScrollIcon right-2`} onClick={() => handleClick("right")}/>
            </div>
        </div>
  )
}

export default Row