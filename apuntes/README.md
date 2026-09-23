# Apuntes de Armonía

Texto en Markdown + ejemplos musicales en LilyPond, con salida a **PDF y HTML
desde la misma fuente**.

El principio: el texto no sabe nada de LilyPond. Los ejemplos son ficheros
aparte que se compilan a SVG, y desde el documento un ejemplo es solo una
imagen. Así se cachean (LilyPond es lento), se reutilizan entre documentos, y
el día que cambie el formato del texto no hay que tocarlos.

## Estructura

    c3u0.md, c4u0.md       una unidad: c<curso>u<unidad>, como en la app
    c3u1.md, c3u2.md       (todavía guiones, sin redactar)

    ejemplos/comun.ily     preámbulo de grabado: idioma, tamaño, \paper
    ejemplos/etiquetas.ily rótulos de análisis: \grado, \cifra, \rotulo
    ejemplos/c4u0-*.ly     un fichero por ejemplo, con el prefijo de su unidad
    ejemplos/svg/          los ejemplos que NO son partitura (ver más abajo)

    _formato/metadatos.yaml  papel, márgenes, tipografía (PDF)
    _formato/apuntes.css     lo mismo para el HTML
    _formato/fuentes/        la fuente del texto, y el script que la hace
    _formato/indice.html     plantilla de la página de índice de unidades

    herramientas/construir.py  todo el flujo
    herramientas/pdf2svg.py    conversor de reserva, sin binarios de sistema

    build/                 generado: todas las unidades compiladas, más
                           imagenes/, fuentes/, apuntes.css y un index.html
                           de trabajo que las lista todas
    build/sitio/           generado: SOLO lo publicable (ver abajo)
    tmp/                   generado: intermedios de LilyPond

Las rutas relativas entre documento, imágenes, fuentes y hoja de estilo ya
están cuadradas en las dos carpetas.

## Requisitos

- **LilyPond** ≥ 2.24 y **Pandoc** ≥ 3.0. Obligatorios.
- **Typst** para el PDF: el **binario**, y en el PATH, porque es a quien llama
  Pandoc. `pip install typst` NO vale: instala el módulo de Python y no deja
  ningún ejecutable. Se descarga de <https://github.com/typst/typst/releases>.
- **Un conversor PDF→SVG**, cualquiera de los dos:
  - `pdftocairo`, del paquete *poppler* / *poppler-utils* (se usa si está); o
  - `pip install pymupdf`, y entonces se usa el `pdf2svg.py` incluido — **la vía
    cómoda en Windows**, porque no requiere instalar binarios de sistema.

No hace falta `make` (no viene con Windows) ni Quarto.

## Uso

    python herramientas/construir.py            todo lo que esté desactualizado
    python herramientas/construir.py c4u0       solo esa unidad
    python herramientas/construir.py ejemplos   solo los SVG
    python herramientas/construir.py --forzar   sin mirar fechas
    python herramientas/construir.py --limpiar  borra build/ y tmp/

El camino completo:

    ejemplos/x.ly     --LilyPond-->  tmp/x.cropped.pdf  --pdftocairo-->
                                                         build/imagenes/x.svg
    ejemplos/svg/x.svg  --se copia-->  build/imagenes/x.svg
    _formato/fuentes/*.woff2  --se copian-->  build/fuentes/
    c4u0.md           --Pandoc-->            build/c4u0.html
                      --Pandoc + Typst-->    build/c4u0.pdf

## Publicar una unidad

`build/` es el resultado de compilarlo todo, incluidas las unidades a medias.
Lo que se publica es **`build/sitio/`**, que es lo que recoge `sitio/montar.sh`,
y ahí solo entran las unidades cuya cabecera YAML lleve

    publico: true

Es el mismo mecanismo que `publico:true` en `app/public/curriculum-data.js`:
**qué ve el alumnado es un dato**, no una consecuencia de que el fichero
exista. Así se puede escribir y revisar una unidad, compilándola y mirándola
en `build/`, sin que se le aparezca a nadie.

Hay por eso dos índices, los dos generados a partir de `_formato/indice.html`:

- `build/sitio/index.html` — el que ven los alumnos; solo lista lo publicado,
  y lo demás sale como «En preparación».
- `build/index.html` — el de trabajo; lista todo lo compilado y marca **DEV**
  lo que aún no sale.

Las filas de los dos —las catorce unidades, con su título y su descripción—
salen de las tablas de `curriculum/Plan-Armonia.md`, no se copian aquí: el
plan manda sobre los apuntes, y así una unidad no puede acabar con un nombre
distinto del que tiene en el plan.

## Los ejemplos que no son partitura

No todo ejemplo sale de LilyPond: el círculo de 5.as de 3.º UD 0 es un
diagrama. Esos van en `ejemplos/svg/`, **se versionan** (no se regeneran en
cada compilación) y `construir.py` los copia a `build/imagenes/` sin tocarlos.
Desde el `.md` se referencian igual que los demás, así que el texto no
distingue de dónde viene cada imagen.

Un SVG así **no puede llevar `<text>`**: referenciado con `<img src>` es un
documento aparte, al que no llega ni el CSS ni la fuente que incrusta el PDF,
y cada salida elegiría una fuente de sustitución por su cuenta (los ♯ y ♭ son
lo primero que se pierde). El texto va convertido a trazos. El círculo lo
dibuja `ejemplos/svg/circulo.py`, que saca los trazos de la propia fuente de
los apuntes; un diagrama hecho a mano en un editor vale igual, siempre que
salga con el texto vectorizado.

## La fuente

La compone `_formato/fuentes/regenerar.py`, y solo hay que volver a lanzarlo
si se cambia de fuente de texto o de alteraciones:

    pip install fonttools brotli
    python _formato/fuentes/regenerar.py

Es **DejaVu Serif recortada y con dos arreglos**: el circunflejo combinante
recolocado sobre la cifra (los grados `1̂`, `5̂`, `♯7̂`) y las alteraciones
sustituidas por las de Leland, la misma familia que Verovio usa en las
partituras de la app. Los dos arreglos van *dentro* de la fuente y no en otra
antepuesta, porque Typst y los navegadores eligen fuente por **clúster**: la
cifra y su marca combinante son uno solo, así que el circunflejo no puede
venir de otra fuente que la cifra.

El `.ttf` lo lee Typst para el PDF y el `.woff2` lo sirve el HTML, así que las
dos salidas componen con exactamente lo mismo y ninguna depende de lo que haya
instalado quien las lea. Al ir recortada, `construir.py` avisa si un `.md` usa
un carácter que se haya quedado fuera; entonces hay que ampliar `RANGOS` en
`regenerar.py` y volver a lanzarlo. Las licencias (DejaVu y Leland, las dos
permisivas) están en `_formato/fuentes/LICENCIAS.txt`.

## Escribir una unidad

1. **El guion primero.** Al principio del fichero, entre
   `<!-- guion:inicio -->` y `<!-- guion:fin -->`, va el esquema de epígrafes.
   Ese bloque **no se publica**: es el mapa mientras se redacta, y se queda ahí
   hasta que la unidad esté cerrada.

2. **Cabecera.** Solo lo propio de la unidad; el formato ya está en
   `_formato/metadatos.yaml`:

       ---
       title: "4.º — UD 0. Repaso"
       subtitle: "Cadencia, prolongación y secuencia"
       ---

3. **Epígrafes.** `##` numerado para el primer nivel (`## 1. Materiales y
   conducción`), `###` para el segundo, `####` para el tercero. El índice llega
   hasta el segundo (`1.1`).

   La unidad abre con un `## Qué repasa esta unidad` sin numerar, y detrás va
   un `<!-- salto -->`: en el PDF, la introducción se queda sola en su página
   con el índice, y el temario empieza en la siguiente. En el HTML no hay
   páginas y la marca se ignora sola.

4. **Huecos de ejemplo.** Mientras no exista el ejemplo, una línea que empiece
   por `- Ej.:` describiendo lo que hará falta. Se publican tal cual: son
   visibles a propósito, para que se vea lo que falta.

5. **Ejemplos hechos.** Un `.ly` en `ejemplos/` (o un `.svg` en `ejemplos/svg/`
   si no es partitura), con el prefijo de la unidad, y
   en el texto una imagen sola en su párrafo (con **línea en blanco delante**,
   o Pandoc se la traga dentro de la lista anterior y pierde el pie):

       ![Pie de figura, que explica lo que hay que mirar.
       ](build/imagenes/c4u0-disposiciones.svg){#fig-disposiciones width=auto}

   La ruta se escribe con el prefijo `build/imagenes/` **para que la vista
   previa del editor encuentre el SVG**; al construir se quita, porque Pandoc
   corre dentro de `build/`.

   **El `width` se escribe `auto`**, y lo calcula `construir.py` leyendo el
   ancho del propio SVG, para que el pentagrama salga igual de grande en todas
   las figuras, sean anchas o estrechas: una fila de cuatro cadencias necesita
   la caja entera para medir lo mismo que un ejemplo de dos acordes.

   Un porcentaje a mano se pudre a la primera: al rehacer un ejemplo cambia el
   ancho del SVG, el número se queda apuntando al viejo, y la figura sale
   diminuta o enorme sin que nada avise. Ya pasó.

   El aumento sobre el tamaño con que graba LilyPond es `ESCALA` en
   `construir.py` (1,3); subirlo agranda todos los ejemplos a la vez. Los SVG
   dibujados a mano no tienen tamaño natural, así que esos —y solo esos— sí
   llevan su `width=N%` puesto a ojo.

6. **Varios casos del mismo asunto, un solo `.ly`.** Los tres 6/4 o las cuatro
   cadencias van en un fichero y **sin `\break`**, para que salgan en fila y no
   uno debajo de otro: ocupan mucho menos y se comparan de un vistazo.

7. **Citar fuentes** al final de cada apartado, en un párrafo que empiece por
   `Fuentes:`, por tema y epígrafe, nunca por página:
   `Fuentes: P-D Tema 6 (§1–2); A/S Unit 7, 10, 19. → 3.º UD 2.`
   Las páginas están en `bibliography/INDICE.md`, fuera del repo.
   Ese párrafo **no se publica**: es para quien escribe la unidad, no para
   quien la estudia. Por eso tiene que empezar exactamente por `Fuentes:`, que
   es lo que busca `construir.py` para quitarlo.

8. **Quitar el `- Ej.:`** en cuanto exista la figura que lo sustituye. El hueco
   está para que se vea lo que falta; si se queda al lado de la imagen, anuncia
   como pendiente algo que ya está hecho.

## Decisiones que conviene no deshacer sin querer

- **Las reglas de conducción no se redefinen aquí.** Viven en
  `curriculum/Minimos-conduccion.md` con identificadores estables; los apuntes
  las explican y la app las implementa.

- **Los ejemplos se escriben en LilyPond real**, no en el mini-LilyPond de la
  app: aquí hacen falta varias voces, `\markup`, rótulos y saltos de sistema,
  que aquel excluye a propósito. La compatibilidad va en la dirección útil —una
  cadena de la app se pega aquí sin retocar— y no al revés.

- **Todo se ejecuta con rutas relativas desde `apuntes/`.** La carpeta de
  trabajo lleva tilde (*Armonía*) y algunas herramientas no abren ficheros
  cuya ruta absoluta tenga caracteres no ASCII.

- **La tipografía de los grados manda sobre el gusto.** `1̂`, `5̂`, `♯7̂` son
  dígito + circunflejo combinante, y casi ninguna fuente los compone: de ahí
  que la fuente sea la que es, y que esté parcheada. El porqué, medido, en
  `_formato/fuentes/regenerar.py`; la decisión, en `_formato/metadatos.yaml`.

- **Ningún SVG de estos lleva `<text>`.** Ni los de LilyPond ni los dibujados:
  el texto va siempre en trazos (ver arriba).

- **Dos pentagramas se agrupan siempre con `\new GrandStaff`**, nunca con
  `ChoirStaff`: llave y líneas divisorias continuas entre los dos, como en la
  escritura de piano. `ChoirStaff` da corchete y líneas independientes, que es
  igual de defendible pero distinto, y tener las dos cosas a la vez en los
  mismos apuntes es lo único que no vale.

- Las demás reglas de render (por qué `-dcrop`, por qué no `-dbackend=svg`, por
  qué no incrustar los SVG en el HTML) están en el `CLAUDE.md` de la raíz.

## Estado

El flujo está completo y las tres salidas se generan.

- **`c3u0.md`** — redactada, con sus siete ejemplos hechos (el círculo de 5.as,
  las parejas de inversión, los compuestos, las dos claves, los cuatro tipos de
  tríada, las inversiones cifradas y el bajo cifrado realizado). **Es la única
  con `publico: true`**, y por tanto la única que sale al sitio.
- **`c4u0.md`** — redactada, con tres ejemplos hechos —disposiciones, los tres
  6/4 y las cuatro cadencias—; los demás siguen marcados con `- Ej.:`. Sin
  publicar: le falta una revisión.
- **`c3u1.md` y `c3u2.md`** — todavía guiones, sin redactar. Sus dos `.ly`
  (`c3u1-5as-paralelas`, `c3u1-triada-im`) están hechos pero aún no enlazados
  desde ningún texto.

Pendiente: los enlaces cruzados con la app (un apunte enlaza al ejercicio de su
unidad y al revés). `_site/` ya lo permite con rutas relativas.
