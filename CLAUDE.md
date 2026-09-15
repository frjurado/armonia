# CLAUDE.md

Reglas para todo el repositorio. Qué es cada cosa y cómo se ejecuta está en
`README.md`; aquí solo va lo que se puede romper sin darse cuenta.

Hay un `CLAUDE.md` adicional en `app/` con las reglas propias de la app. Los
dos se cargan a la vez al trabajar ahí: **`app/CLAUDE.md` no repite nada de
este fichero**, solo añade.

## Idioma

Todo el contenido —documentación, comentarios, interfaz, nombres de fichero—
va **en español**. Mantenerlo, incluso en código.

## Jerarquía documental

`curriculum/Plan-Armonia.md` es la fuente de verdad de la asignatura:
secuenciación, tonalidades válidas por trimestre, niveles, evaluación.
**Gobierna a `apuntes/` y a `app/`, y ninguno de los dos lo gobierna a él.**
Si un apunte o un ejercicio contradice al plan, el que está mal es el apunte
o el ejercicio.

Al añadir un documento, la pregunta es: *si desapareciera la app, ¿esto
seguiría significando algo?*

- Sí → `curriculum/` (o la carpeta del subproyecto que sí lo necesite).
- No → junto al código que describe, dentro de su subproyecto.

Una especificación se pudre en cuanto se aleja del código: por eso
`Gramatica-mini-lilypond.md` vive en `app/docs/` y no en un `docs/` central.

## README frente a CLAUDE.md

- **README.md** — lo que hace falta para empezar: qué es, cómo se ejecuta,
  cómo se publica. Se lee una vez.
- **CLAUDE.md** — restricciones que alguien violaría por ignorancia. Se
  consulta mientras se trabaja.

Un CLAUDE.md entra en el contexto de *cada* turno que trabaje en su carpeta.
Mantenerlo seco: no duplicar el README dentro.

## Render de partituras: dos motores, dos trabajos

**Verovio no lee LilyPond** (solo MEI, MusicXML, ABC, Plaine & Easie, Humdrum,
CMME). No hay un motor único, y no conviene buscarlo:

- **`app/` → Verovio**, en tiempo de ejecución, en el navegador, desde el MEI
  que genera el parser.
- **`apuntes/` → LilyPond**, en tiempo de compilación, desde ficheros `.ly`.

El puente entre ambos es que **mini-LilyPond es un subconjunto estricto de
LilyPond real**: una cadena generada por la app se pega en un `.ly` de los
apuntes sin retocarla. Verificado. Al extender la gramática, no romper eso.

## Reglas del render a papel (`apuntes/`)

Cada una costó descubrirla:

- **No usar `-dbackend=svg`.** El backend SVG de LilyPond no incrusta las
  fuentes de texto: los `\markup` salen con tipografía de sustitución.
- **Pasar siempre por PDF:** `lilypond -dcrop --pdf` y después convertir a
  SVG. Así todo queda en trazos, sin depender de fuentes instaladas.
- **`-dcrop` no es opcional.** Sin él cada ejemplo sale como una página A4
  entera con márgenes alrededor de dos compases.
- **No incrustar SVG dentro del HTML: referenciarlos con `<img src>`.**
  Los `id` de glifo (`glyph-0-0`…) se numeran desde cero en cada fichero;
  incrustados comparten espacio de nombres y el segundo ejemplo dibuja los
  glifos del primero. Con `<img>` cada SVG tiene su propio ámbito.

## Rutas en lo publicado

El sitio se sirve en GitHub Pages bajo una subruta
(`https://<usuario>.github.io/<repo>/`), y `_site/` reúne portada, app y
apuntes en carpetas hermanas. Por tanto **todo enlace, `src` e `@import` es
relativo**; una ruta que empiece por `/` funciona en local y se rompe al
publicar.

## Qué no se versiona

`.gitignore` lo cubre, pero conviene saber por qué: `apuntes/build/` y
`apuntes/tmp/` son SVG y PDF regenerables; `_site/` es el sitio publicado;
`app/tests/*.pdf` sale de compilar el `.ly` que tiene al lado.

Y fuera del repo, en la carpeta de trabajo: `bibliography/` contiene
capítulos escaneados de terceros. **Nunca entra en git ni se publica.**
