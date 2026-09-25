\version "2.24.0"

%% 4.º UD 0 §2.2 — Tres maneras de prolongar la tónica, en Do mayor.
%% a) pedal: el do se queda en el bajo, y encima IV y V7 pierden su
%%    bajo y su inversión (entre paréntesis).
%% b) bordadura: I - (IV) - I; la tónica vuelve en la misma posición
%%    (soprano 3-4-3, contralto 5-6-5).
%% c) paso: I - (VII6) - I6; la tónica cambia de posición, con
%%    intercambio de notas entre bajo y soprano.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a) pedal"      e''2 f'' | f'' e''  \bar "||"
  \rotulo "b) bordadura"  e''2 f'' | e''1  \bar "||"
  \rotulo "c) paso"       e''2 d'' | c''1  \bar "|."
}

contralto = {
  \voiceTwo
  g'2 a' | g' g'
  g'2 a' | g'1
  g'2 f' | g'1
}

tenor = {
  \voiceOne
  c'2 c' | b c'
  c'2 c' | c'1
  c'2 b | c'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2~ \acorde "(IV" c~
    | \acorde "V7)" c~ \acorde "I" c
  \acorde "I" c2 \acorde "(IV)" f | \acorde "I" c1
  \acorde "I" c2 \acorde "(VII6)" d
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
