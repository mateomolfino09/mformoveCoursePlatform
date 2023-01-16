import { GetStaticPaths, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'
import React from 'react'
import { CoursesDB, Item } from '../../../typings'
import { getCourses } from '../../api/course/getCourses'
import { getCourseById } from '../../api/course/getCourseById'
import axios from 'axios'
import requests from '../../../utils/requests'

interface IParams extends ParsedUrlQuery {
  slug: string
}

interface Props {
  youtubeCourse: Item[],
  course: CoursesDB

}

const Course = ({ youtubeCourse, course }: Props) => {
  console.log(youtubeCourse, course)
  return (
    <div>Course</div>
  )
}

interface IParams extends ParsedUrlQuery {
  slug: string
}

export const getStaticPaths: any = async () => {
  const data = await getCourses()

  const paths = data.map((course: CoursesDB) => {
      return {
          params: { id: course.id.toString() },
      }
  })
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (context) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    }
    const { id } = context.params as IParams
    const numberId = id != undefined ? +id : undefined
    const course: CoursesDB = await getCourseById(id)
    const youtubeURL = `${requests.playlistYTAPI}?part=snippet&playlistId=${course?.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
    console.log(youtubeURL)
    const initial = await fetch(youtubeURL);
    const data = await initial.json()
  
    return { props: { youtubeCourse: data.items ,course: course } }
  } catch (error: any) {
    console.log(error.message)
    return { props: { error: error.message }}
  }

}

export default Course