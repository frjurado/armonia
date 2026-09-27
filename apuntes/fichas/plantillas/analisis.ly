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

%%MATERIAL%%

\score {
  \new PianoStaff <<
    \new Staff { %%TONALIDAD%% \arriba }
    \new Staff { \clef bass %%TONALIDAD%% \abajo }
  >>
  \layout { }
}
