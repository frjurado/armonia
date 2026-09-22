\version "2.24.0"

%% 3.º UD 1 — Quintas paralelas entre las voces extremas.
%% Ejemplo de apuntes: usa \markup, colores y dos voces, todo lo que
%% mini-LilyPond excluye a propósito (§2 de la gramática).

\include "comun.ily"

sup = {
  \voiceOne
  \override NoteHead.color = #red
  d''2 e''2
}

inf = {
  \voiceTwo
  \override NoteHead.color = #red
  \textLengthOn                       % reserva sitio para las etiquetas
  \override TextScript.staff-padding = #1.5
  g'2_\markup { \bold "5.ª J" } a'2_\markup { \bold "5.ª J" }
}

\score {
  \new Staff {
    \clef treble \key c \major \time 4/4
    << \new Voice \sup \new Voice \inf >>
  }
  \layout { }
}
