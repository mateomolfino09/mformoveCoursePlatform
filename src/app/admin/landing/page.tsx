'use client';

import { MdDone } from 'react-icons/md';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import './page.css';

interface Props {
}

const Index: React.FC<Props> = () => {

  return (
    <>
      <Head>
        <title>Webinar VIP Access</title>
      </Head>

      <div className="webinar-page">
        {/* Seccion 1: Barra de progreso */}
        <section className="progress-section">
          <div className="progress-wrapper">
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={50}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext="50% (Paso 2 de 3: Por favor no salgas o hagas click para volver atrás...)"
              style={{ width: '50%' }}
            >
              <span className="progress-text">
                Paso 2 de 3: Por favor no salgas o hagas click para volver atrás...
              </span>
            </div>
          </div>
        </section>

        {/* Seccion 2: Cabecera */}
        <section className="heading-section">
          <h2>
            Ya casi estás dentro. Mira este video corto con el audio encendido
          </h2>
        </section>

        {/* Seccion 3: Video */}
        <section className="video-section">
          <div className="video-wrapper">
            <iframe
              className="video-iframe"
              src="https://www.youtube.com/embed/pSY3i5XHHXo?si=l3nLYL9x66wdP9Id"
              title="Reproductor de vídeo vimeo"
              frameBorder="0"
              allow="autoplay; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Seccion 4: Titulo de acceso */}
        <section className="section-4">
          <p className="texto-beneficios">
            Si desbloqueas el paquete especial, te llevas:
          </p>
          
          {/* Barra de Progreso dentro de la Sección 4 */}
          <div className="progress-section">
            <div className="progress-wrapper">
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={70}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext="70% (Solo quedan 22 de 100 lugares disponibles...)"
                style={{ width: '70%' }}
              >
                <span className="progress-text">
                  Solo quedan 22 de 100 lugares disponibles...
                </span>
              </div>
            </div>
          </div>

          {/* Seccion 5: Cosas del acceso */}
          <section className="exclusive-access-section" id="acceso-exclusivo">
            <ul className="benefits-list">
              <li>
                <MdDone /> <b>Planificación personalizada</b> para 3 sesiones de
                entrenamiento por semana
              </li>
              <li>
                <MdDone /> <b>Acceso a guías explicativas</b> para TODOS los ejercicios planteados
              </li>
              <li>
                <MdDone /> <b>Asesoramiento 1 a 1</b> para cualquier duda o pregunta de los ejercicios
              </li>
              <li>
                <MdDone /> <b>DEVOLUCIÓN del 100%</b> del pago en caso de que no quedes conforme
              </li>
            </ul>
            <div className="pricing">
              <h2>
                <span className="regular-price">
                  PRECIO REGULAR: <del>$90 USD/Mes</del>
                </span>
              </h2>
              <h2>
                <span className="pre-event-price">
                  <u>
                    <b>
                      PRECIO PRE-LANZAMIENTO: <b className="precio-final">$30 USD/Mes</b>
                    </b>
                  </u>
                </span>
              </h2>
              <a
                className="cta-button"
                href="" // LINK DE PAGO
              >
                <b>¡Si! Quiero mi acceso</b>
              </a>
            </div>
            <img
              className="credit-card-logos"
              src="https://fullmusculo.com/wp-content/uploads/2023/10/logos-cc-disclaimer.png"
              alt="Credit Card Logos"
            />
          </section>
        </section>
      </div>
    </>
  );
};

export default Index;
