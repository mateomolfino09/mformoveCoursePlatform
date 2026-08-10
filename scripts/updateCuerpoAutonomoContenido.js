/**
 * Reemplaza cursoConfig.contenidoModulos del producto "Cuerpo Autónomo" ya insertado en
 * PRODUCCIÓN (_id 6a74b5b24758cf3bdadb7526) por la estructura real de 3 módulos
 * (Calmar / Ordenar / Construir, 22 clases) definida en la conversación.
 *
 * - descripcionGeneral / descripcionCorta: texto tal cual lo dio el usuario ("Descripción
 *   general" / "Foco alumno" por clase).
 * - descripcionCompleta: redactada por Claude (autorizado explícitamente por el usuario:
 *   "utiliza lo que te convenga para diseñar uno por uno"), adaptando el material teórico
 *   que ya existía en el módulo viejo donde el tema coincide, y escribiendo contenido nuevo
 *   donde no había equivalente.
 * - videoId / videoUrl / pdfUrl: vacíos a propósito (el usuario pidió no ocuparse de esto
 *   todavía: "NO te preocupes por esto, luego ordenamos los videoId y URL").
 * - No toca publicado / fechaPublicacion (siguen en false / null desde el insert anterior).
 * - Borra los 11 CourseClass viejos de este producto y crea los 22 nuevos.
 *
 * Uso:
 *   node scripts/updateCuerpoAutonomoContenido.js            # dry-run
 *   node scripts/updateCuerpoAutonomoContenido.js --confirm  # escribe en PRODUCCIÓN
 */

require('dotenv').config();
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
const PRODUCT_ID = '6a74b5b24758cf3bdadb7526';

const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION;
if (!PRODUCTION_URI) {
  console.error('❌ Falta MONGODB_URI_PRODUCTION en .env');
  process.exit(1);
}
if (PRODUCTION_URI.includes('clustertest')) {
  console.error('❌ MONGODB_URI_PRODUCTION apunta a "clustertest" (dev). Abortando.');
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({}, { strict: false, versionKey: '__v' });
const CourseClassSchema = new mongoose.Schema({}, { strict: false, versionKey: false });
const Product = mongoose.model('Product', ProductSchema);
const CourseClass = mongoose.model('CourseClass', CourseClassSchema);

function clase({ name, general, corta, completa, materials = [] }, order) {
  return {
    name,
    description: general,
    descripcionGeneral: general,
    descripcionCorta: corta,
    descripcionCompleta: completa,
    videoUrl: '',
    videoId: '',
    videoThumbnail: '',
    duration: 0,
    level: 1,
    order,
    materials,
    visibleInLibrary: true,
    pdfUrl: '',
    titulo: '',
    vimeoVideoId: '',
    orden: 0,
  };
}

const MODULOS = [
  {
    timelineIndex: 0,
    titulo: 'Calmar',
    esencia:
      'Bajás la alerta que te tiene rígido.\nUn cuerpo rígido es un sistema nervioso en alerta. Antes de construir cualquier cosa hay que bajar esa alerta. Sin esto los otros módulos no funcionan.',
    bundleTipo: 'videos',
    vimeoPlaylistId: '',
    clases: [
      clase({
        name: 'Cómo usar este módulo',
        general:
          'Qué es Calmar y por qué es el primer paso antes de cualquier otra cosa. Cómo abordar las clases, qué actitud traer y qué no esperar todavía. Este módulo no se mide en resultados físicos, se mide en conciencia.',
        corta:
          'Antes de empezar, necesitás saber cómo empezar. Este video te dice exactamente cómo usar lo que viene para que no lo conviertas en otra cosa que forzar.',
        completa:
          'Calmar es el primer módulo del programa y, antes de arrancar, necesitás saber para qué sirve. No se mide en flexibilidad ganada ni en sentadillas hechas. Se mide en cuánta conciencia tenés de tu propio cuerpo al terminarlo.\n\nSi llegaste hasta acá buscando resultados físicos inmediatos, es normal, pero no es de eso que se trata este módulo. Antes de forzar cualquier cambio necesitamos bajar la alerta que sostiene la rigidez. Eso no se logra con más esfuerzo, se logra con más atención.\n\nHacé estas clases sin apuro. No busques hacerlo perfecto, ni completar una lista de ejercicios. Buscá información: cómo respira tu cuerpo, dónde guarda tensión, qué evita hacer. Esa información es la base de todo lo que viene después en Ordenar y Construir.',
      }, 0),
      clase({
        name: '¿Por qué estás rígido?',
        general:
          'La rigidez no es un problema muscular, es una respuesta del sistema nervioso. Esta clase trabaja el mecanismo neurofisiológico detrás de la tensión crónica y por qué el enfoque convencional de forzar el estiramiento perpetúa el problema. El método parte de regular el tono muscular desde el sistema nervioso, no desde la fuerza.',
        corta:
          'El problema no es que estires poco. Tu cuerpo se rigidiza porque tu sistema nervioso vive en alerta, es un reflejo de protección perpetuado. Para cambiarlo, necesitas entender por qué pasa. Esta clase te da esa respuesta.',
        completa:
          'Tu cuerpo no te limita porque esté roto. Te limita porque te está protegiendo.\n\nLa sensación de rigidez depende tanto de los tejidos como del sistema nervioso, y no siempre en la proporción que pensamos. No hay evidencia sólida de que un músculo se "endurezca" en el sentido literal de la palabra de un día para otro. Lo que sí influye es una combinación de factores: musculares (acortamiento, debilidad), contextuales (estrés, mal descanso, mala alimentación, sobrecarga de vida), ambientales (temperatura, humedad) y psico-emocionales (miedo al dolor, creencias, experiencias previas). Muchas veces no estás rígido en un sentido mecánico. Simplemente tu cuerpo se percibe así.\n\nPor eso en este programa preferimos hablar de recuperar confianza y ganar seguridad: "sé cómo hacerlo, puedo hacerlo, ya no me genera dolor". Como el cuerpo funciona como un sistema conectado por tejido, para ganar esa seguridad trabajamos tanto lo mecánico como lo mental, y lo hacemos en el cuerpo entero, porque cada parte afecta a las demás.\n\nLa pregunta que te vamos a proponer cambiar a lo largo del programa no es "¿qué músculo tengo corto?", sino "¿por qué se está protegiendo mi cuerpo en esta zona?".',
      }, 1),
      clase({
        name: 'El poder de la respiración',
        general:
          'Respiración mecánica. Cómo activar el sistema parasimpático, reducir la tensión basal y preparar el cuerpo para el descanso. Meditación como el acto de observación del pensamiento, fuera del juicio. El primer escaneo corporal aparece en prestarle atención a la respiración y al cuerpo en quietud.',
        corta:
          'Respirar bien te cambia la vida. Es una herramienta directa para bajar la tensión, regular el descanso, reducir el estrés y vivir con más claridad y ganas. Nadie te enseña cómo usarla. Acá la combinamos con el movimiento del cuerpo, las enseñanzas del yoga y la ciencia.',
        completa:
          'La respiración es la herramienta más directa que tenés para hablarle a tu sistema nervioso. Cuando respirás rápido y corto, le decís a tu cuerpo que siga en alerta. Cuando respirás lento y profundo, activás el sistema parasimpático: el que baja la tensión basal, mejora el descanso y le da al cuerpo permiso para dejar de protegerse.\n\nEn esta clase trabajamos la respiración diafragmática, exhalaciones largas y una meditación breve, no como relajación aislada, sino como la puerta de entrada al resto del programa. La meditación, acá, no es vaciar la mente. Es observar el pensamiento sin juzgarlo, de la misma forma que vamos a aprender a observar el cuerpo.\n\nEl primer escaneo corporal del programa aparece así, de la forma más simple posible: prestándole atención a tu respiración y a tu cuerpo en quietud. Antes de movernos, aprendemos a estar.',
      }, 2),
      clase({
        name: 'El dolor: de condena a oportunidad',
        general:
          'Clase teórica y reflexiva. Desmitificación del dolor como señal de peligro. El dolor como sistema de información del cuerpo, la diferencia entre dolor agudo y tensión crónica, y por qué ignorarlo o temerlo perpetúa el problema. Base filosófica y científica para abordar el resto del programa.',
        corta:
          'El dolor no es una condena. Es tu cuerpo hablándote. Acá aprendés a escucharlo en vez de tenerle miedo, y eso cambia cómo te relacionás con él para el resto de tu vida. Lo habitás y lo escuchás o lo evitás y le escapás, el resultado es muy distinto.',
        completa:
          'Durante años nos enseñaron a tratar el dolor como una señal de peligro que hay que eliminar cuanto antes. Esta clase es teórica y reflexiva, y busca desarmar esa idea.\n\nEl dolor es, ante todo, un sistema de información. No es lo mismo un dolor agudo —una señal clara de alarma— que una tensión crónica que tu cuerpo sostiene desde hace tiempo. Tratarlos igual, con miedo o evitación, suele perpetuar el problema en lugar de resolverlo.\n\nNo buscamos que sufras ni que sobre-exijas al cuerpo. Buscamos que aprendas a diferenciar: qué incomodidad te ayuda a crecer y cuál te está pidiendo que la respetes. Esa distinción es la base filosófica y científica del resto del programa. El dolor no es una condena, es tu cuerpo hablándote. Podés habitarlo y escucharlo, o evitarlo y escaparle. El resultado, con el tiempo, es muy distinto.',
      }, 3),
      clase({
        name: 'Relaja tu cuerpo: escaneo corporal',
        general:
          'Primera instancia de autodiagnóstico guiado. El alumno aprende a identificar zonas de alerta y zonas inhibidas desde la observación en quietud y movimiento. Sienta las bases del criterio propio que el método busca desarrollar a lo largo de las 12 semanas.',
        corta:
          'Por primera vez vas a prestarle atención a tu cuerpo sin juzgarlo. Vas a descubrir qué zonas están tensas, cuáles están apagadas y qué tiene para decirte cada una.',
        completa:
          'Esta es tu primera instancia de autodiagnóstico guiado. No hay ejercicio que hacer perfecto ni resultado que lograr: el objetivo es que aprendas a identificar, en quietud y en movimiento, qué zonas de tu cuerpo están en alerta y cuáles casi no percibís.\n\nHacemos un escaneo corporal inicial, seguido de sacudidas suaves para soltar tensión superficial, y después empezamos a movilizar articulaciones que muchas veces dejan de explorar su rango completo simplemente por el sedentarismo del día a día: cuello, hombros, escápulas, caderas, rodillas y apoyos de pie.\n\nNo estás entrenando todavía. Estás despertando el sistema y sentando las bases del criterio propio que este programa va a seguir desarrollando durante las próximas semanas: la capacidad de percibir antes de actuar.',
      }, 4),
    ],
  },
  {
    timelineIndex: 1,
    titulo: 'Ordenar',
    esencia:
      'Habilitar el cuerpo. No es reparar ni preparar, es abrir los caminos que el sedentarismo cerró y reordenar los hábitos que los siguen cerrando todos los días.\nSin este módulo el Módulo 3 empieza desde la resistencia. Construir sobre un cuerpo que no tiene rangos disponibles ni patrones organizados es construir sobre una base bloqueada.',
    bundleTipo: 'videos',
    vimeoPlaylistId: '',
    clases: [
      clase({
        name: 'Cómo usar este módulo',
        general:
          'Qué significa ordenar y por qué no es una semana de trabajo sino un cambio de hábitos. Cómo integrar las clases en la vida cotidiana, qué priorizar y por qué este módulo es la llave que hace que todo lo siguiente funcione.',
        corta:
          'Este módulo no se termina cuando terminan las clases grabadas. Se termina cuando cambia algo en cómo vivís tu cuerpo todos los días. Este video te explica cómo lograrlo.',
        completa:
          'Ordenar no es una semana de trabajo, es un cambio de hábitos. Este video te explica qué significa eso y por qué este módulo es la llave que hace que todo lo que sigue funcione.\n\nAcá vamos a habilitar tu cuerpo: pies, columna, fascia y los micro-hábitos posturales que sostenés (o rompés) todos los días, más allá de lo que entrenes. No se trata de reparar algo roto ni de prepararte para el módulo siguiente. Se trata de abrir los caminos que el sedentarismo fue cerrando.\n\nEste módulo no se termina cuando terminan las clases grabadas. Se termina cuando cambia algo en cómo vivís tu cuerpo todos los días: cómo te sentás, cómo caminás, cómo cargás peso. Priorizá integrarlo en tu rutina antes que completarlo rápido.',
      }, 0),
      clase({
        name: 'De los pies al mundo: Hallux y bóveda plantar',
        general:
          'Los pies son la única superficie de contacto entre el cuerpo y el suelo. Entender su estructura, activarlos y cuidarlos genera un efecto de descompresión ascendente en toda la cadena. No se trata de culpar a los pies de los problemas, sino de entender todo lo que mejora cuando los activás conscientemente.',
        corta:
          'Tus pies te sostienen, no los encierres en un zapato. Cuando los activás bien, el resto del cuerpo trabaja mecánicamente mejor. Prevenir lesiones empieza desde abajo. Aprendé a usarlos como la base que siempre fueron.',
        completa:
          'Los pies son la única superficie de contacto entre tu cuerpo y el suelo. Todo lo que pasa arriba —rodillas, caderas, columna— empieza, en parte, por cómo tus pies tocan el piso.\n\nEn esta clase entendés la estructura del pie, en particular el hallux (el dedo gordo) y la bóveda plantar, y aprendés a activarlos conscientemente. No se trata de culpar a tus pies de todos tus problemas, sino de entender el efecto de descompresión ascendente que generás en toda la cadena cuando los activás bien.\n\nTus pies te sostienen: no los encierres en un zapato todo el día. Cuando los activás correctamente, el resto del cuerpo trabaja mecánicamente mejor, y eso es prevención de lesiones desde la base.',
      }, 1),
      clase({
        name: 'La postura perfecta no existe',
        general:
          'Desmitificación de la postura. No se trata de estar derecho, se trata de no perpetuar patrones que generan desgaste. Columna, discopatías típicas, coordinación vertebral y por qué la postura perfecta no existe.',
        corta:
          'Nadie te enseñó cómo funciona tu columna. Te enseñaron a corregirla. Acá entendés la diferencia y pasás de creer que tener una recta en la espalda es la fórmula de la salud corporal a coordinar tus vértebras para utilizar todas sus funciones.',
        completa:
          'Durante años nos enseñaron que existe una postura perfecta que deberíamos sostener todo el tiempo. Pero el cuerpo no está diseñado para permanecer quieto: está diseñado para cambiar, adaptarse y encontrar nuevas soluciones constantemente.\n\nEn esta clase, junto a un kinesiólogo, desarmamos ese mito: no se trata de estar siempre derecho, sino de no perpetuar los mismos patrones que generan desgaste. Vemos cómo funciona tu columna, las discopatías típicas y qué significa realmente coordinación vertebral.\n\nMuchas veces el problema no es cómo te sentás, sino cuánto tiempo permanecés exactamente igual. La mejor postura suele ser, siempre, la siguiente. Pasás de creer que tener la espalda recta es la fórmula de la salud corporal, a coordinar tus vértebras para usar todas sus funciones.',
      }, 2),
      clase({
        name: 'Fascia: el tejido que nadie te explicó',
        general:
          'Por qué el sedentarismo endurece el cuerpo más allá del músculo. Qué es la fascia, cómo responde al movimiento y qué hacer para liberarla en el día a día.',
        corta:
          'No es el músculo lo que te tiene tenso. Es el tejido que lo rodea. Entendés por qué y qué hacer al respecto.',
        completa:
          'No es (solamente) el músculo lo que te tiene tenso. Es el tejido que lo rodea: la fascia.\n\nEn esta clase, con un kinesiólogo, entendés qué es la fascia, cómo responde al sedentarismo —que la endurece más allá de lo muscular— y cómo responde al movimiento. También vemos qué podés hacer en el día a día para liberarla, sin necesidad de equipamiento especial ni sesiones largas.\n\nEntender la fascia cambia cómo interpretás la rigidez: muchas veces no es un músculo acortado, es una red de tejido que dejó de recibir estímulo variado.',
      }, 3),
      clase({
        name: 'Hábitos posturales: lo que hacés en el día importa más que una hora entrenando',
        general:
          'Bracing en la silla, patrones al caminar, cómo usar el teléfono, cómo cargar peso. Los micro-hábitos que perpetúan la rigidez o la revierten. La presión intraabdominal como sistema de protección espinal. Cómo activar el core de verdad para proteger la columna en cualquier movimiento, no solo en el entrenamiento.',
        corta:
          'Una hora de movimiento no compensa ocho horas mal sentado, mirando el celular, compensando constantemente y descuidando al cuerpo. Acá aprendés cómo cuidarte en el día a día, a prestarte atención y usar tu biomecánica para protegerte y prevenir.',
        completa:
          'Una hora de movimiento no compensa ocho horas mal sentado, mirando el celular, compensando constantemente y descuidando al cuerpo.\n\nEsta clase, entre Mateo y un kinesiólogo, recorre los micro-hábitos que sostenés todos los días sin darte cuenta: cómo te sentás en la silla, tu patrón al caminar, cómo usás el teléfono, cómo cargás peso. Vemos qué es la presión intraabdominal como sistema de protección espinal y cómo activar el core de verdad —no solo durante el entrenamiento, sino en cualquier movimiento cotidiano— para proteger tu columna.\n\nAcá aprendés a prestarte atención en el momento en que realmente pasan las cosas: en tu día a día, no solo en la hora que le dedicás a moverte.',
      }, 4),
      clase({
        name: 'El orden es un estilo de vida',
        general:
          'Ordenar no es una clase, es una forma de vivir. Cómo integrar la conciencia corporal en la rutina sin que sea una carga. La diferencia entre saber y hacer, y por qué el proceso importa más que el resultado inmediato.',
        corta:
          'Ordenar no es una clase, es un estilo de vida. Volvemos a él porque necesitamos reorganizarnos. Saber no alcanza. Acá trabajás cómo sostener lo que aprendés sin que se convierta en otra cosa que abandonás.',
        completa:
          'Ordenar no es una clase, es una forma de vivir. Volvemos a esa idea porque necesitamos reorganizarnos, no una sola vez, sino todo el tiempo.\n\nEn esta clase vemos cómo integrar la conciencia corporal en tu rutina sin que se vuelva una carga más. Trabajamos la diferencia entre saber algo y realmente hacerlo, y por qué el proceso de sostenerlo importa más que el resultado inmediato.\n\nSaber no alcanza. Esta clase es sobre cómo sostener lo que aprendiste en este módulo sin que se convierta en otra cosa que terminás abandonando.',
      }, 5),
      clase({
        name: 'Tu mapa corporal',
        general:
          'Primera instancia de diagnóstico propio con criterio real. El alumno integra todo lo del módulo, identifica sus patrones, compensaciones y zonas de trabajo prioritarias.',
        corta:
          'Llegaste al final del módulo con algo concreto: un mapa de tu propio cuerpo. Sabés qué está bloqueado, qué está disponible y por dónde empezar.',
        completa:
          'Esta es tu primera instancia de diagnóstico propio con criterio real. Integrás todo lo que trabajaste en Ordenar —pies, columna, fascia, hábitos— y armás tu propio mapa corporal: qué está bloqueado, qué está disponible y por dónde conviene empezar en el módulo Construir.\n\nLlegaste al final de Ordenar con algo concreto en la mano, no solo con información. Ese mapa es el punto de partida real para todo lo que sigue.',
      }, 6),
    ],
  },
  {
    timelineIndex: 2,
    titulo: 'Construir',
    esencia:
      'Desarrollás lo que te faltaba sin miedo a lesionarte.\nEl módulo más pesado. Donde pasa el cambio físico real. El cliente construye las capacidades que le dan confianza para moverse.',
    bundleTipo: 'videos',
    vimeoPlaylistId: '',
    clases: [
      clase({
        name: '¿Cómo usar este módulo?',
        general:
          'Qué es Construir y por qué es el módulo más exigente del programa. Cómo abordar las clases sin caer en el error de querer ir rápido. La diferencia entre construir desde el control y entrenar desde el ego. Qué esperar, qué no esperar y cómo medir el progreso real.',
        corta:
          'Este es el módulo donde pasa el cambio físico. Pero solo si lo abordás con cabeza. Este video te dice cómo entrar, cómo progresar y por qué la paciencia no es debilidad sino inteligencia.',
        completa:
          'Construir es el módulo más exigente del programa, y también donde pasa el cambio físico real. Antes de arrancar necesitás saber cómo abordarlo para no caer en el error más común: querer ir rápido.\n\nAcá la diferencia importante es entre construir desde el control y entrenar desde el ego. No se trata de levantar más peso o hacer el ejercicio más difícil posible. Se trata de construir capacidad real, de a poco, sobre la base que armaste en Calmar y Ordenar.\n\nEste video te dice qué esperar, qué no esperar todavía, y cómo medir tu progreso de verdad. La paciencia acá no es debilidad, es inteligencia.',
      }, 0),
      clase({
        name: 'Ser SOLO flexible no sirve: Recuperá el control',
        general:
          'La rigidez no es falta de flexibilidad, es falta de control en el rango. Se trabaja la diferencia entre movilidad pasiva y activa, y cómo recuperar espacio articular real sin forzar con movimiento.',
        corta:
          'No se trata de ser más flexible. Se trata de tener control en los rangos que ya tenés. Acá empezamos a recuperar ESPACIO.',
        completa:
          'La rigidez no es (solo) falta de flexibilidad. Muchas veces es falta de control en el rango que ya tenés disponible.\n\nEn esta clase trabajamos la diferencia entre movilidad pasiva —la que lográs con ayuda externa o relajación— y movilidad activa —la que controlás con tu propia fuerza—. Vemos cómo recuperar espacio articular real sin forzar el movimiento, sino construyéndolo.\n\nNo se trata de ser más flexible por ser más flexible. Se trata de tener control en los rangos que ya tenés. Acá empezamos a recuperar espacio, de verdad.',
      }, 1),
      clase({
        name: 'Moverse todos los días: las posturas que no podés ignorar',
        general:
          'Herramientas de higiene corporal diaria. Sentadilla profunda, rotaciones de columna, extensiones, spinal waves, pancake y puente y cómo incorporarlas en tu rutina. Son los patrones que organizan el trabajo del módulo.',
        corta:
          'Las lesiones empiezan en estar quieto o siempre sentado. Hoy volvemos a nuestras caderas, a mover la columna, agarrar con los brazos y rotar el tronco todos los días. Cuidá a tu cuerpo y tu cuerpo te cuida.',
        completa:
          'Las lesiones muchas veces empiezan en estar quieto, o siempre sentado en las mismas posiciones.\n\nEsta clase es herramientas de higiene corporal diaria: sentadilla profunda, rotaciones de columna, extensiones, spinal waves, pancake y puente. No son ejercicios sueltos, son los patrones que organizan el resto del trabajo de este módulo, y los que te van a servir para siempre en tu día a día.\n\nHoy volvemos a nuestras caderas, a mover la columna, a agarrar con los brazos y a rotar el tronco todos los días. Cuidá a tu cuerpo, y tu cuerpo te cuida.',
      }, 2),
      clase({
        name: 'La flexibilidad que no usás la perdés',
        general:
          'Llevamos las posturas estáticas al mundo dinámico, trabajamos la locomoción para utilizar el rango ganado y expresar los resultados.',
        corta:
          'Empezamos a movernos. Exploramos el control corporal, la fuerza orgánica y la movilidad en escenarios dinámicos. Si solo lo entrenás no es suficiente, tu cuerpo tiene que utilizarlo para no perderlo.',
        completa:
          'Llevamos las posturas estáticas que trabajaste hasta acá al mundo dinámico. Trabajamos locomoción para empezar a utilizar el rango que ganaste y expresarlo en movimiento real.\n\nAcá exploramos control corporal, fuerza orgánica y movilidad en escenarios que cambian, no en posiciones fijas. Si solo entrenás un rango sin usarlo en movimiento, no alcanza: tu cuerpo tiene que utilizarlo activamente para no volver a perderlo.',
      }, 3),
      clase({
        name: 'Fuerza orgánica: calistenia y gestión de la carga',
        general:
          'No es hipertrofia. Es la fuerza que hace que todo te salga más fácil, te canses menos y te lesiones menos. Se trabajan los patrones básicos con progresiones adaptadas a cada nivel. Cómo medir tu evolución en el entrenamiento, ganancia muscular y de fuerza con control corporal.',
        corta:
          'La fuerza no es solo para verse bien. Es lo que hace que tu cuerpo aguante la vida, prevenga lesiones y esté preparado para subir de nivel. Acá empezás a construirla con claridad.',
        completa:
          'Esto no es hipertrofia. Es la fuerza que hace que todo te salga más fácil, que te canses menos y que te lesiones menos.\n\nTrabajamos los patrones básicos de fuerza —empuje, tracción, sentadilla, bisagra de cadera, plancha— con progresiones adaptadas a tu nivel actual, sin necesidad de gimnasio ni equipamiento complejo. También vemos cómo medir tu evolución real: en entrenamiento, en ganancia muscular y de fuerza, y en control corporal.\n\nLa fuerza no es solo para verse bien. Es lo que hace que tu cuerpo aguante la vida, prevenga lesiones y esté preparado para el siguiente nivel. Acá empezás a construirla con claridad, no a ciegas.',
      }, 4),
      clase({
        name: 'Ser blando te hace flexible',
        general:
          'Prácticas corporales de suelo para ablandar el sistema nervioso, trabajar el tono muscular y la coordinación. Movimiento para prevenir contracturas, tensión acumulada y generar espacio para habilitar el control motor.',
        corta:
          'Lo duro se rompe. Lo blando se adapta. Acá bajás al suelo, soltás la tensión que acumulaste y le das al sistema nervioso lo que más necesita: permiso para relajarse. No es una clase fácil, es una clase necesaria.',
        completa:
          'Lo duro se rompe. Lo blando se adapta.\n\nEsta clase es de suelo: prácticas corporales para ablandar el sistema nervioso, trabajar el tono muscular y la coordinación. Es movimiento pensado para prevenir contracturas, soltar tensión acumulada y generar espacio real que habilite más control motor.\n\nAcá bajás al piso, soltás lo que acumulaste, y le das al sistema nervioso lo que más necesita: permiso para relajarse. No es una clase fácil. Es una clase necesaria.',
      }, 5),
      clase({
        name: 'Coordinación y control motor',
        general:
          'Clase práctica de coordinación ojo-pie y óculo-manual-pédica. Neuroplasticidad y trabajo cognitivo, inteligencia motriz aplicada a contextos variados y objetos como: pelota de tenis, bastón y bloques jenga.',
        corta:
          'Tu cuerpo y tu cerebro tienen que trabajar juntos. Coordinar no es una opción, es lo que organiza las demás capacidades. La vida exige más que fuerza, exige organización. Se entrena cómo el sistema nervioso organiza todo lo que construiste. Acá lo vemos con objetos simples en situaciones reales: una pelota, un bastón, unos bloques. La coordinación no es un talento, es una habilidad. Y como toda habilidad, se construye.',
        completa:
          'Tu cuerpo y tu cerebro tienen que trabajar juntos. Coordinar no es un extra, es lo que organiza el resto de las capacidades que construiste hasta acá.\n\nEsta es una clase práctica de coordinación ojo-pie y óculo-manual-pédica, trabajando neuroplasticidad e inteligencia motriz aplicada a contextos variados, con objetos simples: una pelota de tenis, un bastón y bloques tipo jenga.\n\nLa vida exige más que fuerza, exige organización. Acá vemos cómo tu sistema nervioso organiza todo lo que fuiste construyendo. La coordinación no es un talento con el que naciste o no. Es una habilidad, y como toda habilidad, se construye.',
        materials: ['pelota', 'baston', 'bloque'],
      }, 6),
      clase({
        name: 'Los miedos van a estar siempre',
        general:
          'Para personas con historial de lesiones o miedo a moverse. Cómo leer las señales del cuerpo, cuándo empujar y cuándo bajar la intensidad. Criterio kinesiológico para avanzar sin romperse.',
        corta:
          'El miedo a lesionarte no desaparece. Pero cuando entendés qué te dice tu cuerpo, deja de paralizarte y empieza a informarte. Acá aprendés a leer las señales y a saber exactamente cuándo avanzar y cuándo parar.',
        completa:
          'Esta clase es especialmente para quienes tienen historial de lesiones o miedo a moverse, aunque te sirve igual si no lo tenés.\n\nCon un kinesiólogo, trabajamos cómo leer las señales reales de tu cuerpo: cuándo empujar un poco más y cuándo bajar la intensidad. Es criterio kinesiológico aplicado, para que puedas avanzar sin romperte.\n\nEl miedo a lesionarte no desaparece del todo, y está bien que así sea. Pero cuando entendés qué te está diciendo tu cuerpo, ese miedo deja de paralizarte y empieza a informarte. Acá aprendés a leer esas señales y a saber, con criterio, cuándo avanzar y cuándo parar.',
      }, 7),
      clase({
        name: 'Movimiento y suelo: Volviendo al origen',
        general:
          'Entrar al suelo, conocer el pasaje de peso, entradas y salidas. Patrón de movimiento básico para la longevidad. Coordinación, fuerza y control corporal.',
        corta:
          'Si perdiste la capacidad de moverte en el suelo, perdiste una parte fundamental de tu autonomía. El suelo es donde aprendiste a moverte antes de que alguien te pusiera en una silla. Acá volvés a ese origen. Entrar, salir, rodar, apoyar y desplazarte. No es un ejercicio, es recuperar algo que siempre fue tuyo. Y cuando lo recuperás, todo lo demás se vuelve más fácil.',
        completa:
          'Si perdiste la capacidad de moverte cómodo en el suelo, perdiste una parte fundamental de tu autonomía.\n\nEn esta clase trabajamos entrar al suelo, el pasaje de peso, entradas y salidas: un patrón de movimiento básico para la longevidad, que además entrena coordinación, fuerza y control corporal al mismo tiempo. El suelo es donde aprendiste a moverte antes de que alguien te sentara en una silla.\n\nAcá volvés a ese origen: entrar, salir, rodar, apoyar y desplazarte. No es un ejercicio más. Es recuperar algo que siempre fue tuyo, y cuando lo recuperás, todo lo demás se vuelve más fácil.',
      }, 8),
      clase({
        name: 'Armá tu semana de entrenamiento',
        general:
          'El alumno aprende a distribuir el trabajo del módulo en una semana real. Cómo combinar fuerza, movilidad, coordinación y recuperación sin sobrecargar ni subentrenar. Criterio para adaptar la semana según el tiempo disponible y el nivel de energía.',
        corta:
          'De nada sirve saber si no sabés cuándo aplicarlo. Acá organizás todo lo que aprendiste en una semana concreta, con tu vida y tu tiempo real. Esta es la diferencia entre seguir un programa y empezar a entrenarte con autonomía.',
        completa:
          'De nada sirve saber si no sabés cuándo aplicarlo. Esta es la última clase del módulo, y es sobre organización real, no sobre un ejercicio nuevo.\n\nAcá aprendés a distribuir todo el trabajo de Construir en una semana concreta: cómo combinar fuerza, movilidad, coordinación y recuperación sin sobrecargarte ni subentrenar, y cómo adaptar esa semana según el tiempo que tengas disponible y tu nivel de energía real, no el ideal.\n\nEsta es la diferencia entre seguir un programa paso a paso y empezar a entrenarte con autonomía de verdad: con tu vida y tu tiempo reales, no los de otra persona.',
      }, 9),
    ],
  },
];

async function main() {
  console.log(CONFIRM ? '🚀 Modo ejecución (--confirm): va a escribir en PRODUCCIÓN.' : '🧪 Dry-run: no se escribe nada. Pasá --confirm para ejecutar.');
  console.log('Conectando a producción...');
  await mongoose.connect(PRODUCTION_URI);
  console.log('✅ Conectado a', mongoose.connection.name);

  const totalClases = MODULOS.reduce((n, m) => n + m.clases.length, 0);

  if (!CONFIRM) {
    console.log('\n--- Resumen (dry-run) ---');
    console.log('ProductId objetivo:', PRODUCT_ID);
    MODULOS.forEach((m) => console.log(`Módulo "${m.titulo}": ${m.clases.length} clases`));
    console.log('Total clases:', totalClases);
    console.log('\nNada escrito. Corré con --confirm cuando estés listo.');
    await mongoose.disconnect();
    return;
  }

  const product = await Product.findById(PRODUCT_ID);
  if (!product) {
    console.error('❌ No se encontró el producto', PRODUCT_ID);
    process.exit(1);
  }

  // Borrar los CourseClass viejos (11, de la estructura de 4 módulos) de este producto.
  const deleted = await CourseClass.deleteMany({ productId: product._id });
  console.log('🗑️  CourseClass viejas borradas:', deleted.deletedCount);

  // Crear los CourseClass nuevos y setear courseClassId en cada clase embebida.
  for (const modulo of MODULOS) {
    for (const c of modulo.clases) {
      const doc = await CourseClass.create({
        productId: product._id,
        timelineIndex: modulo.timelineIndex,
        name: c.name,
        description: c.description,
        descripcionGeneral: c.descripcionGeneral,
        descripcionCorta: c.descripcionCorta,
        descripcionCompleta: c.descripcionCompleta,
        pdfUrl: c.pdfUrl,
        videoUrl: c.videoUrl,
        videoId: c.videoId,
        videoThumbnail: c.videoThumbnail,
        duration: c.duration,
        level: c.level,
        order: c.order,
        materials: c.materials,
        visibleInLibrary: c.visibleInLibrary,
      });
      c.courseClassId = String(doc._id);
    }
  }

  product.cursoConfig.contenidoModulos = MODULOS;
  product.markModified('cursoConfig');
  await product.save();

  console.log('✅ contenidoModulos actualizado:', MODULOS.length, 'módulos,', totalClases, 'clases.');
  console.log('publicado sigue en:', product.cursoConfig.publicado);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
