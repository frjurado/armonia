\version "2.24.0"

%% 4.º UD 0 §1.2 — Duplicaciones en 1.ª inversión, en Do mayor:
%% I - VII6 - I6 - II6 - V, bajo 1-2-3-4-5.
%%   VII6  duplica el bajo (la 3.ª del acorde), nunca la sensible.
%%   I6    duplica la fundamental.
%%   II6   duplica el bajo (la 3.ª), y una de las dos baja al ir a V.
%% Bajo y soprano intercambian notas en I-VII6-I6.

\include "comun.ily"
\include "etiquetas.ily"

soprano = { \voiceOne c''2 b' | c'' a' | g'1 \bar "|." }
contralto = { \voiceTwo g'2 f' | g' f' | d'1 }
tenor = { \voiceOne e'2 d' | c' d' | b1 }
bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2 \acorde "VII6" d
    | \acorde "I6" e \acorde "II6" f
    | \acorde "V" g1
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
