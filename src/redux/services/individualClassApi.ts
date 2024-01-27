import { url } from "inspector";
import { ClassesDB } from "../../../typings";
import requests from "../../utils/requests";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const individualClassApi = createApi({
  reducerPath: 'individualClassApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/individualClass'
  }),
  tagTypes: ['individualClass'], 
  endpoints: (builder) => ({
    getClass: builder.query<any, {id: number}>({
      query: ({id}) => `/getClassById/${id}`,
      providesTags: ["individualClass"],
      transformResponse: (response: any) => response?.clase
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
        invalidatesTags: ["individualClass"],
        
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
        invalidatesTags: ["individualClass"],
        
    }),
    deleteFile: builder.mutation({
        query: (args: any) => {
            const { file, clase } = args

            const claseId = clase.id

            return {
                url: `/deleteFile/${file.id}`,
                method: 'DELETE',
                body: {claseId}
            }
        },
        invalidatesTags: ["individualClass"]
    }),
    deleteLink: builder.mutation({
        query: (args: any) => {
            const { link, clase } = args

            const claseId = clase.id

            return {
                url: `/deleteLink/${link.id}`,
                method: 'DELETE',
                body: {claseId}
            }
        },
        invalidatesTags: ["individualClass"]
    })
  })
})

export const { useGetClassQuery, useAddFilesMutation, useDeleteFileMutation, useDeleteLinkMutation, useAddLinksMutation } = individualClassApi;  
