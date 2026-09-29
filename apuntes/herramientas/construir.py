#!/usr/bin/env python
"""Construye los apuntes: de los ficheros fuente a HTML y PDF.

    python herramientas/construir.py              todo lo que esté desactualizado
    python herramientas/construir.py c4u0         solo esa unidad
    python herramientas/construir.py c3u1-f1      solo esa ficha
    python herramientas/construir.py fichas       solo las fichas
    python herramientas/construir.py ejemplos     solo los SVG
    python herramientas/construir.py --forzar     sin mirar fechas
    python herramientas/construir.py --limpiar    borra build/ y tmp/

El camino es este:

    ejemplos/x.ly  --LilyPond-->  tmp/x.cropped.pdf  --pdftocairo-->
                                                     build/imagenes/x.svg
    c4u0.md        --Pandoc---->  build/c4u0.html
                   --Pandoc + Typst -->  build/c4u0.pdf

y `build/` queda siendo justo lo publicable: los documentos, sus
imágenes y la hoja de estilo, con rutas relativas entre ellos.

Por qué no hay Makefile: `make` no viene con Windows y aquí no está
instalado. Las dependencias que necesitamos son pocas y una de ellas
—qué ejemplos usa cada unidad— se calcula mejor leyendo el Markdown que
declarándola a mano.

Antes de llamar a Pandoc, de cada `.md` se hacen cuatro cosas:

1. **Se quita el bloque de guion**, entre `<!-- guion:inicio -->` y
   `<!-- guion:fin -->`: el esquema de trabajo sirve para escribir, no
   para publicar.
2. **Se quitan los párrafos «Fuentes:»**, por lo mismo: la cita de
   bibliografía es para quien escribe la unidad, no para quien la
   estudia.
3. **Se traducen los `<!-- salto -->`**: salto de página en el PDF y
   raya horizontal en el HTML, que no tiene páginas. Son dos bloques en
   bruto, y cada salida se queda con el suyo.
4. **Se corrige la ruta de los ejemplos.** En el `.md` se escriben como
   `build/imagenes/x.svg`, que es lo que resuelve la vista previa del
   editor; Pandoc corre dentro de `build/`, donde sobra ese prefijo.
   Ahí, y solo ahí, cuadran las rutas para las dos salidas a la vez: el
   HTML referencia `imagenes/x.svg` con `<img src>` (nunca incrustado:
   ver CLAUDE.md) y Typst lo busca desde su propia raíz.

El formato (papel, márgenes, tipografía) está en
`_formato/metadatos.yaml`; lo que declare cada unidad en su cabecera
YAML tiene prioridad sobre ese fichero.

Además de su HTML y su PDF, una unidad puede dar dos cosas más:

- **Ejemplos para clase** (`build/c3u1-ejemplos.pdf`): las figuras
  marcadas `.aula`, en su versión sin análisis, con el mismo número de
  ejemplo que en los apuntes y sitio debajo para anotar. Se enlaza desde
  la unidad y desde el índice.
- **Fichas de ejercicios** (`fichas/c3u1-f1.md` → `build/c3u1-f1.pdf` y
  `build/c3u1-f1-soluciones.pdf`), que no se enlazan desde ningún sitio.
  Ver `documentar_ficha()`.
"""

import datetime
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
BUILD = RAIZ / "build"
IMAGENES = BUILD / "imagenes"
TMP = RAIZ / "tmp"
EJEMPLOS = RAIZ / "ejemplos"
FORMATO = RAIZ / "_formato"

SVG_FIJOS = EJEMPLOS / "svg"
FUENTES = FORMATO / "fuentes"
SITIO = BUILD / "sitio"
PLAN = RAIZ.parent / "curriculum" / "Plan-Armonia.md"

# Fichas de ejercicios: el material en fichas/, la plantilla LilyPond de
# cada tipo en fichas/plantillas/<tipo>.ly, y los tipos —con su
# consigna— en el catálogo de la asignatura, no aquí.
FICHAS = RAIZ / "fichas"
PLANTILLAS = FICHAS / "plantillas"
CATALOGO = RAIZ.parent / "curriculum" / "Ejercicios-papel.md"
FORMATO_FICHAS = RAIZ / "_formato" / "fichas.yaml"   # márgenes propios

# Cifrado de grados: la tabla (qué cifras lleva cada código, V6/5…) es de
# la asignatura, no de los apuntes; la usan el filtro del texto y, vía
# tmp/cifrado.ily, los ejemplos.
CIFRADO = RAIZ.parent / "curriculum" / "cifrado.json"
CIFRADO_LUA = FORMATO / "cifrado.lua"
CIFRADO_ILY = TMP / "cifrado.ily"

# Todo lo que, si cambia, obliga a regrabar los ejemplos: los .ily, la
# tabla de cifrado y la fuente (el texto de las partituras va en ella).
INCLUIDOS = [EJEMPLOS / "comun.ily", EJEMPLOS / "etiquetas.ily", CIFRADO,
             *sorted(FUENTES.glob("*.ttf"))]
METADATOS = FORMATO / "metadatos.yaml"
CSS = FORMATO / "apuntes.css"
TABLAS = FORMATO / "tablas.lua"   # filtro del HTML: tablas desplazables
PDF_TYP = FORMATO / "pdf.typ"     # cabeceras, pies y retoques del PDF
QR = RAIZ.parent / "sitio" / "qr-armonia.svg"   # al pie de la portada del PDF
PLANTILLA = FORMATO / "indice.html"
YO = pathlib.Path(__file__)

# El índice: sus filas salen de las tablas de unidades del plan, y una
# unidad se publica cuando su cabecera YAML lleva `publico: true`.
MARCA_UNIDADES = "<!-- unidades -->"
MARCA_PIE = "<!-- pie -->"
RE_FILA_PLAN = re.compile(
    r"^\|[^|]*\|\s*\*\*UD (\d)\*\*\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|", re.M)
RE_PUBLICO = re.compile(r"^publico:\s*true\b", re.M)
CANDADO = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
           'stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" '
           'height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>')
MARCA_DEV = '<span class="marca-dev" title="No sale al sitio publicado">DEV</span>'

GUION_INICIO = "<!-- guion:inicio -->"
GUION_FIN = "<!-- guion:fin -->"
RE_IMAGEN = re.compile(r"\]\(build/imagenes/([^)\s]+\.svg)")

# Una figura entera: pie, SVG y atributos. Se numeran en el orden del
# texto («Ejemplo 3.») y ese número lo escribe numerar() en el pie, igual
# en el HTML, en el PDF y en los ejemplos para clase: en clase se dice «el
# ejemplo 3» y tiene que ser el mismo en las tres. Por eso la numeración
# automática de Typst está apagada (pdf.typ).
RE_FIGURA = re.compile(
    r"^!\[(?P<pie>.*?)\]\(build/imagenes/(?P<svg>[^)\s]+\.svg)\)\{(?P<attr>[^}]*)\}",
    re.M | re.S)
RE_AULA = re.compile(r"(?:^|\s)\.aula(?:\s|$)")
RE_EPIGRAFE = re.compile(r"^#{2,3} +(.+?)(?:\s*\{[^}]*\})?[ \t]*$", re.M)
# Sitio en blanco bajo cada ejemplo para clase, para anotarlo a mano, y
# escala algo mayor que en los apuntes: es para escribir encima. La caja
# es más ancha (márgenes de 1,5 cm, _formato/ejemplos.yaml), para que un
# ejemplo ancho no tenga que reducirse.
ESPACIO_AULA = "3cm"
ESCALA_AULA = 1.4    # provisional: pendiente de una prueba de impresión
CAJA_AULA_PT = 510   # A4 (595 pt) menos 2 × 1,5 cm
FORMATO_AULA = RAIZ / "_formato" / "ejemplos.yaml"

# Fichas: un ejercicio es un bloque `::: {.ejercicio tipo="…"}` con su
# material en un bloque de código `lilypond` dentro.
RE_EJERCICIO = re.compile(
    r"^:::+[ \t]*\{\.ejercicio\b(?P<attr>[^}]*)\}[ \t]*\n(?P<cuerpo>.*?)^:::+[ \t]*$",
    re.M | re.S)
RE_ATRIBUTO = re.compile(r'([\w-]+)="([^"]*)"')
RE_LILYPOND = re.compile(r"^```[ \t]*lilypond[ \t]*\n(?P<codigo>.*?)^```[ \t]*$", re.M | re.S)
RE_TIPO = re.compile(r"^\|\s*`([a-z0-9-]+)`\s*\|\s*([^|]+?)\s*\|", re.M)
RE_ESPACIO = re.compile(r"^%%\s*espacio:\s*(\S+)", re.M)
# Fragmento opcional de una consigna: `[cadencias: , así como las cadencias]`.
# Sale solo si la ficha lo pide (pide="cadencias"); si no, desaparece.
RE_FRAGMENTO = re.compile(r"\[([\w-]+):([^\]]*)\]")
NOTAS_LY = {"do": "c", "re": "d", "mi": "e", "fa": "f", "sol": "g", "la": "a", "si": "b"}

# Salto: se escribe `<!-- salto -->` en el .md y se cambia por dos
# bloques en bruto, uno por salida; Pandoc usa el de la suya y descarta
# el otro. En el PDF es un salto de página; en el HTML, que no tiene
# páginas, una raya que hace sus veces —la única del documento: entre
# apartados no se pone ninguna—. Un mismo texto vale entonces para las
# dos salidas, sin ramificar `preparar()`.
SALTO = "<!-- salto -->"
SALTO_BRUTO = ("```{=typst}\n#pagebreak()\n```\n\n"
               "```{=html}\n<hr class=\"salto\">\n```")

# Separador: `<!-- separador -->`, tres asteriscos centrados, para lo que
# va al final de una unidad sin ser parte del último epígrafe (un
# fragmento comentado, p. ej.). No es una raya —la única es la del
# salto— ni un epígrafe: no entra en el índice.
SEPARADOR = "<!-- separador -->"
SEPARADOR_BRUTO = ("```{=typst}\n#align(center, block(above: 2em, below: 2em,\n"
                   "  text(fill: rgb(\"#666666\"))[\\* #h(1.2em) \\* #h(1.2em) \\*]))\n```\n\n"
                   "```{=html}\n<p class=\"separador\" aria-hidden=\"true\">"
                   "*&emsp;*&emsp;*</p>\n```")

# `width=auto` en el .md: el ancho lo calcula `anchos_automaticos()` a
# partir del propio SVG, para que el pentagrama salga igual de grande en
# todas las figuras. ESCALA es el aumento sobre el tamaño con que lo
# graba LilyPond, y CAJA_PT el ancho de la caja de texto (A4 con
# márgenes de 3 cm). Subir ESCALA agranda todos los ejemplos a la vez.
ESCALA = 1.3
CAJA_PT = 425
# En el móvil, el porcentaje deja los pentagramas diminutos: es un
# porcentaje de una columna que mide la mitad. Por eso cada figura lleva
# además, solo para el HTML, un ancho mínimo en píxeles a partir de su
# tamaño natural (--ancho-movil, que aplica apuntes.css en pantallas
# estrechas): PX_MOVIL píxeles por punto del SVG, unas tres cuartas
# partes del tamaño en escritorio. La que no cabe se desplaza dentro de
# su figura, no la página entera. Typst ignora el `style`.
PX_MOVIL = 1.6
RE_AUTO = re.compile(r"\]\(build/imagenes/([^)\s]+\.svg)\)(\{[^}]*?)width=auto")
# El ancho del SVG se busca primero en el atributo `width` y, si no está o
# viene en porcentaje, en el tercer número del `viewBox`. Las dos cosas
# hacen falta: cada versión de cairo (la de pdftocairo) escribe la
# cabecera a su manera, y la de Ubuntu no la escribe como la de aquí.
RE_TAG_SVG = re.compile(r"<svg\b[^>]*>", re.S)
RE_ANCHO_SVG = re.compile(r'\bwidth="\s*([0-9.]+)\s*(pt|px)?\s*"')
RE_VIEWBOX = re.compile(r'\bviewBox="\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s')

forzar = False
cobertura = None    # cmap de la fuente, cargado una vez (ver revisar_cobertura)


# --- utilidades ------------------------------------------------------

def caduco(destino, fuentes):
    """¿Falta el destino, o alguna fuente es más reciente?"""
    if forzar or not destino.exists():
        return True
    return any(f.exists() and f.stat().st_mtime > destino.stat().st_mtime for f in fuentes)


def ejecutar(orden, **kwargs):
    """Lanza una orden SIEMPRE desde apuntes/ y con rutas relativas.

    No es manía: la carpeta del proyecto lleva tilde («Armonía») y
    algunas de estas herramientas —pdftocairo, entre otras— no abren
    ficheros cuya ruta absoluta tenga caracteres no ASCII.
    """
    kwargs.setdefault("cwd", RAIZ)
    hecho = subprocess.run([str(x) for x in orden], **kwargs)
    if hecho.returncode:
        sys.exit(f"\nFalló: {' '.join(str(x) for x in orden)}")


def conversor_svg():
    """pdftocairo si está; si no, el pdf2svg.py de al lado (PyMuPDF)."""
    if shutil.which("pdftocairo"):
        return ["pdftocairo", "-svg"]
    return [sys.executable, "herramientas/pdf2svg.py"]


# --- ejemplos musicales ----------------------------------------------

def grabar(ly, nombre=None, sin_analisis=False):
    """Un .ly -> un SVG recortado, `build/imagenes/<nombre>.svg`.

    -dcrop, porque sin él cada ejemplo sale como un A4 entero con dos
    compases en una esquina. Y se pasa por PDF (--pdf) en lugar de usar
    el backend SVG de LilyPond, que no incrusta las fuentes de texto y
    deja los \\markup con tipografía de sustitución.

    Con `sin_analisis`, sale la versión sin las etiquetas de análisis
    (ver «Con y sin análisis» en etiquetas.ily): la de los ejemplos para
    clase y la de los ejercicios sin resolver.
    """
    nombre = nombre or ly.stem
    svg = IMAGENES / f"{nombre}.svg"
    if not caduco(svg, [ly, *INCLUIDOS]):
        return False
    IMAGENES.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(exist_ok=True)
    cifrado_ily()
    entorno = {**os.environ, "ARMONIA_FUENTES": fuentes_para_lilypond()}
    entorno.pop("ARMONIA_SIN_ANALISIS", None)
    if sin_analisis:
        entorno["ARMONIA_SIN_ANALISIS"] = "1"
    # -I tmp: ahí está cifrado.ily, que se genera y no se versiona.
    # -I ../ejemplos: LilyPond se muda a la carpeta de salida (tmp/) antes
    # de buscar los \include, y desde ahí «ejemplos» no existe. A los
    # ejemplos no les afecta (comun.ily está a su lado), pero a los .ly de
    # las fichas, generados en tmp/fichas/, sí.
    ejecutar(["lilypond", "-dcrop", "--pdf", "-I", "ejemplos", "-I", "../ejemplos", "-I", "tmp",
              "-o", f"tmp/{nombre}", ly.relative_to(RAIZ).as_posix()],
             stdout=subprocess.DEVNULL, env=entorno)
    ejecutar([*conversor_svg(), f"tmp/{nombre}.cropped.pdf",
              f"build/imagenes/{svg.name}"],
             stdout=subprocess.DEVNULL)
    print(f"  {svg.relative_to(RAIZ)}")
    return True


def cifrado_ily():
    """curriculum/cifrado.json -> tmp/cifrado.ily, la misma tabla en Scheme.

    LilyPond no lee JSON. Se traduce aquí a una lista de asociación
    (`tablaCifrado`), que usa \\acorde en etiquetas.ily; así los ejemplos
    y el texto salen de la misma tabla. Las claves que empiezan por «_»
    son comentario y no pasan. Solo se escribe si cambia, para no
    regrabar por nada.
    """
    def scheme(valor):
        if isinstance(valor, str):
            return '"' + valor.replace("\\", "\\\\").replace('"', '\\"') + '"'
        if isinstance(valor, list):
            return "(" + " ".join(scheme(v) for v in valor) + ")"
        return "(" + " ".join(f"({scheme(k)} . {scheme(v)})"
                              for k, v in valor.items() if not k.startswith("_")) + ")"
    tabla = json.loads(CIFRADO.read_text(encoding="utf-8"))
    texto = ("%% GENERADO por construir.py desde curriculum/cifrado.json.\n"
             "%% No editar: se sobrescribe en cada compilación.\n"
             f"#(define tablaCifrado '{scheme(tabla)})\n")
    TMP.mkdir(exist_ok=True)
    if not CIFRADO_ILY.exists() or CIFRADO_ILY.read_text(encoding="utf-8") != texto:
        CIFRADO_ILY.write_text(texto, encoding="utf-8")


fuentes_lilypond = None


def fuentes_para_lilypond():
    """Copia los .ttf a una carpeta temporal SIN TILDES y la devuelve.

    LilyPond carga «Armonia Serif» con fontconfig, y fontconfig no abre
    una carpeta cuya ruta absoluta lleve «Armonía»: no da error, sustituye
    la fuente por otra y el ejemplo sale en sans. Pasa igual que con
    pdftocairo (ver ejecutar()). comun.ily lee la carpeta de
    ARMONIA_FUENTES.
    """
    global fuentes_lilypond
    if fuentes_lilypond is None:
        destino = pathlib.Path(tempfile.gettempdir()) / "armonia-fuentes-lilypond"
        if not str(destino).isascii():
            print(f"  AVISO: {destino} lleva caracteres no ASCII; "
                  "LilyPond puede no encontrar la fuente")
        destino.mkdir(parents=True, exist_ok=True)
        for f in sorted(FUENTES.glob("*.ttf")):
            if caduco(destino / f.name, [f]):
                shutil.copy2(f, destino / f.name)
        fuentes_lilypond = str(destino)
    return fuentes_lilypond


def copiar_svg(svg):
    """Un SVG dibujado a mano -> build/imagenes/, sin pasar por LilyPond.

    No todo ejemplo es una partitura: el circulo de 5.as, por ejemplo,
    es un diagrama. Esos viven en ejemplos/svg/ —dentro del repo, porque
    no se regeneran— y desde el .md se referencian igual que los demas.
    """
    destino = IMAGENES / svg.name
    if not caduco(destino, [svg]):
        return False
    IMAGENES.mkdir(parents=True, exist_ok=True)
    shutil.copy2(svg, destino)
    print(f"  {destino.relative_to(RAIZ)}")
    return True


def grabar_todos(unidad=None):
    usados = ejemplos_de(unidad) if unidad else None
    mds = [RAIZ / f"{unidad}.md"] if unidad else unidades()
    aula = {f["svg"] for md in mds for f in figuras_aula(md)}
    hechos = 0
    for ly in sorted(EJEMPLOS.glob("*.ly")):
        if usados is None or f"{ly.stem}.svg" in usados:
            hechos += grabar(ly)
        if f"{ly.stem}.svg" in aula:
            hechos += grabar(ly, f"{ly.stem}-aula", sin_analisis=True)
    for svg in sorted(SVG_FIJOS.glob("*.svg")):
        if usados is None or svg.name in usados:
            hechos += copiar_svg(svg)
    return hechos


# --- texto ------------------------------------------------------------

def ejemplos_de(unidad):
    return set(RE_IMAGEN.findall((RAIZ / f"{unidad}.md").read_text(encoding="utf-8")))


def figuras(texto):
    """Las figuras del texto, en orden y con el número que les toca.

    Cada una con su número, su SVG, sus atributos y el epígrafe (## o
    ###) bajo el que cae, que es lo que la sitúa en los ejemplos para
    clase. El texto tiene que llegar ya sin guion: en el guion puede
    haber imágenes que no cuentan.
    """
    lista = []
    for n, m in enumerate(RE_FIGURA.finditer(texto), 1):
        previos = list(RE_EPIGRAFE.finditer(texto, 0, m.start()))
        epigrafe = previos[-1].group(1) if previos else ""
        # Tras un separador, la figura ya no es de ese epígrafe (ver SEPARADOR).
        if previos and SEPARADOR in texto[previos[-1].end():m.start()]:
            epigrafe = ""
        lista.append({"n": n, "svg": m.group("svg"), "attr": m.group("attr"),
                      "epigrafe": epigrafe})
    return lista


def figuras_aula(md):
    """Las figuras de una unidad marcadas `.aula`, para los ejemplos para clase."""
    texto = sin_fuentes(sin_guion(md.read_text(encoding="utf-8")))
    return [f for f in figuras(texto) if RE_AULA.search(f["attr"])]


def svg_aula(svg):
    """La versión sin análisis de un ejemplo; si no sale de un .ly
    (un diagrama de ejemplos/svg/), no la hay y vale el mismo."""
    stem = svg[:-len(".svg")]
    return f"{stem}-aula.svg" if (EJEMPLOS / f"{stem}.ly").exists() else svg


def numerar(texto):
    """«Ejemplo N.» al principio de cada pie de figura (ver RE_FIGURA)."""
    n = 0

    def uno(m):
        nonlocal n
        n += 1
        return (f"![**Ejemplo {n}.** {m.group('pie')}]"
                f"(build/imagenes/{m.group('svg')}){{{m.group('attr')}}}")
    return RE_FIGURA.sub(uno, texto)


def sin_guion(texto):
    while GUION_INICIO in texto:
        i = texto.index(GUION_INICIO)
        j = texto.find(GUION_FIN, i)
        if j < 0:
            sys.exit(f"Falta {GUION_FIN} (abierto en la línea "
                     f"{texto[:i].count(chr(10)) + 1})")
        texto = texto[:i] + texto[j + len(GUION_FIN):]
    return texto


def sin_fuentes(texto):
    """Quita los párrafos que empiezan por «Fuentes:».

    La cita de bibliografía es para quien escribe la unidad, no para
    quien la estudia: al alumno no le dice nada y le distrae de lo que
    va detrás (los «→ 3.º UD n», que sí le sirven). Se queda en el
    fuente y se cae al publicar, igual que el bloque de guion.
    """
    fuera = []
    dentro = False
    for linea in texto.splitlines(keepends=True):
        if linea.startswith("Fuentes:"):
            dentro = True
        elif dentro and not linea.strip():
            dentro = False
            continue          # también la línea en blanco que lo cerraba
        if not dentro:
            fuera.append(linea)
    return "".join(fuera)


def cabecera_svg(svg):
    """La etiqueta <svg ...> del fichero, para poder enseñarla al fallar."""
    tag = RE_TAG_SVG.search(svg.read_text(encoding="utf-8", errors="replace"))
    return tag.group(0)[:200] if tag else "(no tiene etiqueta <svg>)"


def ancho_svg(svg):
    """El ancho del SVG en puntos, o None si no hay manera de saberlo.

    No se puede dar por buena la cabecera que escribe un pdftocairo
    concreto: la versión de esta máquina pone `width="171pt"` y la de
    Ubuntu, donde corre el flujo de publicación, no. Así que se mira el
    atributo `width` y, si falta o viene en porcentaje, el `viewBox`,
    cuyo tercer número es el ancho. Como el SVG viene de recortar un PDF,
    sus unidades de usuario son puntos y las dos vías dan lo mismo.
    """
    tag = RE_TAG_SVG.search(svg.read_text(encoding="utf-8", errors="replace"))
    if not tag:
        return None
    for expresion in (RE_ANCHO_SVG, RE_VIEWBOX):
        hallazgo = expresion.search(tag.group(0))
        if hallazgo:
            return float(hallazgo.group(1))
    return None


def anchos_automaticos(texto, md):
    """Sustituye cada `width=auto` por el porcentaje que le toca.

    El pentagrama tiene que salir igual de grande en todas las figuras,
    y eso no depende del hueco que ocupe la figura sino del tamaño con
    que LilyPond la grabó: una fila de cuatro cadencias necesita el
    ancho entero de la caja para que sus pentagramas midan lo mismo que
    los de un ejemplo de dos acordes.

    Se calculaba a mano y se pudría a la primera: al rehacer un ejemplo
    cambia el ancho del SVG, el porcentaje se queda apuntando al viejo y
    la figura sale a destiempo —diminuta o enorme— sin que nada avise.
    Ahora se lee del SVG en cada compilación.

    Un SVG sin ancho en puntos (los dibujados a mano, que no son
    partituras y no tienen «tamaño natural») no entra aquí: esos llevan
    su `width` puesto a ojo en el .md, que es lo único que cabe hacer.
    """
    def ancho(m):
        svg = IMAGENES / m.group(1)
        puntos = puntos_svg(svg, md)
        return (f"{m.group(0)[:-len('width=auto')]}width={porcentaje(puntos)}% "
                f'style="--ancho-movil:{round(PX_MOVIL * puntos)}px"')
    return RE_AUTO.sub(ancho, texto)


def puntos_svg(svg, md):
    puntos = ancho_svg(svg)
    if puntos is None:
        sys.exit(f"{md.name}: no leo el ancho de {svg.name}, así que "
                 f"`width=auto` no vale; ponle un `width=N%` a ojo.\n"
                 f"  su cabecera es: {cabecera_svg(svg)}")
    return puntos


def porcentaje(puntos, escala=ESCALA, caja=CAJA_PT):
    """El ancho de una figura en % de la caja, a escala común (ESCALA)."""
    return round(min(escala * puntos / caja, 1.0) * 100)


def imagen_typst(svg, md, escala=ESCALA, caja=CAJA_PT):
    """Una imagen centrada, en typst en bruto, para lo que solo es PDF
    (ejemplos para clase y fichas)."""
    return (f'```{{=typst}}\n#align(center, image("imagenes/{svg}", '
            f"width: {porcentaje(puntos_svg(IMAGENES / svg, md), escala, caja)}%))\n```\n")


def preparar(md):
    texto = sin_fuentes(sin_guion(md.read_text(encoding="utf-8")))
    texto = numerar(texto)
    texto = texto.replace(SALTO, SALTO_BRUTO).replace(SEPARADOR, SEPARADOR_BRUTO)
    texto = anchos_automaticos(texto, md)
    return texto.replace("build/imagenes/", "imagenes/")


def copiar_fuentes():
    """Los woff2 al lado del HTML; el CSS los pide por ruta relativa."""
    destino = BUILD / "fuentes"
    destino.mkdir(parents=True, exist_ok=True)
    for f in sorted(FUENTES.glob("*.woff2")):
        if caduco(destino / f.name, [f]):
            shutil.copy2(f, destino / f.name)


def revisar_cobertura(texto, md):
    """Avisa si el texto usa algo que no esté en la fuente.

    «Armonia Serif» va recortada a lo que se usa en un apunte (ver
    _formato/fuentes/regenerar.py). Un carácter fuera de ese recorte no
    rompe la compilación: sale un hueco, o el cuadradito del sustituto,
    y eso se cuela con facilidad. Mejor decirlo aquí.
    """
    global cobertura
    if cobertura is None:
        try:
            from fontTools.ttLib import TTFont
        except ImportError:
            cobertura = False      # sin fontTools no se comprueba, y ya está
            return
        cobertura = set(TTFont(FUENTES / "armonia-serif.ttf").getBestCmap())
    if cobertura is False:
        return
    fuera = sorted({c for c in texto if ord(c) not in cobertura and c not in "\n\t"})
    if fuera:
        detalle = ", ".join(f"{c!r} (U+{ord(c):04X})" for c in fuera)
        print(f"  AVISO: {md.name} usa caracteres que la fuente no trae: {detalle}")
        print("         añádelos a RANGOS en _formato/fuentes/regenerar.py")


def pandoc(texto, salida, extra, indice=True):
    BUILD.mkdir(exist_ok=True)
    # toc-depth=3 llega hasta los «1.1»: en una unidad larga, un índice
    # de cuatro entradas no sirve para orientarse.
    ejecutar(["pandoc", "--from=markdown", "--standalone",
              *(["--toc", "--toc-depth=3"] if indice else []),
              f"--metadata-file=../_formato/{METADATOS.name}",
              "--output", salida.name, *extra],
             input=texto.encode("utf-8"), cwd=BUILD)
    print(f"  {salida.relative_to(RAIZ)} ({salida.stat().st_size // 1024} kB)")


def envoltorio(md):
    """Lo que rodea al documento en el HTML: cabecera entintada y hoja.

    Dos cosas a la vez, y por eso va en un solo sitio:

    - La **cabecera verde**, con la vuelta al índice y la descarga del
      PDF dentro. Es la misma banda que llevan la portada, el menú de
      ejercicios y cada ejercicio; sin ella, la unidad era la única
      página del sitio que aparecía sin tintar.
    - La **hoja**, un `<div>` que envuelve todo el documento. Hace falta
      para lo anterior: la columna de texto no puede seguir siendo el
      `<body>`, porque entonces la banda no puede ir a sangre. Con la
      hoja, el ancho de lectura es suyo y la banda ocupa el ancho entero.

    Va por `--include-before-body` / `--include-after-body` porque la
    plantilla de Pandoc los pone por fuera del título y del índice del
    documento; un bloque en bruto dentro del texto caería detrás.

    Solo en el HTML: el PDF ya es el fichero que se descargaría, y no
    tiene índice de apuntes al que volver.
    """
    TMP.mkdir(exist_ok=True)
    # Los ejemplos para clase, si la unidad marca alguno (ver documentar_aula).
    ejemplos = (f'  <a class="pdf" href="{md.stem}-ejemplos.pdf">Ejemplos para clase</a>\n'
                if figuras_aula(md) else "")
    trozos = {
        "before": ('<header class="masthead">\n'
                   '  <a class="back" href="index.html">← Apuntes</a>\n'
                   f'  <a class="pdf" href="{md.stem}.pdf">Descargar en PDF</a>\n'
                   f'{ejemplos}'
                   '</header>\n'
                   '<div class="hoja">\n'),
        "after": f'</div>\n<footer class="pie">{pie_html()}</footer>\n',
    }
    opciones = []
    for donde, contenido in trozos.items():
        fichero = TMP / f"{donde}-{md.stem}.html"
        fichero.write_text(contenido, encoding="utf-8")
        opciones.append(f"--include-{donde}-body=../{fichero.relative_to(RAIZ).as_posix()}")
    return opciones


def documentar(md):
    """Un .md -> su HTML y su PDF, si alguno de los dos está caduco."""
    svgs = [IMAGENES / n for n in ejemplos_de(md.stem)]
    fuentes = sorted(FUENTES.glob("*"))
    comunes = [md, METADATOS, YO, *svgs, *fuentes]
    hechos = 0

    texto = preparar(md)
    revisar_cobertura(texto, md)

    html = BUILD / f"{md.stem}.html"
    if caduco(html, [*comunes, CSS, TABLAS, CIFRADO, CIFRADO_LUA]):
        shutil.copy2(CSS, BUILD / CSS.name)
        copiar_fuentes()
        pandoc(texto, html, [f"--css={CSS.name}", *envoltorio(md),
                             f"--lua-filter=../{TABLAS.relative_to(RAIZ).as_posix()}",
                             f"--lua-filter=../{CIFRADO_LUA.relative_to(RAIZ).as_posix()}"])
        hechos += 1

    pdf = BUILD / f"{md.stem}.pdf"
    if caduco(pdf, [*comunes, PDF_TYP, QR, CIFRADO, CIFRADO_LUA]):
        pandoc(texto, pdf, [*opciones_typst(), *portada_pdf(md)])
        hechos += 1
    return hechos + documentar_aula(md)


def opciones_typst():
    # --font-path: «Armonia Serif» no está instalada en el sistema,
    # vive en el repo y solo la ve quien compila esto.
    return ["--pdf-engine=typst",
            f"--pdf-engine-opt=--font-path=../{FUENTES.relative_to(RAIZ).as_posix()}",
            f"--lua-filter=../{CIFRADO_LUA.relative_to(RAIZ).as_posix()}"]


def cabecera_yaml(title, subtitle):
    def cadena(texto):
        return '"' + texto.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return f"---\ntitle: {cadena(title)}\nsubtitle: {cadena(subtitle)}\n---\n\n"


def documentar_aula(md):
    """Los ejemplos para clase de una unidad -> build/<unidad>-ejemplos.pdf.

    Son las figuras marcadas `.aula`, para que el alumno las traiga
    impresas sin imprimir los apuntes enteros: cada una en su versión sin
    análisis (el análisis es lo que se hace en clase), con el mismo número
    de ejemplo que en los apuntes, el epígrafe del que sale y sitio debajo
    para anotar. Sin pie: el pie explica lo que hay que ver, y eso es
    justo lo que se busca en clase.

    Solo PDF: es para imprimir. Si la unidad ya no marca ninguna figura,
    se borra el que hubiera, para no dejar un enlace a algo caducado.
    """
    pdf = BUILD / f"{md.stem}-ejemplos.pdf"
    marcadas = figuras_aula(md)
    if not marcadas:
        if pdf.exists():
            pdf.unlink()
        return 0
    svgs = [IMAGENES / svg_aula(f["svg"]) for f in marcadas]
    if not caduco(pdf, [md, METADATOS, FORMATO_AULA, YO, PDF_TYP, QR, CIFRADO_LUA, *svgs,
                        *sorted(FUENTES.glob("*"))]):
        return 0
    subtitulo = "Ejemplos para clase"
    partes = [cabecera_yaml(dato("title", md, defecto=md.stem), subtitulo)]
    for f in marcadas:
        epigrafe = f" · {f['epigrafe']}" if f["epigrafe"] else ""
        partes.append(f"## Ejemplo {f['n']}{epigrafe} {{.unnumbered .unlisted}}\n\n"
                      f"{imagen_typst(svg_aula(f['svg']), md, ESCALA_AULA, CAJA_AULA_PT)}\n"
                      f"```{{=typst}}\n#v({ESPACIO_AULA})\n```\n")
    pandoc("\n".join(partes), pdf,
           [*opciones_typst(),
            # después de metadatos.yaml, así que sus márgenes ganan
            f"--metadata-file=../_formato/{FORMATO_AULA.name}",
            *portada_pdf(md, nombre=pdf.stem, subtitulo=subtitulo)],
           indice=False)
    return 1


# --- el índice y la carpeta publicable --------------------------------

def unidades_del_plan():
    """Las unidades de cada curso, tal como las declara el plan.

    `curriculum/Plan-Armonia.md` es la fuente de verdad de la asignatura
    (ver el CLAUDE.md de la raíz), así que los títulos se leen de sus
    tablas y no se copian aquí: el índice enseña las catorce unidades
    aunque casi ninguna esté escrita todavía, y ninguna se queda con un
    nombre distinto del que tiene en el plan.
    """
    if not PLAN.exists():
        sys.exit(f"No encuentro {PLAN}; el índice sale de sus tablas")
    texto = PLAN.read_text(encoding="utf-8")
    cursos = []
    for curso in ("3", "4"):
        marca = f"### Curso {curso}.º"
        if marca not in texto:
            sys.exit(f"{PLAN.name} no trae «{marca}»")
        i = texto.index(marca)
        j = texto.find("###", i + len(marca))
        filas = RE_FILA_PLAN.findall(texto[i:j if j > 0 else len(texto)])
        if not filas:
            sys.exit(f"{PLAN.name}: no leo ninguna unidad de {curso}.º")
        cursos.append((curso, filas))
    return cursos


# --- autoría y contexto ------------------------------------------------

def dato(clave, fichero=METADATOS, defecto=None):
    """Un `clave: "valor"` de una cabecera YAML, sin cargar YAML.

    Vale para metadatos.yaml (autoría, licencia…) y para la cabecera de
    una unidad (title, subtitle). Solo valores de una línea y entre
    comillas, que es como están escritos: si alguno deja de estarlo, se
    para aquí en vez de salir un PDF sin autor.
    """
    m = re.search(rf'^{re.escape(clave)}:\s*"(.*)"\s*$',
                  fichero.read_text(encoding="utf-8"), re.M)
    if not m and defecto is not None:
        return defecto
    if not m:
        sys.exit(f'{fichero.name}: falta «{clave}: "…"»')
    return m.group(1)


def curso_academico(hoy=None):
    """«2026–27»: de septiembre en adelante, el curso que empieza."""
    hoy = hoy or datetime.date.today()
    inicio = hoy.year if hoy.month >= 9 else hoy.year - 1
    return f"{inicio}–{(inicio + 1) % 100:02d}"


def portada_pdf(md, nombre=None, subtitulo=None, despues="", autoria=True):
    """Opciones de Pandoc para la portada y las cabeceras del PDF.

    Escribe dos ficheros typst en tmp/: la cabecera —`datos` con la
    autoría y los títulos, y detrás _formato/pdf.typ, que los usa— y el
    principio del cuerpo, que pone la línea de autoría bajo el título.
    El QR se copia junto a las imágenes, que es donde lo busca Typst.

    Va por -H y no por `header-includes` en metadatos.yaml porque Pandoc
    no suma los dos: con -H, el del YAML desaparece sin avisar.

    `nombre` y `subtitulo` son para los PDF que no son la unidad misma
    (ejemplos para clase, fichas); `despues`, typst que va tras la
    autoría (la línea de nombre y fecha de una ficha). Sin `autoria`, no
    va la línea de autoría bajo el título: una ficha tiene que caber en
    una hoja, y la autoría ya está al pie.
    """
    nombre = nombre or md.stem
    def cadena(texto):
        return '"' + texto.replace("\\", "\\\\").replace('"', '\\"') + '"'
    datos = {
        "contexto": dato("contexto"),
        "autoria": dato("autoria"),
        "derechos": dato("derechos"),
        "licencia": dato("licencia"),
        "licencia-url": dato("licencia-url"),
        "web": dato("web"),
        "curso": curso_academico(),
        # Las unidades que aún son guion no tienen cabecera YAML.
        "corto": f"Armonía · {dato('title', md, defecto=md.stem)}",
        "subtitulo": subtitulo if subtitulo is not None else dato("subtitle", md, defecto=""),
    }
    TMP.mkdir(exist_ok=True)
    IMAGENES.mkdir(parents=True, exist_ok=True)
    shutil.copy2(QR, IMAGENES / QR.name)
    cabecera = TMP / f"cabecera-{nombre}.typ"
    cabecera.write_text(
        "#let datos = (\n"
        + "".join(f"  {k}: {cadena(v)},\n" for k, v in datos.items())
        + ")\n\n" + PDF_TYP.read_text(encoding="utf-8"),
        encoding="utf-8")
    antes = TMP / f"antes-{nombre}.typ"
    antes.write_text(("#autoria()\n" if autoria else "") + despues, encoding="utf-8")
    return [f"--include-in-header=../{cabecera.relative_to(RAIZ).as_posix()}",
            f"--include-before-body=../{antes.relative_to(RAIZ).as_posix()}"]


def pie_html():
    """El pie de las páginas de apuntes (unidades e índice).

    El mismo texto que el de la portada y el menú de la app, que lo
    llevan escrito a mano (ver metadatos.yaml). En la web la autoría va
    aquí y no bajo el título: es de todo el sitio, no de cada unidad.
    """
    return (f'{dato("derechos")} · {dato("centro")} · '
            f'<a href="{dato("licencia-url")}" rel="license">{dato("licencia")}</a>')


def es_publica(md):
    """¿Lleva `publico: true` en su cabecera YAML?

    Igual que `publico:true` en app/public/curriculum-data.js: qué ve el
    alumnado es un dato, no una consecuencia de que el fichero exista.
    Una unidad puede estar escrita y compilándose sin salir al sitio.
    """
    cabecera = md.read_text(encoding="utf-8").split("---", 2)
    return len(cabecera) > 2 and RE_PUBLICO.search(cabecera[1]) is not None


def indice(destino, solo_publicas):
    """Escribe el índice de unidades en `destino`.

    Se genera dos veces y por eso lleva `solo_publicas`: el de
    `build/sitio/` es el que ven los alumnos y solo lista lo publicado;
    el de `build/` es el de trabajo, lista todo lo compilado y marca con
    DEV lo que aún no sale. Es la misma distinción que hace la app entre
    su copia pública y la de desarrollo.
    """
    hechas = {p.stem: p for p in unidades() if (BUILD / f"{p.stem}.html").exists()}
    partes = []
    for curso, filas in unidades_del_plan():
        partes.append(f'<section class="curso">\n'
                      f'  <h2>Curso {curso}.º</h2>')
        for numero, titulo, nota in filas:
            md = hechas.get(f"c{curso}u{numero}")
            publica = md is not None and es_publica(md)
            if md is None or (solo_publicas and not publica):
                estado = f'{CANDADO}En preparación'
                titulo_html = titulo
                clase = ""
            else:
                # El título también enlaza: en el móvil el par «Leer · PDF»
                # queda debajo y en pequeño, y el blanco grande al que se
                # tira a tocar es el título.
                estado = (f'<a href="c{curso}u{numero}.html">Leer</a>'
                          f'<a class="pdf" href="c{curso}u{numero}.pdf">PDF</a>')
                if (BUILD / f"c{curso}u{numero}-ejemplos.pdf").exists():
                    estado += (f'<a class="pdf" href="c{curso}u{numero}-ejemplos.pdf"'
                               ' title="Los ejemplos que se analizan en clase, para imprimir">'
                               'Ejemplos</a>')
                titulo_html = f'<a href="c{curso}u{numero}.html">{titulo}</a>'
                clase = " lista"
            # DEV marca lo compilado que aún no sale; lo que no existe
            # todavía no está pendiente de publicar, está sin escribir.
            marca = MARCA_DEV if md is not None and not publica and not solo_publicas else ""
            partes.append(
                f'  <div class="ud-row{clase}">\n'
                f'    <div class="num">{numero}</div>\n'
                f'    <div><div class="titulo">{titulo_html}{marca}</div>\n'
                f'         <div class="nota">{nota}</div></div>\n'
                f'    <div class="estado">{estado}</div>\n'
                f'  </div>')
        partes.append('</section>')

    plantilla = PLANTILLA.read_text(encoding="utf-8")
    if MARCA_UNIDADES not in plantilla:
        sys.exit(f"{PLANTILLA.name} ya no trae la marca «{MARCA_UNIDADES}»")
    if MARCA_PIE not in plantilla:
        sys.exit(f"{PLANTILLA.name} ya no trae la marca «{MARCA_PIE}»")
    destino.write_text(plantilla.replace(MARCA_UNIDADES, "\n".join(partes))
                                .replace(MARCA_PIE, pie_html()),
                       encoding="utf-8")
    print(f"  {destino.relative_to(RAIZ)}")


def montar_sitio():
    """Reúne en build/sitio/ lo publicable, y solo eso.

    `build/` es el resultado de compilar todo, incluidas las unidades a
    medias; `build/sitio/` es el subconjunto que se publica, que es lo
    que recoge sitio/montar.sh. Separarlos permite compilar y revisar una
    unidad sin que se le aparezca a nadie.
    """
    SITIO.mkdir(parents=True, exist_ok=True)
    publicas = [p for p in unidades()
                if (BUILD / f"{p.stem}.html").exists() and es_publica(p)]
    if not publicas:
        print("  (ninguna unidad lleva `publico: true`: sitio/ queda sin unidades)")

    usados = set()
    for md in publicas:
        usados |= ejemplos_de(md.stem)
        for ext in ("html", "pdf"):
            shutil.copy2(BUILD / f"{md.stem}.{ext}", SITIO / f"{md.stem}.{ext}")
        print(f"  {(SITIO / md.stem).relative_to(RAIZ)}.html + .pdf")
        ejemplos = BUILD / f"{md.stem}-ejemplos.pdf"
        if ejemplos.exists():
            shutil.copy2(ejemplos, SITIO / ejemplos.name)
            print(f"  {(SITIO / ejemplos.name).relative_to(RAIZ)}")
        elif (SITIO / ejemplos.name).exists():
            (SITIO / ejemplos.name).unlink()

    (SITIO / "imagenes").mkdir(exist_ok=True)
    for nombre in sorted(usados):
        shutil.copy2(IMAGENES / nombre, SITIO / "imagenes" / nombre)
    (SITIO / "fuentes").mkdir(exist_ok=True)
    for f in sorted(FUENTES.glob("*.woff2")):
        shutil.copy2(f, SITIO / "fuentes" / f.name)
    shutil.copy2(CSS, SITIO / CSS.name)

    indice(SITIO / "index.html", solo_publicas=True)
    indice(BUILD / "index.html", solo_publicas=False)
    return 1


# --- fichas de ejercicios ---------------------------------------------

def tipos_de_ejercicio():
    """{id: consigna}, de la tabla de curriculum/Ejercicios-papel.md.

    Los tipos son de la asignatura, no de los apuntes (sobrevivirían a
    ellos), así que se leen de allí, como las unidades del plan: una
    ficha no puede usar un tipo que el catálogo no defina.
    """
    if not CATALOGO.exists():
        sys.exit(f"No encuentro {CATALOGO}; los tipos de ejercicio salen de ahí")
    tipos = dict(RE_TIPO.findall(CATALOGO.read_text(encoding="utf-8")))
    if not tipos:
        sys.exit(f"{CATALOGO.name}: no leo ningún tipo de ejercicio")
    return tipos


def tonalidad_ly(tono, ficha):
    """«Sol mayor» -> «\\key g \\major»; sin tono, nada."""
    if not tono:
        return ""
    m = re.fullmatch(r"(do|re|mi|fa|sol|la|si)\s*([♯♭]?)\s+(mayor|menor)", tono.strip().lower())
    if not m:
        sys.exit(f'{ficha.name}: no entiendo la tonalidad «{tono}» (p. ej. "Fa♯ menor")')
    nota = NOTAS_LY[m.group(1)] + {"♯": "s", "♭": "f", "": ""}[m.group(2)]
    return f"\\key {nota} \\{'major' if m.group(3) == 'mayor' else 'minor'}"


def consigna_de(modelo, atributos, donde):
    """La consigna de un ejercicio, a partir de la de su tipo en el catálogo.

    Tres cosas, en este orden:

    - `consigna="…"` en el bloque de la ficha la sustituye entera: para
      el caso raro que no encaja en el catálogo.
    - Los fragmentos opcionales, `[nombre: texto]`, salen si la ficha los
      pide (`pide="cadencias grados-bajo"`) y si no desaparecen. Así un
      mismo tipo vale para unidades que piden más o menos cosas (señalar
      las cadencias, cuando ya se han visto) sin duplicar filas en el
      catálogo. El texto va tal cual, salvo un espacio tras los dos puntos.
    - `{atributo}` se cambia por el del bloque: `{tono}`.

    Pedir un fragmento que el tipo no tiene es casi seguro una errata, y
    se para aquí.
    """
    if "consigna" in atributos:
        return atributos["consigna"]
    pedidos = set(atributos.get("pide", "").split())
    existentes = {nombre for nombre, _ in RE_FRAGMENTO.findall(modelo)}
    if pedidos - existentes:
        sys.exit(f"{donde}: pide {', '.join(sorted(pedidos - existentes))}, "
                 f"que la consigna del tipo no tiene (tiene: {', '.join(sorted(existentes)) or 'nada'})")

    def fragmento(m):
        texto = m.group(2)[1:] if m.group(2).startswith(" ") else m.group(2)
        return texto if m.group(1) in pedidos else ""
    consigna = RE_FRAGMENTO.sub(fragmento, modelo)
    return re.sub(r"\{(\w+)\}", lambda x: atributos.get(x.group(1), x.group(0)), consigna)


def escribir_si_cambia(fichero, texto):
    """Así la fecha del fichero solo cambia si cambia él, y no se regraba por nada."""
    fichero.parent.mkdir(parents=True, exist_ok=True)
    if not fichero.exists() or fichero.read_text(encoding="utf-8") != texto:
        fichero.write_text(texto, encoding="utf-8")


def documentar_ficha(ficha):
    """Una ficha -> build/<ficha>.pdf y build/<ficha>-soluciones.pdf.

    La ficha es Markdown con su cabecera YAML, y cada ejercicio un bloque

        ::: {.ejercicio tipo="grados-bajo-cifrado" tono="Sol mayor"}
        ```lilypond
        arriba = { … }
        abajo = { … }
        ```
        Texto opcional, que sigue a la consigna.
        :::

    El tipo tiene que estar en el catálogo (curriculum/Ejercicios-papel.md),
    que da la consigna —con {tono} y cualquier otro atributo sustituidos—,
    y en fichas/plantillas/<tipo>.ly, que es la partitura con dos huecos:
    %%TONALIDAD%% y %%MATERIAL%%. El material lleva la solución dentro,
    como análisis (\\acorde, \\gradoBajo, \\encima, \\analitico): de un
    mismo .ly salen el ejercicio, grabado sin análisis (con rayas donde
    va la respuesta), y la solución, con él. Una sola fuente, y la
    solución no puede desencajarse del ejercicio.

    Solo PDF, y sin enlazar desde la web: las fichas se reparten en
    clase. Un `obra="…"` en el bloque pone la referencia de un fragmento.
    """
    catalogo = tipos_de_ejercicio()
    texto = sin_fuentes(sin_guion(ficha.read_text(encoding="utf-8")))
    hechos = 0
    trozos = []
    svgs = []
    dependencias = [ficha, CATALOGO, METADATOS, FORMATO_FICHAS, YO, PDF_TYP, QR, CIFRADO_LUA,
                    *sorted(FUENTES.glob("*"))]
    pos = 0
    for k, m in enumerate(RE_EJERCICIO.finditer(texto), 1):
        trozos.append(texto[pos:m.start()])
        pos = m.end()
        atributos = dict(RE_ATRIBUTO.findall(m.group("attr")))
        tipo = atributos.get("tipo")
        if tipo not in catalogo:
            sys.exit(f"{ficha.name}, ejercicio {k}: el tipo «{tipo}» no está en "
                     f"{CATALOGO.name} ({', '.join(catalogo)})")
        plantilla = PLANTILLAS / f"{tipo}.ly"
        if not plantilla.exists():
            sys.exit(f"{ficha.name}, ejercicio {k}: falta la plantilla {plantilla.relative_to(RAIZ)}")
        codigo = RE_LILYPOND.search(m.group("cuerpo"))
        if not codigo:
            sys.exit(f"{ficha.name}, ejercicio {k}: falta el bloque ```lilypond con el material")
        nota = RE_LILYPOND.sub("", m.group("cuerpo")).strip()
        consigna = consigna_de(catalogo[tipo], atributos, f"{ficha.name}, ejercicio {k}")

        modelo = plantilla.read_text(encoding="utf-8")
        espacio = RE_ESPACIO.search(modelo)
        ly = TMP / "fichas" / f"{ficha.stem}-{k}.ly"
        escribir_si_cambia(ly, modelo
                           .replace("%%TONALIDAD%%", tonalidad_ly(atributos.get("tono"), ficha))
                           .replace("%%MATERIAL%%", codigo.group("codigo")))
        nombre = f"{ficha.stem}-{k}"
        hechos += grabar(ly, nombre, sin_analisis=True)
        hechos += grabar(ly, f"{nombre}-sol")
        svgs += [IMAGENES / f"{nombre}.svg", IMAGENES / f"{nombre}-sol.svg"]
        dependencias.append(plantilla)
        trozos.append({"k": k, "consigna": consigna, "nota": nota,
                       "obra": atributos.get("obra"), "nombre": nombre,
                       "espacio": espacio.group(1) if espacio else "1cm"})
    trozos.append(texto[pos:])
    if not svgs:
        print(f"  AVISO: {ficha.name} no tiene ningún bloque .ejercicio")

    titulo = dato("title", ficha, defecto=ficha.stem)
    subtitulo = dato("subtitle", ficha, defecto="")
    # Nombre y fecha, solo en la que se reparte.
    linea = ("#v(0.4em)\n#grid(columns: (auto, 1fr, auto, 3.5cm), column-gutter: 0.5em,\n"
             "  align: bottom, [Nombre], line(length: 100%, stroke: 0.4pt),\n"
             "  [Fecha], line(length: 100%, stroke: 0.4pt))\n#v(0.2em)\n")
    for sufijo, solucion in (("", False), ("-soluciones", True)):
        pdf = BUILD / f"{ficha.stem}{sufijo}.pdf"
        if not caduco(pdf, [*dependencias, *svgs]):
            continue
        partes = []
        for trozo in trozos:
            if isinstance(trozo, str):
                partes.append(trozo)
                continue
            svg = f"{trozo['nombre']}{'-sol' if solucion else ''}.svg"
            obra = f"*{trozo['obra']}*\n\n" if trozo["obra"] else ""
            # Todo el ejercicio en un bloque que no se parte: la consigna
            # en una página y la partitura en la siguiente no sirven. El
            # espacio para escribir va fuera del bloque: al pie de una
            # página Typst lo descarta, y no empuja el ejercicio a la otra.
            partes.append(f"```{{=typst}}\n#block(breakable: false)[\n```\n\n"
                          f"## Ejercicio {trozo['k']} {{.unnumbered .unlisted}}\n\n"
                          f"{obra}{trozo['consigna']} {trozo['nota']}\n\n"
                          f"{imagen_typst(svg, ficha)}\n"
                          f"```{{=typst}}\n]\n#v({trozo['espacio']})\n```\n\n")
        md = "".join(partes)
        revisar_cobertura(md, ficha)
        sub = f"{subtitulo} · Soluciones" if solucion else subtitulo
        pandoc(md, pdf,
               [*opciones_typst(), f"--metadata=subtitle:{sub}",
                # después de metadatos.yaml, así que lo que declara gana
                f"--metadata-file=../_formato/{FORMATO_FICHAS.name}",
                *portada_pdf(ficha, nombre=pdf.stem, subtitulo=sub,
                             despues="" if solucion else linea, autoria=False)],
               indice=False)
        hechos += 1
    return hechos


def fichas():
    return sorted(FICHAS.glob("c[34]u*.md"))


# --- principal --------------------------------------------------------

def unidades():
    return sorted(p for p in RAIZ.glob("c[34]u*.md"))


def main(argv):
    global forzar
    forzar = "--forzar" in argv
    argv = [a for a in argv if a != "--forzar"]

    if "--limpiar" in argv:
        for d in (BUILD, TMP):
            shutil.rmtree(d, ignore_errors=True)
        print("build/ y tmp/ borrados")
        return

    objetivo = argv[0] if argv else None
    hechos = 0

    if objetivo == "ejemplos":
        print("Ejemplos:")
        hechos = grabar_todos()
    elif objetivo == "fichas" or (FICHAS / f"{objetivo}.md").exists():
        for ficha in (fichas() if objetivo == "fichas" else [FICHAS / f"{objetivo}.md"]):
            print(f"fichas/{ficha.name}:")
            hechos += documentar_ficha(ficha)
        print("Nada que hacer." if not hechos else f"Listo ({hechos}).")
        return
    elif objetivo:
        md = RAIZ / f"{objetivo}.md"
        if not md.exists():
            sys.exit(f"No existe {md.name}. Unidades: "
                     f"{', '.join(u.stem for u in unidades())}")
        print(f"{md.name}:")
        hechos = grabar_todos(objetivo) + documentar(md)
    else:
        print("Ejemplos:")
        hechos = grabar_todos()
        for md in unidades():
            print(f"{md.name}:")
            hechos += documentar(md)
        for ficha in fichas():
            print(f"fichas/{ficha.name}:")
            hechos += documentar_ficha(ficha)

    if objetivo != "ejemplos":
        print("Sitio:")
        hechos += montar_sitio()

    print("Nada que hacer." if not hechos else f"Listo ({hechos}).")


if __name__ == "__main__":
    # La consola de Windows no es UTF-8, y los avisos citan caracteres
    # como «↔»: sin esto, el aviso revienta en vez de avisar.
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    main(sys.argv[1:])
