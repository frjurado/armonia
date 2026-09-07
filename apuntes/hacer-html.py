#!/usr/bin/env python3
"""Demo del camino a HTML: mismo texto, mismos SVG, otro renderizador.
En el flujo real esto lo hace Pandoc/Quarto; aquí se genera a mano para
mantener la prueba mínima y autocontenida (los SVG van incrustados)."""
import pathlib

B = pathlib.Path("build")
svg = {p.stem: p.read_text(encoding="utf-8").split("?>", 1)[-1].strip()
       for p in B.glob("ud01-*.svg")}

CSS = """
:root { --tinta:#1a1a1a; --suave:#666; }
body { max-width: 38rem; margin: 3rem auto; padding: 0 1.5rem;
       font: 16px/1.65 Georgia, "Times New Roman", serif; color: var(--tinta); }
h1 { font-size: 1.5rem; margin-bottom: .2rem; }
h2 { font-size: 1.15rem; margin-top: 2.2rem; color: var(--suave); }
p  { text-align: justify; hyphens: auto; }
figure { margin: 2rem 0; text-align: center; }
figure svg { max-width: 100%; height: auto; }
figcaption { font-size: .85rem; color: var(--suave); margin-top: .6rem; }
.ej-1 svg { width: 13rem; } .ej-2 svg { width: 8rem; }
"""

HTML = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>UD 1. Conducción de voces</title>
<style>{CSS}</style></head><body>

<h1>UD 1. Conducción de voces</h1>
<h2>Quintas paralelas</h2>

<p>Cuando dos voces se mueven en la misma dirección manteniendo entre sí el
intervalo de quinta justa, se produce el error de conducción más
característico del estilo. En el ejemplo <a href="#fig-5as">Figura 1</a>,
soprano y contralto suben conjuntamente de la quinta Sol–Re a la quinta
La–Mi.</p>

<figure id="fig-5as" class="ej-1">{svg['ud01-5as-paralelas']}
<figcaption>Figura 1: Quintas paralelas entre las voces extremas.</figcaption>
</figure>

<p>La tríada de tónica sobre la que se resuelve aparece en
<a href="#fig-triada">Figura 2</a>.</p>

<figure id="fig-triada" class="ej-2">{svg['ud01-triada-im']}
<figcaption>Figura 2: Tríada de tónica de La menor, estado fundamental.</figcaption>
</figure>

</body></html>
"""

pathlib.Path("demo.html").write_text(HTML, encoding="utf-8")
print("demo.html generado —", len(HTML), "bytes")
