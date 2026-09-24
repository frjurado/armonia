// Retoques del PDF que la plantilla typst de Pandoc no expone como
// variable. construir.py lo pasa con --include-in-header, después de
// definir `datos` (autoría, licencia, títulos…, sacados de
// metadatos.yaml y de la cabecera de la unidad). En el HTML no entra.

#let gris = rgb("#666666")

// El pie de figura, más pequeño y gris: explica lo que hay que mirar en
// el ejemplo, pero no es el texto.
#show figure.caption: set text(size: 8.8pt, fill: gris)

// El índice, despegado del título y del cuerpo. Apretado contra los dos
// parece parte de ellos, y es una tercera cosa.
#show outline: it => block(above: 2.2em, below: 3.2em, it)

// Cabecera y pie de página. La primera página es la portada: arriba, de
// qué es el documento (en la web no hace falta: ya se está en ella); al
// pie, derechos, licencia y dónde está la versión en línea, con su QR,
// para quien tenga la fotocopia. Las demás llevan una cabecera discreta
// con la unidad, para que una hoja suelta diga de dónde es, y el número
// de página abajo (al definir `footer`, Typst ya no lo pone solo).
#set page(
  header: context {
    set text(size: 7.5pt, fill: gris)
    if here().page() == 1 {
      align(center, text(tracking: 0.1em, upper(datos.contexto)))
    } else {
      grid(columns: (1fr, auto), datos.corto, emph(datos.subtitulo))
      v(-0.4em)
      line(length: 100%, stroke: 0.4pt + gris)
    }
  },
  footer: context {
    if here().page() == 1 {
      set text(size: 7.5pt, fill: gris)
      set par(justify: false)
      grid(
        columns: (1fr, auto),
        column-gutter: 1em,
        align: (left + horizon, right + horizon),
        [#datos.derechos · Licencia #link(datos.licencia-url)[#datos.licencia] \
         Versión en línea, con los ejercicios: #link("https://" + datos.web)[#datos.web]],
        image("imagenes/qr-armonia.svg", width: 1.3cm),
      )
    } else {
      align(center, text(size: 9pt, counter(page).display()))
    }
  },
)

// Debajo del título y el subtítulo: autoría y curso. La plantilla de
// Pandoc tiene su propio bloque de autores, pero con afiliación y correo
// en líneas aparte; esto es una línea. Lo llama el principio del cuerpo.
#let autoria() = align(center, block(above: 0pt, below: 0pt,
  text(size: 1.05em)[#datos.autoria · Curso #datos.curso]))
