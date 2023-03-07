import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import React from 'react'
import Banner from '../components/IndexBanner'
import IndexHeader from '../components/IndexHeader'
import { User } from '../typings'
import { getUserFromBack } from './api/user/getUserFromBack'

interface Props {
    user: User | null
}

const Index = ({ user }: Props) => {
    return (
        <div className="relative h-screen bg-gradient-to-b lg:h-[100vh]">
          <Head>
            <title>Video Streaming</title>
            <meta name="description" content="Stream Video App" />
            <link rel="icon" href="/favicon.ico" />
          </Head>    
          <IndexHeader user={user}/>
          <main className='relative pl-4 lg:space-y-24 lg:pl-16'>
            <Banner randomImage={null}/>
          </main>
            </div>
     )
}

export async function getServerSideProps(context: any) {
    const { params, query, req, res } = context
    const session = await getSession({ req })
      // Get a cookie
    const cookies = parseCookies(context)
    const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
    const email = userCookie?.email 
    let user = null

    if(email != null) user = await getUserFromBack(email)

    return {
      props: { user  }
    }
  } 
  

export default Index