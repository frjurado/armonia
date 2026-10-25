\version "2.24.0"

%% Plantilla del tipo `faltas-paralelas` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define de dos a cuatro
%% voces, en blancas y sin compás, y las respuestas:
%%
%%   soprano      siempre, en el pentagrama de Sol
%%   contralto    si la hay, con la soprano (dos voces en un pentagrama)
%%   bajo         si lo hay, en el pentagrama de Fa (si no, un pentagrama solo)
%%   tenor        si lo hay, con el bajo
%%   respuestas   un paso por cada par de sonoridades seguidas: \sinFalta,
%%                o \falta con el rótulo, en líneas separadas por «/»:
%%                  \falta "5.as par."  \falta "8.as par./contr./(S–B)"
%%
%% Así sirve la misma plantilla para las cuatro texturas de una serie (dos
%% voces en clave de Sol, dos en las dos claves, 2 + 1 y cuatro), y la
%% consigna es una sola. Las respuestas van debajo del pentagrama de abajo,
%% a mitad de camino entre las dos sonoridades, con los rótulos de
%% Paralelas y directas de la app. Sin modelo.
%%
%% espacio: 0.1cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-8

%% Un paso con falta: el rótulo, en el color de lo que está mal, y una
%% blanca hasta el siguiente. Sin falta, solo la blanca.
falta =
#(define-music-function (texto) (string?)
   #{ \grado #(make-with-color-markup colorMal
                (make-override-markup '(baseline-skip . 2.2)
                  (make-center-column-markup (string-split texto #\/))))
      s2 #})

sinFalta = s2

%% La fila de las respuestas, reservada (dos líneas: el rótulo y las
%% voces), para que el ejercicio deje sitio para escribir. Un rótulo de
%% tres («5.as par./contr./(S–B)») alarga un poco la solución.
reserva = \etiquetaAbajo #alturaGrados
  \markup \override #'(baseline-skip . 2.2) \center-column {
    \transparent "I" \transparent "I" }

contralto = ##f
tenor = ##f
bajo = ##f

%%MATERIAL%%

filaRespuestas = \new Voice {
  \override TextScript.self-alignment-X = #CENTER \reserva s4 \respuestas }

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella. Así todos los
%% apartados de una serie miden lo mismo y quedan alineados a los dos lados.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

\score {
  #(let* ((arriba (if contralto
                      #{ << \new Voice { \voiceOne \cadenzaOn \soprano \bar "|." }
                            \new Voice { \voiceTwo \contralto } >> #}
                      #{ \new Voice { \cadenzaOn \soprano \bar "|." } #}))
          (abajo (and bajo
                      (if tenor
                          #{ << \new Voice { \voiceOne \tenor }
                                \new Voice { \voiceTwo \bajo } >> #}
                          #{ \new Voice { \bajo } #}))))
     (if abajo
         #{ \new GrandStaff <<
              \new Staff << %%TONALIDAD%% \omit Staff.TimeSignature #arriba >>
              \new Staff << \clef bass %%TONALIDAD%% \omit Staff.TimeSignature
                            #abajo \filaRespuestas >>
            >> #}
         #{ \new Staff << %%TONALIDAD%% \omit Staff.TimeSignature
                          #arriba \filaRespuestas >> #}))
  \layout {
    %% Aire entre sonoridades: ahí van las respuestas.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/16)
               \override SpacingSpanner.spacing-increment = #1.6 }
    \context { \Voice \override TextScript.font-size = #-1.5 }
  }
}
