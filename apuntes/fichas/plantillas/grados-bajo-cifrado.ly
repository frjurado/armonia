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
%% en cada fila y dónde (en una serie, solo el del apartado a). El alto
%% de las filas lo reserva la plantilla (ver abajo).
%%
%% Filas apretadas y sin espacio detrás, para que quepa una serie de
%% cuatro apartados en una hoja: el sitio para escribir ya está en las
%% filas reservadas.
%%
%% espacio: 0cm

\include "comun.ily"
\include "etiquetas.ily"

%% Tres filas debajo del bajo (cifras, ①, romano) y una encima del Sol.
alturaFiguras = #-5
alturaGradosBajo = #-8.7
alturaGrados = #-11
alturaEncima = #4.8

%%MATERIAL%%

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella. Así todos los
%% apartados de una serie miden lo mismo y quedan alineados a los dos lados.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

%% Las filas de respuesta, reservadas siempre con un texto invisible: sin
%% ellas, un apartado de una serie (que no lleva \modelo) saldría sin
%% sitio para escribir encima y debajo.
reservaArriba = \etiquetaArriba #alturaEncima \markup \transparent "C"
reservaAbajo = {
  \etiquetaAbajo #alturaGradosBajo \markup \transparent "①"
  \etiquetaAbajo #alturaGrados \markup \transparent "I"
}

\score {
  \new GrandStaff <<
    \new Staff {
      %%TONALIDAD%%
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \reservaArriba \arriba
      \bar "|."
    }
    \new Staff {
      \clef bass
      %%TONALIDAD%%
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \reservaAbajo \abajo
      \bar "|."
    }
  >>
  \layout {
    %% Aire entre acordes, para escribir debajo y encima de cada uno.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/32) }
  }
}
