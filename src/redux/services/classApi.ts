import { url } from "inspector";
import { ClassesDB } from "../../../typings";
import requests from "../../utils/requests";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const classApi = createApi({
  reducerPath: 'classApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/class'
  }),
  tagTypes: ['Classes'], 
  endpoints: (builder) => ({
    getClass: builder.query<any, {id: string}>({
      query: ({id}) => `/getClassById/${id}`,
      providesTags: ["Classes"],
      transformResponse: (response) => response
    }),
    addFiles: builder.mutation({
        query: (args: any) => {
            const { dataFiles, userId, claseId } = args;
            return {
                url: `/addFiles`,
                method: 'PUT',
                body: {dataFiles, userId, claseId}
            }
        },
        invalidatesTags: ["Classes"],
        
    }),
    addLinks: builder.mutation({
        query: (args: any) => {
            const { links, userId, claseId } = args;
            return {
                url: `/addLinks`,
                method: 'PUT',
                body: {links, userId, claseId}
            }
        },
        invalidatesTags: ["Classes"],
        
    }),
    deleteFile: builder.mutation({
        query: (args: any) => {
            const { file, clase } = args

            const claseId = clase._id

            return {
                url: `/deleteFile/${file.id}`,
                method: 'DELETE',
                body: {claseId}
            }
        },
        invalidatesTags: ["Classes"]
    }),
    deleteLink: builder.mutation({
        query: (args: any) => {
            const { link, clase } = args

            const claseId = clase._id

            return {
                url: `/deleteLink/${link.id}`,
                method: 'DELETE',
                body: {claseId}
            }
        },
        invalidatesTags: ["Classes"]
    })
  })
})

export const { useGetClassQuery, useAddFilesMutation, useDeleteFileMutation, useDeleteLinkMutation, useAddLinksMutation } = classApi;  
