\version "2.24.0"

%% 4.º UD 0 §1.3 — Las inversiones de V7 prolongan la tónica, en Do mayor.
%% a) Bajo 1-7-1-2-3: I - V6/5 - I - V4/3 - I6. V6/5 es bordadura
%%    inferior de 1; V4/3, de paso hacia I6, y ahí su 7.ª (fa, en la
%%    soprano) sube a sol: 10.as paralelas con el bajo.
%% b) V - V4/2 - I6: el bajo baja 5-4-3 y la 7.ª resuelve en él.
%% Las inversiones, siempre completas.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)" e''2 d'' | c'' b' | c''1 \bar "||"
  \rotulo "b)" b'2 b' | c''1 \bar "|."
}

contralto = {
  \voiceTwo
  g'2 g' | g' g' | g'1
  g'2 g' | g'1
}

tenor = {
  \voiceOne
  c'2 f' | e' f' | e'1
  d'2 d' | c'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2 \acorde "V6/5" b,
    | \acorde "I" c \acorde "V4/3" d
    | \acorde "I6" e1
  \acorde "V" g2 \acorde "V4/2" f
    | \acorde "I6" e1
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
