\version "2.24.0"

%% Plantilla del tipo `enlazar-acordes` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define cinco variables:
%%
%%   soprano, contralto   pentagrama de Sol, en blancas, sin compás
%%   tenor, bajo          pentagrama de Fa
%%   respuestas           un \paso por cada enlace, con lo que hace la
%%                        consigna en él: \paso "1 n.c." \paso "contr." …
%%
%% El bajo es el dato: sale siempre. De las voces superiores sale el
%% primer acorde, si se da; el resto va dentro de \analitico:
%%   soprano = { d''2 \analitico { e''2 d'' … } }
%% Sin primer acorde, las tres voces superiores enteras en \analitico.
%% Los rótulos de los enlaces, los de Enlazar acordes de la app («1 n.c.»,
%% «2 n.c.», «contr.»), solo en la solución, a mitad de camino entre los
%% dos acordes (como en movimientos-armonicos.ly).
%%
%% espacio: 0.6cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-8

paso =
#(define-music-function (texto) (markup?)
   #{ \grado #texto s2 #})

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
                  \new Voice { \override TextScript.self-alignment-X = #CENTER s4 \respuestas } >>
  >>
  \layout {
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/16) }
    \context { \Voice \override TextScript.font-size = #-1.5 }
  }
}
