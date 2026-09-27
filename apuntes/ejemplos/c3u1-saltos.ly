\version "2.24.0"

%% 3.º UD 1 §2.2 — Saltos e intervalos melódicos, una sola voz.
%%   a) bien: salto de 5.ª (do4–sol4) y cambio de dirección por grado (fa4).
%%   b) mal: el mismo salto seguido de otro en la misma dirección
%%      (sol4–si4): los dos suman una 7.ª.
%%   c) mal: 4.ª aumentada fa4–si4.
%%   d) bien: 5.ª disminuida si4–fa5, que vuelve hacia dentro (mi5).
%%   e) mal: La menor, fa4–sol♯4, 2.ª aumentada.
%%   f) bien: la corrección, fa♯4–sol♯4–la4 (la melódica ascendente).
%% El guion agrupaba c–d y e–f como «mal frente a bien»; separados, cada
%% uno lleva su ✓ o ✗. Debajo de cada nota, el intervalo con la anterior.

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-6

\score {
  \new Staff {
    \omit Staff.TimeSignature
    \cadenzaOn
    \textLengthOn
    \rotuloBien "a)" c'4 \grado "5ªJ" g' \grado "2ªM" f'          \bar "||"
    \rotuloMal "b)"  c'4 \grado "5ªJ" g' \grado "3ªM" \mal b'     \bar "||"
    \rotuloMal "c)"  f'4 \grado "4ªA" \mal b'                    \bar "||"
    \rotuloBien "d)" b'4 \grado "5ªD" f'' \grado "2ªm" e''        \bar "||"
    \rotuloMal "e)"  f'4 \grado "2ªA" \mal gs' \grado "2ªm" a'    \bar "||"
    %% gs'!: en \cadenzaOn las alteraciones no caducan en cada \bar, y
    %% sin forzarlo el sostenido de e) haría callar a este.
    \rotuloBien "f)" fs'4 \grado "2ªM" gs'! \grado "2ªm" a'       \bar "|."
  }
  \layout { }
}
