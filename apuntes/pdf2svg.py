#!/usr/bin/env python3
"""PDF -> SVG sin binarios de sistema.  Uso: python pdf2svg.py in.pdf out.svg
Requiere:  pip install pymupdf
Alternativa a `pdftocairo -svg` (poppler) cuando no se quiere instalar
poppler en Windows.  Convierte todo el texto a trazos, igual que poppler."""
import sys
import pymupdf

entrada, salida = sys.argv[1], sys.argv[2]
doc = pymupdf.open(entrada)
with open(salida, "w", encoding="utf-8") as f:
    f.write(doc[0].get_svg_image(text_as_path=True))
