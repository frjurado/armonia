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
3. **Se traducen los `<!-- salto -->`** a un salto de página de Typst.
   Es un bloque en bruto que solo entiende el PDF, así que el mismo
   texto sirve para las dos salidas: en el HTML no hay páginas y el
   salto sobra.
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

INCLUIDOS = [EJEMPLOS / "comun.ily", EJEMPLOS / "etiquetas.ily"]
METADATOS = FORMATO / "metadatos.yaml"
CSS = FORMATO / "apuntes.css"
YO = pathlib.Path(__file__)

GUION_INICIO = "<!-- guion:inicio -->"
GUION_FIN = "<!-- guion:fin -->"
RE_IMAGEN = re.compile(r"\]\(build/imagenes/([^)\s]+\.svg)")

# Salto de página, solo en el PDF: se escribe `<!-- salto -->` en el .md
# y se cambia por un bloque typst en bruto, que Pandoc solo entiende al
# generar el PDF y descarta al generar el HTML. Un mismo texto vale
# entonces para las dos salidas, sin ramificar `preparar()`.
SALTO = "<!-- salto -->"
SALTO_TYPST = "```{=typst}\n#pagebreak()\n```"

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


def preparar(md):
    texto = sin_fuentes(sin_guion(md.read_text(encoding="utf-8")))
    texto = texto.replace(SALTO, SALTO_TYPST)
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


def documentar(md):
    """Un .md -> su HTML y su PDF, si alguno de los dos está caduco."""
    svgs = [IMAGENES / n for n in ejemplos_de(md.stem)]
    fuentes = sorted(FUENTES.glob("*"))
    comunes = [md, METADATOS, YO, *svgs, *fuentes]
    hechos = 0

    texto = preparar(md)
    revisar_cobertura(texto, md)

    html = BUILD / f"{md.stem}.html"
    if caduco(html, [*comunes, CSS]):
        shutil.copy2(CSS, BUILD / CSS.name)
        copiar_fuentes()
        pandoc(texto, html, [f"--css={CSS.name}"])
        hechos += 1

    pdf = BUILD / f"{md.stem}.pdf"
    if caduco(pdf, comunes):
        # --font-path: «Armonia Serif» no está instalada en el sistema,
        # vive en el repo y solo la ve quien compila esto.
        pandoc(texto, pdf,
               ["--pdf-engine=typst",
                f"--pdf-engine-opt=--font-path=../{FUENTES.relative_to(RAIZ).as_posix()}"])
        hechos += 1
    return hechos


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

    print("Nada que hacer." if not hechos else f"Listo ({hechos}).")


if __name__ == "__main__":
    main(sys.argv[1:])
