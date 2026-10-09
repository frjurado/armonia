\version "2.24.0"

%% 4.º UD 1 §3.3 — Otras secuencias con séptimas.
%% a) Do mayor. Terceras descendentes, en la variante con todos los
%%    acordes en fundamental (la de la Romanesca): I – V7 – VI – III7 –
%%    IV – I7 – II – V – I (A/S ej. 24-9a). Las tres voces superiores
%%    bajan por grado en bloque; la 7.ª del segundo acorde de cada pareja
%%    llega por grado (nota de paso) y baja a la fundamental del
%%    siguiente.
%% b) Fa mayor. 5–6 ascendente con 6/5: I – VI6/5 – II – VII6/5 – III –
%%    I6/5 – IV – V – I (A/S ej. 24-10). La 5.ª disonante de cada 6/5
%%    (do, re, mi) suena antes en el tenor y aparece en la soprano: está
%%    preparada, pero en otra voz.

\include "comun.ily"
\include "etiquetas.ily"

superior = {
  \rotulo "a)"
  <g' c'' e''>2 <f' b' d''> | <e' a' c''> <d' g' b'> | <c' f' a'> <b e' g'>
    | <a d' f'> <b d' g'> | <c' e' g'>1 \bar "||"
  \key f \major
  \rotulo "b)"
  <f' a'>2 <a' c''> | <g' bf'> <bf' d''> | <a' c''> <c'' e''>
    | <bf' d''> <g' c''> | <a' c''>1 \bar "|."
}

%% El tenor de b) va con el bajo, para que se vea dónde está preparada la
%% disonancia; en a) no hay tenor aparte (las tres voces van arriba).
tenor = {
  \voiceOne
  s1*5
  \key f \major
  c'2 d' | d' e' | e' f' | f' e' | f'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c'2 \acorde "V7" g | \acorde "VI" a \acorde "III7" e
    | \acorde "IV" f \acorde "I7" c | \acorde "II" d \acorde "V" g | \acorde "I" c1
  \key f \major
  \acorde "I" f2~ \acorde "VI6/5" f | \acorde "II" g~ \acorde "VII6/5" g
    | \acorde "III" a~ \acorde "I6/5" a | \acorde "IV" bf \acorde "V" c' | \acorde "I" f1
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4 \omit Staff.TimeSignature \superior >>
    \new Staff << \clef bass \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
