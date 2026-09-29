\version "2.24.0"

%% Plantilla del tipo `grados-bajo-cifrado` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye las dos marcas: la de TONALIDAD por la armadura
%% (del atributo tono="…" del ejercicio) y la de MATERIAL por el bloque
%% lilypond de la ficha, que define dos variables:
%%
%%   arriba   el pentagrama de Sol: el acorde escrito (\analitico) y su
%%            cifrado americano (\encima), una redonda por acorde
%%   abajo    el bajo cifrado: la nota con \figuras (el dato), y
%%            \gradoBajo y \acorde (la respuesta)
%%
%% Todo lo que es respuesta sale solo en las soluciones. En el ejercicio
%% no hay rayas: el primer acorde, resuelto (\modelo), ya enseña qué va
%% en cada fila y dónde, y conserva el alto de todas ellas.
%%
%% espacio: 0.3cm

\include "comun.ily"
\include "etiquetas.ily"

%% Tres filas debajo del bajo (cifras, ①, romano) y una encima del Sol.
alturaFiguras = #-5
alturaGradosBajo = #-9.2
alturaGrados = #-11.7
alturaEncima = #5.5

%%MATERIAL%%

\score {
  \new GrandStaff <<
    \new Staff {
      %%TONALIDAD%%
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \arriba
      \bar "|."
    }
    \new Staff {
      \clef bass
      %%TONALIDAD%%
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \abajo
      \bar "|."
    }
  >>
  \layout {
    %% Aire entre acordes, para escribir debajo y encima de cada uno.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/32) }
  }
}
