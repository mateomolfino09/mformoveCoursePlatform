import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import imageLoader from '../imageLoader'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import Header from '../components/Header'
import Banner from '../components/Banner'
import requests from '../utils/requests'
import { Images, Ricks } from '../typings'
import Row from '../components/Row'
import { getSession, useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { parseCookies } from 'nookies'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { wrapper } from '../redux/store'
import { loadUser } from '../redux/user/userAction'
import { useSelector } from 'react-redux'
import Modal from '../components/Modal'
import { CourseModal } from '../redux/courseModal/courseModalTypes'
import { State } from '../redux/reducers'

interface Props {
  randomImage: Images
  rickAndMorty: Ricks[]
  session: Session

}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

const Home = ({ randomImage, rickAndMorty
 } : Props) => {

  const course: CourseModal = useSelector((state: State) => state.courseModaleducer)
  let { loading, error,activeModal,dbCourse  } = course
  
  const [showModal, setShowModal] = useState(false)
  const userDB = useSelector((state: any) => state.dbUser)  
  const cookies = parseCookies()
  const {data: session} = useSession() 
  const router = useRouter()

  let user = cookies?.user ? JSON.parse(cookies.user): session?.user ? session.user : ''

  useEffect(() => {
    user = cookies?.user ? JSON.parse(cookies.user): session?.user ? session.user : ''
    if (user === '') {
      router.push("/src/user/login")
    }
  }, [router, session, cookies])
  
  return (
    <div className="relative h-screen bg-gradient-to-b lg:h-[140vh]">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header/>

      <main className='relative pl-4 pb-24 lg:space-y-24 lg:pl-16'>
        <Banner randomImage={randomImage}/>
        <section className='md:space-y-24 mt-48 md:mt-24 lg:mt-0'>
          <Row title="Cursos de Moda" rickAndMorty={rickAndMorty} />
          {/* <Row title={"Mi Lista"}/> */}
        </section>
      </main>

      {activeModal && <Modal />}
    </div>
 )
}

// export const getServerSideProps: any = async (context: any) => {
//   const [
//     randomImage,
//     rickAndMorty
//   ] = await Promise.all([
//     fetch(requests.fetchRandomImages).then((res) => res.json()),
//     fetch(requests.fetchRickAndmort).then((res) => res.json())
//   ])

//   return {
//     props: {
//       randomImage: randomImage,
//       rickAndMorty : rickAndMorty.results ,
//   }
// }
// }

export const getServerSideProps: GetServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req }) => {
      const cookies = parseCookies()
      const session = await getSession({ req })
      const [
        randomImage,
        rickAndMorty
      ] = await Promise.all([
        fetch(requests.fetchRandomImages).then((res) => res.json()),
        fetch(requests.fetchRickAndmort).then((res) => res.json())
      ])

      const user: User = cookies?.user ? JSON.parse(cookies.user) : session?.user

      await store.dispatch(loadUser(user?.email, user))

      return {
        props: {
          randomImage: randomImage,
          rickAndMorty : rickAndMorty.results ,
      }
    }
  }
)

export default Home;


