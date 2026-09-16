# Armonía — materiales de la asignatura

Materiales digitales de Armonía para 3.º y 4.º de EE.PP. de conservatorio.
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

`_site/` es producto de build y no se versiona. En local:

    sh sitio/montar.sh && python -m http.server 8000 -d _site

### Desarrollo y público: dos ramas, un sitio

Los alumnos usan el sitio, así que lo que ven no puede cambiar con cada
commit. Hay dos ramas y el flujo `.github/workflows/publicar.yml` monta las
dos en el mismo despliegue, con cada push a cualquiera de ellas:

| Rama | Qué es | URL |
|---|---|---|
| `master` | desarrollo: todo el trabajo diario | `https://frjurado.github.io/armonia/dev/` |
| `publico` | lo que ven los alumnos | `https://frjurado.github.io/armonia/` (la del QR) |

La rutina: trabajar y hacer push en `master`, comprobarlo en `/dev/`, y
cuando algo esté listo para los alumnos:

    sh sitio/publicar.sh        # fusiona master en publico y sube las dos

Un arreglo urgente de producción se hace en `publico` y se fusiona de vuelta
a `master`. `/dev/` no se enlaza desde ningún sitio y lleva `noindex`.

Además del código, **qué unidades ven los alumnos** es un dato:
`publico:true` en cada unidad de `app/public/curriculum-data.js`. La copia
pública (`app/modo.js` = `'publico'`, escrito por `montar.sh`) trata las
demás como «próximamente»; la de desarrollo (`'dev'`, el valor del repo) lo
muestra todo, con una marca DEV en lo que los alumnos no ven. Así una
unidad puede estar en `master` y en `publico` sin verse hasta que se marque.

Para activarlo en un repositorio nuevo, una sola vez: *Settings → Pages →
Build and deployment → Source: **GitHub Actions***. Y como despliegan dos
ramas, el entorno `github-pages` (que por defecto solo admite la rama
principal) tiene que permitir también `publico`: *Settings → Environments
→ github-pages → Deployment branches*: añadir `master` y `publico`; o por
API, `gh api -X POST repos/<usuario>/<repo>/environments/github-pages/deployment-branch-policies -f name=publico -f type=branch`
(tras poner la política en `custom_branch_policies`). Si falta, el push a
`publico` falla con «not allowed to deploy to github-pages». El sitio queda en
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
- [ ] Partituras largas (Unidad 1 y las que vengan): llevarlas a la tira
      deslizante (`tira-partitura.js`, como armaduras) centrando el acorde
      actual, con el `#overlay` de líneas de voz dentro del contenedor que
      se desplaza. Resuelve a la vez que en móvil se vean diminutas (hoy
      se reducen por CSS) y que en pizarra no quepan más grandes; escala a
      ejercicios más largos. Decidido frente a «botones abajo» (cambia el
      formato en el mismo dispositivo) y a más ancho de contenido.
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
