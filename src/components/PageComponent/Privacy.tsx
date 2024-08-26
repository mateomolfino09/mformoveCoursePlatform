import React from 'react'
import { ClassTypes, ProductDB} from '../../../typings'
import MainSideBar from '../MainSideBar'
import Head from 'next/head'
import Footer from '../Footer'
import FilterNavProductWrapper from '../FilterNavProductWrapper'

interface Props {

}

const Privacy = () => {
  return (
    <div className='relative bg-white lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'  
    >    
    <MainSideBar where={'product'}>
      <FilterNavProductWrapper>
        <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
        </Head>
        <main className='relative lg:space-y-12 space-y-5 mt-32'>
            <section className='!mt-0 lg:pr-64 pl-4 md:pl-20 lg:pl-28'>
                {/* <PrivacyFilters filtersDB={filters}/> */}
                <h1 className='text-black text-3xl md:text-4xl mb-2 font-semibold capitalize font-montserrat md:mb-8'>Políticas de Privacidad</h1>
               <div className='w-full h-full flex-col space-y-4 text-black text-base'>
               <p>Consideramos que el consentimiento, la privacidad de los datos y la transparencia son una prioridad. Poner en tus manos, como usuario, el poder de controlar la información personal que almacenamos es un pilar importante para construir un servicio y comunidad como MforMove. Aquí tienes algunos de nuestros principios de privacidad:</p>

                <p>La información que subes o publicas en MforMove puede ser vista por otros, dependiendo de tu configuración de privacidad.</p>
                <p>Agregamos y desidentificamos cierta información sobre nuestros miembros para usarla con fines comerciales.</p>
                <p>Te damos formas de controlar la privacidad de tu información personal y estamos trabajando continuamente para mejorar las opciones de privacidad disponibles para ti.</p>

                <p>Información general</p>
                <p>Antes de leer la Política de Privacidad de MforMove, por favor también lee nuestros Términos y Condiciones.</p>

                <p>MforMove reconoce que la privacidad es importante y estamos comprometidos a proteger tus derechos de privacidad (“Política”). Utilizamos la información que recopilamos sobre ti para procesar pedidos, mejorar el contenido de MforMove y brindar una experiencia más personalizada.</p>
                <p>También podemos usarla para informarte periódicamente sobre cambios en nuestro sitio web y nuevos productos y servicios. No vendemos, comercializamos ni alquilamos tu información personal a terceros.</p>

                <p>Ten en cuenta que la disponibilidad de cualquier aplicación de MforMove en un sitio de redes sociales, dispositivo móvil o tableta, televisión por internet u otra plataforma tecnológica no indica ninguna relación o afiliación entre MforMove y dicho sitio de redes sociales, dispositivo móvil o tableta, o plataforma tecnológica de televisión por internet.</p>

                <p>Si tienes alguna pregunta sobre esta política, no dudes en contactarnos.</p>

                <p>Al utilizar el servicio, consientes la recopilación y el uso de tu información personal como se describe en esta política. Como esta política puede ser modificada ocasionalmente, deberías visitar esta página periódicamente para revisar cualquier cambio en la política. A través de tu uso continuo del sitio web después de que se realicen cambios en la política, aceptas la política modificada.</p>

                <p>Información que recopilamos y cómo la usamos</p>
                <p>Información que proporcionas: cuando te registras para una cuenta en MforMove, te pedimos información personal (como tu nombre, dirección de correo electrónico y una contraseña de cuenta, y podemos requerir tu fecha de nacimiento, género, dirección postal y de facturación, y código postal). Al momento de registrarte como miembro o durante tu período de prueba gratuito, también solicitamos información de tarjeta de crédito u otra cuenta de pago, la cual mantenemos en forma cifrada en servidores seguros. Podemos combinar la información que envías bajo tu cuenta con información de otros servicios de MforMove o de terceros para brindarte una mejor experiencia y mejorar la calidad de nuestros servicios.</p>

                <p>Hacemos tu perfil disponible para otros usuarios de acuerdo con la configuración de privacidad que estableces como parte de tu perfil. Tu nombre de usuario será identificado para nosotros y para cualquier destinatario de mensajes que envíes a través del servicio.</p>

                <p>También usamos tu nombre, dirección de correo electrónico y otra información en nuestro sistema para notificarte sobre nuevos lanzamientos de productos, notificaciones de servicio, eventos y para solicitar tus comentarios y opiniones. También podemos utilizar tu información, o una parte de ella, para enviarte material de marketing y/o boletines de MforMove u otra información que MforMove considere que podrías necesitar, a menos que nos notifiques que no deseas recibir dicho material. Por favor, contáctanos para solicitar que no te enviemos ninguna o toda esa información.</p>

                <p>Cookies: cuando visitas MforMove, enviamos una o más cookies (un pequeño archivo que contiene una cadena de caracteres) a tu computadora que identifica de manera única tu navegador. Utilizamos cookies para mejorar la calidad de nuestro servicio almacenando las preferencias del usuario y siguiendo las tendencias del usuario. La mayoría de los navegadores están configurados inicialmente para aceptar cookies, pero puedes restablecer tu navegador para rechazar todas las cookies o para indicar cuándo se está enviando una cookie. Sin embargo, algunas características y servicios de MforMove pueden no funcionar correctamente si tus cookies están deshabilitadas. Las cookies recopilan la fecha y la hora de tu visita y tu información de registro.</p>

                <p>Estas cookies pueden ser permanentes o temporales. MforMove utiliza cookies permanentes. Esto significa que la cookie permanece en tu disco duro hasta que la elimines. Puedes eliminar nuestra cookie en cualquier momento siguiendo las instrucciones contenidas en el archivo de ayuda de tu navegador o contactando a la empresa que proporciona el soporte técnico de tu navegador. MforMove no utiliza cookies para almacenar información como números de tarjetas de crédito, números de teléfono u otra información sensible.</p>

                <p>MforMove puede utilizar cookies para ofrecer contenido específico según tus intereses, para guardar tu contraseña, de modo que no tengas que volver a ingresarla cada vez que visites nuestro sitio, o para otros fines.</p>

                <p>Información de actividad: para proporcionar el mejor servicio posible y permitirnos hacer ciertos informes internos y recomendaciones, recopilamos información agregada sobre el uso del servicio, incluida información sobre los usuarios que acceden al sitio web, como direcciones de protocolo de internet (IP), tipo de navegador, idioma del navegador, páginas de referencia/salida y URL, otro historial del navegador, tipo de plataforma, número de clics, nombres de dominio, páginas de destino, páginas vistas y el orden de esas páginas, la cantidad de tiempo dedicado a páginas particulares, y la fecha y hora. Al utilizar el servicio, consientes que retengamos toda tu información de actividad.</p>

                <p>Dirección IP: una dirección de Protocolo de Internet (IP) es un número que se asigna automáticamente a tu computadora cada vez que navegas por la web. Podemos retener tu dirección IP para ayudarnos a diagnosticar problemas con nuestros servidores, administrar nuestro sitio web, ayudarnos a identificarte, recopilar información demográfica amplia anónima (como la cantidad de visitantes de un área geográfica), hacer cumplir el cumplimiento de los términos y condiciones del sitio web, o de otra manera para proteger nuestros servicios, sitios, clientes u otros.</p>

                <p>Información de registro: cuando utilizas el servicio, nuestros servidores registran automáticamente la información que tu navegador envía cada vez que visitas un sitio web. Estos registros del servidor pueden incluir información como tu solicitud web, dirección IP, tipo de navegador, idioma del navegador, la fecha y hora de tu solicitud y una o más cookies que pueden identificar de manera única tu navegador.</p>

                <p>Comunicaciones de usuario: cuando envías correos electrónicos u otra comunicación a MforMove, podemos retener esas comunicaciones para procesar tus consultas, responder a tus solicitudes y mejorar nuestros servicios.</p>

                <p>Sitios afiliados: ofrecemos algunos de nuestros servicios en conexión con otros sitios web. La información personal que proporcionas a esos sitios web puede ser enviada a MforMove para entregar el servicio. Procesamos esa información de acuerdo con esta política. Los sitios web afiliados pueden tener diferentes prácticas de privacidad y te recomendamos leer sus políticas de privacidad.</p>

                <p>Enlaces: MforMove puede presentar enlaces en un formato que nos permita rastrear si se han seguido estos enlaces. Utilizamos esta información para mejorar la calidad de nuestro sitio web.</p>

                <p>Otros sitios web: esta política se aplica a sitios web y servicios que son propiedad y están operados por MforMove. No ejercemos control sobre los sitios web mostrados como resultados de búsqueda o enlaces dentro de nuestros diversos servicios. Estos otros sitios web pueden colocar sus propias cookies u otros archivos en tu computadora, recopilar datos o solicitar información personal de ti.</p>

                <p>¿Qué hace MforMove con la información recopilada en este sitio web?</p>
                <p>Información personal: podemos utilizar tu información personal para los fines descritos en esta política y/o el aviso de privacidad para servicios específicos. Dichos fines incluyen, entre otros:</p>
                <ul>
                <li>Proporcionar nuestros productos y servicios a los usuarios, incluida la visualización de contenido y publicidad personalizados;</li>
                <li>Compartir información con nuestros socios comerciales que realizan servicios básicos (como alojamiento, facturación, almacenamiento de datos, seguridad y servicios de informes) relacionados con la operación del sitio web y el servicio;</li>
                <li>Recopilar y procesar información sobre tu ubicación actual para proporcionar productos y servicios basados en la ubicación y otros contenidos;</li>
                <li>Verificar tu identidad;</li>
                <li>Dar seguimiento a las transacciones iniciadas en el sitio web;</li>
                <li>Auditoría, investigación y análisis para mantener, proteger y mejorar nuestros servicios;</li>
                <li>Garantizar el funcionamiento técnico de nuestra red; y</li>
                <li>Desarrollar nuevos servicios.</li>
                </ul>
                <p>MforMove procesa información personal en sus servidores de todo el mundo. En algunos casos, procesamos información personal en un servidor fuera de tu país. Proporcionamos información personal y no personal a nuestras subsidiarias, empresas afiliadas u otros terceros de confianza o personas para el propósito de procesar información personal en nuestro nombre. Exigimos que estas partes acepten procesar dicha información personal de acuerdo con nuestras instrucciones y cumpliendo con las medidas de confidencialidad y seguridad apropiadas.</p>

                <p>También podemos divulgar información personal si la ley lo exige o en la creencia de buena fe de que dicha acción es necesaria para (1) cumplir con los dictados de la ley o cumplir con el proceso legal que se le haya servido a MforMove o su empresa matriz, subsidiarias o afiliadas, (2) proteger y defender los derechos o la propiedad de MforMove o los usuarios del sitio web, o (3) actuar en circunstancias urgentes para proteger la seguridad del público o los usuarios del sitio web.</p>

                <p>Opciones para la información personal: cuando te registras para el servicio, te pedimos que proporciones información personal. Si utilizamos esta información de manera diferente a la descrita en esta política y/o en los avisos de servicio específicos, entonces solicitaremos tu consentimiento previo a dicho uso.</p>

                <p>Si proponemos utilizar información personal para cualquier propósito que no sea el descrito en esta política y/o en los avisos de servicio específicos, y lo rechazas, es posible que MforMove no pueda proporcionarte su servicio.</p>

                <p>Mantenimiento de la información personal: puedes acceder a tu información contenida en la base de datos de MforMove siguiendo las instrucciones en nuestra página de Protección de Datos y Seguridad. Si crees que alguna de tu información es incorrecta o necesita actualizarse, por favor infórmanos en la dirección de correo electrónico help@MforMove.com. MforMove
                </p>
                <p>Mantenemos procedimientos para que revises la información que recolectamos sobre ti. Obtén más información en nuestra página de Protección de Datos y Seguridad.</p>

                <p>Tomamos medidas de seguridad adecuadas para proteger contra el acceso no autorizado, la alteración, divulgación o destrucción de datos. Esto incluye revisiones internas de nuestras prácticas de recolección, almacenamiento y procesamiento de datos, así como medidas de seguridad físicas para evitar el acceso no autorizado a los sistemas donde almacenamos datos personales.</p>

                <p>Restringimos el acceso a la información personal a empleados, contratistas y agentes de MForMove que necesitan conocer esa información para operar, desarrollar o mejorar nuestros servicios. Estas personas están obligadas por compromisos de confidencialidad y pueden estar sujetas a sanciones, incluyendo el despido y acciones penales, si no cumplen con estas obligaciones.</p>

                <p>Sin embargo, ten en cuenta que ninguna transmisión de datos por Internet puede garantizarse como 100% segura, por lo que, aunque MForMove se esfuerza en proteger tu información, no puede asegurar ni garantizar la seguridad de la información que voluntariamente proporcionas en la plataforma MForMove.</p>

                <p>Cuando utilizas los Servicios, te proporcionamos acceso a tu información personal y te permitimos corregir estos datos si son inexactos o eliminarlos si no se requieren por ley o por motivos comerciales legítimos. Puedes hacerlo contactándonos. Pedimos a los usuarios que se identifiquen y detallen la información que desean acceder, corregir o eliminar antes de procesar dichas solicitudes, y podemos negarnos a procesar solicitudes que sean irrazonablemente repetitivas o sistemáticas, que requieran un esfuerzo técnico desproporcionado, pongan en peligro la privacidad de otros, o sean extremadamente imprácticas (por ejemplo, solicitudes relacionadas con información en cintas de respaldo), o para las cuales no sea necesario el acceso. En cualquier caso donde proporcionemos acceso y corrección de información, realizamos este servicio de forma gratuita, excepto si hacerlo requiere un esfuerzo desproporcionado.</p>
                <p>Áreas del sitio web fuera del control de MForMove</p>
                <p>Enlaces a terceros, relaciones de co-branding y foros públicos – En un intento de proporcionar un mayor valor a nuestros visitantes, MForMove puede elegir varios sitios web de terceros para enlazar, enlazar desde y enmarcar dentro del sitio web. MForMove también puede participar en relaciones de co-branding y otras asociaciones para ofrecer comercio electrónico y otros servicios y características a sus usuarios. Sin embargo, aunque el tercero esté afiliado a MForMove, no tenemos control sobre estos sitios enlazados, cada uno de los cuales tiene prácticas de privacidad y recolección de datos independientes de MForMove. No tenemos responsabilidad ni obligación alguna por estas políticas o acciones independientes, y no somos responsables de las prácticas de privacidad o el contenido de dichos sitios web. Asegúrate de sentirte cómodo con las prácticas de privacidad de cada sitio que visites antes de proporcionarles tu información personal. Estos sitios enlazados son solo para tu conveniencia y, por lo tanto, los accedes bajo tu propio riesgo.</p>

                <p>También podemos poner a tu disposición salas de chat, foros y tableros de mensajes en el sitio web. Recuerda que no podemos controlar la información compartida por los miembros y que cualquier cosa que proporciones voluntariamente en cualquier área pública de Internet estará disponible públicamente para otros visitantes en ese sitio web y potencialmente para otros terceros. Por lo tanto, ten en cuenta que siempre debes tener precaución al decidir divulgar públicamente cualquier información personal en estas y similares áreas.</p>

                <p>Aplicación de la política</p>
                <p>MForMove revisa regularmente su cumplimiento con esta política. No dudes en dirigir cualquier pregunta o inquietud sobre esta política o el tratamiento de la información personal por parte de MForMove contactándonos.</p>

                <p>Cuando recibimos quejas formales por escrito en esta dirección, es política de MForMove contactar al usuario que presenta la queja en relación con sus inquietudes. Cooperaremos con las autoridades reguladoras correspondientes, incluidas las autoridades locales de protección de datos, para resolver cualquier queja relacionada con la transferencia de datos personales que no pueda resolverse entre MForMove y un individuo.</p>

                <p>Usuarios menores de 18 años</p>
                <p>El contenido de MForMove no está dirigido a usuarios menores de dieciocho (18) años de edad, y si proporcionas información sobre ti como usuario de MForMove, estás declarando que tienes al menos dieciocho (18) años de edad. No recopilamos conscientemente información personal identificable de nadie menor de dieciocho (18) años de edad, pero si llegamos a tener conocimiento de haber recopilado información personal identificable de un usuario menor de dieciocho (18) años de edad, eliminaremos dicha información de nuestros archivos.</p>

                <p>Derechos de los miembros de la UE</p>
                <p>Si te encuentras habitualmente en la Unión Europea, tienes derecho a acceder, rectificar, descargar o borrar tu información, así como el derecho a restringir y oponerte a cierto procesamiento de tu información. Si bien algunos de estos derechos se aplican en general, ciertos derechos solo se aplican en circunstancias limitadas.</p>

                <p>Describimos estos derechos a continuación:</p>

                <p>Acceso y portabilidad: Puedes acceder a gran parte de tu información iniciando sesión en tu cuenta. Si requieres acceso adicional o si no eres miembro de MForMove, contáctanos.</p>

                <p>Rectificar, restringir, limitar, eliminar: También puedes rectificar, restringir, limitar o eliminar gran parte de tu información iniciando sesión en tu cuenta. Si no puedes hacerlo, contáctanos. MForMove generalmente responderá a tu solicitud en un plazo de 10 a 14 días hábiles.</p>

                <p>Objeción: Cuando procesamos tu información en función de nuestros intereses legítimos explicados anteriormente o en interés público, puedes oponerte a este procesamiento en determinadas circunstancias. En tales casos, dejaremos de procesar tu información a menos que tengamos razones legítimas imperiosas para continuar procesándola o cuando sea necesario por razones legales.</p>

                <p>Revocar el consentimiento: Cuando hayas proporcionado previamente tu consentimiento, como para permitirnos procesar datos relacionados con tu salud, tienes el derecho de retirar tu consentimiento al procesamiento de tu información en cualquier momento. Por ejemplo, puedes retirar tu consentimiento actualizando tu configuración. En ciertos casos, podemos continuar procesando tu información después de haber retirado el consentimiento si tenemos una base legal para hacerlo o si tu retirada del consentimiento se limitó a ciertas actividades de procesamiento.</p>

                <p>Queja: Si deseas plantear una preocupación sobre nuestro uso de tu información (y sin perjuicio de cualquier otro derecho que puedas tener), tienes derecho a hacerlo ante tu autoridad supervisora local.</p>

                <p>Cambios a esta política</p>
                <p>Ten en cuenta que esta política puede cambiar de vez en cuando. No reduciremos tus derechos bajo esta política sin tu consentimiento explícito, y esperamos que la mayoría de los cambios sean menores. Sin embargo, publicaremos cualquier cambio de política en esta página y, si los cambios son significativos, proporcionaremos un aviso más destacado (incluyendo, para ciertos servicios, notificación por correo electrónico de los cambios en la política). Cada versión de esta política será identificada en la parte inferior de la página por su fecha de entrada en vigor, y también mantendremos versiones anteriores de esta política de privacidad en un archivo para tu revisión.</p>

                <p>Términos y condiciones de uso de MForMove</p>
                <p>Una declaración completa de nuestros Términos y Condiciones de Uso se puede encontrar aquí. Los Términos y Condiciones de Uso de MForMove se incorporan expresamente en esta política por esta referencia.</p>

                <p>Tu consentimiento</p>
                <p>Al utilizar nuestro sitio web, consientes la recopilación y uso de información por parte de MForMove tal como se establece en esta política. Si decidimos cambiar nuestra política, publicaremos esos cambios en esta página para que siempre estés al tanto de qué información recopilamos, cómo la usamos y bajo qué circunstancias limitadas la divulgamos. El acceso continuo o el uso del sitio web constituirá tu aceptación expresa de cualquier modificación a esta política.</p>

               </div>
            </section>
        </main>
        <Footer />
        </FilterNavProductWrapper>

    </MainSideBar>

    </div>

  )
}

export default Privacy