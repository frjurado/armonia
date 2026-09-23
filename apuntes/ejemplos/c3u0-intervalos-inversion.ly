\version "2.24.0"

%% 3.º UD 0 §2.1 — Tres parejas de intervalo e inversión.
%% Se eligen para que se vean las tres reglas de golpe:
%%   3.ª M -> 6.ª m   la amplitud suma 9, la calidad se invierte
%%   5.ª d -> 4.ª A   también con los alterados
%%   4.ª J -> 5.ª J   justo sigue justo
%% En cada pareja la nota grave sube una 8.ª: es la misma operación
%% siempre, y por eso la superior del primer acorde es la grave del
%% segundo.

\include "comun.ily"
\include "etiquetas.ily"

\score {
  \new Staff {
    \clef treble
    \omit Staff.TimeSignature
    \cadenzaOn
    \textLengthOn
    \override TextScript.staff-padding = #2

    \grado "3.ª M" <c' e'>1     \grado "6.ª m" <e' c''>     \bar "|"
    \grado "5.ª d" <b' f''>     \grado "4.ª A" <f'' b''>    \bar "|"
    \grado "4.ª J" <c' f'>      \grado "5.ª J" <f' c''>     \bar "|."
  }
  \layout { }
}
