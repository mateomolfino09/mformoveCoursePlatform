import React from 'react';

const testimonials = [
  {
    name: 'Ignacio Luz',
    plan: 'Mentoría Estudiante',
    photo: '/images/testimonials/testimonio_nacho.jpg', // Cambia por la ruta real o Cloudinary
    text: 'La mentoría con Mateo es una experiencia transformadora. Gracias a su mirada precisa y su acompañamiento constante, hoy me siento mucho más conectado con mi cuerpo y más cerca de los resultados que deseo.'
  },
  {
    name: 'Sofía Velozo',
    plan: 'Mentoría Practicante',
    photo: '/images/testimonials/sofia.jpeg',
    text: 'Nunca había sentido un progreso tan real y sostenido. Mateo te motiva, te corrige y te acompaña en cada paso. Recomiendo la mentoría a cualquiera que busque un cambio profundo.'
  },
  {
    name: 'Gonzalo Gómez',
    plan: 'Mentoría Explorador',
    photo: '/images/testimonials/sofia.jpg',
    text: 'Mateo como profe es excelente. Siempre te pone a prueba, te motiva y celebra tus intentos, sin importar el resultado. Lo recomiendo al 100% si querés sentirte más libre, con confianza en cada movimiento, y rodeado de un ambiente de amistad.'
  },
  {
    name: 'Diego Ramírez',
    plan: 'Mentoría Practicante',
    photo: '/images/testimonials/gonza.jpg',
    text: 'El seguimiento 1:1 y la calidad humana de Mateo marcan la diferencia. Aprendí a moverme mejor y a confiar en mi cuerpo.'
  },
  {
    name: 'Valentina Torres',
    plan: 'Mentoría Estudiante',
    photo: '/images/testimonials/valentina.jpg',
    text: 'La mentoría me ayudó a superar mis límites y a disfrutar el proceso de cambio. Recomiendo esta experiencia a todos los que buscan algo real.'
  },
  {
    name: 'Juan Pablo Suárez',
    plan: 'Mentoría Explorador',
    photo: '/images/testimonials/juanpablo.jpg',
    text: 'Nunca imaginé que podría avanzar tanto en tan poco tiempo. El plan es personalizado y el acompañamiento es constante. ¡Gracias Mateo!'
  }
];

const MentorshipTestimonials = () => {
  return (
    <section className="py-20 bg-[#F2F3F6] font-montserrat">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" style={{ color: 'black' }}>
          Testimonios de Alumnos
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-md flex flex-col items-center text-center border" style={{ borderColor: '#234C8C' }}>
              <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-[black]">
                <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-lg italic mb-4" style={{ color: 'black' }}>
                “{t.text}”
              </p>
              <div className="mt-auto">
                <p className="font-bold text-[#234C8C]">{t.name}</p>
                <p className="text-sm text-[#4F7CCF]">{t.plan}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorshipTestimonials; 