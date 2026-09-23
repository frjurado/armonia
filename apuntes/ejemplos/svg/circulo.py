# Dibuja c3u0-circulo-5as.svg, el círculo de quintas de 3.º UD 0 §1.1.
#
#     python ejemplos/svg/circulo.py
#
# Se ejecuta desde apuntes/ (rutas relativas: ver CLAUDE.md) y reescribe
# el SVG que tiene al lado. El SVG sí se versiona —es la fuente, no un
# intermedio—; este script está para poder retocar el diagrama sin
# pelearse con las coordenadas a mano.
#
# POR QUÉ NO LLEVA <text>: un SVG referenciado con <img src> es un
# documento aparte, al que no llega ni el CSS de los apuntes ni la
# fuente que incrusta el PDF. Con <text> cada salida elegiría por su
# cuenta una fuente de sustitución —el mismo problema por el que los
# ejemplos de LilyPond no usan -dbackend=svg (ver CLAUDE.md)—, y los ♯
# y ♭ son justo lo primero que se pierde. Así que todo el texto se
# convierte aquí a trazos, sacados de la propia «Armonia Serif», y el
# SVG no depende de nada.
import sys
import math
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

sys.stdout.reconfigure(encoding="utf-8")
AQUI = pathlib.Path(__file__).resolve().parent
FUENTES = AQUI / "../../_formato/fuentes"

R = 200                     # radio de la circunferencia de las armaduras

MARGEN = 46

# Las doce posiciones, en el sentido de las agujas del reloj desde arriba:
# cada paso es una 5.ª ascendente, que suma un sostenido o quita un bemol.
# Hasta 6 alteraciones y nunca 7: abajo se cruzan las dos escrituras,
# y ahí es donde el círculo se cierra (§1.1).
CASILLAS = [
    ("Do", "la", ""),
    ("Sol", "mi", "1♯"),
    ("Re", "si", "2♯"),
    ("La", "fa♯", "3♯"),
    ("Mi", "do♯", "4♯"),
    ("Si", "sol♯", "5♯"),
    ("Fa♯/Sol♭", "re♯/mi♭", "6♯/6♭"),
    ("Re♭", "si♭", "5♭"),
    ("La♭", "fa", "4♭"),
    ("Mi♭", "do", "3♭"),
    ("Si♭", "sol", "2♭"),
    ("Fa", "re", "1♭"),
]

TINTA = "#1a1a1a"
SUAVE = "#666"
REGLA = "#ccc"


def cargar(nombre):
    f = TTFont(FUENTES / nombre)
    return f, f.getGlyphSet(), f.getBestCmap(), f["head"].unitsPerEm


def texto(fuente, cadena, cx, cy, cuerpo, color):
    """Una cadena convertida a <path>, centrada en (cx, cy).

    Sin kerning ni ligaduras: son dos palabras sueltas por casilla y no
    compensa arrastrar HarfBuzz hasta aquí.
    """
    f, gs, cm, upem = fuente
    escala = cuerpo / upem
    ancho = sum(f["hmtx"][cm[ord(c)]][0] for c in cadena if ord(c) in cm) * escala
    x = cx - ancho / 2
    trozos = []
    for c in cadena:
        if ord(c) not in cm:
            sys.exit(f"«{c}» (U+{ord(c):04X}) no está en la fuente")
        glifo = cm[ord(c)]
        pluma = SVGPathPen(gs)
        # El eje Y del SVG va hacia abajo y el de la fuente hacia arriba:
        # de ahí el -escala.
        gs[glifo].draw(TransformPen(pluma, (escala, 0, 0, -escala, x, cy)))
        d = pluma.getCommands()
        if d:
            trozos.append(f'<path d="{d}"/>')
        x += f["hmtx"][glifo][0] * escala
    if not trozos:
        return ""
    return f'<g fill="{color}">' + "".join(trozos) + "</g>"


def main():
    redonda = cargar("armonia-serif.ttf")
    negrita = cargar("armonia-serif-negrita.ttf")

    # Cuadrado: el radio exterior más el sitio que piden los nombres
    # mayores, que son los que más sobresalen.
    ancho = alto = 2 * (R + MARGEN)
    cx, cy = ancho / 2, alto / 2

    partes = [
        f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" '
        f'stroke="{REGLA}" stroke-width="1.5"/>',
        f'<circle cx="{cx}" cy="{cy}" r="{R - 62}" fill="none" '
        f'stroke="{REGLA}" stroke-width="1" stroke-dasharray="3 4"/>',
    ]

    for i, (mayor, menor, alteraciones) in enumerate(CASILLAS):
        angulo = math.radians(-90 + i * 30)
        for radio, cadena, fuente, cuerpo, color in (
            (R + 26, mayor, negrita, 19, TINTA),
            (R - 24, alteraciones, redonda, 16, SUAVE),
            (R - 84, menor, negrita, 16, TINTA),
        ):
            partes.append(texto(fuente, cadena,
                                cx + radio * math.cos(angulo),
                                cy + radio * math.sin(angulo) + cuerpo * 0.35,
                                cuerpo, color))

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" '
           f'width="{ancho}" height="{alto}">\n'
           + "\n".join(p for p in partes if p) + "\n</svg>\n")
    destino = AQUI / "c3u0-circulo-5as.svg"
    destino.write_text(svg, encoding="utf-8")
    print(f"{destino.name}  {destino.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
