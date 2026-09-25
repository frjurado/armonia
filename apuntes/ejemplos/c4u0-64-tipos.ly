\version "2.24.0"

%% 4.º UD 0 §1.2 — Los tres 6/4 disonantes, en Do mayor.
%% a) cadencial: en parte fuerte, resuelve en la V (6-5, 4-3).
%%    Se cifra I6/4 - V, como en la app y en los mínimos de conducción.
%% b) de bordadura: bajo inmóvil, parte débil.
%% c) de paso: bajo por grado conjunto (1-2-3), parte débil.
%% En los tres se duplica el bajo.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a) cadencial"
  c''2 c''  | c'' b'  | c''1 \bar "||"
  \rotulo "b) de bordadura"
  c''2 c''  | c''1 \bar "||"
  \rotulo "c) de paso"
  e''2 d''  | c''1 \bar "|."
}

contralto = {
  \voiceTwo
  g'2 a'  | g' g'  | g'1
  g'2 a'  | g'1
  g'2 g'  | g'1
}

tenor = {
  \voiceOne
  e'2 f'  | e' d'  | e'1
  e'2 f'  | e'1
  c'2 b   | c'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2 \acorde "IV" f
    | \acorde "I6/4" g \acorde "V" g,
    | \acorde "I" c1
  \acorde "I" c2 \acorde "IV6/4" c
    | \acorde "I" c1
  \acorde "I" c2 \acorde "V6/4" d
    | \acorde "I6" e1
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4 \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 4/4 \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
