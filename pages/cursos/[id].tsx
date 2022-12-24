import { GetStaticPaths, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'
import React from 'react'
import requests from '../../utils/requests'
import { Ricks, Playlist, Item } from '../../typings'
import { Context } from 'vm'
import Youtube from '../../components/Youtube'
import { getSession } from 'next-auth/react'

interface Props {
    curso: Ricks,
    playlist: Playlist
}


function Curso({ curso, playlist }: Props) {
  return (
    <div>
       <h1>Curso 1</h1> 
        <Youtube playlist = {playlist.items}/>
    </div>
  )
}

export const getStaticPaths = async () => {
    const data = await fetch(requests.fetchRickAndmort).then((res) => res.json())
    const paths = data.results.map((course: Ricks) => {
        return {
            params: { id : course.id.toString()}
        }
    })
    return { paths, fallback: false }
}

export const getStaticProps = async (context: any) => {
    const id = context.params.id;

    const res = await fetch(requests.fetchRickAndmort + '/' + id)
    const resYT = await fetch(requests.fetchYT);
    const dataYT = await resYT.json()

    const data = await res.json()

    const session = await getSession(context)
    if(!session) {
    return {
        redirect: {
        destination: "/src/user/login"
        
        }
    }
    }

    return {
        props: { curso: data, playlist: dataYT }
    }
} 



export default Curso