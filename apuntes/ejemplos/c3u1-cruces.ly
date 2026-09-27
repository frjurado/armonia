\version "2.24.0"

%% 3.º UD 1 §2.1 — Cruces y unísonos, soprano y contralto en el
%% pentagrama de Sol.
%%   a) mal: cruce armónico, la contralto (mi5) por encima de la soprano (do5).
%%   b) mal: superposición: la soprano sube de do5 a mi5, y la contralto
%%      llega a re5, por encima del do que la soprano acaba de dejar.
%%   c) mal: unísono por movimiento directo (si4 → do5, sol4 → do5).
%%   d) bien: el mismo unísono por movimiento contrario (re5 → do5, si4 → do5).
%% El unísono, una cabeza con dos plicas.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \cadenzaOn          % a) es un solo acorde: sin compás que llenar
  \textLengthOn
  \rotuloMal "a)"  \mal c''2      \bar "||"
  \rotuloMal "b)"  c''2 e''       \bar "||"
  \rotuloMal "c)"  b'2 \mal c''   \bar "||"
  \rotuloBien "d)" d''2 \bien c'' \bar "|."
}

contralto = {
  \voiceTwo
  \mal e''2
  a'2 \mal d''
  g'2 \mal c''
  b'2 \bien c''
}

\score {
  \new Staff << \key c \major \time 2/2 \omit Staff.TimeSignature
                \new Voice \soprano \new Voice \contralto >>
  \layout { }
}
