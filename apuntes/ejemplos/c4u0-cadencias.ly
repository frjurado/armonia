\version "2.24.0"

%% 4.º UD 0 §2.1 — Las cuatro cadencias sobre la misma progresión,
%% en Do mayor: I6 - II6 - V - x. Lo que cambia es el último acorde
%% y, sobre todo, la soprano.
%%   CAP  soprano a 1 (2-1); V y I en estado fundamental.
%%   CAI  soprano a 3; misma armonía.
%%   SC   la frase acaba en V tríada (nunca V7).
%%   CR   la V va al VI (bajo 5-6): 3.ª duplicada, sensible al alza.
%% La sensible va en la contralto salvo en CR, donde va en la soprano.
%% En CAP baja a 5 (el 1 lo da la soprano, justo encima); en CAI y en
%% CR sube a 1.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "CAP"  e''4 d''  b'2   | c''1 \bar "||"
  \rotulo "CAI"  g''4 f''  d''2  | e''1 \bar "||"
  \rotulo "SC"   e''4 d''  b'2  \bar "||"
  \rotulo "CR"   c''4 d''  b'2   | c''1 \bar "|."
}

contralto = {
  \voiceTwo
  c''4 a'   g'2  | g'1
  c''4 d''  b'2  | c''1
  c''4 a'   g'2
  g'4 a'  g'2  | e'1
}

tenor = {
  \voiceOne
  g'4 f'  d'2  | e'1
  g'4 a'  g'2  | g'1
  g'4 f'  d'2
  e'4 d'  d'2  | c'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \gradoSeis "I" e4 \gradoSeis "II" f \grado "V" g2 | \grado "I" c1
  \gradoSeis "I" e4 \gradoSeis "II" f \grado "V" g2 | \grado "I" c1
  \gradoSeis "I" e4 \gradoSeis "II" f \grado "V" g2
  \gradoSeis "I" e4 \gradoSeis "II" f \grado "V" g2 | \grado "VI" a1
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
