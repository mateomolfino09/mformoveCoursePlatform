'use client'

import React from 'react'
import { 
  FlagIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  StarIcon,
  AcademicCapIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import MainSideBar from '../../components/MainSidebar/MainSideBar'
import Footer from '../../components/Footer'
import { Card, Badge } from '../../components/ui'

const About = () => {
  return (
    <MainSideBar where={'about'}>
      <div className="min-h-screen absolute w-screen bg-white">
        <main className="relative lg:space-y-12 space-y-8 mt-32">
          <section className="!mt-0 lg:pr-64 pl-4 md:pl-20 lg:pl-28">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-[#234C8C] text-4xl md:text-5xl mb-4 font-bold font-montserrat">
                Sobre MforMove
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                Somos una plataforma dedicada a transformar vidas a través del movimiento, 
                la mentoría y el aprendizaje continuo. Nuestra misión es conectar personas 
                con expertos que pueden guiarlos en su camino hacia el bienestar físico y mental.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8">
                <h2 className="text-[#234C8C] text-2xl font-semibold mb-4 font-montserrat">
                  Nuestra Misión
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Facilitar el acceso a conocimiento especializado y mentoría personalizada 
                  para que cada persona pueda alcanzar su máximo potencial en movimiento, 
                  salud y bienestar integral.
                </p>
              </Card>

              <Card className="p-8">
                <h2 className="text-[#234C8C] text-2xl font-semibold mb-4 font-montserrat">
                  Nuestra Visión
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Ser la plataforma líder en Latinoamérica que conecte a millones de personas 
                  con expertos en movimiento, creando una comunidad global comprometida 
                  con el crecimiento personal y la excelencia física.
                </p>
              </Card>
            </div>

            {/* Values */}
            <div className="mb-12">
              <h2 className="text-[#234C8C] text-3xl font-semibold mb-8 font-montserrat">
                Nuestros Valores
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#234C8C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Excelencia</h3>
                  <p className="text-gray-600">
                    Buscamos la excelencia en todo lo que hacemos, desde la calidad de nuestros 
                    mentores hasta la experiencia del usuario.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#234C8C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Comunidad</h3>
                  <p className="text-gray-600">
                    Creemos en el poder de la comunidad y en la importancia de conectar 
                    personas con objetivos similares.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#234C8C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <LightBulbIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Innovación</h3>
                  <p className="text-gray-600">
                    Constantemente innovamos en nuestras metodologías y tecnologías 
                    para ofrecer la mejor experiencia posible.
                  </p>
                </Card>
              </div>
            </div>

            {/* Team */}
            <div className="mb-12">
              <h2 className="text-[#234C8C] text-3xl font-semibold mb-8 font-montserrat">
                Nuestro Equipo
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src="https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg" 
                      alt="Mateo Molfino" 
                      className="w-full h-full object-cover" 
                      style={{ objectPosition: 'center 10%' }} 
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Mateo Molfino</h3>
                  <Badge variant="primary" className="mb-3">Fundador & CEO</Badge>
                  <p className="text-gray-600 text-sm">
                    Especialista en movimiento y emprendimiento, apasionado por conectar 
                    personas con su potencial máximo.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Equipo de Desarrollo</h3>
                  <Badge variant="info" className="mb-3">Tecnología</Badge>
                  <p className="text-gray-600 text-sm">
                    Expertos en crear experiencias digitales excepcionales que facilitan 
                    el aprendizaje y la conexión.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Mentores Expertos</h3>
                  <Badge variant="success" className="mb-3">Especialistas</Badge>
                  <p className="text-gray-600 text-sm">
                    Profesionales certificados en diversas disciplinas del movimiento, 
                    listos para guiar tu transformación.
                  </p>
                </Card>
              </div>
            </div>



            {/* CTA */}
            <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-[#234C8C] text-2xl font-semibold mb-4 font-montserrat">
                ¿Listo para comenzar tu transformación?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Únete a nuestra comunidad y descubre cómo el movimiento puede cambiar tu vida. 
                Conecta con expertos, aprende nuevas habilidades y alcanza tus objetivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/mentorship" 
                  className="bg-[#234C8C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1a3763] transition-colors"
                >
                  Explorar Mentorías
                </a>
                <a 
                  href="/mentorship" 
                  className="border-2 border-[#234C8C] text-[#234C8C] px-8 py-3 rounded-lg font-semibold hover:bg-[#234C8C] hover:text-white transition-colors"
                >
                  Agendar Mentoría
                </a>
              </div>
            </Card>
          </section>
        </main>
        <Footer />
      </div>
    </MainSideBar>
  )
}

export default About