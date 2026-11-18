\version "2.24.0"

%% Plantilla del tipo `cadencia-iv` (curriculum/Ejercicios-papel.md).
%% Como secuencia-triadas.ly: varios casos en un mismo sistema, cada uno
%% en su tonalidad, así que el ejercicio no lleva tono="…" y el material
%% define cinco variables:
%%
%%   global      la armadura y la doble barra de cada caso, en blancas sin
%%               compás: \key c \major s2*3 \bar "||" \key a \minor s2*2 \bar "|."
%%   soprano     delante, el rótulo del caso, que es dato (y lo lee
%%               comprobar-fichas.js para saber la tonalidad de cada caso):
%%               \rotuloAnalisis "a) Do mayor" "a) Do mayor" …
%%   contralto, tenor, bajo
%%   El bajo lleva los grados (\acorde "I"), que son análisis.
%%
%% I y V en estado fundamental, alternados (3.º UD 2, familia Estado
%% fundamental de la app: app/docs/familias/tonica-dominante.md).
%% Lo que se da: solo el rótulo (tonalidad, tipo y número de acordes);
%% las cuatro voces, en \analitico, que reservan el sitio. El rótulo dice,
%% con análisis, si la CA es CAP o CAI:
%%   \rotuloAnalisis "a) Sol mayor: CA de tres acordes" "a) Sol mayor: CAI"
%%
%% espacio: 0.3cm

\include "comun.ily"
\include "etiquetas.ily"

%%MATERIAL%%

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

\score {
  \new GrandStaff <<
    \new Staff << \global \omit Staff.TimeSignature
                  \new Voice { \voiceOne \cadenzaOn \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass \global \omit Staff.TimeSignature
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \textLengthOn \bajo } >>
  >>
  \layout {
    %% sin compases, las alteraciones no caducan: cada una, contra la armadura
    \context { \Staff \accidentalStyle forget }
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/16) }
  }
}
