# Armonía — materiales de la asignatura

Materiales digitales de Armonía para 3º y 4º de EE.PP. de conservatorio.
Tres subproyectos que comparten repositorio porque comparten currículo.

    curriculum/   Plan de la asignatura: secuenciación en 12 unidades + UD 0,
                  tonalidades por trimestre, estrategia didáctica, evaluación.
                  Gobierna a los otros dos; ninguno lo gobierna a él.

    apuntes/      Los apuntes para el alumnado. Texto en Markdown + ejemplos
                  musicales en LilyPond, con salida a PDF y HTML.

    app/          Ejercicios breves autogenerados para pizarra digital.
                  HTML/JS estático, sin build ni backend. Lo que se publica
                  está en app/public/; docs/, design/ y tests/ no salen.

    sitio/        Portada del sitio publicado y el script que lo monta.

## Ejecutar

**App de ejercicios** — no necesita nada instalado:

    # abrir app/public/index.html en el navegador, o bien
    python -m http.server 8000 -d app/public

Verovio y soundfont-player van empaquetados en `app/public/vendor/`; solo
los samples de piano se descargan de la red al primer «Escuchar» (ver
*Pendientes*).

**Apuntes** — necesita LilyPond y un conversor PDF→SVG:

    cd apuntes && make ejemplos

Detalles y requisitos completos en [`apuntes/README.md`](apuntes/README.md).

## Publicar

Todo es estático y va al mismo sitio, en **GitHub Pages**. `sitio/montar.sh`
reúne en `_site/` la portada, la app y los apuntes renderizados, de modo que
un apunte pueda enlazar a su ejercicio con una ruta relativa:

    _site/
      index.html      portada (sitio/index.html)
      app/            ejercicios (app/public/)
      apuntes/        apuntes renderizados (apuntes/build/sitio/, cuando exista)

`_site/` es producto de build y no se versiona. Lo monta y publica el flujo
`.github/workflows/publicar.yml` con cada push a `master`; en local:

    sh sitio/montar.sh && python -m http.server 8000 -d _site

Para activarlo en un repositorio nuevo, una sola vez: *Settings → Pages →
Build and deployment → Source: **GitHub Actions***. El sitio queda en
`https://<usuario>.github.io/<repo>/`; como cuelga de una subruta, **todas
las rutas del sitio son relativas**, nunca `/absolutas`.

Los apuntes aún no entran: falta el paso que instale LilyPond en el flujo y
renderice a `apuntes/build/sitio/` (ver *Pendientes*). Cuando exista,
`montar.sh` los recoge sin más cambios y en la portada basta convertir la
tarjeta «Apuntes» en enlace.

## Pendientes

- [x] Separar en `app/` lo que se publica (`app/public/`) de lo que no
      (`docs/`, `design/`, `tests/`).
- [ ] Publicar los apuntes: paso en `publicar.yml` que instale LilyPond
      (`apt-get install lilypond`, 2.24 en Ubuntu 24.04) y un conversor
      PDF→SVG, ejecute `make -C apuntes ejemplos` y renderice el HTML a
      `apuntes/build/sitio/`. Depende de sustituir el andamiaje por Quarto
      (abajo). Después, enlazar la tarjeta «Apuntes» de `sitio/index.html`.
- [ ] Enlaces cruzados apunte ↔ ejercicio (un apunte enlaza al ejercicio de
      su unidad; un ejercicio, al apunte que lo explica). La disposición de
      `_site/` ya lo permite con rutas relativas (`../app/...`, `../apuntes/...`);
      falta decidir dónde se declaran los enlaces (probablemente en el
      `unidades.yaml` de abajo). Sin prisa.
- [x] Empaquetar Verovio y soundfont-player en local (`app/public/vendor/`).
- [ ] Empaquetar también los samples de piano (`acoustic_grand_piano` de
      `gleitz.github.io/midi-js-soundfonts`, ~1 MB en MP3) y pasar a
      `Soundfont.instrument` una `nameToUrl` que apunte a `vendor/`. Es lo
      único que aún sale a la red desde un ejercicio.
- [ ] Extraer de `curriculum/Plan-Armonia.md` §2 un `unidades.yaml` que
      alimente a la vez a los apuntes y a `app/curriculum-data.js`.
- [ ] Sustituir `apuntes/plantilla-demo.typ` y `apuntes/hacer-html.py` por
      Quarto: un `.qmd` y `quarto render` para las dos salidas.
