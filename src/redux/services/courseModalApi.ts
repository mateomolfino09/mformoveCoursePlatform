import requests from "../../utils/requests";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CourseModal } from "../courseModal/courseModalTypes";

export const courseModalApi = createApi({
  reducerPath: 'courseModalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: requests.fetchYT
  }),
  endpoints: (builder) => ({
    loadCourse: builder.query<CourseModal, null>({
      query: () => 'courseModal'
    }),
    loadCourses: builder.query<CourseModal[], null>({
      query: () => 'coursesModal'
    })
  })
})

export const { useLoadCourseQuery, useLoadCoursesQuery } = courseModalApi;  
