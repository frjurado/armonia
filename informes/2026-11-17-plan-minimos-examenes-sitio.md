# Plan: mínimos, exámenes y un solo inicio para el sitio

*17 de noviembre de 2026. Plan, sin código. Abre la fase 14 de `HISTORIA.md`.*

## Contexto

El sitio nació bipartito: una portada con dos tarjetas, **Ejercicios** (el menú de la app)
y **Apuntes** (el índice que genera `construir.py`). Desde entonces se han ido sumando
materiales —ejemplos para clase, fichas a mano, bancos de repasos generados con su
página «Fichas»— y vienen más: **ejercicios mínimos** y **modelos de examen**. Los
enlaces cruzados (botón «Apuntes» en cada ejercicio, «Para practicar» y «Ejercicios» en
el apunte, «Apuntes →» y «Fichas →» en el menú) muestran que el paso de un lado a otro
es frecuente: hay dos estructuras paralelas, ambas curso → unidad, con la misma clave
(`c3u1`).

El diagnóstico: el problema es **solo de navegación**. Los subproyectos siguen
separados en el repositorio (uno se dibuja en el navegador, el otro se compila), y las
páginas no se funden: el apunte es también un PDF y el ejercicio, una herramienta de
pizarra. Lo que sobra es tener dos índices.

## Decisiones

### El sitio: la unidad como eje

- **Un solo inicio**, en la raíz (la URL del QR no cambia): pestañas por curso y
  unidades en acordeón en una sola página, como el menú actual de la app.
- **La unidad abierta tiene tres bloques, en este orden**: *Apuntes* (leer, PDF,
  ejemplos), *Ejercicios* (las familias y sus consignas, como hoy) y *En papel*
  (repasos y modelos de examen; más adelante, quizá las fichas de clase).
- **Vuelta atrás**: ejercicios, apuntes y páginas de fichas vuelven al inicio abierto en
  su unidad (`#ud=c3u1`, que ya existe). Se conservan los enlaces finos (botón
  «Apuntes · 1.2» del ejercicio, «Para practicar» del apunte); sobran «Ejercicios» y
  «Fichas» en la cabecera del apunte.
- `app/index.html` y `apuntes/index.html` quedan como **redirecciones** al inicio, para
  no romper marcadores. La portada desaparece; el QR pasa al inicio.
- **Datos**: el inicio lee `curriculum-data.js` y un `enlaces.js` ampliado a manifiesto
  de lo que tiene cada unidad. Sin él, salen solo los ejercicios (como hoy los enlaces).
- **Aspecto**: la capa actual, sin cambios.

### Mínimos

- **Qué son.** Ejercicios de la app —se practican en ella— que en clase se hacen **en
  papel**, con tiempo limitado y un porcentaje de acierto alto. Son condición para
  aprobar (los *hard gates* del Plan §7.2).
- **Uno por unidad** en principio; 3.º UD 1 tiene ahora dos.
- **En la app**: una marca en la consigna (`minimo`, con el nivel si hace falta), que se
  ve como un **punto terroso** en el botón del menú y en la cabecera del ejercicio. El
  terroso hoy significa «acierto»; se acepta de momento.
- **En papel**: generados en lote, **dos copias por A4** (para cortar), con su
  solución para el profesor. **No van a la web**: no hay banco público (para practicar
  está la app).

### Exámenes

- **Trimestrales, de una hora.** No se marcan entre unidades —una unidad puede quedar a
  medias al final del trimestre—: el modelo de examen aparece **en la unidad que
  corresponda** (la que está a medias o recién terminada).
- **Modelos**: banco de 20 con solución, como los repasos (modelo con condiciones →
  generador → verificador → banco), y la misma maquinaria da **el examen real**. La
  estructura (consignas y condiciones) se decide al llegar a ello.
- El examen real se genera en local con otra semilla y **no se versiona** (el repo es
  público).
- Esta primera tanda no tiene por qué salir en el sitio: si antes de reestructurar
  resulta confuso, se entrega en papel.

### Fichas de clase

Las hechas a mano (`c3u1-f1`…) siguen **sin enlace** por ahora. Cuando esté claro cómo
encajan todos los materiales en papel (fichas, mínimos, repasos, exámenes), tendría
sentido incluirlas en el bloque *En papel*.

## Orden

El examen del primer trimestre es dentro de dos o tres semanas, así que manda la
urgencia, no el orden lógico:

1. **Mínimos**: la marca en la app y su versión en papel, dos por A4 (fuera de la web).
2. **Modelos de examen y el examen**, sobre la maquinaria de los repasos; en el sitio
   solo si encaja con la estructura actual.
3. **Plan y sitio**: definir evaluación en `curriculum/Plan-Armonia.md` §7 (mínimos,
   exámenes, *hard gates*); el inicio único; y llevar a él lo que falte.

## Dificultades previstas

- **Mínimos en papel** es lo más caro: solo cinco tipos de ficha tienen adaptador de
  generación, y los ejercicios de 3.º UD 0 (armaduras, intervalos, acordes) no tienen
  tipo de papel. Cada mínimo nuevo pide plantilla, adaptador y verificación. Los dos de
  3.º UD 1 hay que elegirlos primero.
- **Maqueta de dos por A4**: nueva en `construir.py` y en `_formato/`.
- **Probar el menú**: con el inicio en `sitio/`, verlo exigirá montar el sitio
  (`montar.sh`), como ya pasa con los enlaces.
- **Documentación vigente que cambia** al reestructurar: `app/docs/Modelo-ejercicios.md`
  §3, los dos `CLAUDE.md`, los README (el menú deja de ser «de la app»).
- **Los alumnos**: cambio a mitad de curso; publicarlo de una vez y en un momento
  tranquilo.

## Abierto

- Qué dos consignas son los mínimos de 3.º UD 1, con qué nivel, tiempo y porcentaje.
- Estructura del examen del primer trimestre (consignas y condiciones).
- Marca de mínimo: si «terroso = acierto» estorba, otro color o una etiqueta de texto.
