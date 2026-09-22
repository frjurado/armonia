\version "2.24.0"

%% 4.º UD 0 §1.1 — Disposición: cerrada, abierta y mixta.
%% El mismo acorde de tónica de Do mayor; solo cambia la distancia
%% entre tenor y soprano. Criterio: menos de una 8.ª, más de una 8.ª,
%% exactamente una 8.ª.

\include "comun.ily"

soprano = { \voiceOne c''1 c'' g' }
contralto = { \voiceTwo g'1 e' e' }
tenor = { \voiceOne e'1 g g }
bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2
  c1_\markup { \bold "cerrada" }
  c_\markup { \bold "abierta" }
  c_\markup { \bold "mixta" }
}

\score {
  \new ChoirStaff <<
    \new Staff <<
      \key c \major
      \omit Staff.TimeSignature
      \new Voice \soprano
      \new Voice \contralto
    >>
    \new Staff <<
      \clef bass
      \key c \major
      \omit Staff.TimeSignature
      \new Voice \tenor
      \new Voice \bajo
    >>
  >>
  \layout { }
}
