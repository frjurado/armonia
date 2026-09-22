# Apuntes de Armonía

Texto en Markdown + ejemplos musicales en LilyPond, con salida a **PDF y HTML
desde la misma fuente**.

El principio: el texto no sabe nada de LilyPond. Los ejemplos son ficheros
aparte que se compilan a SVG, y desde el documento un ejemplo es solo una
imagen. Así se cachean (LilyPond es lento), se reutilizan entre documentos, y
el día que cambie el formato del texto no hay que tocarlos.

## Estructura

    c4u0.md                una unidad: c<curso>u<unidad>, como en la app
    c3u1.md, c3u2.md       (todavía guiones, sin redactar)

    ejemplos/comun.ily     preámbulo de grabado: idioma, tamaño, \paper
    ejemplos/etiquetas.ily rótulos de análisis: \grado, \cifra, \rotulo
    ejemplos/c4u0-*.ly     un fichero por ejemplo, con el prefijo de su unidad

    _formato/metadatos.yaml  papel, márgenes, tipografía (PDF)
    _formato/apuntes.css     lo mismo para el HTML

    herramientas/construir.py  todo el flujo
    herramientas/pdf2svg.py    conversor de reserva, sin binarios de sistema

    build/                 generado: c4u0.html, c4u0.pdf, imagenes/, apuntes.css
    tmp/                   generado: intermedios de LilyPond

`build/` es exactamente lo publicable, con las rutas relativas ya cuadradas
entre documento, imágenes y hoja de estilo.

## Requisitos

- **LilyPond** ≥ 2.24 y **Pandoc** ≥ 3.0. Obligatorios.
- **Typst** para el PDF (`pip install typst` o el binario). Pandoc lo llama solo.
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

    ejemplos/x.ly   --LilyPond-->  tmp/x.cropped.pdf  --pdftocairo-->
                                                       build/imagenes/x.svg
    c4u0.md         --Pandoc-->            build/c4u0.html
                    --Pandoc + Typst-->    build/c4u0.pdf

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
   hasta el segundo.

4. **Huecos de ejemplo.** Mientras no exista el ejemplo, una línea que empiece
   por `- Ej.:` describiendo lo que hará falta. Se publican tal cual: son
   visibles a propósito, para que se vea lo que falta.

5. **Ejemplos hechos.** Un `.ly` en `ejemplos/`, con el prefijo de la unidad, y
   en el texto una imagen sola en su párrafo (con **línea en blanco delante**,
   o Pandoc se la traga dentro de la lista anterior y pierde el pie):

       ![Pie de figura, que explica lo que hay que mirar.
       ](build/imagenes/c4u0-disposiciones.svg){#fig-disposiciones width=55%}

   La ruta se escribe con el prefijo `build/imagenes/` **para que la vista
   previa del editor encuentre el SVG**; al construir se quita, porque Pandoc
   corre dentro de `build/`.

6. **Citar fuentes** al final de cada apartado, por tema y epígrafe, nunca por
   página: `Fuentes: P-D Tema 6 (§1–2); A/S Unit 7, 10, 19. → 3.º UD 2.`
   Las páginas están en `bibliography/INDICE.md`, fuera del repo.

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
  dígito + circunflejo combinante, y casi ninguna fuente los compone: el
  porqué de la elegida está comentado en `_formato/metadatos.yaml`.

- Las demás reglas de render (por qué `-dcrop`, por qué no `-dbackend=svg`, por
  qué no incrustar los SVG en el HTML) están en el `CLAUDE.md` de la raíz.

## Estado

El flujo está completo y las tres salidas se generan. Falta contenido: de
`c4u0.md` solo están hechos tres ejemplos —disposiciones, los tres 6/4 y las
cuatro cadencias—, y los demás siguen marcados con `- Ej.:`. `c3u1.md` y
`c3u2.md` son todavía guiones sin redactar.

Pendiente de decidir: cómo se publica el conjunto (una página por unidad más
un índice) y los enlaces cruzados con la app.
