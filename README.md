# Armonía — materiales de la asignatura

Materiales digitales de Armonía para 3º y 4º de EE.PP. de conservatorio.
Tres subproyectos que comparten repositorio porque comparten currículo.

    curriculum/   Plan de la asignatura: secuenciación en 12 unidades + UD 0,
                  tonalidades por trimestre, estrategia didáctica, evaluación.
                  Gobierna a los otros dos; ninguno lo gobierna a él.

    apuntes/      Los apuntes para el alumnado. Texto en Markdown + ejemplos
                  musicales en LilyPond, con salida a PDF y HTML.

    app/          Ejercicios breves autogenerados para pizarra digital.
                  HTML/JS estático, sin build ni backend.

## Ejecutar

**App de ejercicios** — no necesita nada instalado:

    # abrir app/index.html en el navegador, o bien
    cd app && python -m http.server 8000

Requiere red mientras Verovio y soundfont-player se sigan cargando por CDN
(ver *Pendientes*).

**Apuntes** — necesita LilyPond y un conversor PDF→SVG:

    cd apuntes && make ejemplos

Detalles y requisitos completos en [`apuntes/README.md`](apuntes/README.md).

## Publicar

Los dos son estáticos y van al mismo sitio. El despliegue reúne en `_site/`
los apuntes renderizados y la app, de modo que un apunte pueda enlazar a su
ejercicio con una ruta relativa:

    _site/
      index.html      apuntes
      app/            ejercicios

`_site/` es producto de build y no se versiona.

## Pendientes

- [ ] Separar en `app/` lo que se publica (`app/public/`) de lo que no
      (`docs/`, `design/`, `tests/`): hoy están al mismo nivel y un host
      estático apuntado a `app/` publicaría las tres.
- [ ] Empaquetar Verovio y soundfont-player en local (`app/public/vendor/`).
      Depender de un CDN en el aula es frágil.
- [ ] Extraer de `curriculum/Plan-Armonia.md` §2 un `unidades.yaml` que
      alimente a la vez a los apuntes y a `app/curriculum-data.js`.
- [ ] Sustituir `apuntes/plantilla-demo.typ` y `apuntes/hacer-html.py` por
      Quarto: un `.qmd` y `quarto render` para las dos salidas.
