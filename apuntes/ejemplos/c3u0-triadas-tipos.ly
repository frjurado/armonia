\version "2.24.0"

%% 3.º UD 0 §3.1 — Las cuatro tríadas sobre do, en el orden de la tabla.
%% Ese orden (disminuida, menor, mayor, aumentada) no es el de costumbre:
%% se elige para que se vea que de una a la siguiente cambia UNA NOTA,
%% siempre subiendo un semitono, y que la 5.ª crece con ella.
%% Encima, el cifrado americano; debajo, el tipo. Una barra entre acordes,
%% y cada uno lleva solo sus alteraciones, sin becuadros de recuerdo.

\include "comun.ily"
\include "etiquetas.ily"

\score {
  \new Staff {
    \clef treble
    \omit Staff.TimeSignature
    \cadenzaOn
    % En cadenza la barra no abre compás y las alteraciones se arrastran:
    % «forget» escribe en cada acorde solo las suyas.
    \accidentalStyle forget
    \textLengthOn
    \override TextScript.staff-padding = #2

    \rotulo "C°" \grado "dism."     <c' ef' gf'>1  \bar "|"
    \rotulo "Cm" \grado "menor"      <c' ef' g'>  \bar "|"
    \rotulo "C"  \grado "mayor"      <c' e' g'>  \bar "|"
    \rotulo "C+" \grado "aum."      <c' e' gs'>
    \bar "|."
  }
  \layout { }
}
