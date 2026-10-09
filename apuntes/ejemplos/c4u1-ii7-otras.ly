\version "2.24.0"

%% 4.º UD 1 §2.3 — Otras posiciones del II7, en Do mayor.
%% a) I – II4/2 – V6/5 – I, sobre el bajo 1-1-7-1: la 7.ª del II está en
%%    el bajo (preparada: es la tónica) y baja a la sensible. Uso no
%%    cadencial.
%% b) I6 – II6/5 – II7 – V7 – I: la supertónica se prolonga con
%%    intercambio de voces entre bajo y soprano (fa–re contra re–fa); el do
%%    del tenor es la 7.ª en las dos posiciones del II.
%% c) I – II6/5 – V4/2 – I6: II6/5 y V4/2 sobre el mismo fa del bajo, que
%%    pasa a ser la 7.ª del V y resuelve en el I6.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)" c''2 d'' | d'' c'' \bar "||"
  \rotulo "b)" e''2 d'' | f''~ f'' | e''1 \bar "||"
  \rotulo "c)" e''2 d''~ | d'' c'' \bar "|."
}

contralto = {
  \voiceTwo
  e'2 f'~ | f' e'
  g'2 a' | a' g' | g'1
  g'2 a' | g' g'
}

tenor = {
  \voiceOne
  g2 a | g g
  c'2~ c'~ | c' b | c'1
  c'2~ c' | b c'
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2~ \acorde "II4/2" c | \acorde "V6/5" b, \acorde "I" c
  \acorde "I6" e2 \acorde "II6/5" f | \acorde "II7" d \acorde "V7" g, | \acorde "I" c1
  \acorde "I" c2 \acorde "II6/5" f~ | \acorde "V4/2" f \acorde "I6" e
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
