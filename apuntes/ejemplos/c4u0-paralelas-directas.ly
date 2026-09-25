\version "2.24.0"

%% 4.º UD 0 §1.1 — Movimiento armónico: paralelas y directas, en Do mayor.
%% a) IV-V con 5.as paralelas entre bajo y soprano (lo único mal).
%% b) V-I: 8.ª directa entre extremas, con la soprano por grado: bien.
%% c) I-V: 8.ª directa entre extremas, con la soprano por salto: mal.
%% Tintadas y unidas por una raya, las dos voces de cada intervalo.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotuloMal "a)"  \mal c''2\glissando \mal d''   \bar "||"
  \rotuloBien "b)" \bien b'2\glissando \bien c''  \bar "||"
  \rotuloMal "c)"  \mal e''2\glissando \mal g''   \bar "|."
}

contralto = {
  \voiceTwo
  a'2 b'
  g'2 g'
  g'2 b'
}

tenor = {
  \voiceOne
  f'2 d'
  d'2 e'
  c'2 d'
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #4
  \acorde "IV" \mal f2\glissando \acorde "V" \mal g
  \acorde "V" \bien g2\glissando \acorde "I" \bien c'
  \acorde "I" \mal c2\glissando \acorde "V" \mal g
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
