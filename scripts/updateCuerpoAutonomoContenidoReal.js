/**
 * Reemplaza cursoConfig.contenidoModulos del producto "Cuerpo Autónomo" en PRODUCCIÓN
 * (_id 6a74b5b24758cf3bdadb7526) por la estructura REAL confirmada contra Vimeo
 * (carpeta "Cuerpo Autónomo" / user 203650563): 3 módulos (Reconectar, Ordenar, Construir),
 * 13 clases, con videoId ya asignado por título exacto de cada video.
 *
 * Reemplaza por completo lo cargado en el paso anterior (la versión "Calmar/Ordenar/
 * Construir" de 22 clases) — el usuario confirmó que Vimeo + este texto son la fuente
 * de verdad correcta, no aquella.
 *
 * "Cómo aprende el cuerpo" (Ordenar, video 1215876651) queda como clase con video
 * enlazado pero sin descripción: es la única de las 13 sin texto fuente todavía.
 *
 * Uso:
 *   node scripts/updateCuerpoAutonomoContenidoReal.js            # dry-run
 *   node scripts/updateCuerpoAutonomoContenidoReal.js --confirm  # escribe en PRODUCCIÓN
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

function clase({ name, videoId, duration, general = '', corta = '', completa = '' }, order) {
  return {
    name,
    description: general,
    descripcionGeneral: general,
    descripcionCorta: corta,
    descripcionCompleta: completa,
    videoUrl: videoId ? `https://vimeo.com/${videoId}` : '',
    videoId: videoId || '',
    videoThumbnail: '',
    duration: duration || 0,
    level: 1,
    order,
    materials: [],
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
    titulo: 'Reconectar',
    esencia: '',
    bundleTipo: 'videos',
    vimeoPlaylistId: '',
    clases: [
      clase({
        name: 'Antes de estirar',
        videoId: '1212826028',
        duration: 23 * 60 + 54,
        general:
          'Primera clase del programa: introducción a la observación consciente del cuerpo. Por qué las sensaciones que aparecen al empezar (rigidez, incomodidad, zonas que vuelven a hacerse presentes) son normales, y por qué este programa no busca resultados rápidos sino desarrollar la capacidad de percibirte y acompañarte mejor.',
        corta:
          'No empieces preguntándote qué tenés que arreglar. Empezá preguntándote qué podés descubrir. Esta clase te prepara física y mentalmente para todo lo que viene.',
        completa:
          'Muchas personas creen que son rígidas, débiles o que tienen mala postura o mala genética. Pero el cuerpo no suele funcionar así. El cuerpo aprende. Se especializa. Se vuelve bueno en aquello que hacemos todos los días. La pregunta entonces cambia: ¿qué está intentando mostrarte tu cuerpo?\n\nAntes de seguir, sentate y anotá estas preguntas: ¿qué partes de mi cuerpo siento más presentes durante el día? ¿Qué partes casi nunca percibo? ¿Hay movimientos que evito hacer automáticamente? ¿Hay posiciones en las que me siento cómodo o incómodo? ¿Cómo describiría mi cuerpo hoy sin usar palabras como bueno o malo?\n\nCuando empezás un proceso de consciencia corporal, empiezan a aparecer sensaciones que quizás habías dejado de percibir hace mucho tiempo: la rigidez, la incomodidad, el placer de estirar, la respiración, zonas del cuerpo que parecían dormidas. Eso es normal. No significa que estés peor, significa que estás prestando atención. Tu sistema nervioso no está acostumbrado a recibir tanta información al mismo tiempo, por eso no necesitamos hacer todo de golpe.\n\nNo quiero que hagas estas clases buscando arreglar algo. Quiero que las hagas buscando información, curiosidad, experiencia, atención. Durante estas semanas quiero que aparezcan preguntas como: ¿dónde siento la respiración cuando inhalo? ¿Qué movimientos me generan sensación de libertad? ¿Qué movimientos me generan miedo o tensión? ¿Qué pasa cuando me muevo más lento? Anotalas.\n\nNo empieces este programa preguntándote qué tenés que arreglar. Empezá preguntándote qué podés descubrir. Las próximas semanas no se tratan de reparar un cuerpo roto. Se tratan de conocer un cuerpo que lleva años intentando adaptarse de la mejor manera que pudo.\n\nAntes de arrancar la Clase 1, tomate unos minutos y respondé: ¿cómo me gustaría sentirme dentro de mi cuerpo? ¿Qué cosas me gustaría volver a hacer y hoy siento lejanas? ¿Qué movimiento me genera ilusión recuperar o aprender? ¿Cómo sería una vida donde mi cuerpo me acompañe en lugar de limitarme? ¿Qué sueño físico todavía no me animé a perseguir?\n\nNo importa si hoy te parecen imposibles: correr una carrera, jugar con tus hijos sin cansarte, sentarte en el suelo con comodidad, volver a bailar, sentirte fuerte otra vez. Tenés tanto en potencia que estás solo a unos pasos de cumplir tus sueños, porque el cuerpo cambia, siempre cambió y va a seguir cambiando. La pregunta es si vamos a participar conscientemente de ese proceso o simplemente dejar que ocurra solo.',
      }, 0),
      clase({
        name: '¿Por qué estás rígido?',
        videoId: '1203859248',
        duration: 24 * 60 + 34,
        general:
          'La rigidez no es un problema muscular, es una respuesta del sistema nervioso. Esta clase trabaja el mecanismo neurofisiológico detrás de la tensión crónica y por qué el enfoque convencional de forzar el estiramiento perpetúa el problema. El método parte de regular el tono muscular desde el sistema nervioso, no desde la fuerza.',
        corta:
          'El problema no es que estires poco. Tu cuerpo se rigidiza porque tu sistema nervioso vive en alerta, es un reflejo de protección perpetuado. Para cambiarlo, necesitas entender por qué pasa. Esta clase te da esa respuesta.',
        completa:
          'Tu cuerpo no te limita porque está roto. Te limita porque te está protegiendo. La sensación de rigidez depende tanto de los tejidos como del sistema nervioso.\n\nSolemos abordarlo como percepción de rigidez, o sensación. No hay estudios que puedan confirmar que el músculo o el tejido conectivo se "rigidicen" en sentido estricto de la palabra. Pueden influir factores musculares, pero también factores contextuales (trabajo, familia, vínculos, mal descanso, mala alimentación), ambientales (temperatura, humedad), psico-emocionales (creencias sobre el dolor, miedos, traumas) y sociales (personas que preguntan constantemente sobre ese dolor y lo refrescan). En resumen, pueden ser múltiples factores interactuando: no necesariamente alguien está rígido en un sentido mecánico, a veces solo se auto-percibe como tal.\n\nComo puede ser un factor tangible —un músculo acortado o débil— o un factor del cerebro vinculado al miedo o el trauma, preferimos hablar de recuperar la confianza. Ganar seguridad: "sé cómo hacerlo, puedo hacerlo, ya no me genera dolor". El cuerpo está conectado por tejido, y como queremos ganar esa seguridad, trabajamos en lo mecánico y en lo mental, en el cuerpo entero, porque cada parte afecta a las otras.\n\nPráctica: plegado pasivo al 50% de esfuerzo, calentamiento general y movimiento articular, masajes con pelota en el pie, un segundo plegado pasivo, y Contract Relax (FNP), que aumenta el rango luego de contraer.\n\nEscaneo: cuando dejás de usar un movimiento perdés familiaridad con él, disminuye el control y la confianza del sistema nervioso. Los rangos que no usás se convierten en rangos que el cerebro protege. Practicamos un escaneo parados.\n\nForzar vs. ceder: muchas personas responden a la rigidez con más fuerza, más empuje y más estiramiento. Sin embargo, cuando intentamos invadir un rango que el cuerpo percibe como inseguro, suelen aumentar las respuestas de protección: el sistema nervioso puede responder aumentando la activación muscular o intensificando la sensación de tensión. Por eso, muchas veces, más esfuerzo no genera más movilidad. Lo que genera más movilidad es más seguridad. Cuando el cuerpo percibe control, respiración tranquila y ausencia de amenaza, suele permitir más movimiento. La movilidad no depende solamente de la longitud de los tejidos, también depende de cuánto confía tu sistema nervioso en ese rango.\n\nCierre: cambiá la pregunta. No "¿qué músculo está corto?", sino "¿por qué mi cuerpo se está protegiendo en esta zona?".',
      }, 1),
      clase({
        name: 'Despertar el cuerpo',
        videoId: '1208273949',
        duration: 32 * 60 + 5,
        general:
          'Después de pasar horas en la misma posición, muchas articulaciones dejan de explorar su rango completo. Esta clase no busca entrenar ni corregir: busca volver a habitar el cuerpo, despertar articulaciones, estimular la circulación y recordarle al sistema nervioso que existen muchas opciones de movimiento, cerrando con respiración y meditación guiada.',
        corta:
          'El cuerpo no necesita empezar moviéndose más fuerte. Necesita empezar moviéndose más. Despertá tus articulaciones y tu respiración antes de construir cualquier capacidad.',
        completa:
          'El cuerpo no necesita empezar moviéndose más fuerte. Necesita empezar moviéndose más. Después de pasar horas en la misma posición, muchas articulaciones dejan de explorar todo su rango de movimiento y muchos tejidos reciben siempre los mismos estímulos. Antes de desarrollar fuerza, movilidad o cualquier otra capacidad, necesitamos volver a despertar el organismo. El objetivo de esta clase no es entrenar ni corregirte: es volver a habitar el cuerpo, despertar las articulaciones, estimular la circulación, movilizar el sistema linfático y recordarle al sistema nervioso que todavía existen muchas opciones de movimiento.\n\nPráctica: escaneo corporal inicial, sacudidas suaves de todo el cuerpo, calentamiento de cuello, hombros y escápulas, caderas, rodillas y apoyos de pie, y transiciones desde sentadilla profunda hacia flexión de cadera y cuadrupedia, con ondas de columna asistidas contra la pared.\n\nCuando dejamos de intentar movernos perfecto y empezamos a movernos con curiosidad, el cuerpo recibe información nueva. Muchas veces la rigidez no desaparece porque la forcemos, sino porque el sistema nervioso empieza a sentirse más seguro explorando distintos rangos de movimiento. Movernos todos los días no solo mantiene saludables las articulaciones, también conserva la capacidad de adaptación del organismo. La respiración aparece entonces como una herramienta para integrar todo ese movimiento y ayudar al cuerpo a encontrar un estado de mayor calma y presencia.\n\nPráctica: observación de la respiración actual, respiración diafragmática, exhalaciones largas, box breathing, meditación guiada, observación de sensaciones corporales y de pensamientos, vuelta progresiva al entorno.\n\nCierre: antes de desarrollar capacidades, necesitamos despertar el cuerpo. Mover todas las articulaciones con frecuencia es una de las formas más simples de conservar salud y autonomía. La respiración y el movimiento son herramientas para influir sobre nuestro estado interno. No siempre podemos elegir cómo llegamos a la práctica, pero muchas veces sí podemos influir en cómo nos vamos.',
      }, 2),
      clase({
        name: 'Moverse entre el placer y el dolor',
        videoId: '1208466703',
        duration: 26 * 60 + 51,
        general:
          'Retomamos los mismos movimientos de la clase anterior, pero con una intención distinta: percibir qué sentimos mientras nos movemos. Trabajamos a diferenciar la incomodidad que ayuda a crecer de la que el cuerpo pide respetar, sin buscar sufrir ni comodidad permanente.',
        corta:
          'Entre el placer y el dolor existe un enorme territorio de sensaciones. Cuanto mejor aprendés a recorrerlo, mejores decisiones tomás sobre tu propio cuerpo.',
        completa:
          'La clase pasada despertamos el cuerpo. Hoy vamos a recorrer exactamente el mismo territorio, pero con una intención distinta. Ya no buscamos solamente movernos: buscamos empezar a percibir qué sentimos mientras nos movemos. Desarrollar autonomía también significa aprender a diferenciar entre una incomodidad que nos ayuda a crecer y una que el cuerpo nos pide respetar. Muchas veces queremos eliminar cualquier sensación incómoda, pero el cuerpo aprende justamente explorando esos lugares donde todavía no tiene demasiada experiencia. No buscamos sufrir. Tampoco buscamos comodidad permanente. Buscamos curiosidad.\n\nPráctica: escaneo corporal inicial, sacudidas suaves, calentamiento de cuello, hombros y escápulas, caderas, rodillas y apoyos de pie, movilidad de muñecas, transiciones de sentadilla profunda a flexión de cadera y plancha, y un circuito de cuadrupedia (cruces de rodilla a codo, cuadrupedia lateral, gateos contralaterales) cerrando con carpa, esfinge y postura del niño.\n\nCierre: respiración diafragmática, exhalaciones largas, meditación breve.\n\nReflexión: hoy hicimos casi los mismos movimientos que la clase anterior. Lo que cambió fue la forma de habitarlos. No entrenamos solamente movilidad, entrenamos atención. Entre el placer y el dolor existe un enorme territorio de sensaciones. Cuanto mejor aprendés a recorrer ese territorio, mejores decisiones tomás sobre tu propio cuerpo.',
      }, 3),
      clase({
        name: 'El arte de dirigir la atención',
        videoId: '1206213614',
        duration: 33 * 60 + 21,
        general:
          'La atención funciona como un reflector que ilumina ciertas partes de la experiencia y deja otras en segundo plano. Esta clase entrena la capacidad de dirigirla conscientemente, usando transferencias de peso y posiciones con más variables, cerrando con meditación guiada.',
        corta:
          'La atención no crea cosas nuevas. Muchas veces simplemente revela cosas que ya estaban ahí. Es una habilidad que se entrena, y cuanto más atento estás, más información tenés para moverte y decidir.',
        completa:
          'En la clase anterior exploramos las sensaciones que aparecen cuando nos movemos. Hoy vamos a explorar algo diferente: la atención. No podemos prestar atención a todo al mismo tiempo. La atención funciona como un reflector que ilumina ciertas partes de la experiencia mientras deja otras en segundo plano. Aprender a dirigirla es una habilidad que puede entrenarse.\n\nPráctica: respiración consciente y llegada al cuerpo, transferencias de peso parado, tocar puntos con un pie mientras el otro sostiene, combinaciones de las anteriores, dibujar círculos con transferencias de peso, jugar con alturas y tocar el piso con una pierna y volver. Cada vez que trasladás el peso estás entrenando algo más que la atención: estás desarrollando estabilidad, coordinación y confianza en distintos apoyos. "La atención no crea cosas nuevas. Muchas veces simplemente revela cosas que ya estaban ahí."\n\nCuando la atención cambia, la experiencia cambia. El mismo movimiento puede sentirse completamente diferente dependiendo de dónde colocamos el foco. Repetimos el trabajo de transferencias de peso, ahora en sentadilla profunda, con rotaciones torácicas y alcances de manos: mientras exploramos la atención también estamos desarrollando equilibrio, coordinación y control corporal, pero hoy no como objetivo principal, sino como consecuencia de la práctica.\n\nCuanto más refinada es nuestra atención, más información tenemos disponible. Muchas veces el cuerpo ya está comunicando lo que necesitamos saber, simplemente no estamos escuchando.\n\nPráctica final: meditación guiada, observar la respiración, las sensaciones que quedaron de la práctica, los puntos de contacto con el suelo, y notar pensamientos, sonidos y sensaciones sin intentar modificarlos.\n\nCierre: la atención es una habilidad entrenable. Aquello a lo que prestamos atención tiende a crecer en nuestra experiencia. La autonomía no depende solamente de lo que hacemos, también depende de nuestra capacidad para percibir.',
      }, 4),
      clase({
        name: 'Percibo luego actúo',
        videoId: '1212826039',
        duration: 28 * 60 + 7,
        general:
          'Clase de integración del módulo: rigidez, respiración, sensaciones, placer, dolor y atención se juntan en una misma práctica. La autonomía no consiste en controlar cada aspecto del cuerpo, sino en desarrollar la capacidad de escucharlo, comprenderlo y responder con criterio.',
        corta:
          'No se trata de hacer más. Se trata de comprender mejor. Cerramos el módulo cambiando la relación que tenés con tu cuerpo, para construir nuevas capacidades desde acá.',
        completa:
          'Durante este módulo exploramos la rigidez, la respiración, las sensaciones, el placer, el dolor y la atención. Ahora llega el momento de integrar todo. Muchas veces vivimos intentando hacer más, corregir más o esforzarnos más. Sin embargo, el cambio no siempre aparece cuando agregamos algo: a veces aparece cuando aprendemos a percibir con más claridad lo que ya está ocurriendo. No estamos entrenando movimientos, estamos entrenando capacidades.\n\nPráctica: escaneo corporal inicial y una secuencia de transferencias de peso, cossacks, branching y rotaciones torácicas, observando claridad mental y atención mientras se ejecuta.\n\nLa autonomía no consiste en controlar cada aspecto del cuerpo. Consiste en desarrollar la capacidad de escucharlo, comprenderlo y responder con criterio. Cuanto más percibimos, más información tenemos disponible para movernos, entrenar y vivir de forma consciente.\n\nPráctica: de sentadilla profunda a alcance de manos, y un desplazamiento libre de transferencias de peso en tres partes: primero observando la sucesión de apoyos y cómo viaja el peso por el cuerpo; después reduciendo progresivamente la velocidad y prestando atención a dónde va la mirada; por último integrando ondas de columna sin perder el foco en la mirada.\n\nCierre: el cuerpo siempre está comunicando información. La autonomía comienza cuando desarrollamos la capacidad de percibirla. No se trata de hacer más, se trata de comprender mejor. El objetivo de este módulo no fue cambiar tu cuerpo en unos días, sino empezar a cambiar la relación que tenés con él. Desde este lugar de mayor percepción y regulación, podemos comenzar a construir nuevas capacidades en los módulos siguientes.',
      }, 5),
    ],
  },
  {
    timelineIndex: 1,
    titulo: 'Ordenar',
    esencia:
      'La autonomía no aparece por hacer una rutina perfecta. Aparece por construir una vida que facilite las decisiones que te hacen bien.\n"No necesitás una vida perfecta para construir un cuerpo que te haga bien."',
    bundleTipo: 'videos',
    vimeoPlaylistId: '',
    clases: [
      clase({
        name: 'Lo que repetís te hace',
        videoId: '1206235806',
        duration: 17 * 60 + 23,
        general:
          'Usamos la atención entrenada en el módulo anterior para observar algo distinto: lo que repetimos todos los días. Trabajamos con una reflexión guiada sobre hábitos cotidianos y un ejercicio FODA (fortalezas, oportunidades, debilidades, amenazas) para identificar qué favorece y qué frena tu movimiento.',
        corta:
          'Tu cuerpo no se construye en una hora de entrenamiento. Se construye en las cosas que repetís todos los días. La motivación cambia, los hábitos permanecen.',
        completa:
          'En el módulo anterior aprendimos a percibir y dirigir la atención. Ahora vamos a usar esa atención para observar algo distinto: las cosas que repetimos todos los días. El cuerpo cambia constantemente, se adapta a lo que hacés, a lo que evitás y a lo que sostenés en el tiempo. Lo que repetís te construye.\n\nReflexión: ¿cómo es un día normal en tu vida? ¿Cuánto tiempo pasás sentado? ¿Cuánto caminás? ¿Qué movimientos hacés todos los días? ¿Qué movimientos hace años que no hacés?\n\nMuchas veces pensamos que el problema es la falta de voluntad, pero los hábitos no ocurren en el vacío. El espacio donde vivimos, el tiempo disponible, las personas que nos rodean y nuestras rutinas influyen en las decisiones que tomamos. Diseñar una vida que nos haga bien suele ser más efectivo que depender únicamente de la motivación.\n\nPráctica: escribí tres hábitos que hoy ya te ayudan a sentirte mejor, y tres cosas del entorno o la rutina que dificultan moverte más o cuidarte.\n\nEjercicio FODA: dividí una hoja en cuatro partes y escribí tus fortalezas (¿qué cosas ya juegan a tu favor?), oportunidades (¿qué cambios pequeños podrían ayudarte?), debilidades (¿qué hábitos te frenan?) y amenazas (¿qué factores externos dificultan sostener una rutina?). Reflexioná: ¿qué patrones aparecen? ¿Qué depende de vos y qué del entorno? ¿Cuál sería el cambio más pequeño que podrías sostener esta semana?\n\nCierre: tu cuerpo no se construye en una hora de entrenamiento, se construye en las cosas que repetís todos los días. La motivación cambia, los hábitos permanecen. El objetivo de este módulo no es corregirte constantemente, sino aprender a diseñar una vida que sostenga el cuerpo que querés construir.',
      }, 0),
      clase({
        name: 'Volver a lo simple',
        videoId: '1207799254',
        duration: 32 * 60 + 10,
        general:
          'El cuerpo humano evolucionó expuesto al sol, moviéndose constantemente y en contacto con el suelo. Trabajamos enraizamiento de pies, sentadilla profunda y variabilidad postural, y elegís tres acciones simples (sol, descalzarte, comida real, contacto con el suelo) para incorporar en tu semana.',
        corta:
          'Muchas dificultades modernas no aparecen porque falte información, sino porque dejamos de hacer cosas extraordinariamente simples. Volvé a ellas.',
        completa:
          'Durante miles de años el cuerpo humano evolucionó expuesto al sol, moviéndose constantemente, respirando aire libre, sentándose en el suelo, caminando descalzo y alimentándose de comida real. Muchas de las dificultades modernas no aparecen porque nos falte información, sino porque dejamos de hacer cosas extraordinariamente simples.\n\nPráctica: respiración consciente durante 3 minutos, observando la luz natural (cerca de una ventana o al aire libre si es posible), sintiendo el apoyo de los pies descalzos contra el suelo. Enraizamiento de los pies con segmentación de columna, aperturas de pecho con rotación de hombros, y masaje de pies.\n\nEl cuerpo necesita información del entorno para organizarse. La luz, la respiración y el contacto con el suelo forman parte de esa información. Priorizá la luz de la mañana y el atardecer, eliminá luces fuertes antes de dormir, y andá más descalzo por la vida: los zapatos promueven la insensibilidad desde los pies y por ende lesiones articulares en todo el cuerpo.\n\nAntes de existir las sillas, las personas descansaban, trabajaban y convivían en múltiples posiciones. La variabilidad postural es una de las formas más simples de mantener un cuerpo adaptable.\n\nPráctica: sentadilla profunda con bisagra de cadera, transferencias de peso, rotaciones torácicas en sentadilla, y el juego de entrar y salir del suelo de distintas formas, con introducción al pancake y otras maneras de sentarte a trabajar. La sentadilla profunda no es un ejercicio extraño: es una posición humana básica que muchas personas simplemente dejaron de practicar.\n\nDiez minutos de sol por la mañana ayudan a sincronizar tus ritmos biológicos. Ver el atardecer le informa al cuerpo que el día está terminando y favorece el descanso nocturno. Comer alimentos reales simplifica la relación con la alimentación. Respirar conscientemente algunos minutos puede cambiar tu estado interno. Descalzarte devuelve información que los zapatos eliminan constantemente.\n\nElegí tres acciones simples para incorporar esta semana: diez minutos de sol por la mañana, ver el amanecer o el atardecer, comer una comida completamente basada en alimentos reales, sentarte en el suelo algunos minutos, permanecer en sentadilla profunda mientras descansás o conversás, caminar descalzo en casa, o respirar conscientemente durante tres minutos.\n\nCierre: el cuerpo no siempre necesita más tecnología, más métodos o más complejidad. Muchas veces necesita volver a recibir estímulos que durante miles de años formaron parte de la vida humana: el sol, el movimiento, la respiración, la comida real y el contacto con el suelo. Construir un cuerpo más capaz empieza por construir una vida que lo sostenga.',
      }, 1),
      clase({
        name: 'Guía para la postura perfecta',
        videoId: '1213252192',
        duration: 38 * 60 + 49,
        general:
          'Recorrido en tres bloques: explorar nuevas formas de sentarte, entender que la columna necesita movimiento (no quietud) y llevar la variabilidad postural a tu día a día. La mejor postura, en cualquier momento, es la siguiente.',
        corta:
          'El cuerpo se beneficia de la variabilidad más que de la perfección. No necesitamos encontrar la postura perfecta, necesitamos construir más opciones.',
        completa:
          'Más opciones, menos correcciones. Durante años nos enseñaron que existe una postura perfecta que deberíamos mantener todo el tiempo. Pero el cuerpo no está diseñado para permanecer quieto: está diseñado para cambiar, adaptarse y encontrar nuevas soluciones constantemente. Muchas veces el problema no es cómo te sentás, sino cuánto tiempo permanecés exactamente igual. La mejor postura suele ser la siguiente.\n\nExplorar nuevas formas de sentarse: sentado con piernas cruzadas, sentado con piernas extendidas, pancake, pancake dinámico con respiración, posición 90/90, coordinaciones entre posturas, apoyo de manos atrás con apertura del pecho, y levantarte y volver al suelo de diferentes maneras. El suelo obliga al cuerpo a adaptarse constantemente. Cada posición desarrolla capacidades distintas. La comodidad muchas veces aparece cuando recuperamos variedad, no cuando encontramos una única postura ideal.\n\nLa columna quiere movimiento: una columna sana no es una columna inmóvil, es una columna que conserva opciones. Flexionarse, extenderse, rotar e inclinarse forman parte de su diseño natural. Práctica: gato-vaca, segmentación de columna, rotaciones torácicas, círculos de hombros, extensiones torácicas, introducción a spinal waves, y movimientos libres combinando respiración y columna. El movimiento nutre aquello que utilizamos; lo que dejamos de explorar empieza a sentirse extraño.\n\nLlevar la variabilidad al día a día: ordenar el cuerpo no consiste en corregirse constantemente, sino en incorporar pequeñas variaciones que permitan que la estructura siga adaptándose. Reflexioná: ¿cuánto tiempo pasás en una misma posición cada día? ¿Qué posiciones podrías incorporar más seguido? Elegí tres acciones para experimentar esta semana: cambiar de posición cada treinta minutos, sentarte en el suelo durante descansos, levantarte y caminar varias veces al día, o alternar distintas formas de sentarte y trabajar.\n\nCierre: la mejor postura es la siguiente. El cuerpo se beneficia de la variabilidad más que de la perfección. Moverse más y corregirse menos suele ser una estrategia más sostenible a largo plazo. Un cuerpo organizado no es un cuerpo rígido, es un cuerpo que tiene opciones.',
      }, 2),
      clase({
        name: 'Cómo aprende el cuerpo',
        videoId: '1215876651',
        duration: 13 * 60 + 23,
        general: '',
        corta: '',
        completa: '',
      }, 3),
      clase({
        name: 'Fuerte y flexible, sin elegir',
        videoId: '1213107981',
        duration: 36 * 60 + 50,
        general:
          'Fuerza y flexibilidad no compiten entre sí: un músculo fuerte también puede ser flexible, y un cuerpo flexible necesita fuerza para controlar ese rango. La clase integra cuatro bloques: construir capacidad (fuerza con recorridos amplios), recuperar rango (streching sostenido) e integrar capacidades (equilibrio, gateo, transferencias de peso).',
        corta:
          'No tenés que elegir entre fuerza o flexibilidad. La calidad del movimiento aparece cuando ambas capacidades se desarrollan juntas.',
        completa:
          'La falsa elección: hasta ahora entendimos que el cuerpo se adapta a lo que repetimos, que necesita recibir estímulos variados y que aprende a partir de la experiencia. Pero todavía queda una pregunta: ¿cómo se construyen realmente las capacidades del cuerpo? Muchas personas creen que hay que elegir entre ganar fuerza o ganar flexibilidad. Sin embargo, un músculo fuerte también puede ser flexible, y un cuerpo flexible necesita fuerza para controlar ese rango. La calidad del movimiento aparece cuando ambas capacidades se desarrollan juntas.\n\nConstruir capacidad: la fuerza es la capacidad de producir y controlar movimiento. Cuando entrenamos con recorridos amplios no solo desarrollamos fuerza, también mantenemos o mejoramos la movilidad. No buscamos músculos grandes ni movimientos perfectos, buscamos un cuerpo capaz. Práctica en 3 vueltas: sentadillas, zancadas, flexiones de brazos, dominadas o remo invertido, y plancha, con descansos entre vueltas. La fuerza no limita el movimiento: lo limita entrenarla siempre de la misma manera y en recorridos incompletos.\n\nRecuperar rango: una articulación con más movimiento ofrece más opciones, pero ese rango debe ser útil. No buscamos llegar más lejos por llegar más lejos, buscamos ampliar las posibilidades del cuerpo. Práctica: mantener 45-60 segundos cada posición (pancake, half split, hip flexor stretch, rotación torácica, apertura de hombros) respirando lento. Un rango nuevo es una oportunidad, pero todavía falta aprender a usarlo.\n\nIntegrar capacidades: ahora el cuerpo tiene más fuerza y más rango. El siguiente paso es aprender a coordinarlos, porque las capacidades aisladas sirven de poco. La vida no nos pide solamente fuerza, tampoco solamente flexibilidad: nos pide resolver problemas mientras nos movemos. Práctica en 2-3 vueltas: equilibrio unipodal, transferencias de peso, bear crawl, crawl lateral, levantarte del suelo de distintas maneras, y flow libre integrando todos los movimientos.\n\nReflexión: ¿qué movimientos aparecieron naturalmente? ¿Qué posiciones empezaron a sentirse más fáciles? ¿Dónde todavía aparece inseguridad?',
      }, 4),
      clase({
        name: 'La confianza, la rutina y el proceso',
        videoId: '1213616145',
        duration: 16 * 60 + 25,
        general:
          'Clase de cierre del módulo: cómo sostener los hábitos cuando termina el entusiasmo inicial. La mejor rutina no es la más intensa, es la que sigue existiendo en los días difíciles. Incluye un caso personal de Mateo y un ejercicio para escribir tres acciones mínimas sostenibles.',
        corta:
          'No necesitás sentir ganas todos los días. Necesitás aprender a volver. Un Cuerpo Autónomo no es el que nunca se desvía, es el que siempre sabe volver.',
        completa:
          'Durante este módulo entendimos que el cuerpo se adapta a lo que repetimos. Aprendimos que pequeños hábitos pueden tener un impacto enorme, que el movimiento no es solamente entrenar y que ordenar el cuerpo muchas veces significa ordenar la vida. Pero ahora aparece la pregunta más importante: ¿cómo sostenemos todo esto cuando termina el entusiasmo inicial? Muchas personas creen que necesitan más disciplina o más motivación para cambiar. Necesitan algo mucho más simple: una práctica que sobreviva a los días difíciles. La mejor rutina no es la más intensa, es la que sigue existiendo cuando no tenés tiempo, cuando estás cansado o cuando simplemente no tenés ganas.\n\nLas ganas no aparecen antes de empezar. Aparecen cuando empezás a sentir que el cuerpo responde. Primero aparece la necesidad, después la decisión, recién más adelante llegan la confianza y el disfrute. Esperar sentirte motivado para empezar es como esperar saber nadar antes de entrar al agua. El cuerpo aprende haciendo, y la confianza también.\n\nCaso personal: hay días en los que no entreno, en los que no tengo una hora libre ni energía para una rutina completa. Pero hace mucho tiempo dejé de pensar que entrenar era solamente dedicarle una hora al ejercicio. Hoy forman parte de mi vida pequeñas cosas que casi no requieren esfuerzo: una sentadilla profunda mientras espero el agua para el mate, mover el cuello después de trabajar varias horas, abrir el pecho cuando siento que llevo demasiado tiempo sentado, respirar conscientemente en el ómnibus o escuchar una meditación antes de dormir. No porque sea disciplinado, sino porque esas acciones dejaron de sentirse como tareas y pasaron a ser parte de cómo vivo. No pretendo que incorpores todo eso de golpe: pensar que tenemos que hacer absolutamente todo lo que nos hace bien suele ser la forma más rápida de abandonar. La idea es encontrar hábitos que tengan sentido dentro de tu realidad, no dentro de una vida perfecta.\n\nEjercicio: escribí tres acciones tan pequeñas que puedas sostener incluso en una semana complicada. No pienses en la rutina ideal, pensá en la vida que tenés hoy: respirar tres minutos al levantarte, caminar diez minutos después de comer, sentarte un rato en el suelo, hacer algunas sentadillas profundas, mover la columna al terminar de trabajar, levantarte cada dos horas del escritorio. El objetivo no es hacer más, es construir una base que siempre esté ahí. Cuando los hábitos son demasiado grandes dependen de la motivación; cuando son suficientemente pequeños, empiezan a formar parte de tu vida.\n\nMuchas veces nos contamos historias para justificar por qué no cambiamos: "trabajo muchas horas", "estoy cansado", "no tengo tiempo", "soy muy rígido". Muchas veces esas razones son reales, pero también es cierto que no siempre podemos cambiar nuestras circunstancias, mientras que casi siempre podemos cambiar cómo respondemos dentro de ellas. La clave no es transformar toda tu vida de un día para otro. La clave es dejar de creer que solo existen dos opciones: hacerlo perfecto o no hacer nada.\n\nCierre: en el primer módulo aprendimos a percibir. En este aprendimos a ordenar. Entendimos que el cuerpo se adapta a lo que repetimos, que los hábitos construyen más que la motivación, que la fuerza, la flexibilidad y el movimiento no compiten entre sí, y que la mejor postura es la siguiente. Una vida más saludable no se construye con acciones extraordinarias, sino con decisiones simples que dejamos de negociar. El cuerpo cambia lento, no responde a la intensidad de un solo día, responde a la información que recibe una y otra vez. No necesitás hacerlo perfecto. No necesitás sentir ganas todos los días. Necesitás aprender a volver. Porque un Cuerpo Autónomo no es el que nunca se desvía. Es el que siempre sabe volver.',
      }, 5),
    ],
  },
  {
    timelineIndex: 2,
    titulo: 'Construir',
    esencia: '',
    bundleTipo: 'videos',
    vimeoPlaylistId: '',
    clases: [
      clase({
        name: 'Construí un cuerpo que resuelve',
        videoId: '1215815068',
        duration: 45 * 60 + 18,
        general:
          'Primera clase del módulo Construir: después de percibir y ordenar el cuerpo, empezamos a desarrollar capacidades. Trabajamos fuerza, movilidad y adaptabilidad en una misma práctica, integrando cambios de apoyo, locomoción (gateos, crawl) y resolución de problemas en movimiento.',
        corta:
          'El cuerpo no necesita solamente fuerza ni solamente flexibilidad. Necesita producir fuerza, moverse con amplitud y resolver situaciones mientras se mueve. Hoy empezamos a construir eso.',
        completa:
          'En los módulos anteriores aprendimos a percibir y ordenar el cuerpo. Ahora empieza una etapa distinta: desarrollar capacidades. El cuerpo no necesita solamente fuerza ni solamente flexibilidad. Necesita producir fuerza, moverse con amplitud y resolver situaciones mientras se mueve. Hoy vamos a trabajar esas tres cosas en una misma práctica.\n\nCalentamiento general: respiración, transferencias de peso, movilidad articular, segmentación de columna.\n\nConstruir capacidad: la fuerza es la capacidad de producir y controlar movimiento. Cuando entrenamos utilizando todo el recorrido de una articulación también entrenamos movilidad. No buscamos músculos grandes, buscamos un cuerpo que pueda responder mejor a las demandas de la vida. Práctica en 3 vueltas: sentadilla, zancadas, flexiones de brazos, dominadas o remo, y plancha, agregando variantes de apoyo y saltos en la última vuelta, con descanso entre vueltas. Recuperar rango manteniendo 45-60 segundos cada posición: pancake, half split, hip flexor stretch, rotación torácica, apertura de hombros, respirando lento. La fuerza construye capacidad, la movilidad amplía las posibilidades, pero todavía falta algo.\n\nConstruir un cuerpo adaptable: hasta ahora desarrollamos fuerza y recuperamos rango de movimiento, pero la vida no nos pide esas capacidades por separado. Nos pide cambiar de dirección, recuperar el equilibrio, reaccionar, cargar objetos, entrar y salir del suelo y resolver problemas mientras nos movemos. Un cuerpo capaz no solo tiene fuerza y movilidad, sabe coordinarlas y adaptarlas a situaciones cambiantes. Las capacidades orgánicas nacen de esa integración.\n\nPráctica en 2-3 vueltas: cambios de apoyo (transferencias de peso, equilibrio unipodal, alcanzar el piso con una pierna), locomoción (bear crawl, crawl lateral, crab walk), e integración (entrar y salir del suelo de distintas maneras, levantar un objeto del suelo con diferentes estrategias, y flow libre integrando desplazamientos, cuadrupedia, sentadilla, cambios de apoyo y rotaciones).\n\nReflexión: la fuerza y la movilidad construyen capacidades, la coordinación les da sentido. Un cuerpo adaptable no memoriza movimientos, aprende a encontrar soluciones. ¿Qué estrategias aparecieron de forma espontánea? ¿En qué situaciones tuviste que adaptarte en lugar de repetir un patrón? ¿Qué capacidades sentís que todavía necesitan más experiencia?',
      }, 0),
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
    MODULOS.forEach((m) => {
      console.log(`Módulo "${m.titulo}": ${m.clases.length} clases`);
      m.clases.forEach((c) => console.log(`  - ${c.name} (video ${c.videoId || 'SIN VIDEO'})${c.descripcionCompleta ? '' : ' [SIN TEXTO]'}`));
    });
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

  // Borrar las 22 CourseClass de la versión anterior (Calmar/Ordenar/Construir inventada).
  const deleted = await CourseClass.deleteMany({ productId: product._id });
  console.log('🗑️  CourseClass viejas borradas:', deleted.deletedCount);

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
