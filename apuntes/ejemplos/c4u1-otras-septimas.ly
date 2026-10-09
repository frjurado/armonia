\version "2.24.0"

%% 4.º UD 1 §2.5 — El I7 de paso, en Do mayor: sobre la tónica que se
%% prolonga, la soprano baja de la fundamental a la 7.ª (do–si, 8–7) y
%% sigue hasta la 3.ª del IV: I – I7 – IV – V – I.

\include "comun.ily"
\include "etiquetas.ily"

soprano = { \voiceOne c''2 b' | a' g' | g'1 \bar "|." }
contralto = { \voiceTwo g'2 g' | f' d' | e'1 }
tenor = { \voiceOne e'2 e' | c' b | c'1 }

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2~ \acorde "I7" c | \acorde "IV" f \acorde "V" g | \acorde "I" c1
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
