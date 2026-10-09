\version "2.24.0"

%% 4.º UD 1 §1.2 — Cómo se llega a la 7.ª de una séptima diatónica, en
%% Do mayor.
%% a) Por nota común: el do de la soprano (1̂) se mantiene del I al II6/5,
%%    donde ya es disonancia (5.ª sobre el bajo, contra el re), y baja a
%%    si en el V. El II6/5 cae en tiempo fuerte: es un retardo.
%% b) Como nota de paso: sobre un II que se prolonga (II6 – II7), la
%%    soprano baja re–do–si: 8–7 y resolución. En posición cerrada, para
%%    que el bajo no salte (do–fa–re–sol–do) y no haya unísono en el V.
%% c) Mal: la soprano llega al do (7.ª del II7) por salto, desde el mi.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)"     c''1~ | c''2 b' | c''1 \bar "||"
  \rotulo "b)"     c''2 d'' | c'' b' | c''1 \bar "||"
  \rotuloMal "c)"  \mal e''2\glissando \mal c'' | b'1 \bar "|."
}

contralto = {
  \voiceTwo
  g'1 | a'2 g' | g'1
  g'2 a' | a' g' | g'1
  g'2 f' | d'1
}

tenor = {
  \voiceOne
  e'1 | d'2 d' | e'1
  e'2 f' | f' d' | e'1
  c'2 a | g1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c1 | \acorde "II6/5" f2 \acorde "V" g | \acorde "I" c1
  \acorde "I" c2 \acorde "II6" f | \acorde "II7" d \acorde "V" g | \acorde "I" c1
  \acorde "I" c2 \acorde "II7" d | \acorde "V" g,1
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
