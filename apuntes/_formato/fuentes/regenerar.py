# Regenera «Armonia Serif», la fuente de texto de los apuntes.
# Requiere `pip install fonttools brotli`.
#
#     python _formato/fuentes/regenerar.py
#
# Se ejecuta desde apuntes/ (rutas relativas: ver CLAUDE.md). Produce,
# por cada uno de los cuatro estilos, un .ttf (lo lee Typst para el PDF,
# vía --font-path) y un .woff2 (lo sirve el HTML). Todo en un solo
# fichero por estilo: el PDF y el HTML componen con exactamente lo mismo,
# y el HTML deja de depender de lo que haya instalado quien lo lea.
#
# QUÉ ES: DejaVu Serif recortada y con dos parches.
#
# 1. EL CIRCUNFLEJO DE LOS GRADOS (U+0302)
#
#    Los grados (1̂, 5̂, ♯7̂) son dígito + circunflejo combinante. DejaVu
#    dibuja la marca donde le toca a una minúscula, y sobre una cifra se
#    le mete dentro y queda descentrada. Medido (2048 upem):
#
#        «6»       avance 1303, llega a 1520 de alto
#        U+0302    avance 0, caja x -831..-193, y 1262..1638
#
#    O sea: la marca arranca 258 unidades POR DEBAJO de lo alto de la
#    cifra, y su centro cae en x -512 cuando el de la cifra está en -651
#    (139 de desvío a la derecha). La referencia de cómo tendría que
#    verse la da la propia DejaVu en su «Â» precompuesta: la A llega a
#    1493 y el acento ocupa 1523..1899, o sea 30 unidades de aire y el
#    techo en el ascendente. Trasladado a una cifra sale ALTURA = 1560.
#
#    Se agranda un punto (ESCALA, porque sobre una cifra la marca de
#    DejaVu se queda corta) y se recoloca. Se toca el contorno, no una
#    tabla de anclajes: DejaVu no ancla marcas a las cifras —de ahí que
#    el defecto se vea—, así que mover el dibujo basta y vale igual en
#    Typst y en el navegador.
#
#    Por qué se parchea DENTRO de la fuente de texto y no con una fuente
#    aparte antepuesta: Typst y los navegadores eligen fuente por
#    CLÚSTER, no por carácter. Cifra y marca combinante son un solo
#    clúster, así que la marca no puede venir de otra fuente que la
#    cifra. Probado: sale la marca sola y la cifra desaparece.
#
# 2. LAS ALTERACIONES (♭ U+266D · ♮ U+266E · ♯ U+266F · 𝄪 U+1D12A · 𝄫 U+1D12B)
#
#    Las de DejaVu son toscas. Se sustituyen por las de Leland (la misma
#    familia que Verovio usa en las partituras de la app), tomadas del
#    subconjunto que ya vive en app/public/vendor/fuentes/ —OFL 1.1, ahí
#    está el porqué de sus proporciones— y reescaladas de sus 1000 upem
#    a los 2048 de DejaVu. Así una alteración en el texto de los apuntes
#    y otra en un ejercicio de la app son el mismo dibujo.
#    Estas sí son clúster propio y habrían valido como fuente aparte;
#    van aquí por no tener dos mecanismos para lo mismo.
#
# NOMBRE: no puede llamarse «DejaVu» (su licencia lo prohíbe para las
# versiones modificadas). Licencias en LICENCIAS.txt.
#
# RECORTE: solo los rangos de RANGOS, que es de lo que se compone un
# apunte. construir.py comprueba en cada compilación que ningún .md use
# un carácter que se haya quedado fuera, y avisa si ocurre.
import sys
import pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools import subset

sys.stdout.reconfigure(encoding="utf-8")
AQUI = pathlib.Path(__file__).resolve().parent
LELAND = AQUI / "../../../app/public/vendor/fuentes/leland-alteraciones.woff2"

FAMILIA = "Armonia Serif"
ESTILOS = {
    # estilo: (fichero de DejaVu, peso, cursiva, sufijo de los nuestros)
    "Regular": ("DejaVuSerif.ttf", 400, False, ""),
    "Bold": ("DejaVuSerif-Bold.ttf", 700, False, "-negrita"),
    "Italic": ("DejaVuSerif-Italic.ttf", 400, True, "-cursiva"),
    "Bold Italic": ("DejaVuSerif-BoldItalic.ttf", 700, True, "-negrita-cursiva"),
}
DEJAVU = pathlib.Path("C:/Windows/Fonts")

CIRCUNFLEJO = 0x0302
ALTERACIONES = [0x266D, 0x266E, 0x266F, 0x1D12A, 0x1D12B]

ESCALA = 1.15   # la marca de DejaVu, sobre una cifra, se queda corta
ALTURA = 1560   # base de la marca (las cifras llegan a 1520)
CENTRO = -664   # centro de la cifra visto desde el cursor: «6» redonda -651,
                # negrita -712; se toma la media y el desvío no se aprecia

# De qué se compone un apunte: latín con sus acentos, marcas combinantes,
# puntuación y rayas, flechas, ≤ ≥ y demás operadores, y los símbolos
# musicales. Generoso a propósito: recortar de más sale caro y pesa poco.
RANGOS = ("U+0000-00FF,U+0100-017F,U+0180-024F,U+02B0-02FF,U+0300-036F,"
          "U+2000-206F,U+2070-209F,U+20A0-20BF,U+2100-214F,U+2190-21FF,"
          "U+2200-22FF,U+2300-23FF,U+25A0-25FF,U+2600-26FF,U+1D100-1D1FF")


def renombrar(f, estilo):
    """Nombres nuevos, avisos legales intactos.

    Renombrar es obligado: la licencia de DejaVu no deja llamar «DejaVu»
    a una versión modificada. Pero el copyright (0), el texto de la
    licencia (13) y su URL (14) se conservan tal cual vienen —la de
    Bitstream Vera exige que el aviso viaje con la fuente— y de ahí sale
    también LICENCIAS.txt.
    """
    conservado = {r.nameID: r.toUnicode() for r in f["name"].names
                  if r.nameID in (0, 13, 14)}
    completo = FAMILIA if estilo == "Regular" else f"{FAMILIA} {estilo}"
    postscript = completo.replace(" ", "")
    nombres = {1: FAMILIA, 2: estilo, 3: f"{postscript}:regenerar.py",
               4: completo, 6: postscript,
               16: FAMILIA, 17: estilo,
               **conservado}
    f["name"].names = []
    for nid, valor in sorted(nombres.items()):
        f["name"].setName(valor, nid, 3, 1, 0x409)
        f["name"].setName(valor, nid, 1, 0, 0)


def dibujar_en(destino_font, glifo, origen_gs, origen_glifo, transformacion):
    """Copia un contorno de una fuente a otra, con su transformación.

    Cu2QuPen porque Leland es CFF (curvas cúbicas) y DejaVu es glyf
    (cuadráticas): sin convertirlas, TTGlyphPen no las admite.
    """
    pluma = TTGlyphPen(destino_font.getGlyphSet())
    origen_gs[origen_glifo].draw(
        TransformPen(Cu2QuPen(pluma, 0.5), transformacion))
    destino_font["glyf"][glifo] = pluma.glyph()


def parchear_circunflejo(f):
    gs = f.getGlyphSet()
    glifo = f.getBestCmap()[CIRCUNFLEJO]
    caja = BoundsPen(gs)
    gs[glifo].draw(caja)
    x0, y0, x1, y1 = caja.bounds
    dx = CENTRO - (x0 + x1) / 2 * ESCALA
    dy = ALTURA - y0 * ESCALA
    dibujar_en(f, glifo, gs, glifo, (ESCALA, 0, 0, ESCALA, dx, dy))
    f["hmtx"][glifo] = (0, round(x0 * ESCALA + dx))   # avance 0: es una marca


def parchear_alteraciones(f, leland):
    escala = f["head"].unitsPerEm / leland["head"].unitsPerEm
    lgs = leland.getGlyphSet()
    lcm = leland.getBestCmap()
    cm = f.getBestCmap()
    gs = f.getGlyphSet()
    for u in ALTERACIONES:
        if u not in cm:      # 𝄪 y 𝄫 pueden no estar en DejaVu
            continue
        glifo = cm[u]
        dibujar_en(f, glifo, lgs, lcm[u], (escala, 0, 0, escala, 0, 0))
        f["hmtx"][glifo] = (round(leland["hmtx"][lcm[u]][0] * escala),
                            round(leland["hmtx"][lcm[u]][1] * escala))


def construir(estilo):
    fichero, peso, cursiva, sufijo = ESTILOS[estilo]
    f = TTFont(DEJAVU / fichero)

    opciones = subset.Options()
    opciones.layout_features = ["*"]     # kerning y demás, intactos
    opciones.name_IDs = ["*"]            # si no, se lleva por delante copyright y licencia
    opciones.notdef_outline = True
    recorte = subset.Subsetter(opciones)
    recorte.populate(unicodes=subset.parse_unicodes(RANGOS))
    recorte.subset(f)

    parchear_circunflejo(f)
    parchear_alteraciones(f, TTFont(LELAND.resolve()))

    # fsSelection: cursiva (0x01), negrita (0x20), redonda normal (0x40).
    # Sin esto, Typst y el navegador no saben cuál de los cuatro ficheros
    # es cuál y acaban fingiendo la negrita sobre la redonda.
    f["OS/2"].usWeightClass = peso
    f["OS/2"].fsSelection = ((0x01 if cursiva else 0)
                             | (0x20 if peso == 700 else 0)
                             | (0x40 if peso != 700 and not cursiva else 0))
    f["head"].macStyle = (0x01 if peso == 700 else 0) | (0x02 if cursiva else 0)
    renombrar(f, estilo)

    for flavor, ext in ((None, "ttf"), ("woff2", "woff2")):
        f.flavor = flavor
        destino = AQUI / f"armonia-serif{sufijo}.{ext}"
        f.save(destino)
        print(f"  {destino.name}  {destino.stat().st_size // 1024} kB")


def comprobar():
    """Reabre lo guardado y enseña las cajas, que es lo único que importa."""
    print("Comprobación (2048 upem; las cifras llegan a 1520, la «A» a 1493):")
    for estilo in ESTILOS:
        sufijo = ESTILOS[estilo][3]
        f = TTFont(AQUI / f"armonia-serif{sufijo}.ttf")
        gs, cm = f.getGlyphSet(), f.getBestCmap()
        partes = []
        for nombre, u in (("^", CIRCUNFLEJO), ("♯", 0x266F)):
            caja = BoundsPen(gs)
            gs[cm[u]].draw(caja)
            x0, y0, x1, y1 = caja.bounds
            partes.append(f"{nombre} x {x0:.0f}..{x1:.0f} y {y0:.0f}..{y1:.0f}")
        print(f"  {estilo:12} " + " | ".join(partes))


def licencias():
    """Junta los dos avisos legales en un fichero, al lado de las fuentes.

    El de DejaVu se saca del propio binario (nameID 13), que es la copia
    autorizada; el de Leland se copia del que ya hay en la app.
    """
    dejavu = TTFont(DEJAVU / ESTILOS["Regular"][0])["name"].getDebugName(13)
    ofl = (LELAND.parent / "OFL-Leland.txt").resolve().read_text(encoding="utf-8")
    destino = AQUI / "LICENCIAS.txt"
    destino.write_text(
        f"Licencias de lo que compone «{FAMILIA}».\n"
        "Lo generado aquí es obra derivada de las dos cosas: se distribuye\n"
        "con los dos avisos y renombrado, como exigen ambas.\n"
        "\n"
        "El cuerpo de la fuente es DejaVu Serif (recortada y con el\n"
        "circunflejo combinante recolocado). Las cinco alteraciones\n"
        "(♭ ♮ ♯ 𝄪 𝄫) son contornos de Leland Text, reescalados.\n"
        "\n"
        "=========================================================\n"
        "1. DejaVu Serif — cuerpo de la fuente\n"
        "=========================================================\n"
        f"\n{dejavu}\n"
        "\n"
        "=========================================================\n"
        "2. Leland Text — solo los glifos de las alteraciones\n"
        "=========================================================\n"
        f"\n{ofl}\n",
        encoding="utf-8")
    print(f"  {destino.name}  {destino.stat().st_size // 1024} kB")


if __name__ == "__main__":
    for estilo in ESTILOS:
        print(f"{FAMILIA} {estilo}:")
        construir(estilo)
    print("Licencias:")
    licencias()
    comprobar()
