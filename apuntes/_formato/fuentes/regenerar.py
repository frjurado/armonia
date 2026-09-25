# Regenera «Armonia Serif», la fuente de texto de los apuntes.
# Requiere `pip install fonttools brotli` y, la primera vez, red.
#
#     python _formato/fuentes/regenerar.py
#
# Se ejecuta desde apuntes/ (rutas relativas: ver CLAUDE.md). Produce,
# por cada uno de los cuatro estilos, un .ttf (lo lee Typst para el PDF,
# vía --font-path) y un .woff2 (lo sirve el HTML). Todo en un solo
# fichero por estilo: el PDF y el HTML componen con exactamente lo mismo,
# y el HTML deja de depender de lo que haya instalado quien lo lea.
#
# QUÉ ES: Source Serif 4 recortada y con cinco parches.
#
# POR QUÉ SOURCE SERIF 4 (septiembre de 2026). Es la serifa de los títulos
# de la portada del sitio, así que los apuntes y la web hablan con la
# misma letra. Se eligió frente a DejaVu Serif (la anterior: correcta pero
# ancha y tosca), Libertinus Serif (la más de libro, pero de ojo pequeño:
# pedía cuerpo 12 y en pantalla quedaba clara), Noto Serif (muy parecida
# a DejaVu) y Charis SIL (la única que compone los grados sin parche, pero
# más utilitaria), después de componer la unidad entera con cada una. Las
# pruebas quedaron en apuntes/tmp/prueba-fuentes/ y build/prueba-fuente-*,
# que no se versionan.
#
# La negrita es la SEMINEGRITA de Source (Semibold, 600): la Bold pesa
# demasiado al lado de la redonda, y 600 es el peso de los títulos del
# sitio. Va declarada como el estilo «Bold» (700) de la familia, para que
# Typst y el navegador la elijan sin más cuando piden negrita.
#
# DE DÓNDE SALE. De la publicación oficial de Adobe (DESCARGA, abajo), que
# se baja una vez a apuntes/tmp/, fuera del repo. Se usan los TTF
# (contornos cuadráticos, tabla glyf): los parches dibujan con
# TTGlyphPen, que no sabe escribir CFF.
#
# 1. EL CIRCUNFLEJO DE LOS GRADOS (U+0302)
#
#    Los grados (1̂, 5̂, ♯7̂) son dígito + circunflejo combinante. Casi
#    ninguna fuente de texto ancla marcas a las cifras, y Source tampoco:
#    su U+0302 está centrado en el origen, a la altura de una minúscula,
#    así que sobre una cifra cae a la derecha y metido dentro de ella.
#
#    Se dibuja un glifo NUEVO (`circunflejo.cifra`) y se le apunta el
#    carácter U+0302; el original se queda como estaba. No vale mover el
#    original: en Source, las letras precompuestas («ê», «Â») son
#    compuestos que lo reutilizan, y moverlo las rompe. Probado. El glifo
#    nuevo, además, no está en ninguna regla de posicionamiento de la
#    fuente, así que nadie lo mueve después.
#
#    La posición no se pone a mano, se mide en la propia fuente:
#      - centrado sobre el «6» (ancho de cifra, igual en todas),
#        visto desde el cursor, que ya está detrás de la cifra;
#      - apoyado a la altura de la cifra más el aire que la propia
#        fuente deja entre la «A» y el acento de su «Â», con un mínimo
#        (AIRE_MINIMO);
#      - un punto mayor (ESCALA): sobre una cifra la marca de
#        minúscula se queda corta.
#    Medido así sale igual de bien en los cuatro estilos, cursivas
#    incluidas, sin una constante por estilo.
#
#    Por qué se parchea DENTRO de la fuente de texto y no con una fuente
#    aparte antepuesta: Typst y los navegadores eligen fuente por
#    CLÚSTER, no por carácter. Cifra y marca combinante son un solo
#    clúster, así que la marca no puede venir de otra fuente que la
#    cifra. Probado: sale la marca sola y la cifra desaparece.
#
# 2. LAS ALTERACIONES (♭ U+266D · ♮ U+266E · ♯ U+266F · 𝄪 U+1D12A · 𝄫 U+1D12B)
#
#    Source no las trae. Se añaden las de Leland (la misma familia que
#    Verovio usa en las partituras de la app), tomadas del subconjunto que
#    ya vive en app/public/vendor/fuentes/ —OFL 1.1, ahí está el porqué de
#    sus proporciones— y reescaladas a las unidades de Source. Así una
#    alteración en el texto de los apuntes y otra en un ejercicio de la
#    app son el mismo dibujo. Si una fuente de partida ya tuviera alguna,
#    se sustituye igual.
#
# 3. LA DOBLE FLECHA (↔ U+2194)
#
#    Source trae «→» pero no «↔», y los apuntes la usan (2.ª↔7.ª). Se
#    dibuja como UN contorno con los puntos de la propia «→»: su punta y
#    su cuello a la derecha, los mismos reflejados a la izquierda, y entre
#    los dos «hombros» (donde el astil de Source deja de estrecharse) un
#    astil recto de su grosor. La «→» de Source es siempre de 12 puntos:
#    cola (0-1), hombro (2), cuello (3), punta (4-9), cuello (10), hombro
#    (11); si otra versión cambiara eso, se para aquí.
#
#    Dos intentos anteriores, descartados:
#      - la «→» y su reflejo en la misma caja: la punta ocupa más de la
#        mitad de la flecha, las dos se montaban en el centro y salía un
#        rombo cruzado por una diagonal;
#      - «←» y «→» desplazada, superpuestas: el astil de Source se
#        estrecha hacia la punta, y de cerca se veía el escalón donde un
#        astil se montaba en el otro.
#    El glifo es más ancho que la «→» (ALARGUE), como en las fuentes que
#    traen «↔» de serie: con el ancho de la «→» no cabe astil entre puntas.
#
# 4. EL TACHADO DE CIFRA (U+0338)
#
#    Para el bajo cifrado a la francesa: 5̸ es la 5.ª disminuida (V6/5 se
#    cifra 6 sobre 5 tachado). Es cifra + marca combinante, el mismo caso
#    que el circunflejo y resuelto igual: glifo nuevo, avance 0, dibujado
#    hacia atrás sobre la cifra anterior. Sirve para cualquier cifra (7̸).
#
# 5. LOS GRADOS DEL BAJO EN CÍRCULO (① … ⑨, U+2460 …)
#
#    Convención de Gjerdingen (y de Caplin, y de Pascual-Diego): el grado
#    del bajo va en círculo; el circunflejo queda para las demás voces.
#    Source no los trae. Se dibujan con la cifra de la propia fuente,
#    reducida, dentro de un anillo trazado aquí; así texto, PDF y
#    partituras (LilyPond usa esta misma fuente) dicen lo mismo.
#
# NOMBRE: Source Serif lleva «Source» como nombre reservado (Reserved
# Font Name de su OFL): una versión modificada no puede llamarse así. De
# ahí «Armonia Serif». Licencias en LICENCIAS.txt.
#
# RECORTE: solo los rangos de RANGOS, que es de lo que se compone un
# apunte. construir.py comprueba en cada compilación que ningún .md use
# un carácter que se haya quedado fuera, y avisa si ocurre.
#
# Tras regenerar, hay que volver a lanzar ejemplos/svg/circulo.py: el
# círculo de 5.as dibuja su texto con los contornos de esta fuente.
import io
import math
import sys
import pathlib
import urllib.request
import zipfile
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools import subset

sys.stdout.reconfigure(encoding="utf-8")
AQUI = pathlib.Path(__file__).resolve().parent
LELAND = AQUI / "../../../app/public/vendor/fuentes/leland-alteraciones.woff2"

DESCARGA = ("https://github.com/adobe-fonts/source-serif/releases/download/"
            "4.005R/source-serif-4.005_Desktop.zip")
ORIGEN = AQUI / "../../tmp/source-serif-4"     # fuera del repo
EN_ZIP = "source-serif-4.005_Desktop/"

FAMILIA = "Armonia Serif"
ESTILOS = {
    # estilo: (fichero de Source Serif 4, peso, cursiva, sufijo de los nuestros)
    "Regular": ("SourceSerif4-Regular.ttf", 400, False, ""),
    "Bold": ("SourceSerif4-Semibold.ttf", 700, False, "-negrita"),
    "Italic": ("SourceSerif4-It.ttf", 400, True, "-cursiva"),
    "Bold Italic": ("SourceSerif4-SemiboldIt.ttf", 700, True, "-negrita-cursiva"),
}

CIRCUNFLEJO = 0x0302
GLIFO_CIRCUNFLEJO = "circunflejo.cifra"
ALTERACIONES = [0x266D, 0x266E, 0x266F, 0x1D12A, 0x1D12B]
FLECHA, DOBLE_FLECHA = 0x2192, 0x2194
ALARGUE = 0.6   # desplazamiento de la «→» en la «↔», en fracción de su ancho:
                # deja entre las puntas un astil de más o menos una punta
ESCALA = 1.1    # la marca de minúscula, sobre una cifra, se queda corta
AIRE_MINIMO = 0.02   # entre cifra y marca, en fracción del cuadratín

BARRA = 0x0338                 # tachado combinante: 5̸ = 5.ª disminuida
GLIFO_BARRA = "barra.cifra"
# grosor de la barra, en fracción del ancho de cifra (la redonda y la
# seminegrita tienen trazos distintos, y la barra los acompaña)
GROSOR_BARRA = {400: 0.12, 700: 0.16}

CIRCULOS = range(1, 10)        # ① … ⑨ (U+2460 …): grados del bajo
DIAMETRO = 1.18                # del círculo, en alturas de cifra
GROSOR_CIRCULO = {400: 0.055, 700: 0.075}   # en fracción del diámetro
ESCALA_CIFRA = 0.64            # la cifra dentro del círculo
MARGEN_CIRCULO = 40            # a cada lado, en unidades de la fuente

# De qué se compone un apunte: latín con sus acentos, marcas combinantes,
# puntuación y rayas, flechas, ≤ ≥ y demás operadores, y los símbolos
# musicales. Generoso a propósito: recortar de más sale caro y pesa poco.
RANGOS = ("U+0000-00FF,U+0100-017F,U+0180-024F,U+02B0-02FF,U+0300-036F,"
          "U+2000-206F,U+2070-209F,U+20A0-20BF,U+2100-214F,U+2190-21FF,"
          "U+2200-22FF,U+2300-23FF,U+25A0-25FF,U+2600-26FF,U+1D100-1D1FF")


def origen():
    """Los TTF de Adobe, bajados una vez a tmp/ con su licencia."""
    faltan = [f for f, *_ in ESTILOS.values() if not (ORIGEN / f).exists()]
    if faltan or not (ORIGEN / "LICENSE.md").exists():
        print(f"Descargando Source Serif 4 de {DESCARGA}")
        with urllib.request.urlopen(DESCARGA) as r:
            z = zipfile.ZipFile(io.BytesIO(r.read()))
        ORIGEN.mkdir(parents=True, exist_ok=True)
        for f in [*(f for f, *_ in ESTILOS.values())]:
            (ORIGEN / f).write_bytes(z.read(f"{EN_ZIP}TTF/{f}"))
        (ORIGEN / "LICENSE.md").write_bytes(z.read(f"{EN_ZIP}LICENSE.md"))
    return ORIGEN.resolve()


def renombrar(f, estilo):
    """Nombres nuevos, avisos legales intactos.

    Renombrar es obligado: «Source» es nombre reservado en su licencia.
    El copyright (0), el texto de la licencia (13) y su URL (14) se
    conservan tal cual vienen.
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
    # Los ejes y nombres de instancia de Source dirían «Semibold» donde
    # la familia dice «Bold»: fuera, que aquí no hay variaciones.
    if "STAT" in f:
        del f["STAT"]


def caja(gs, glifo):
    pluma = BoundsPen(gs)
    gs[glifo].draw(pluma)
    return pluma.bounds


def dibujo(destino_font, origen_gs, origen_glifo, transformacion):
    """Un contorno de una fuente, transformado, listo para otra.

    Cu2QuPen porque Leland es CFF (curvas cúbicas) y el destino es glyf
    (cuadráticas): sin convertirlas, TTGlyphPen no las admite.
    """
    pluma = TTGlyphPen(destino_font.getGlyphSet())
    origen_gs[origen_glifo].draw(
        TransformPen(Cu2QuPen(pluma, 0.5), transformacion))
    return pluma.glyph()


def poner(f, nombre, glifo, metrica, unicode=None):
    """Da de alta (o sustituye) un glifo y, si se pide, su carácter."""
    orden = f.getGlyphOrder()
    if nombre not in orden:
        f.setGlyphOrder(orden + [nombre])
    f["glyf"][nombre] = glifo
    f["hmtx"][nombre] = metrica
    if unicode is not None:
        for t in f["cmap"].tables:
            if t.isUnicode() and (unicode <= 0xFFFF or t.format in (10, 12, 13)):
                t.cmap[unicode] = nombre
    f["maxp"].numGlyphs = len(f.getGlyphOrder())


def parchear_circunflejo(f):
    gs, cm = f.getGlyphSet(), f.getBestCmap()
    seis = cm[ord("6")]
    x0, _, x1, techo = caja(gs, seis)
    avance = f["hmtx"][seis][0]
    _, _, _, alto_a = caja(gs, cm[ord("A")])
    _, _, _, alto_acento = caja(gs, cm[0x00C2])
    marca = cm[CIRCUNFLEJO]
    m0, n0, m1, n1 = caja(gs, marca)
    # «Â»: de la A a su acento. En Source ese acento es el de mayúscula,
    # más alto que U+0302, y la resta sale negativa; de ahí el mínimo.
    aire = max((alto_acento - (n1 - n0)) - alto_a, AIRE_MINIMO * f["head"].unitsPerEm)
    dx = ((x0 + x1) / 2 - avance) - (m0 + m1) / 2 * ESCALA
    dy = techo + aire - n0 * ESCALA
    poner(f, GLIFO_CIRCUNFLEJO,
          dibujo(f, gs, marca, (ESCALA, 0, 0, ESCALA, dx, dy)),
          (0, round(m0 * ESCALA + dx)),             # avance 0: es una marca
          CIRCUNFLEJO)
    if "GDEF" in f and f["GDEF"].table.GlyphClassDef:
        f["GDEF"].table.GlyphClassDef.classDefs[GLIFO_CIRCUNFLEJO] = 3   # marca


def parchear_alteraciones(f, leland):
    escala = f["head"].unitsPerEm / leland["head"].unitsPerEm
    lgs, lcm = leland.getGlyphSet(), leland.getBestCmap()
    for u in ALTERACIONES:
        if u not in lcm:
            continue
        nombre = f.getBestCmap().get(u, f"uni{u:04X}" if u <= 0xFFFF else f"u{u:05X}")
        avance, izquierda = leland["hmtx"][lcm[u]]
        poner(f, nombre, dibujo(f, lgs, lcm[u], (escala, 0, 0, escala, 0, 0)),
              (round(avance * escala), round(izquierda * escala)), u)


def doble_flecha(f):
    cm = f.getBestCmap()
    if DOBLE_FLECHA in cm:
        return
    gs = f.getGlyphSet()
    flecha = cm[FLECHA]
    grabado = RecordingPen()
    gs[flecha].draw(grabado)
    puntos = [args[0] for op, args in grabado.value if op != "closePath"]
    if (len(puntos) != 12 or [op for op, _ in grabado.value].count("moveTo") != 1
            or any(op not in ("moveTo", "lineTo", "closePath") for op, _ in grabado.value)):
        sys.exit("La «→» ya no es el contorno de 12 puntos que espera doble_flecha()")
    avance, izquierda = f["hmtx"][flecha]
    x0, _, x1, _ = caja(gs, flecha)
    dx = round((x1 - x0) * ALARGUE)
    derecha = [(x + dx, y) for x, y in puntos[2:12]]      # hombro … hombro
    eje = x0 + x1 + dx                                     # reflejo: x → eje - x
    izquierda_ = [(eje - x, y) for x, y in reversed(derecha)]
    if derecha[0][0] < izquierda_[-1][0]:
        sys.exit("ALARGUE se queda corto: los hombros de la «↔» se cruzan")
    pluma = TTGlyphPen(gs)
    pluma.moveTo(derecha[0])
    for punto in derecha[1:] + izquierda_:
        pluma.lineTo(punto)
    pluma.closePath()
    poner(f, "uni2194", pluma.glyph(), (avance + dx, izquierda), DOBLE_FLECHA)


def barra(f, peso, inclinacion):
    """U+0338 como tachado de cifra, colocado sobre la anterior.

    Igual que el circunflejo: glifo nuevo de avance 0, dibujado hacia
    atrás desde el cursor, medido sobre el «5» (las cifras de Source son
    tabulares: todas del mismo ancho). Una raya en diagonal, de abajo a
    la izquierda a arriba a la derecha, que sobresale un poco de la cifra
    por los dos extremos; en cursiva, inclinada con ella.
    """
    gs, cm = f.getGlyphSet(), f.getBestCmap()
    cinco = cm[ord("5")]
    x0, _, x1, techo = caja(gs, cinco)
    avance = f["hmtx"][cinco][0]
    ancho = x1 - x0
    medio = GROSOR_BARRA[peso] * ancho / 2
    sale = 0.08 * ancho
    pie, cabeza = 0.10 * techo, 0.90 * techo
    tangente = math.tan(math.radians(-inclinacion))
    def punto(x, y):
        return (round(x + y * tangente - avance), round(y))
    a, b = (x0 - sale, pie), (x1 + sale, cabeza)
    pluma = TTGlyphPen(gs)
    pluma.moveTo(punto(a[0] - medio, a[1]))           # sentido horario
    pluma.lineTo(punto(b[0] - medio, b[1]))
    pluma.lineTo(punto(b[0] + medio, b[1]))
    pluma.lineTo(punto(a[0] + medio, a[1]))
    pluma.closePath()
    glifo = pluma.glyph()
    glifo.recalcBounds(f["glyf"])
    poner(f, GLIFO_BARRA, glifo, (0, glifo.xMin), BARRA)
    if "GDEF" in f and f["GDEF"].table.GlyphClassDef:
        f["GDEF"].table.GlyphClassDef.classDefs[GLIFO_BARRA] = 3   # marca


def circulos(f, peso):
    """①–⑨: la cifra de la propia fuente, reducida, dentro de un anillo.

    El anillo va centrado en la altura de cifra (no en la de la línea):
    así el ① se alinea con las cifras de alrededor y sobresale lo mismo
    por arriba que por abajo. Siempre recto, también en cursiva: es un
    signo, no una letra. La alteración, si la hay, va fuera y delante
    (♯⑦), como en ♯7̂: no hacen falta más glifos.
    """
    gs, cm = f.getGlyphSet(), f.getBestCmap()
    _, _, _, alto = caja(gs, cm[ord("6")])
    radio = DIAMETRO * alto / 2
    grueso = GROSOR_CIRCULO[peso] * 2 * radio
    cx, cy = MARGEN_CIRCULO + radio, alto / 2
    k = 0.5523   # control de la curva cúbica que aproxima un cuarto de círculo

    def anillo(pluma, r, horario):
        # cuatro cuartos en sentido horario desde arriba: (control, control, fin)
        q = k * r
        tramos = [((cx + q, cy + r), (cx + r, cy + q), (cx + r, cy)),
                  ((cx + r, cy - q), (cx + q, cy - r), (cx, cy - r)),
                  ((cx - q, cy - r), (cx - r, cy - q), (cx - r, cy)),
                  ((cx - r, cy + q), (cx - q, cy + r), (cx, cy + r))]
        if not horario:   # el mismo camino al revés
            inicio = (cx, cy + r)
            previos = [inicio] + [t[2] for t in tramos[:-1]]
            tramos = [(c2, c1, fin) for (c1, c2, _), fin in
                      zip(reversed(tramos), reversed(previos))]
        pluma.moveTo((cx, cy + r))
        for c1, c2, fin in tramos:
            pluma.curveTo(c1, c2, fin)
        pluma.closePath()

    for n in CIRCULOS:
        cifra = cm[ord(str(n))]
        c0, d0, c1, d1 = caja(gs, cifra)
        pluma = TTGlyphPen(gs)
        cubica = Cu2QuPen(pluma, 1.0)
        anillo(cubica, radio, True)                  # contorno exterior: horario
        anillo(cubica, radio - grueso, False)        # hueco: antihorario
        dx = cx - (c0 + c1) / 2 * ESCALA_CIFRA
        dy = cy - (d0 + d1) / 2 * ESCALA_CIFRA
        gs[cifra].draw(TransformPen(pluma, (ESCALA_CIFRA, 0, 0, ESCALA_CIFRA, dx, dy)))
        glifo = pluma.glyph()
        glifo.recalcBounds(f["glyf"])
        poner(f, f"circulo.{n}", glifo,
              (round(2 * (MARGEN_CIRCULO + radio)), glifo.xMin), 0x2460 + n - 1)


def construir(estilo, carpeta):
    fichero, peso, cursiva, sufijo = ESTILOS[estilo]
    f = TTFont(carpeta / fichero)

    opciones = subset.Options()
    opciones.layout_features = ["*"]     # kerning y demás, intactos
    opciones.name_IDs = ["*"]            # si no, se lleva por delante copyright y licencia
    opciones.notdef_outline = True
    opciones.glyph_names = True
    recorte = subset.Subsetter(opciones)
    recorte.populate(unicodes=subset.parse_unicodes(RANGOS))
    recorte.subset(f)

    parchear_circunflejo(f)
    parchear_alteraciones(f, TTFont(LELAND.resolve()))
    doble_flecha(f)
    barra(f, peso, f["post"].italicAngle)
    circulos(f, peso)

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
    print("Comprobación (el circunflejo tiene que quedar encima del «6»):")
    for estilo in ESTILOS:
        sufijo = ESTILOS[estilo][3]
        f = TTFont(AQUI / f"armonia-serif{sufijo}.ttf")
        gs, cm = f.getGlyphSet(), f.getBestCmap()
        x0, _, x1, techo = caja(gs, cm[ord("6")])
        avance = f["hmtx"][cm[ord("6")]][0]
        m0, n0, m1, _ = caja(gs, cm[CIRCUNFLEJO])
        print(f"  {estilo:12} «6» x {x0 - avance:.0f}..{x1 - avance:.0f} hasta {techo:.0f}"
              f" | ^ x {m0:.0f}..{m1:.0f} desde {n0:.0f}"
              f" | ♯ {'sí' if 0x266F in cm else 'NO'}"
              f" | ↔ {'sí' if DOBLE_FLECHA in cm else 'NO'}"
              f" | 5̸ {'sí' if BARRA in cm and cm[BARRA] == GLIFO_BARRA else 'NO'}"
              f" | ①–⑨ {'sí' if all(0x2460 + n - 1 in cm for n in CIRCULOS) else 'NO'}")


def licencias(carpeta):
    """Junta los dos avisos legales en un fichero, al lado de las fuentes."""
    source = (carpeta / "LICENSE.md").read_text(encoding="utf-8")
    ofl = (LELAND.parent / "OFL-Leland.txt").resolve().read_text(encoding="utf-8")
    destino = AQUI / "LICENCIAS.txt"
    destino.write_text(
        f"Licencias de lo que compone «{FAMILIA}».\n"
        "Lo generado aquí es obra derivada de las dos cosas: se distribuye\n"
        "con los dos avisos y renombrado, como exigen ambas.\n"
        "\n"
        "El cuerpo de la fuente es Source Serif 4 (recortada y con un\n"
        "circunflejo combinante propio para las cifras). Las alteraciones\n"
        "(♭ ♮ ♯ 𝄪 𝄫) son contornos de Leland Text, reescalados.\n"
        "\n"
        "=========================================================\n"
        "1. Source Serif 4 — cuerpo de la fuente\n"
        "=========================================================\n"
        f"\n{source}\n"
        "\n"
        "=========================================================\n"
        "2. Leland Text — solo los glifos de las alteraciones\n"
        "=========================================================\n"
        f"\n{ofl}\n",
        encoding="utf-8")
    print(f"  {destino.name}  {destino.stat().st_size // 1024} kB")


if __name__ == "__main__":
    carpeta = origen()
    for estilo in ESTILOS:
        print(f"{FAMILIA} {estilo}:")
        construir(estilo, carpeta)
    print("Licencias:")
    licencias(carpeta)
    comprobar()
