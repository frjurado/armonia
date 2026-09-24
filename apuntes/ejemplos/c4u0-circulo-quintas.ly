\version "2.24.0"

%% 4.º UD 0 §2.4 — Círculo de 5.as en La menor, todo en estado
%% fundamental: I - IV - VII - III - VI - II - V - I.
%% El modelo (I-IV, fundamental a la 5.ª descendente) se repite, con la
%% misma realización, un grado más abajo en cada compás; los corchetes
%% marcan el modelo y sus dos repeticiones. En cada enlace, una voz
%% mantiene la nota común y las otras dos suben por grado.
%% El último compás es la misma realización otra vez, pero ya es la
%% cadencia (V-I, con la sensible en la soprano): fuera de corchete.
%% Cifrado en mayúsculas, como en la app.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \once \override HorizontalBracketText.text = "modelo"
  c''2\startGroup d''\stopGroup
  | b'\startGroup c''\stopGroup
  | a'\startGroup b'\stopGroup
  | gs' a' \bar "|."
}

contralto = { \voiceTwo a'2 a' | g' g' | f' f' | e' e' }
tenor = { \voiceOne e'2 f' | d' e' | c' d' | b c' }

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #5
  \grado "I" a2 \grado "IV" d
    | \grado "VII" g \grado "III" c
    | \grado "VI" f \grado "II" b,
    | \grado "V" e \grado "I" a,
}

\score {
  \new GrandStaff <<
    \new Staff << \key a \minor \time 4/4 \omit Staff.TimeSignature
                  \new Voice \with { \consists Horizontal_bracket_engraver
                                     \override HorizontalBracket.direction = #UP }
                    \soprano
                  \new Voice \contralto >>
    \new Staff << \clef bass \key a \minor \time 4/4 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
