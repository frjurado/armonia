\version "2.24.0"

%% Plantilla del tipo `paralelas` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define cinco variables:
%%
%%   soprano, contralto   pentagrama de Sol, en blancas, sin compás
%%   tenor, bajo          pentagrama de Fa
%%   respuestas           un \paso por cada paso de un acorde al siguiente:
%%                        las paralelas de ese paso, apiladas,
%%                          \paso \markup \center-column {
%%                            \pareja "A–T" "6.as" \prohibida "T–B" "5.as" }
%%                        (\prohibida, las 5.as y 8.as), y \sinParalelas
%%                        si no hay ninguna.
%%
%% Las respuestas van debajo, a mitad de camino entre los dos acordes (como
%% en movimientos-armonicos.ly). Sin modelo.
%%
%% espacio: 1.4cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-8.5

paso =
#(define-music-function (texto) (markup?)
   #{ \grado \markup \override #'(baseline-skip . 5.4) #texto s2 #})

sinParalelas = s2

%% Una paralela: las voces y, debajo, el intervalo (en dos líneas, para que
%% quepa entre dos acordes). La prohibida, en el color de lo que está mal y
%% con su ✗. Varias en un mismo paso, en \column, con aire entre ellas.
#(define-markup-command (pareja layout props voces intervalo) (markup? markup?)
   (interpret-markup layout props
     #{ \markup \override #'(baseline-skip . 2.2) \center-column { #voces #intervalo } #}))
#(define-markup-command (prohibida layout props voces intervalo) (markup? markup?)
   (interpret-markup layout props
     #{ \markup \with-color #colorMal \pareja #voces
          \concat { #intervalo \hspace #0.4 \raise #0.2 \marcaMal } #}))

reserva = \etiquetaAbajo #alturaGrados \markup \transparent "I"

%%MATERIAL%%

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella. Así todos los
%% apartados de una serie miden lo mismo y quedan alineados a los dos lados.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

\score {
  \new GrandStaff <<
    \new Staff << %%TONALIDAD%% \omit Staff.TimeSignature
                  \new Voice { \voiceOne \cadenzaOn \soprano \bar "|." }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass %%TONALIDAD%% \omit Staff.TimeSignature
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \bajo }
                  \new Voice { \override TextScript.self-alignment-X = #CENTER \reserva s4 \respuestas } >>
  >>
  \layout {
    %% Aire entre acordes: ahí van las respuestas.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/16)
               \override SpacingSpanner.spacing-increment = #1.6 }
    \context { \Voice \override TextScript.font-size = #-1.5 }
  }
}
