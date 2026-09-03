# Apuntes de Armonía

Texto en Markdown + ejemplos musicales en LilyPond, con salida a **PDF y HTML
desde la misma fuente**.

El principio: el texto no sabe nada de LilyPond. Los ejemplos son ficheros
aparte que se compilan a SVG, y desde el documento un ejemplo es solo una
imagen. Así se cachean (LilyPond es lento), se reutilizan entre documentos, y
el día que cambie el formato del texto no hay que tocarlos.

## Estructura

    ejemplos/comun.ily     preámbulo compartido: idioma, tamaño de pentagrama, \paper
    ejemplos/*.ly          un fichero por ejemplo musical
    Makefile               ejemplos/*.ly -> build/*.svg, solo lo que ha cambiado
    pdf2svg.py             conversor alternativo, sin binarios de sistema
    UD*-guion.md           guiones de trabajo por unidad
    build/                 generado, no se versiona

## Requisitos

- **LilyPond** ≥ 2.24. Obligatorio.
- **Un conversor PDF→SVG**, cualquiera de los dos:
  - `pdftocairo`, del paquete *poppler* / *poppler-utils*; o
  - `pip install pymupdf` y usar el `pdf2svg.py` incluido — **la vía cómoda
    en Windows**, porque no requiere instalar binarios de sistema.
- **Typst** para el PDF: `pip install typst`, el binario, o vía Quarto.

## Uso

    make ejemplos                      # renderiza los SVG
    make limpiar                       # borra build/ y tmp/

    # con un conversor distinto de pdftocairo:
    make ejemplos PDF2SVG="python pdf2svg.py"

Y para las dos salidas:

    typst compile plantilla-demo.typ   # PDF
    python hacer-html.py               # HTML

## Estado

`plantilla-demo.typ` y `hacer-html.py` son **andamiaje provisional**: prueban
que los dos caminos funcionan sobre el mismo SVG. Los sustituirá Quarto, con
un `.qmd` único y `quarto render` para ambas salidas. `demo.pdf` y `demo.html`
son su resultado, guardados como referencia visual.

Los ejemplos musicales se escriben en **LilyPond real**, no en el
mini-LilyPond de la app: aquí hacen falta varias voces, `\markup`, colores y
corchetes, que aquel excluye a propósito. La compatibilidad va en la
dirección útil —una cadena de la app se pega aquí sin retocar— y no al revés.

Las reglas de render (por qué `-dcrop`, por qué no `-dbackend=svg`, por qué
no incrustar los SVG) están en el `CLAUDE.md` de la raíz del repo.
