# Renderiza cada ejemplo de ejemplos/*.ly a un SVG recortado en build/.
# Solo rehace lo que ha cambiado.
#
# Conversor PDF->SVG. Por defecto poppler (pdftocairo).
# Alternativa portable sin binarios de sistema:  make PDF2SVG="python pdf2svg.py"
PDF2SVG ?= pdftocairo -svg

LY  := $(wildcard ejemplos/*.ly)
SVG := $(patsubst ejemplos/%.ly,build/%.svg,$(LY))

.PHONY: ejemplos limpiar
ejemplos: $(SVG)

build/%.svg: ejemplos/%.ly ejemplos/comun.ily
	@mkdir -p build tmp
	lilypond -dcrop --pdf -I ejemplos -o tmp/$* $<
	$(PDF2SVG) tmp/$*.cropped.pdf $@

limpiar:
	rm -rf build tmp
