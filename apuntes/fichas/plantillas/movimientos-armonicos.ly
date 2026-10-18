\version "2.24.0"

%% Plantilla del tipo `movimientos-armonicos` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define tres variables:
%%
%%   superior    la voz aguda, en el pentagrama de Sol: blancas, sin compás
%%   inferior    la voz grave, en el de Fa
%%   respuestas  un \paso por cada paso de una sonoridad a la siguiente, con
%%               su movimiento: \paso "contr." \paso "obl." …
%%
%% Las respuestas van debajo, cada una a mitad de camino entre sus dos
%% sonoridades: la plantilla las pone en una voz aparte, una negra después
%% de la primera blanca y luego cada blanca (ver \paso). Como en
%% Movimientos › Armónicos de la app. Sin modelo.
%%
%% espacio: 0.4cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-7.5

%% Un paso: la respuesta, y una blanca hasta el siguiente.
paso =
#(define-music-function (texto) (markup?)
   #{ \grado #texto s2 #})

%% La fila de las respuestas, reservada: sin ella, el ejercicio no deja
%% sitio debajo para escribir.
reserva = \etiquetaAbajo #alturaGrados \markup \transparent "I"

%%MATERIAL%%

\score {
  \new GrandStaff <<
    \new Staff { %%TONALIDAD%% \omit Staff.TimeSignature \cadenzaOn \superior \bar "|." }
    \new Staff <<
      \clef bass %%TONALIDAD%% \omit Staff.TimeSignature
      \new Voice { \inferior }
      \new Voice { \override TextScript.self-alignment-X = #CENTER \reserva s4 \respuestas }
    >>
  >>
  \layout {
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/16) }
    \context { \Voice \override TextScript.font-size = #-1 }
  }
}
