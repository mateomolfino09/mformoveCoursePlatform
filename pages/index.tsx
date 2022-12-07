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

interface Props {
  randomImage: Images
  rickAndMorty: Ricks[]

}

const Home = ({ randomImage, rickAndMorty
 } : Props) => {
  return (
    <div className="relative h-screen bg-gradient-to-b lg:h-[140vh]">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <main className='relative pl-4 pb-24 lg:space-y-24 lg:pl-16'>
        <Banner randomImage={randomImage}/>
        <section className='md:space-y-24'>
          <Row title="Cursos de Moda" rickAndMorty={rickAndMorty} />
          {/* <Row title={"Mi Lista"}/> */}
        </section>
      </main>
    </div>
 )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [
    randomImage,
    rickAndMorty
  ] = await Promise.all([
    fetch(requests.fetchRandomImages).then((res) => res.json()),
    fetch(requests.fetchRickAndmort).then((res) => res.json())
  ])
  return {
    props: {
      randomImage: randomImage,
      rickAndMorty : rickAndMorty.results 
  }
}
}

export default Home;


