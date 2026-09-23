\version "2.24.0"

%% 3.º UD 0 §3.1 — Las cuatro tríadas sobre do, en el orden de la tabla.
%% Ese orden (disminuida, menor, mayor, aumentada) no es el de costumbre:
%% se elige para que se vea que de una a la siguiente cambia UNA NOTA,
%% siempre subiendo un semitono, y que la 5.ª crece con ella.
%% Encima, el cifrado americano; debajo, el tipo.

\include "comun.ily"
\include "etiquetas.ily"

\score {
  \new Staff {
    \clef treble
    \omit Staff.TimeSignature
    \cadenzaOn
    \textLengthOn
    \override TextScript.staff-padding = #2

    \rotulo "C°" \grado "dism."     <c' ef' gf'>1
    \rotulo "Cm" \grado "menor"      <c' ef' g'>
    \rotulo "C"  \grado "mayor"      <c' e' g'>
    \rotulo "C+" \grado "aum."      <c' e' gs'>
    \bar "|."
  }
  \layout { }
}
