\version "2.24.0"

%% Plantilla del tipo `analisis` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…"; el alumno
%% no la ve escrita, solo la armadura) y la de MATERIAL, el bloque lilypond
%% de la ficha, que define dos variables:
%%
%%   arriba   mano derecha, con su \time
%%   abajo    mano izquierda, con \acorde bajo cada acorde (la solución)
%%
%% Sin rayas (huecos = ##f): marcar dónde cambia el acorde ya es parte
%% del análisis. El sitio para escribir es el espacio en blanco que deja
%% la ficha debajo (espacio:, abajo).
%%
%% espacio: 1.3cm

\include "comun.ily"
\include "etiquetas.ily"

huecos = ##f
alturaGrados = #-7.5

%% Un fragmento de más de un sistema: los grados van a altura fija y el
%% espaciado no los ve, así que los del primer sistema caerían encima del
%% segundo. `\hueco`, pegado a la primera nota (o silencio) de la mano
%% izquierda en cada sistema, deja debajo un texto invisible que sí
%% cuenta: r4\hueco. Mejor con los saltos de sistema fijados (\break).
hueco = _\markup \transparent \column { "I" "I" "I" "I" }

%% Ancho de línea: la caja de texto (CAJA_PT en construir.py) entre la
%% escala de las figuras (ESCALA, 1,3). Un fragmento que ocupa la línea
%% entera sale entonces al mismo tamaño de pentagrama que el resto; con
%% el ancho por defecto (todo el A4), había que reducirlo para que
%% cupiera. Uno más corto no cambia: las líneas no se estiran.
\paper { line-width = 327\pt }

%%MATERIAL%%

\score {
  \new PianoStaff <<
    \new Staff { %%TONALIDAD%% \arriba }
    \new Staff { \clef bass %%TONALIDAD%% \abajo }
  >>
  %% Saltos de sistema, solo los del material (\break): LilyPond no corta
  %% por su cuenta, y así cada sistema lleva su \hueco.
  \layout { \context { \Score \override NonMusicalPaperColumn.line-break-permission = ##f } }
}
