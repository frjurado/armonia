\version "2.24.0"

%% 4.º UD 1 §2.4 — IV7 e IV6/5, en Do mayor.
%% a) I – IV7 – V, con 3̂ en la soprano: la 7.ª (mi) se prepara en el I y
%%    baja a re; la 5.ª del IV7 (do, tenor) baja a la sensible; y la
%%    contralto, que tiene 6̂ una 5.ª por debajo de la 7.ª, salta a re
%%    (como P-D Tema 11 §3.1, ej. a).
%% b) Mal: la contralto baja por grado (la–sol) a la vez que la soprano
%%    (mi–re): 5.as paralelas.
%% c) I – IV6/5 – V6/5 – I, bajo 1-6-7-1 (con el 6 por debajo): la 7.ª del
%%    IV6/5 (mi) se prepara en el I; la del V6/5 (fa), en el IV6/5; el
%%    tenor tiene que saltar (do–sol).

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)"     e''2~ e'' | d''1 \bar "||"
  \rotuloMal "b)"  \mal e''2\glissando \mal d'' \bar "||"
  \rotulo "c)"     e''2~ e'' | d'' c'' \bar "|."
}

contralto = {
  \voiceTwo
  g'2 a' | d'1
  \mal a'2\glissando \mal g'
  g'2 f'~ | f' e'
}

tenor = {
  \voiceOne
  c'2~ c' | b1
  c'2 b
  c'2~ c' | g g
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2 \acorde "IV7" f | \acorde "V" g1
  \acorde "IV7" f2 \acorde "V" g
  \acorde "I" c2 \acorde "IV6/5" a, | \acorde "V6/5" b, \acorde "I" c
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
