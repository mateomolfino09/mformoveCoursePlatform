import { ClassesDB, IndividualClass, Question } from "../../typings";

let usedComments: string[] = [];

export const commentsFunction = (clase: IndividualClass, length: number): Question[] => {
  // Función para obtener un comentario aleatorio sin repeticiones
  const getUniqueRandomComment = () => {
    // Obtiene un comentario aleatorio de la lista
    let comment = getRandomPositiveComment();
    
    // Si el comentario ya fue usado, elige otro
    while (usedComments.includes(comment)) {
      comment = getRandomPositiveComment();
    }
    
    // Marca el comentario como utilizado
    usedComments.push(comment);
    
    return comment;
  };

  return Array.from({ length: length }, (_, index) => ({
    id: Math.floor(Math.random() * 1000), // Genera un ID aleatorio
    question: getUniqueRandomComment(),  // Usa el comentario único
    answers: [],
    user: {
      id: Math.floor(Math.random() * 1000),
      _id: Math.floor(Math.random() * 1000),
      name: getRandomName(),
      email: `usuario${Math.floor(Math.random() * 1000)}@example.com`,
      gender: getRandomGender(),
      country: getRandomCountry(),
      password: "userpass",
      createdAt: generateRandomDate(),
      rol: "User",
      emailToken: "",
      courses: [],
      admin: { active: false, permissions: [] },
      notifications: [],
      classesSeen: [],
      isMember: getRandomBoolean(),
      subscription: null,
      freeSubscription: {
        email: `usuario${Math.floor(Math.random() * 1000)}@example.com`,
        createdAt: generateRandomDate(),
        active: true,
      },
    },
    answerAdmin: null,
    class: {
      _id: clase?._id.toString() || '',
      id: clase?.id || 0,
      name: clase?.name || '',
      createdAt: clase?.createdAt.toString() || '',
      class_code: '',
      image_url: clase?.image_url || '',
      likes: 20,
      totalTime: clase?.totalTime || 0,
      course: null,
      atachedFiles: clase?.atachedFiles || [],
      links: clase?.links || [],
    },
    createdAt: generateRandomDate(),
    hasAnswer: false,
  }));
};

// export const commentsFunction = (individualClass: IndividualClass): Question => ({
//     id: Math.floor(Math.random() * 1000), // Genera un ID aleatorio
//     question: getRandomPositiveComment(),
//     answers: [],
//     user: {
//       id: Math.floor(Math.random() * 1000),
//       _id: Math.floor(Math.random() * 1000),
//       name: getRandomName(),
//       email: `usuario${Math.floor(Math.random() * 1000)}@example.com`,
//       gender: getRandomGender(),
//       country: getRandomCountry(),
//       password: "userpass",
//       createdAt: new Date().toISOString(),
//       rol: "User",
//       emailToken: "",
//       courses: [],
//       admin: { active: false, permissions: [] },
//       notifications: [],
//       classesSeen: [],
//       isMember: getRandomBoolean(),
//       subscription: null,
//       freeSubscription: {
//         email: `usuario${Math.floor(Math.random() * 1000)}@example.com`,
//         createdAt: new Date().toISOString(),
//         active: true,
//       },
//     },
//     answerAdmin: null,
//     class: {
//         _id: individualClass?._id.toString() || '',
//         id: individualClass?.id || 0,
//         name: individualClass?.name || '',
//         createdAt: individualClass?.createdAt.toISOString() || '',
//         class_code: '',
//         image_url: individualClass?.image_url || '',
//         likes: 0,
//         totalTime: individualClass?.totalTime || 0,
//         course: null,
//         atachedFiles: individualClass?.atachedFiles || [],
//         links: individualClass?.links || [],
//       },    createdAt: new Date().toISOString(),
//     hasAnswer: false,
//   });
  
  function getRandomClassName() {
    const classes = ["Flexibilidad básica", "Movilidad avanzada", "Fuerza para principiantes", "Respiración consciente"];
    return classes[Math.floor(Math.random() * classes.length)];
  }
  
  function getRandomName() {
    const firstNames = [
        "Ana", "Luis", "Carlos", "María", "Pedro", "Lucía", "Sofía", "José", "Camila", "Diego",
        "Valentina", "Andrés", "Paula", "Juan", "Carolina", "Miguel", "Elena", "Javier", "Gabriela", "Fernando",
        "Isabel", "Ricardo", "Sara", "Daniel", "Laura", "Manuel", "Alejandra", "Hugo", "Claudia", "Mateo",
        "Andrea", "Cristina", "Francisco", "Martina", "Jorge", "Patricia", "Santiago", "Carmen", "Adriana", "Raúl",
        "Álvaro", "Victoria", "Sebastián", "Natalia", "Eduardo", "Florencia", "Rodrigo", "Alicia", "Antonio", "Diana",
        "Guillermo", "Julia", "Samuel", "Clara", "Nicolás", "Marta", "Rafael", "Teresa", "Pablo", "Irene",
        "Marcos", "Daniela", "Esteban", "Ariana", "Leandro", "Milagros", "Felipe", "Agustina", "Tomás", "Renata",
        "Federico", "Luisa", "Simón", "Rocío", "Cristian", "Pilar", "Víctor", "Eva", "Ramón", "Beatriz",
        "Emilio", "Noelia", "Ángel", "Miranda", "Iván", "Bárbara", "Oscar", "Marina", "Enrique", "Gloria",
        "Alejandro", "Verónica", "Mario", "Esther", "Bruno", "Silvia", "Héctor", "Elsa", "Leonardo", "Rosa"
      ];    
      const lastNames = [
        "López", "Pérez", "Gómez", "Rodríguez", "Martínez", "Fernández", "Torres", "Vargas", "Castro", "Ramírez",
        "Sánchez", "Díaz", "García", "Hernández", "Luna", "Moreno", "Jiménez", "Ruiz", "Gutiérrez", "Muñoz",
        "Alvarez", "Molina", "Blanco", "Suárez", "Jiménez", "Cruz", "Romero", "Méndez", "Ríos", "Vega",
        "Reyes", "González", "Hidalgo", "Salazar", "Escobar", "Paredes", "Álvarez", "Bermúdez", "Ramos", "Morales",
        "Lozano", "Serrano", "Rojas", "Cabrera", "Márquez", "Rivera", "Castillo", "Aguirre", "Fernández", "Ruíz",
        "López", "Bautista", "Chávez", "Linares", "Vidal", "Ochoa", "Delgado", "Pacheco", "Figueroa", "Vidal",
        "Gálvez", "Gil", "Núñez", "Calderón", "Campos", "Bellido", "Serrano", "Solís", "Rivas", "Valenzuela",
        "López", "Navarro", "Cordero", "Riviera", "Cifuentes", "Guerra", "Escalante", "Valverde", "Contreras", "Orozco",
        "Delgado", "Suárez", "Arroyo", "Ortega", "Soto", "Molina", "Torres", "Bolaños", "Mendoza", "López",
        "Vargas", "Peña", "Arias", "Maya", "Vera", "Santos", "Aguilar", "Muñoz", "Ferrer", "Castro", "Pizarro",
      
        // Apellidos italianos
        "Rossi", "Bianchi", "Romano", "Ricci", "Esposito", "Conti", "Gallo", "Mancini", "Lombardi", "Moretti",
        "Marino", "Giordano", "Costa", "Ferrari", "Santoro", "Martini", "Di Stefano", "De Luca", "Grasso", "Coppola",
        "D'Angelo", "Carlucci", "Caputo", "Barbieri", "Pugliese", "Fabbri", "Rizzo", "Bianco", "Ventura", "Caldwell",
        "Pellegrino", "Monti", "Tocci", "Vitali", "Giuliani", "Graziani", "Cicco", "Neri", "Sarti", "Ferraro",
        "Nicolosi", "Lo Bianco", "Basso", "Miele", "Bellini", "Lombardo", "Sgambato", "Alessandro", "Della Rocca",
      
        // Apellidos españoles
        "Álvarez", "Sánchez", "Martínez", "Gómez", "Rodríguez", "López", "Pérez", "Fernández", "García", "Hernández",
        "Jiménez", "Díaz", "Vázquez", "Mendoza", "Moreno", "Torres", "Castro", "Vega", "Ruiz", "Ramos", "Muñoz",
        "Navarro", "Gil", "Vidal", "Solís", "Suárez", "Morales", "Crespo", "Ríos", "Paredes", "Reyes", "Valencia",
        "Delgado", "Cordero", "Álvarez", "Romero", "Gutiérrez", "Blanco", "Peña", "Vázquez", "González", "Linares",
        "Bautista", "Márquez", "Molina", "Castilla", "Gonzalo", "Olivares", "Tobar", "Llorente", "Miranda", "Navarro",
        "Bellido", "Serrano", "Córdoba", "Calderón", "Cifuentes", "Serrat", "Guerra", "Hidalgo", "Martín", "Alonso",
        "Ortega", "Valverde", "Zapata", "Cabrera", "Chávez", "Bolaños", "Campos", "Palacio", "Rodrigo", "García",
        "Paredes", "Rivas", "Jaramillo", "Navarro", "Moya"
      ];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }
  
  function getRandomGender() {
    return Math.random() > 0.5 ? "M" : "F";
  }
  
  function getRandomCountry() {
    const countries = ["Argentina", "Uruguay", "Chile", "México", "España", "Colombia"];
    return countries[Math.floor(Math.random() * countries.length)];
  }
  
  function getRandomBoolean() {
    return Math.random() > 0.5;
  }
  
  function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const positiveComments = [
    "¡La clase estuvo de diez! Me dejó como nuevo, la espalda me agradece.", // Uruguay
    "¡Excelente clase! Me sentí tan bien que ni me di cuenta cuando pasó el tiempo.", // Argentina
    "Me encantó cómo nos guiaron, ¡nunca pensé que iba a estirarme así!", // Perú
    "Espectacular, ya quiero la siguiente, la energía estuvo brutal.", // Centroamérica
    "Qué buena clase, la sensación después es de relax total. ¡Increíble!", // España
    "¡Qué buen nivel! La flexibilidad ahora está mejor que nunca, ¡gracias!", // Argentina
    "¡Un 10! Los ejercicios eran justos para mi nivel. Se nota la experiencia del profe.", // España
    "Te lo juro, no me imaginaba que iba a terminar tan relajado después de esta clase.", // Uruguay
    "¡Qué bien estuvo todo! Me sorprendí de lo que pude lograr, muy buen trabajo.", // Perú
    "¡Me encantó! Los movimientos eran desafiantes, pero alcanzables. Me siento más fuerte.", // Centroamérica
    "Nunca pensé que sería capaz de hacer esos estiramientos, ¡genial clase!", // Argentina
    "¡Súper recomendada! El ritmo estuvo ideal, ni muy rápido ni muy lento, perfecto.", // España
    "Me ayudó mucho con mi postura, lo recomiendo totalmente.", // Perú
    "¡Qué clase más genial! Siento que mi cuerpo responde mejor ahora, ya me siento más ágil.", // Uruguay
    "¡Esto es lo que necesitaba para relajarme después de todo el estrés!", // Centroamérica
    "Estoy mucho más flexible gracias a estas clases. ¡Nunca creí que lograría tanto!", // Argentina
    "¡La clase estuvo de lujo! Un antes y un después, me siento más alineado.", // España
    "¡Un placer asistir! La clase estuvo llena de energía positiva, ¡me hizo sentir genial!", // Uruguay
    "La atención a los detalles es increíble, jamás me había sentido tan bien después de una clase.", // Perú
    "¡Todo un éxito la clase! El profe sabe cómo hacer todo accesible para todos los niveles.", // Centroamérica
    "El enfoque en la respiración fue un plus, ya me siento más relajado después.", // España
    "¡Increíble! Mejoré mucho en un solo día, ahora puedo estirarme sin tanto dolor.", // Argentina
    "Me siento mucho más conectado con mi cuerpo, ¡todo fue perfecto!", // Perú
    "¡Clase de lujo! El ritmo estuvo perfecto, no faltó nada. Me voy a seguir sumando.", // Uruguay
    "Gracias por las opciones para todos los niveles. Muy útil y motivante.", // Centroamérica
    "¡Impresionante! Esta clase me dejó con una sensación de bienestar total.", // España
    "Nunca pensé que disfrutaría tanto estirarme, ¡qué cambio!", // Argentina
    "¡Muy buena clase! Me sentí más suelto que nunca, ¡recomendada!", // Perú
    "Excelente clase, el ambiente estuvo genial y la vibra del instructor estuvo a otro nivel.", // Uruguay
    "Me sorprendió la forma en que integraron los estiramientos con la respiración, ¡genial!", // España
    "Siento que mi cuerpo ha cambiado mucho en pocas sesiones, ¡gracias por todo!", // Argentina
    "¡Me encantó! Gracias por la paciencia y por hacer todo tan claro.", // Perú
    "¡Nunca pensé que sería capaz de llegar tan lejos con los estiramientos, me siento excelente!", // Centroamérica
    "Lo más impresionante fue cómo me sentí al final, una relajación total.", // España
    "¡Gran clase! Me siento con mucha más energía ahora.", // Argentina
    "Siento que cada vez que asisto, mi cuerpo mejora un poco más. ¡Gracias!", // Perú
    "¡Qué clase más espectacular! Estoy mejorando mi flexibilidad muy rápido.", // Uruguay
    "¡Impresionante cómo me ayudaron a liberar todo el estrés! 10/10.", // Centroamérica
    "¡Genial! Me siento mucho más flexible, lo que pensaba imposible ahora es una realidad.", // España
    "Me encantó cómo nos guiaron en cada movimiento, muy bien explicado.", // Argentina
    "Una clase muy completa, se notó que cada detalle estuvo pensado. ¡Genial!", // Perú
    "¡De lujo! Siento que cada día que pasa mejoro mucho más, ¡gracias!", // Uruguay
    "¡Una clase espectacular! Los ejercicios fueron ideales para mis necesidades.", // Centroamérica
    "Me siento mucho más fuerte y relajado, ¡gracias por esta clase!", // España
    "¡Qué bien lo pasé! Me sentí mucho más ágil al final de la clase.", // Argentina
    "Gracias por siempre explicar todo de forma clara, ¡ahora entiendo mejor mi cuerpo!", // Perú
    "¡Qué clase más buena! Los estiramientos me dejaron renovado, me siento mucho mejor.", // Uruguay
    "¡Súper recomendada! Mejoré mucho más rápido de lo que pensaba.", // Centroamérica
    "Excelente clase, mis piernas se sienten mucho más livianas ahora.", // España
    "Cada clase mejora más, ya puedo hacer más estiramientos sin dolor, ¡gracias!", // Argentina
    "Gracias por las explicaciones tan detalladas, eso me ayudó mucho.", // Perú
    "¡Muy buena clase! No puedo esperar para la próxima, ¡ya estoy enganchado!", // Uruguay
    "¡Gracias por todo! Me siento mucho más relajado y mi cuerpo responde mejor.", // Centroamérica
    "¡La clase estuvo brutal! Me siento más fuerte, más flexible y más relajado.", // España
    "¡Qué increíble cómo me siento después de esta clase! Mejoró mi flexibilidad de manera impresionante.", // Argentina
    "¡Siento que mi cuerpo está mucho más alineado! Gracias por todo.", // Perú
    "¡Fantástica clase! Ahora puedo moverme mejor y sin tanto dolor.", // Uruguay
    "¡Un lujo de clase! Muy clara, muy bien explicada y muy accesible.", // Centroamérica
    "¡Increíble lo que logré en tan poco tiempo! Gracias por guiarme tan bien.", // España
    "¡Excelente! La clase me hizo sentir tan bien que ya estoy listo para la próxima.", // Argentina
    "¡Qué bien que la clase fue tan personalizada! Me siento mucho mejor después de hacerlo.", // Perú
    "¡Excelente trabajo! Me sentí más motivado que nunca a seguir adelante con mis entrenamientos.", // Uruguay
    "Muy buen ritmo, pude seguir todo paso a paso sin problemas. ¡Me siento increíble!", // Centroamérica
    "¡Qué bien estructurada estuvo la clase! Me sentí más fuerte al final.", // España
    "Me siento increíble, como si mi cuerpo hubiera renovado, ¡recomendada!", // Argentina
    "Gracias por ser tan paciente y claro con las explicaciones.", // Perú
    "¡Qué buen trabajo! La clase estuvo perfecta, mi flexibilidad mejoró mucho.", // Uruguay
    "¡Una clase espectacular! El profe tiene mucha onda, me sentí muy bien.", // Centroamérica
    "Me siento con mucha más energía, ¡y mejorando cada vez más!", // España
    "¡Qué clase más divertida! No solo relajante, también me sentí retado de una manera positiva.", // Argentina
    "Siento que cada vez que asisto mi cuerpo mejora más. ¡Me siento increíble!", // Perú
    "¡De diez! La clase fue muy buena, con mucho foco en las técnicas.", // Uruguay
    "¡Increíble! Gracias por darme la confianza para estirarme y moverme más.", // Centroamérica
    "¡Esta clase estuvo brutal! Me siento mucho más flexible, ¡gracias!", // España
    "La clase estuvo muy bien pensada. Me siento mucho más enérgico y relajado ahora.", // Argentina
    "¡Qué clase tan completa! Cada día estoy más feliz con los resultados.", // Perú
    "¡Increíble cómo me siento ahora! Mis piernas están mucho más sueltas.", // Uruguay
    "¡Gran clase! Logré estirarme mucho más de lo que pensaba, me siento excelente.", // Centroamérica
    "Me siento mucho más equilibrado, tanto física como mentalmente.", // España
    "¡Qué espectacular clase! Gracias por hacerme sentir tan bien.", // Argentina
    "¡Genial clase! Estoy muy contento con cómo me siento ahora, mucho más relajado.", // Perú
    "¡Muy buena clase! La disfruté mucho, me siento más flexible y fuerte.", // Uruguay
    "¡De lujo! La clase estuvo perfecta para mi nivel, ¡me siento genial!", // Centroamérica
    "Esta clase fue una locura, no me imaginaba que podría estirarme tanto.",
    "¡Qué onda! Mejoré un montón, la flexibilidad está por las nubes.",
    "Increíble, me sentí tan bien después de la clase, como nuevo.",
    "Me re sorprendió lo bien que me cayó la clase, mi cuerpo nunca estuvo tan relajado.",
    "Espectacular! Sentí que estiraba músculos que ni sabía que existían.",
    "La clase estuvo buena, no me esperaba tanto resultado en tan poco tiempo.",
    "Fua! Qué bien que estuvo, me siento re flexible.",
    "Me dejaron todos los músculos relajados, la clase fue lo mejor.",
    "¡Qué buenísimo todo! Siento que mis músculos están de fiesta después de esta clase.",
    "¡Estuvo de 10! Mis piernas ahora se sienten livianas.",
    "¡Increíble! Mi flexibilidad aumentó un montón, lo que más me sorprendió fue lo rápido que pasó.",
    "¡Excelente clase! No creía que podría llegar a hacer estos movimientos.",
    "¡La rompieron! No esperaba tanta mejora, de verdad.",
    "Me sentí tan bien, parecía que mi cuerpo había estado esperando una clase así.",
    "¡Qué gran clase! Estoy más flexible que nunca.",
    "Cada vez me siento más libre con el cuerpo, ¡me encanta!",
    "Es la primera vez que hago algo así, y me encantó. ¡Seguiré viniendo!",
    "La verdad no pensaba que mejoraría tanto, pero ¡aquí estamos!",
    "Está buenísima la clase, te hace sentir que puedes lograr lo imposible.",
    "¡No lo puedo creer! Mi cuerpo se siente más fluido y liviano.",
    "Siento que después de la clase puedo moverme con mucha más libertad.",
    "Es impresionante cómo algo tan simple puede darme tantos resultados.",
    "¡Genial! Mi espalda no me dolió en todo el día, me siento muy bien.",
    "¡Qué buena onda todo! Sentí que la clase estaba hecha a mi medida.",
    "Me sorprendí de lo flexible que me volví en tan solo una sesión.",
    "Me sentí súper bien, ¡gracias por la clase tan completa!",
    "Amo cómo mi cuerpo reacciona a esta clase, ¡es como magia!",
    "¡Fantástico! Cada clase es un desafío nuevo que me encanta superar.",
    "¡Qué maravilla! Ahora puedo hacer movimientos que antes ni pensaba que podía.",
    "La clase estuvo re buena, me sentí muy apoyado durante todo el tiempo.",
    "Estuvo excelente, la mejor clase que tomé en mucho tiempo.",
    "¡Súper! Los estiramientos estuvieron buenísimos, ni me sentí cansado al final.",
    "Me sentí muy a gusto, los movimientos eran justos para mi nivel.",
    "¡Espectacular! Nunca pensé que sería capaz de llegar a estos movimientos.",
    "¡Fui con miedo pero ahora no puedo esperar a la próxima clase!",
    "Lo bueno de esta clase es que es exigente pero no imposible.",
    "¡Qué clase más completa! No me falto nada, muy motivante.",
    "¡Qué onda! La clase estuvo muy buena, mejoré muchísimo.",
    "¡Estuvo de lujo! Los estiramientos me hicieron sentir mucho más relajado.",
    "¡Re bien! Estuve súper incómodo al principio pero terminé sintiéndome re bien.",
    "¡Qué bien! A veces las clases no me motivan, pero esta fue diferente.",
    "¡Muy buena! La verdad es que me hizo sentir mucho más flexible que antes.",
    "No pensé que mi cuerpo podría llegar tan lejos, ¡me encanta cómo me siento!",
    "¡Qué bien! Ahora me siento más en control de mi cuerpo.",
    "No me canso de repetir que esta clase fue lo mejor de la semana.",
    "¡La rompí! Muy buenas indicaciones y ejercicios adecuados.",
    "Me dio una paz interna increíble, fue más allá de lo físico.",
    "Siento que soy otro después de esta clase, ¡increíble!",
    "Estoy bastante sorprendido con lo rápido que vi resultados.",
    "La verdad que me encantó, no esperaba que fuera tan completa.",
    "¡Cada vez mejor! Y eso que al principio me parecía difícil.",
    "Me sentí muy apoyado por el instructor, eso me hizo sentir más cómodo.",
    "Lo mejor de todo es que me sentí muy bien durante y después de la clase.",
    "No sabía que podía hacer estiramientos tan completos, ¡me sorprendí!",
    "¡Estuvo buenísima! Es todo lo que mi cuerpo necesitaba.",
    "Al principio me costaba, pero ahora lo disfruto mucho más.",
    "Recomendadísima, me dio una sensación de bienestar que no esperaba.",
    "¡Qué bien! Me relajé de una manera increíble, ¡lo necesito todos los días!",
    "Me encantó el ritmo de la clase, no era ni tan rápida ni tan lenta.",
    "¡Me siento re bien! La flexibilidad es lo que más noto ahora.",
    "Las clases anteriores fueron más fáciles, esta me retó un montón.",
    "¡Superó todas mis expectativas! De verdad me sentí mucho más flexible.",
    "¡Esto sí que es una clase! Me sentí genial durante todo el tiempo.",
    "¡Fui con dudas, pero ahora me siento completamente satisfecho!",
    "Nada que ver con otras clases, ¡me siento mucho más ágil ahora!",
    "¡Buenísima! Los ejercicios fueron desafiantes, pero totalmente alcanzables.",
    "¡Nunca me imaginé que me sentiría tan bien! ¡Una clase de 10!",
    "¡Qué onda! Ya quiero la próxima clase, siento que me dio mucha energía.",
    "Muy buena clase, me siento mucho más ágil y relajado.",
    "¡Qué sorprendente! Esta clase está ayudando muchísimo a mi postura.",
    "¡Una experiencia excelente! Cada vez más flexible.",
    "Increíble, me siento más fuerte y con mucha menos tensión.",
    "¡Excelente clase! Lo mejor que he hecho por mi cuerpo este año.",
    "¡Qué buena onda! Cada clase me deja con más ganas de seguir entrenando.",
    "¡Re bien! Nunca me sentí tan bien después de una clase, fue increíble.",
    "Me sentí súper cómodo, todo estuvo claro y accesible.",
    "¡A seguir mejorando! Me sentí muy motivado por los avances.",
    "¡Excelente! La clase estuvo en su punto, como siempre.",
    "Cada vez mejor, la clase fue muy completa y me dejó con mucha energía.",
    "¡Qué locura! Sentí que mi cuerpo se está transformando después de esta clase.",
    "Súper recomendada, me siento mucho más ágil que antes.",
    "La clase estuvo increíble, me siento mucho más relajado.",
    "Lo mejor fue que no me sentí forzado, todo fluyó naturalmente.",
    "Súper interesante, cada clase me hace darme cuenta de que mi cuerpo puede más.",
  ];

  const getRandomPositiveComment = (): string => {
    return positiveComments[Math.floor(Math.random() * positiveComments.length)];
  };

  function generateRandomDate() {
    // Obtiene la fecha actual
    const now = new Date();
  
    // Calcula la fecha de hace una semana (7 días)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
    // Genera un valor aleatorio entre la fecha actual y hace una semana
    const randomTime = new Date(oneWeekAgo.getTime() + Math.random() * (now.getTime() - oneWeekAgo.getTime()));
  
    // Devuelve la fecha aleatoria en formato ISO
    return randomTime.toISOString();
  }