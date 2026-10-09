\version "2.24.0"

%% 4.º UD 1 §3.1 — Secuencia de séptimas por quintas descendentes, en Do
%% mayor, todo en estado fundamental:
%% I – IV7 – VII7 – III7 – VI7 – II7 – V7 – I.
%% El I, en redonda: así cada acorde de séptima completo cae en tiempo
%% fuerte, con su 7.ª ligada desde el acorde anterior, y cada compás es
%% un eslabón (modelo IV7–VII7 y dos repeticiones, un grado más abajo;
%% la última desemboca en la cadencia).
%% La 3.ª de cada acorde se mantiene y es la 7.ª del siguiente (las
%% ligaduras, alternando tenor y contralto); cada 7.ª baja a la 3.ª del
%% acorde siguiente. Los acordes se alternan completos (IV7, III7, II7) e
%% incompletos (VII7, VI7, V7: sin 5.ª, fundamental duplicada).

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  c''1
  \once \override HorizontalBracketText.text = "modelo"
  | c''2\startGroup b'\stopGroup
  | b'\startGroup a'\stopGroup
  | a'\startGroup g'\stopGroup | g'1 \bar "|."
}

contralto = { \voiceTwo g'1 | a'2~ a' | g'~ g' | f'~ f' | e'1 }
tenor = { \voiceOne e'1~ | e'2 d'~ | d' c'~ | c' b | c'1 }

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c1
    | \acorde "IV7" f2 \acorde "VII7" b,
    | \acorde "III7" e \acorde "VI7" a,
    | \acorde "II7" d \acorde "V7" g,
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
