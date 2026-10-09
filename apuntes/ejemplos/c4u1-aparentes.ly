\version "2.24.0"

%% 4.º UD 1 §4 — Séptimas aparentes, en Do mayor.
%% a) I – IV – I: el IV lleva una 6.ª añadida (re, en la soprano). Suenan
%%    las notas de un II6/5, pero el re sube a mi y el do se queda: no hay
%%    7.ª que resolver, sino un IV adornado (cadencia plagal con la soprano
%%    subiendo a 3̂).
%% b) El mismo acorde, en la misma disposición, como II6/5 real: el do
%%    (7.ª) baja a si y el acorde va al V.
%% c) Sobre el do del bajo, las tres voces superiores suben y vuelven por
%%    grado: suena un II4/2, pero es un 6/4 de bordadura (fa–la sobre do)
%%    con el re como bordadura del do.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)" e''2 d'' | e''1 \bar "||"
  \rotulo "b)" e''2 d'' | d'' e'' \bar "||"
  \rotulo "c)" c''2 d'' | c''1 \bar "|."
}

contralto = {
  \voiceTwo
  g'2 a' | g'1
  g'2 a' | g' g'
  g'2 a' | g'1
}

tenor = {
  \voiceOne
  c'2~ c' | c'1
  c'2~ c' | b c'
  e'2 f' | e'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2 \acorde "IV" f | \acorde "I" c1
  \acorde "I" c2 \acorde "II6/5" f | \acorde "V" g \acorde "I" c
  \acorde "I" c2~ \acorde "(II4/2)" c | \acorde "I" c1
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
