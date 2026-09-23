/* ============================================================
   curriculum-data.js — datos del currículo de ejercicios,
   compartidos por index.html (menú) y curriculum.html (vista de
   desarrollo).
   Para publicar un ejercicio: pon su URL en el modo correspondiente
   (id / au / ct) de su familia. null = todavía no disponible.
   Qué ven los alumnos: cada unidad lleva `publico:true` cuando está
   lista para ellos. En modo 'publico' (ver modo.js) el menú trata las
   unidades sin ese flag como «próximamente», aunque tengan ejercicios;
   en modo 'dev' se ven todas, marcadas. Granularidad: la unidad.
   La numeración de unidades (`n`) es 0–6 en cada curso (UD 0 = repaso):
   solo identifica dentro de su curso, nunca entre cursos.
   Excepción (unidades de repaso, UD 0 de ambos cursos): sus familias
   no tienen modos id/au/ct (todo es identificación) sino VARIANTES,
   en el array `tipos` [{key, label, title, icono, texto?, url, desc}].
   `icono` es una clave de TIPO_ICONS (index.html) o 'apilado' para
   el icono tipográfico de cifras (con el campo `texto`).
   Las familias sin `niveles` no tienen niveles de dificultad.
   ============================================================ */
const CURRICULO = {
  modos: [
    {key:'id', label:'ID', title:'Identificación'},
    {key:'au', label:'AU', title:'Audición'},
    {key:'ct', label:'CT', title:'Canto'}
  ],
  cursos: [
    {
      nombre:'Curso 3.º', tag:'Diatónico',
      unidades:[
        { n:0, titulo:'Preliminares', publico:true,
          familias:[
            { nombre:'Armaduras',
              desc:'Relacionar armadura y tonalidad en los dos sentidos: series encadenadas de 12 armaduras, desveladas una a una. Conmutadores inclusivos de mayor/menor. Sin niveles de dificultad.',
              tipos:[
                {key:'quintas', label:'POR 5.ª', title:'Por quintas', icono:'reloj',
                 url:'ejercicios/unidad0-armaduras-quintas.html',
                 desc:'Se parte de 2–5 bemoles (o sostenidos) y se recorre el círculo entero en un sentido; se muestra la armadura y se pide la tonalidad. Nunca 7 alteraciones (se prefiere la enarmónica de 5); con 6, sostenidos en sentido horario y bemoles en antihorario.'},
                {key:'cromatico', label:'CROM.', title:'Cromático', icono:'escalones',
                 url:'ejercicios/unidad0-armaduras-cromatico.html',
                 desc:'Doble escala cromática: la tónica mayor sube o baja por semitonos toda la octava, con su relativa menor en paralelo; se muestran los nombres y se pide la armadura, que se dibuja al revelar. Subiendo se prefieren tónicas con sostenido (máx. 6 alteraciones); bajando, con bemol.'},
                {key:'aleatorio', label:'AZAR', title:'Aleatorio', icono:'dado',
                 url:'ejercicios/unidad0-armaduras-aleatorio.html',
                 desc:'Las 12 armaduras barajadas, sin repetir; se muestra la armadura y se pide la tonalidad (con 6 alteraciones, enarmónico al azar).'}
              ]},
            { nombre:'Intervalos',
              desc:'Intervalos armónicos en clave de Sol, hasta la 8.ª, a dos voces (plicas arriba/abajo). Alteraciones simples (un solo ♯/♭) y sin intervalos doble aumentados/disminuidos. Sin niveles de dificultad.',
              tipos:[
                {key:'normal', label:'SIMPLE', title:'Identificación', icono:'dosvoces',
                 url:'ejercicios/unidad0-intervalos-normal.html',
                 desc:'Dos notas simultáneas: nombrar amplitud y calidad («3.ª menor»).'},
                {key:'inversion', label:'INV.', title:'Con inversión', icono:'flechas',
                 url:'ejercicios/unidad0-intervalos-inversion.html',
                 desc:'Se muestra el intervalo (2.ª a 7.ª) y se pide su inversión; la respuesta añade las notas invertidas y el intervalo resultante (do–mi → mi–do, 6.ª menor).'},
                {key:'grados', label:'GRADOS', title:'Con grados', icono:'grados',
                 url:'ejercicios/unidad0-intervalos-grados.html',
                 desc:'Intervalo dentro de una tonalidad (armadura + nombre; las 4 del trimestre 1): nombrar el intervalo y el grado de cada nota (número con circunflejo, encima y debajo del pentagrama). Único accidental posible: la sensible del menor.'}
              ]},
            { nombre:'Acordes',
              desc:'Tríadas con alteraciones simples (reubica la antigua familia de tríadas de la Unidad 1): aisladas, sin tonalidad, salvo en la variante con grados. Las dos primeras variantes alternan dos sentidos: identificar el acorde que se ve, o construirlo a partir del dato (en el nivel 3, posición abierta, solo se identifica en «Tipo y cifrado»).',
              tipos:[
                {key:'tipo', label:'TIPO', title:'Tipo y cifrado', icono:'triada',
                 url:'ejercicios/unidad0-acordes-tipo.html',
                 desc:'Se muestra la tríada en estado fundamental y se piden el tipo (mayor / menor / aumentada / disminuida) y su cifrado americano (D♭m, F°, C+), o se da el cifrado y se pide el acorde.'},
                {key:'inversion', label:'INV.', title:'Inversiones', icono:'apilado', texto:'6/4',
                 url:'ejercicios/unidad0-acordes-inversion.html',
                 desc:'Se muestra la tríada y se piden la inversión y su cifrado («1.ª inversión · 6/3»; en el detalle, el cifrado americano con barra, C/E), o se dan el bajo con su cifrado (solo 6/3 o 6/4) y el tipo, y se pide el resto del acorde.'},
                {key:'grados', label:'GRADOS', title:'Con grados', icono:'romano',
                 url:'ejercicios/unidad0-acordes-grados.html',
                 desc:'Tríada diatónica en estado fundamental dentro de una tonalidad (armadura + nombre; las 4 del trimestre 1): decir modo, grado de la fundamental y tipo («Modo mayor · II grado · Tríada menor»). En menor, la sensible solo en V y VII; el III se toma de la escala natural.'}
              ],
              niveles:[
                'Clave de Sol, posición cerrada.',
                'Clave de Fa, posición cerrada.',
                'Posición abierta en pentagrama doble: el bajo en clave de Fa y las otras dos notas en clave de Sol.'
              ]}
          ]},
        { n:1, titulo:'Morfología. Conducción de voces', publico:false,
          familias:[
            { nombre:'Intervalos',
              desc:'Nombrar la amplitud y la calidad del intervalo a dos voces, y clasificarlo como consonancia perfecta / imperfecta o disonancia.',
              modos:{
                id:{url:'ejercicios/familia2-intervalos-id.html',
                    desc:'Partitura visible; nombrar amplitud, calidad y tipo.'},
                au:{url:'ejercicios/familia2-intervalos-au.html',
                    desc:'Solo audio; la partitura se muestra al revelar la respuesta.'},
                ct:null
              },
              niveles:[
                'Modo mayor, clave de Sol; del unísono a la 8.ª (únicos aumentados/disminuidos posibles: 4.ª aum. / 5.ª dism.).',
                'Añade el modo menor (la sensible genera otros aumentados/disminuidos) y la clave de Fa; amplitudes hasta la 12.ª (compuestos).',
                'Dos claves a la vez (una nota en Fa y otra en Sol, pentagrama doble); casi todos los intervalos son compuestos; sin cruces.'
              ]},
            { nombre:'Movimiento armónico',
              desc:'Contrapunto 1:1 de 10 notas a dos voces: identificar los intervalos armónicos y el tipo de movimiento de cada transición (oblicuo / contrario / directo / paralelo).',
              modos:{
                id:{url:'ejercicios/familia3-movimientos-id.html',
                    desc:'El fragmento se revela intervalo a intervalo; la solución (cifra y línea) va un paso por detrás, para poder adivinar antes.'},
                au:{url:'ejercicios/familia3-movimientos-au.html',
                    desc:'Solo audio, con movimiento casi uniforme: identificar de oído el tipo dominante.'},
                ct:{url:'ejercicios/familia3-movimientos-ct.html',
                    desc:'Cantar el fragmento a dos voces; los conmutadores muestran la solución sobre la partitura.'}
              },
              niveles:[
                'Clave de Sol, modo mayor.',
                'Añade la clave de Fa y el modo menor (con posible sensible).',
                'Una voz en clave de Sol y otra en clave de Fa (pentagrama doble).'
              ]}
          ]},
        { n:2, titulo:'Tónica y dominante', familias:[] },
        { n:3, titulo:'Subdominante. Cadencias', familias:[] },
        { n:4, titulo:'7.ª dominante y 6/4', familias:[] },
        { n:5, titulo:'Otros grados. Cadencia rota', familias:[] },
        { n:6, titulo:'Secuencias diatónicas', familias:[] }
      ]
    },
    {
      nombre:'Curso 4.º', tag:'Cromático',
      unidades:[
        { n:0, titulo:'Repaso', publico:true,
          familias:[
            { nombre:'Cadencias',
              desc:'Cadencias a cuatro voces (CAP, CAI, SC —también frigia— y CR), realizadas al vuelo por el motor a cuatro voces según los mínimos de conducción; 12 tonalidades (16 en el nivel 3), compases de 2/4, 3/4 y 4/4, anacrusa desde el nivel 2. Al revelar, cifrado americano encima y grados con cifras debajo.',
              tipos:[
                {key:'tipo', label:'TIPO', title:'Tipo', icono:'cadencia',
                 url:'ejercicios/c4u0-cadencias-tipo.html',
                 desc:'Se muestra la cadencia completa y la tonalidad; se pide el tipo. CAP y CAI se distinguen solo por la soprano (1̂ frente a 3̂ o 5̂).'},
                {key:'bajo', label:'BAJO', title:'Bajo dado', icono:'clavefa',
                 url:'ejercicios/c4u0-cadencias-bajo.html',
                 desc:'Solo el bajo, con armadura y compás pero sin nombre de tonalidad: se piden tonalidad, tipo y acordes (grado e inversión). El bajo no distingue CAP de CAI, así que se responde CA; al revelar, una realización con su cifrado y, en una segunda fila, los acordes que también habrían cabido.'},
                {key:'canto', label:'CANTO', title:'Canto dado', icono:'clavesol',
                 url:'ejercicios/c4u0-cadencias-canto.html',
                 desc:'Solo la soprano, con su armadura, su compás y el tipo de cadencia: se piden la tonalidad y la línea del bajo. Al revelar, una realización completa con su cifrado y la lista de las demás líneas de bajo que también servirían.'}
              ],
              niveles:[
                'CAP, CAI y SC; tónica inicial I o I6, predominante IV o II6, V o V7; 12 tonalidades; sin anacrusa.',
                'Añade la cadencia rota (sobre VI), la semicadencia frigia, el 6/4 cadencial, II en fundamental (mayor), IV6 (menor) y la anacrusa.',
                'Añade VI como tónica inicial, IV6 en mayor y la rota sobre IV6; 16 tonalidades.'
              ]}
          ]},
        { n:1, titulo:'7.ª diatónicas', familias:[] },
        { n:2, titulo:'Modulación y dominante secundaria', familias:[] },
        { n:3, titulo:'Acordes de VII con 7.ª', familias:[] },
        { n:4, titulo:'VII como D.S. Secuencias modulantes', familias:[] },
        { n:5, titulo:'Homónimo menor', familias:[] },
        { n:6, titulo:'Acordes alterados', familias:[] }
      ]
    }
  ]
};
