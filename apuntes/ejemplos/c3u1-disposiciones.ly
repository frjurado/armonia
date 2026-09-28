\version "2.24.0"

%% 3.º UD 1 §2.1 — Disposición y distancias, sobre el acorde de tónica
%% de Do mayor. Rehace c4u0-disposiciones con dos casos más:
%%   a) cerrada   tenor–soprano, menos de una 8.ª
%%   b) abierta   más de una 8.ª
%%   c) mixta     exactamente una 8.ª
%%   d) mal: más de una 8.ª entre soprano y contralto (10.ª)
%%   e) mal: más de una 8.ª entre contralto y tenor (11.ª)
%% En d) y e), tintadas las dos notas de la pareja que se separa.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \textLengthOn
  \rotulo "a) cerrada"  c''1  \bar "||"
  \rotulo "b) abierta"  c''   \bar "||"
  \rotulo "c) mixta"    e''    \bar "||"
  \rotuloMal "d)"       \mal e''  \bar "||"
  \rotuloMal "e)"       e''   \bar "|."
}

contralto = {
  \voiceTwo
  g'1
  e'
  g'
  \mal c'
  \mal c''
}

tenor = {
  \voiceOne
  e'1
  g
  e'
  g
  \mal g
}

bajo = {
  \voiceTwo
  c1 c c c c
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \omit Staff.TimeSignature \textLengthOn
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
