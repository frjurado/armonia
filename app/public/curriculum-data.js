/* ============================================================
   curriculum-data.js — datos del currículo de ejercicios: fuente
   única para el menú (index.html), la vista de desarrollo
   (curriculum.html), las páginas de ejercicio (comun.js) y los
   apuntes (construir.py lo lee con Node para sus enlaces).
   Modelo: app/docs/Modelo-ejercicios.md §1 y §3.

   cursos → unidades → familias → consignas.
   · unidad: {id, n, titulo, publico?, familias}. `id` (c3u1…) es el
     mismo que el del apunte de la unidad; `n` es 0–6 en cada curso
     (UD 0 = repaso) y solo identifica dentro de su curso.
   · familia: {nombre, desc, consignas, niveles?, publico?}. Las
     familias sin `niveles` no tienen niveles de dificultad. Este es
     el único sitio donde se dice qué incluye cada nivel.
   · consigna: {key, title, icono, texto?, url, desc, apuntes?,
     oir?, publico?}. `url` null = todavía no disponible. `oir:true`: la
     consigna admite la presentación «Oír» (solo audio hasta revelar). `icono` es una
     clave de TIPO_ICONS (index.html), o 'apilado' para el icono
     tipográfico de cifras (con `texto`). `apuntes`: los epígrafes
     que la explican, como 'c3u1#cifrado-de-grados' (el ancla que
     Pandoc da al título); el primero es el del botón «Apuntes» de la
     página, y todos reciben en el apunte su «Para practicar».
     construir.py avisa si un ancla no existe.

   Qué ven los alumnos: una unidad, cuando lleva `publico:true`. En
   modo 'publico' (modo.js) el menú trata las demás como
   «próximamente», aunque tengan ejercicios; en 'dev' se ve todo,
   marcado. Dentro de una unidad pública, `publico:false` en una
   familia la oculta, y en una consigna la deja como «próximamente»;
   sin marca, heredan.
   ============================================================ */
const CURRICULO = {
  cursos: [
    {
      nombre:'Curso 3.º', tag:'Diatónico',
      unidades:[
        { id:'c3u0', n:0, titulo:'Preliminares', publico:true,
          familias:[
            { nombre:'Armaduras',
              desc:'Relacionar armadura y tonalidad en los dos sentidos: series encadenadas de 12 armaduras, desveladas una a una. Conmutadores inclusivos de mayor/menor. Sin niveles de dificultad.',
              consignas:[
                {key:'quintas', label:'POR 5.ª', title:'Por quintas', icono:'reloj',
                 url:'ejercicios/armaduras-quintas.html', apuntes:['c3u0#el-círculo-de-5.as'],
                 desc:'Se parte de 2–5 bemoles (o sostenidos) y se recorre el círculo entero en un sentido; se muestra la armadura y se pide la tonalidad. Nunca 7 alteraciones (se prefiere la enarmónica de 5); con 6, sostenidos en sentido horario y bemoles en antihorario.'},
                {key:'cromatico', label:'CROM.', title:'Cromático', icono:'escalones',
                 url:'ejercicios/armaduras-cromatico.html', apuntes:['c3u0#el-círculo-de-5.as'],
                 desc:'Doble escala cromática: la tónica mayor sube o baja por semitonos toda la octava, con su relativa menor en paralelo; se muestran los nombres y se pide la armadura, que se dibuja al revelar. Subiendo se prefieren tónicas con sostenido (máx. 6 alteraciones); bajando, con bemol.'},
                {key:'aleatorio', label:'AZAR', title:'Aleatorio', icono:'dado',
                 url:'ejercicios/armaduras-aleatorio.html', apuntes:['c3u0#el-círculo-de-5.as'],
                 desc:'Las 12 armaduras barajadas, sin repetir; se muestra la armadura y se pide la tonalidad (con 6 alteraciones, enarmónico al azar).'}
              ]},
            { nombre:'Intervalos',
              desc:'Intervalos armónicos a dos voces. Identificación y Con grados, en pentagrama doble y con compuestos hasta la 12.ª; Con inversión, en clave de Sol y dentro de la 8.ª. Alteraciones simples (un solo ♯/♭); de los aumentados y disminuidos, solo los de la escala mayor y la menor armónica. Sin niveles de dificultad.',
              consignas:[
                {key:'normal', label:'SIMPLE', title:'Identificación', icono:'dosvoces',
                 url:'ejercicios/intervalos-normal.html', apuntes:['c3u0#intervalos', 'c3u0#intervalos-compuestos'],
                 desc:'Dos notas simultáneas, en el mismo pentagrama o una en cada uno: nombrar amplitud y calidad («3.ª menor»); los compuestos, por su forma simple.'},
                {key:'inversion', label:'INV.', title:'Con inversión', icono:'flechas',
                 url:'ejercicios/intervalos-inversion.html', apuntes:['c3u0#inversión-de-intervalos'],
                 desc:'Se muestra el intervalo (2.ª a 7.ª) y se pide su inversión; la respuesta añade las notas invertidas y el intervalo resultante (do–mi → mi–do, 6.ª menor).'},
                {key:'grados', label:'GRADOS', title:'Con grados', icono:'grados',
                 url:'ejercicios/intervalos-grados.html', apuntes:['c3u0#intervalos', 'c3u1#cifrado-de-grados'],
                 desc:'Intervalo dentro de una tonalidad (armadura + nombre; las 4 del trimestre 1): nombrar el intervalo y el grado de cada nota (número con circunflejo, encima y debajo del pentagrama). Único accidental posible: la sensible del menor.'}
              ]},
            { nombre:'Acordes',
              desc:'Tríadas con alteraciones simples (reubica la antigua familia de tríadas de la Unidad 1): aisladas, sin tonalidad, salvo en la variante con grados. Se ve el acorde y se nombra. Siempre en pentagrama doble: en posición cerrada en el de Sol o en el de Fa, o abierta y repartida. Sin niveles de dificultad.',
              consignas:[
                {key:'tipo', label:'TIPO', title:'Tipo y cifrado', icono:'triada',
                 url:'ejercicios/acordes-tipo.html', apuntes:['c3u0#tipos-y-cifrado-americano'],
                 desc:'Se muestra la tríada en estado fundamental y se piden el tipo (mayor / menor / aumentada / disminuida) y su cifrado americano (D♭m, F°, C+).'},
                {key:'inversion', label:'INV.', title:'Inversiones', icono:'apilado', texto:'6/4',
                 url:'ejercicios/acordes-inversion.html', apuntes:['c3u0#inversión-y-bajo-cifrado'],
                 desc:'Se muestra la tríada y se piden la inversión y su cifrado («1.ª inversión · 6/3»; en el detalle, el cifrado americano con barra, C/E).'},
                {key:'grados', label:'GRADOS', title:'Con grados', icono:'romano',
                 url:'ejercicios/acordes-grados.html', apuntes:['c3u1#grados-de-la-escala-y-morfología'],
                 desc:'Tríada diatónica en estado fundamental dentro de una tonalidad (armadura + nombre; las 4 del trimestre 1): decir modo, grado de la fundamental y tipo («Modo mayor · II grado · Tríada menor»). En menor, la sensible solo en V y VII; el III se toma de la escala natural.'}
              ]}
          ]},
        { id:'c3u1', n:1, titulo:'Morfología. Conducción de voces', publico:true,
          familias:[
            { nombre:'Morfología',
              desc:'Tríadas diatónicas en estado fundamental y en sus dos inversiones, dentro de una tonalidad: leer un bajo cifrado (grado del bajo y acorde).',
              consignas:[
                {key:'bajo', label:'BAJO', title:'Bajo cifrado', icono:'cifrado',
                 url:'ejercicios/bajo-cifrado-lectura.html', apuntes:['c3u1#cifrado-de-grados'],
                 desc:'Un bajo de 5 o 6 notas con su cifrado (solo tríadas: sin cifra, 6 y 6/4) y la tonalidad: se pide el grado de cada nota del bajo (en círculo, encima) y el acorde (romano, debajo, delante del cifrado). Empieza en I o I6 y acaba en V–I o en V; el 6/4, solo cadencial o de paso. Al revelar, cada acorde en clave de Sol (estado fundamental, posición cerrada) con su cifrado americano.'}
              ],
              niveles:[
                'Modo mayor (Do y Sol mayor).',
                'Añade el modo menor (La y Re menor): la sensible lleva su alteración en el cifrado (♯, ♯6).'
              ]},
            { nombre:'Movimiento armónico', publico:false,
              desc:'Contrapunto 1:1 de 10 notas a dos voces: identificar los intervalos armónicos y el tipo de movimiento de cada transición (oblicuo / contrario / directo / paralelo).',
              consignas:[
                {key:'id', title:'Identificación', icono:'lupa',
                 url:'ejercicios/movimientos-id.html', apuntes:['c3u1#movimientos-armónicos'],
                 desc:'El fragmento se revela intervalo a intervalo; la solución (cifra y línea) va un paso por detrás, para poder adivinar antes.'},
                {key:'au', title:'Audición', icono:'oido',
                 url:'ejercicios/movimientos-au.html', apuntes:['c3u1#movimientos-armónicos'],
                 desc:'Solo audio, con movimiento casi uniforme: identificar de oído el tipo dominante.'},
                {key:'ct', title:'Canto', icono:'canto',
                 url:'ejercicios/movimientos-ct.html', apuntes:['c3u1#movimientos-armónicos'],
                 desc:'Cantar el fragmento a dos voces; los conmutadores muestran la solución sobre la partitura.'}
              ],
              niveles:[
                'Clave de Sol, modo mayor.',
                'Añade la clave de Fa y el modo menor (con posible sensible).',
                'Una voz en clave de Sol y otra en clave de Fa (pentagrama doble).'
              ]}
          ]},
        { id:'c3u2', n:2, titulo:'Tónica y dominante', familias:[] },
        { id:'c3u3', n:3, titulo:'Subdominante. Cadencias', familias:[] },
        { id:'c3u4', n:4, titulo:'Séptima de dominante y 6/4', familias:[] },
        { id:'c3u5', n:5, titulo:'Otros grados. Cadencia rota', familias:[] },
        { id:'c3u6', n:6, titulo:'Secuencias diatónicas', familias:[] }
      ]
    },
    {
      nombre:'Curso 4.º', tag:'Cromático',
      unidades:[
        { id:'c4u0', n:0, titulo:'Repaso', publico:true,
          familias:[
            { nombre:'Cadencias',
              desc:'Cadencias a cuatro voces (CAP, CAI, SC —también frigia— y CR), realizadas al vuelo por el motor a cuatro voces según los mínimos de conducción; 12 tonalidades (16 en el nivel 3), compases de 2/4, 3/4 y 4/4, anacrusa desde el nivel 2. Al revelar, cifrado americano encima y grados con cifras debajo.',
              consignas:[
                {key:'tipo', label:'TIPO', title:'Tipo', icono:'cadencia',
                 url:'ejercicios/cadencias-tipo.html', apuntes:['c4u0#progresiones-cadenciales'], oir:true,
                 desc:'Se muestra la cadencia completa y la tonalidad; se pide el tipo. CAP y CAI se distinguen solo por la soprano (1̂ frente a 3̂ o 5̂).'},
                {key:'bajo', label:'BAJO', title:'Bajo dado', icono:'clavefa',
                 url:'ejercicios/cadencias-bajo.html', apuntes:['c4u0#progresiones-cadenciales'],
                 desc:'Solo el bajo, con armadura y compás pero sin nombre de tonalidad: se piden tonalidad, tipo y acordes (grado e inversión). El bajo no distingue CAP de CAI, así que se responde CA; al revelar, una realización con su cifrado y, en una segunda fila, los acordes que también habrían cabido.'},
                {key:'canto', label:'CANTO', title:'Canto dado', icono:'clavesol',
                 url:'ejercicios/cadencias-canto.html', apuntes:['c4u0#progresiones-cadenciales'],
                 desc:'Solo la soprano, con su armadura, su compás y el tipo de cadencia: se piden la tonalidad y la línea del bajo. Al revelar, una realización completa con su cifrado y la lista de las demás líneas de bajo que también servirían.'}
              ],
              niveles:[
                'CAP, CAI y SC; tónica inicial I o I6, predominante IV o II6, V o V7; 12 tonalidades; sin anacrusa.',
                'Añade la cadencia rota (sobre VI), la semicadencia frigia, el 6/4 cadencial, II en fundamental (mayor), IV6 (menor) y la anacrusa.',
                'Añade VI como tónica inicial, IV6 en mayor y la rota sobre IV6; 16 tonalidades.'
              ]},
            { nombre:'Prolongación',
              desc:'Bajos sin cifrar con progresiones de prolongación de I o de V (bordadura y paso, con la regla de la 8.ª) y, según el tipo, cadencias (CA y SC). Se piden los acordes y la segmentación; al revelar, una realización a cuatro voces con los acordes subordinados entre paréntesis, sus alternativas y la etiqueta de cada tramo.',
              consignas:[
                {key:'prol', label:'PROL.', title:'Prolongación', icono:'prolongacion',
                 url:'ejercicios/prolongacion-prol.html', apuntes:['c4u0#progresiones-de-prolongación'],
                 desc:'Dos o tres compases: una prolongación que empieza y acaba en la misma armonía. Se da la tonalidad; se piden los acordes, la armonía prolongada y la técnica.'},
                {key:'frase', label:'FRASE', title:'Frase', icono:'cc4',
                 url:'ejercicios/prolongacion-frase.html', apuntes:['c4u0#progresiones-de-prolongación'],
                 desc:'Cuatro compases: prolongación (de I, o de V si la frase empieza en la dominante) y cadencia, CA o SC. Se piden tonalidad, acordes y tramos.'},
                {key:'periodo', label:'PERIODO', title:'Periodo', icono:'cc8',
                 url:'ejercicios/prolongacion-periodo.html', apuntes:['c4u0#progresiones-de-prolongación'],
                 desc:'Ocho compases: prolongación + SC ‖ prolongación (de I, o de V tras la SC) + CA. Se piden tonalidad, acordes y tramos.'}
              ],
              niveles:[
                'Solo tríadas: V6, VII6 e IV como acordes de bordadura o de paso; cadencias con IV o II6 y V; tonalidades mayores.',
                'Añade las inversiones de V7 (V6/5, V4/3, V4/2), V7 y el 6/4 cadencial en la cadencia, y el modo menor (con ♯6̂ al subir de 5̂ a 7̂).',
                'Añade los 6/4 de paso (V6/4) y de bordadura (IV6/4 sobre I, I6/4 sobre V); 16 tonalidades.'
              ]}
          ]},
        { id:'c4u1', n:1, titulo:'Séptimas diatónicas', familias:[] },
        { id:'c4u2', n:2, titulo:'Modulación y dominante secundaria', familias:[] },
        { id:'c4u3', n:3, titulo:'Acordes de VII con 7.ª', familias:[] },
        { id:'c4u4', n:4, titulo:'VII como D.S. Secuencias modulantes', familias:[] },
        { id:'c4u5', n:5, titulo:'Homónimo menor', familias:[] },
        { id:'c4u6', n:6, titulo:'Acordes alterados', familias:[] }
      ]
    }
  ]
};
if (typeof module !== 'undefined') module.exports = CURRICULO;
