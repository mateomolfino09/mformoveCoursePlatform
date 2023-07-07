import requests from "../../utils/requests";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const courseModalApi = createApi({
  reducerPath: 'courseModalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: requests.fetchYT
  }),
  endpoints: (builder) => ({
    loadCourse: builder.query<any, null>({
      query: () => 'courseModal'
    }),
    loadCourses: builder.query<any[], null>({
      query: () => 'coursesModal'
    })
  })
})

export const { useLoadCourseQuery, useLoadCoursesQuery } = courseModalApi;  
