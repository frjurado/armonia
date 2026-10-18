\version "2.24.0"

%% Plantilla del tipo `faltas-disposicion` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define las cuatro voces
%% en blancas, un acorde por compás, sueltos (sin conducción entre ellos):
%%
%%   soprano, contralto   pentagrama de Sol; la soprano lleva el \bar "||"
%%                        de detrás de cada acorde
%%   tenor, bajo          pentagrama de Fa; el bajo lleva la respuesta de
%%                        cada acorde: \grado "cerrada", o la falta y sus
%%                        voces, \falta "cruce" "A/T" (en dos líneas)
%%
%% Blancas, no redondas, como en la app: la plica dice qué voz es cuál, y
%% sin ella un cruce no se ve. Sin modelo: lo que se pide (la falta, o si
%% no la disposición) ya lo dice la consigna, y un acorde resuelto
%% delataría su respuesta. El sitio para escribir es el espacio fijo entre
%% acordes, el mismo en el ejercicio y en la solución.
%%
%% espacio: 0.4cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-9.5

%% La falta, en el color de lo que está mal (etiquetas.ily), y debajo,
%% entre paréntesis, las voces.
falta =
#(define-music-function (texto voces) (markup? markup?)
   #{ \grado \markup \with-color #colorMal
                \override #'(baseline-skip . 2.2)
                \center-column { #texto \concat { "(" #voces ")" } } #})

%%MATERIAL%%

%% La fila de las respuestas, reservada (dos líneas, como una falta):
%% sin ella, en el ejercicio no quedaría sitio para escribir debajo.
reserva = \etiquetaAbajo #alturaGrados
            \markup \transparent \override #'(baseline-skip . 2.2)
                    \center-column { "I" "I" }

\score {
  \new GrandStaff <<
    \new Staff << %%TONALIDAD%% \omit Staff.TimeSignature
                  \new Voice { \voiceOne \cadenzaOn \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass %%TONALIDAD%% \omit Staff.TimeSignature
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \reserva \bajo } >>
  >>
  \layout {
    %% Las respuestas no cuentan para el espaciado (con \textLengthOn, la
    %% solución saldría más ancha que el ejercicio): el aire entre acordes
    %% es fijo, y en él cabe lo que haya que escribir.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/64) }
    \context { \Voice \override TextScript.font-size = #-1 }
  }
}
