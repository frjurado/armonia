\version "2.24.0"

%% 4.º UD 1 §3.2 — Quintas descendentes con 5/3 y 6/5 alternados, en Do
%% mayor: I – IV6/5 – VII – III6/5 – VI – II6/5 – V – I.
%% El I en redonda, para que cada 6/5 caiga en tiempo fuerte y cada compás
%% sea un eslabón (corchetes: modelo y dos repeticiones).
%% El bajo baja una 3.ª y sube una 2.ª. La 3.ª de cada tríada se mantiene
%% como 7.ª del 6/5 siguiente (ligaduras de la soprano) y baja a la 3.ª de
%% la tríada que viene después. Todos los acordes, completos; el VII, en
%% fundamental y con la sensible duplicada: licencias de la secuencia.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  e''1~
  \once \override HorizontalBracketText.text = "modelo"
  | e''2\startGroup d''~\stopGroup
  | d''\startGroup c''~\stopGroup
  | c''\startGroup b'\stopGroup | c''1 \bar "|."
}
contralto = { \voiceTwo g'1 | f'2 f' | e' e' | d' d' | e'1 }
tenor = { \voiceOne c'1 | c'2 b | b a | a g | g1 }

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c1
    | \acorde "IV6/5" a,2 \acorde "VII" b,
    | \acorde "III6/5" g, \acorde "VI" a,
    | \acorde "II6/5" f, \acorde "V" g,
    | \acorde "I" c1
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \with { \consists Horizontal_bracket_engraver
                                     \override HorizontalBracket.direction = #UP
                                     \override HorizontalBracket.transparent = #(not conAnalisis)
                                     \override HorizontalBracketText.transparent = #(not conAnalisis) }
                    \soprano
                  \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
