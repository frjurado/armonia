// Demostración del control de formato en el camino a PDF.
// Esto es, en esencia, lo que genera Quarto con `format: typst`.
// Compilar:  typst compile plantilla-demo.typ demo.pdf

#set page(
  paper: "a4",
  margin: (top: 3cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  numbering: "1",
)
#set text(size: 11pt, lang: "es")
#set par(justify: true, leading: 0.7em)
#show heading: set text(weight: "semibold")

= UD 1. Conducción de voces

== Quintas paralelas

Cuando dos voces se mueven en la misma dirección manteniendo entre sí el
intervalo de quinta justa, se produce el error de conducción más
característico del estilo. En el ejemplo @fig-5as, soprano y contralto
suben conjuntamente de la quinta Sol--Re a la quinta La--Mi.

#figure(
  image("build/ud01-5as-paralelas.svg", width: 35%),
  caption: [Quintas paralelas entre las voces extremas.],
) <fig-5as>

La tríada de tónica sobre la que se resuelve aparece en @fig-triada.

#figure(
  image("build/ud01-triada-im.svg", width: 22%),
  caption: [Tríada de tónica de La menor, estado fundamental.],
) <fig-triada>
