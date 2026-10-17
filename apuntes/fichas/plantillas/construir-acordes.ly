\version "2.24.0"

%% Plantilla del tipo `construir-acordes` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define las cuatro voces
%% en blancas, un acorde por compás, sueltos (sin conducción entre ellos):
%%
%%   soprano, contralto   pentagrama de Sol, dentro de \analitico (son la
%%                        solución); la soprano lleva delante de cada
%%                        acorde su disposición, \rotulo "cerrada" (el
%%                        dato), y detrás el \bar "||"
%%   tenor                pentagrama de Fa, dentro de \analitico
%%   bajo                 pentagrama de Fa: el dato, siempre visible
%%
%% El primer acorde puede ir entero fuera de \analitico, como modelo.
%% La solución es UNA de las posibles (la posición la elige el alumno).
%%
%% espacio: 0.4cm

\include "comun.ily"
\include "etiquetas.ily"

%% Las disposiciones, encima, a altura fija sobre el Sol.
alturaRotulos = #7

%%MATERIAL%%

\score {
  \new GrandStaff <<
    \new Staff << %%TONALIDAD%% \omit Staff.TimeSignature
                  \new Voice { \voiceOne \cadenzaOn \textLengthOn \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass %%TONALIDAD%% \omit Staff.TimeSignature
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \bajo } >>
  >>
  \layout {
    %% Aire entre acordes, el mismo con y sin la solución.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/64) }
  }
}
