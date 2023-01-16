import MuiModal from '@mui/material/Modal'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from '../redux/reducers'
import { Courses, CoursesDB, Item } from '../typings'
import { CourseModal } from '../redux/courseModal/courseModalTypes'
import { closeCourse } from '../redux/courseModal/courseModalAction'
import { HandThumbUpIcon, PlusCircleIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAppDispatch } from '../hooks/useTypeSelector'
import ReactPlayer from 'react-player/lazy'
import { FaPlay, FaThumbsUp, FaVolumeMute, FaVolumeOff, FaVolumeUp } from 'react-icons/fa'
import requests from '../utils/requests'
import axios from 'axios'
import Row from './Row'
import Link from 'next/link'

interface Props {
    courseDB : CoursesDB | null
}

function Modal({ courseDB } : Props) {
    const youtubeURL = `${requests.playlistYTAPI}?part=snippet&playlistId=${courseDB?.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
    const [items, setItems] = useState<Item[] | null>(null)
    const [url, setUrl] = useState<string | null>(null)
    const course: CourseModal = useSelector((state: State) => state.courseModalReducer)
    let { loading, error,activeModal,dbCourse, youtubeVideo  } = course
    const [muted, setMuted] = useState(false);
    const dispatch = useAppDispatch()
    const videoFromDB:Item | null = youtubeVideo != null ? youtubeVideo[0] : null

    useEffect(() => {
        if(!courseDB) return
        const getCourseIntro = async () => {
            try {
                const config = {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                const { data } = await axios.post('/api/course/getCourseIntro', { youtubeURL }, config)
                setUrl(`https://www.youtube.com/embed/${data.items[0].snippet.resourceId.videoId}`) 
                setItems(data.items)
                
            } catch (error: any) {
                console.log(error.message)
            }
        }

        getCourseIntro()

    }, [])

    const handleClose = () => {
        dispatch(closeCourse())
    }

    return (
        <MuiModal open={activeModal} onClose={handleClose} className="fixed !top-7 left-0 right-0 z-50 mx-auto w-full max-w-5xl overflow-hidden overflow-y-scroll rounded-md scrollbar-hide">
            <>
                <button onClick={handleClose} className='modalButton absolute right-5 top-5 !z-40 h-9 w-9 border-none'>
                    <XCircleIcon className='h-6 w-6'/>
                </button>

                <div className='relative pt-[56.25%]'>
                    <ReactPlayer 
                    url={url?.toString()}
                    width='100%'
                    height='100%'
                    style={{ position: 'absolute', top: '0', left: '0 '}}
                    playing
                    muted={muted}
                    />
                    <div className='absolute bottom-10 flex w-full items-center justify-between px-10'>
                        <div className='flex space-x-2'>
                        <Link href={`src/courses/${courseDB?.playlist_code}`}>
                        <button className='flex items-center gap-x-2 rounded bg-white px-8 text-xl font-bold py-1 text-black transition hover:bg-[#e6e6e6]'>           <FaPlay className='h-7 w-7 text-black'/>
                            Ver</button>
                        </Link>


                            <button className='modalButton'>
                                <PlusCircleIcon className='h-7 w-7'/>
                            </button>
                            <button className='modalButton'>
                                <HandThumbUpIcon className='h-7 w-7'/>
                            </button>
                        </div>
                        <button className='modalButton' onClick={() => {
                            setMuted(!muted)
                            console.log(muted)}}>
                            {muted ? (
                                <FaVolumeMute className='h-6 w-6'/>
                            ) : (
                                <FaVolumeUp className='h-6 w-6'/>
                            )}
                        </button>
                    </div>
                </div>

                <div className='flex space-x-16 rounded-b-md bg-[#181818] px-10 py-10'>
                    <div className='space-y-6 text-lg'>
                        <div className='flex items-center space-x-2 text-sm'>
                        <p className='font-semibold text-green-400'>100% Match</p>
                            <p className='font-light'>{items != null ? new Date(items[0].snippet.publishedAt).toUTCString(): ''}</p>
                            <div className='flex h-4 items-center justify-center rounded border border-white/40 px-1.5 text-xs '>HD</div>
                        </div>
                        <div className='flex flex-col gap-x-10 gap-y-4 font-light md:flex-row '>
                            <p className='w-5/6'>{items != null ? items[0].snippet.description.toString() : ''}</p>
                            <div className='flex flex-col space-y-3 text-sm'>
                                <div>
                                    <span className='text-[gray]'>Generos: </span>
                                    Peluqueria
                                </div>

                                <div>
                                    <span className='text-[gray]'>Idioma Original: </span>
                                    en
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                <div className='flex space-x-16 rounded-b-md bg-[#181818] px-10 py-10'>
                    <Link href={`src/courses/${courseDB?.playlist_code}`}>
                        <Row items={items} courseDB={courseDB} title= {items != null ? items[0].snippet.title : ''} courses={null} setSelectedCourse={null} /> 

                    </Link>
                </div>

            </>
        </MuiModal>
    )
}

export default Modal