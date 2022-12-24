import { env } from 'process';
import React from 'react'
import Youtube from '../../components/Youtube';
import requests from '../../utils/requests'




export async function getServerSideProps() {
    const res = await fetch(requests.fetchYT);
    const data = await res.json()
    return {
      props: {
        data,
        req: requests.fetchYT
      }
    }
  }


function clase({ data, req }) {



  return (
    <div>
    <h1>Curso</h1> 
     <Youtube />
 </div>
  )
}


export default clase