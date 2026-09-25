\version "2.24.0"

%% 4.º UD 0 §1.3 — Resolución de V7 en estado fundamental, en Do mayor.
%%   a) V7 completo -> I incompleto (sin 5.ª, fundamental triplicada).
%%   b) V7 incompleto (sin 5.ª, fundamental doblada) -> I completo.
%%   c) V7 -> VI (cadencia rota): la sensible sube, 3.ª del VI doblada.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)" b'2 c''  \bar "||"
  \rotulo "b)" b'2 c''  \bar "||"
  \rotulo "c)" d''2 c'' \bar "|."
}

contralto = {
  \voiceTwo
  f'2 e'
  f'2 e'
  f'2 e'
}

tenor = {
  \voiceOne
  d'2 c'
  g2 g
  b2 c'
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #5
  \acorde "V7" g2 \acorde "I" c
  \acorde "V7" g,2 \acorde "I" c
  \acorde "V7" g2 \acorde "VI" a
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 2/2 \omit Staff.TimeSignature
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 2/2 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
