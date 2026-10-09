\version "2.24.0"

%% 4.º UD 1 §2.2 — El II7 en estado fundamental.
%% a) Do mayor, I6 – II7 – V7 – I: el II7 completo, con el do del tenor
%%    preparado en el I6; la soprano mantiene 4̂, que pasa a ser la 7.ª
%%    del V7 y resuelve en 3̂.
%% b) Mal: desde el I en estado fundamental, el II7 completo da 5.as
%%    paralelas entre el bajo y la contralto (do–sol → re–la).
%% c) Bien: el mismo enlace con el II7 sin 5.ª, la fundamental duplicada.
%% d) La menor, I – II7 – I6/4 – V – I: el II7 semidisminuido, completo
%%    (si–fa, 5.ª disminuida, no hace paralelas con la–mi); la 7.ª (la)
%%    se mantiene como 4.ª del 6/4 y resuelve en el sol♯.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)"      e''2 f''~ | f'' e'' \bar "||"
  \rotuloMal "b)"   c''2 c'' \bar "||"
  \rotuloBien "c)"  c''2~ c'' | b' c'' \bar "||"
  \key a \minor
  \rotulo "d)"      c''2 d'' | c'' b' | c''1 \bar "|."
}

contralto = {
  \voiceTwo
  g'2 a' | g' g'
  \mal g'2\glissando \mal a'
  g'2 f' | g' g'
  a'2~ a'~ | a' gs' | a'1
}

tenor = {
  \voiceOne
  c'2~ c' | b c'
  e'2 f'
  e'2 d' | d' e'
  e'2 f' | e' e' | e'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I6" e2 \acorde "II7" d | \acorde "V7" g, \acorde "I" c
  \acorde "I" \mal c2\glissando \acorde "II7" \mal d
  \acorde "I" c2 \acorde "II7" d | \acorde "V" g, \acorde "I" c
  \key a \minor
  \acorde "I" a,2 \acorde "II7" b, | \acorde "I6/4" e \acorde "V" e, | \acorde "I" a,1
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
