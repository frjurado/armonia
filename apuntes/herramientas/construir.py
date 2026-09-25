#!/usr/bin/env python
"""Construye los apuntes: de los ficheros fuente a HTML y PDF.

    python herramientas/construir.py              todo lo que esté desactualizado
    python herramientas/construir.py c4u0         solo esa unidad
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
"""

import datetime
import pathlib
import re
import shutil
import subprocess
import sys

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

INCLUIDOS = [EJEMPLOS / "comun.ily", EJEMPLOS / "etiquetas.ily"]
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

# Salto: se escribe `<!-- salto -->` en el .md y se cambia por dos
# bloques en bruto, uno por salida; Pandoc usa el de la suya y descarta
# el otro. En el PDF es un salto de página; en el HTML, que no tiene
# páginas, una raya que hace sus veces —la única del documento: entre
# apartados no se pone ninguna—. Un mismo texto vale entonces para las
# dos salidas, sin ramificar `preparar()`.
SALTO = "<!-- salto -->"
SALTO_BRUTO = ("```{=typst}\n#pagebreak()\n```\n\n"
               "```{=html}\n<hr class=\"salto\">\n```")

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

def grabar(ly):
    """Un .ly -> un SVG recortado.

    -dcrop, porque sin él cada ejemplo sale como un A4 entero con dos
    compases en una esquina. Y se pasa por PDF (--pdf) en lugar de usar
    el backend SVG de LilyPond, que no incrusta las fuentes de texto y
    deja los \\markup con tipografía de sustitución.
    """
    svg = IMAGENES / f"{ly.stem}.svg"
    if not caduco(svg, [ly, *INCLUIDOS]):
        return False
    IMAGENES.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(exist_ok=True)
    ejecutar(["lilypond", "-dcrop", "--pdf", "-I", "ejemplos",
              "-o", f"tmp/{ly.stem}", f"ejemplos/{ly.name}"],
             stdout=subprocess.DEVNULL)
    ejecutar([*conversor_svg(), f"tmp/{ly.stem}.cropped.pdf",
              f"build/imagenes/{svg.name}"],
             stdout=subprocess.DEVNULL)
    print(f"  {svg.relative_to(RAIZ)}")
    return True


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
    hechos = 0
    for ly in sorted(EJEMPLOS.glob("*.ly")):
        if usados is None or f"{ly.stem}.svg" in usados:
            hechos += grabar(ly)
    for svg in sorted(SVG_FIJOS.glob("*.svg")):
        if usados is None or svg.name in usados:
            hechos += copiar_svg(svg)
    return hechos


# --- texto ------------------------------------------------------------

def ejemplos_de(unidad):
    return set(RE_IMAGEN.findall((RAIZ / f"{unidad}.md").read_text(encoding="utf-8")))


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
        puntos = ancho_svg(svg)
        if puntos is None:
            sys.exit(f"{md.name}: no leo el ancho de {svg.name}, así que "
                     f"`width=auto` no vale; ponle un `width=N%` a ojo.\n"
                     f"  su cabecera es: {cabecera_svg(svg)}")
        por_ciento = min(ESCALA * puntos / CAJA_PT, 1.0)
        return (f"{m.group(0)[:-len('width=auto')]}width={round(por_ciento * 100)}% "
                f'style="--ancho-movil:{round(PX_MOVIL * puntos)}px"')
    return RE_AUTO.sub(ancho, texto)


def preparar(md):
    texto = sin_fuentes(sin_guion(md.read_text(encoding="utf-8")))
    texto = texto.replace(SALTO, SALTO_BRUTO)
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


def pandoc(texto, salida, extra):
    BUILD.mkdir(exist_ok=True)
    # toc-depth=3 llega hasta los «1.1»: en una unidad larga, un índice
    # de cuatro entradas no sirve para orientarse.
    ejecutar(["pandoc", "--from=markdown", "--standalone",
              "--toc", "--toc-depth=3",
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
    trozos = {
        "before": ('<header class="masthead">\n'
                   '  <a class="back" href="index.html">← Apuntes</a>\n'
                   f'  <a class="pdf" href="{md.stem}.pdf">Descargar en PDF</a>\n'
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
    if caduco(html, [*comunes, CSS, TABLAS]):
        shutil.copy2(CSS, BUILD / CSS.name)
        copiar_fuentes()
        pandoc(texto, html, [f"--css={CSS.name}", *envoltorio(md),
                             f"--lua-filter=../{TABLAS.relative_to(RAIZ).as_posix()}"])
        hechos += 1

    pdf = BUILD / f"{md.stem}.pdf"
    if caduco(pdf, [*comunes, PDF_TYP, QR]):
        # --font-path: «Armonia Serif» no está instalada en el sistema,
        # vive en el repo y solo la ve quien compila esto.
        pandoc(texto, pdf,
               ["--pdf-engine=typst",
                f"--pdf-engine-opt=--font-path=../{FUENTES.relative_to(RAIZ).as_posix()}",
                *portada_pdf(md)])
        hechos += 1
    return hechos


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


def portada_pdf(md):
    """Opciones de Pandoc para la portada y las cabeceras del PDF.

    Escribe dos ficheros typst en tmp/: la cabecera —`datos` con la
    autoría y los títulos, y detrás _formato/pdf.typ, que los usa— y el
    principio del cuerpo, que pone la línea de autoría bajo el título.
    El QR se copia junto a las imágenes, que es donde lo busca Typst.

    Va por -H y no por `header-includes` en metadatos.yaml porque Pandoc
    no suma los dos: con -H, el del YAML desaparece sin avisar.
    """
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
        "subtitulo": dato("subtitle", md, defecto=""),
    }
    TMP.mkdir(exist_ok=True)
    IMAGENES.mkdir(parents=True, exist_ok=True)
    shutil.copy2(QR, IMAGENES / QR.name)
    cabecera = TMP / f"cabecera-{md.stem}.typ"
    cabecera.write_text(
        "#let datos = (\n"
        + "".join(f"  {k}: {cadena(v)},\n" for k, v in datos.items())
        + ")\n\n" + PDF_TYP.read_text(encoding="utf-8"),
        encoding="utf-8")
    antes = TMP / f"antes-{md.stem}.typ"
    antes.write_text("#autoria()\n", encoding="utf-8")
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
