\version "2.24.0"

%% 4.º UD 1 §2.1 — El II6/5 en la progresión cadencial. El II6/5, siempre
%% en parte fuerte.
%% a) Do mayor, I – II6/5 – V – I con 6̂ en la soprano: el do del tenor
%%    (1̂) se mantiene como 7.ª del II y baja a la sensible.
%% b) Do mayor, I – II6/5 – I6/4 – V – I: el do de la soprano se queda
%%    en el 6/4 (la 4.ª) y solo entonces baja a si.
%% c) Re menor, I – VI – II6/5 – V – I: el bajo baja por 3.as hasta ④, y
%%    el re de la soprano es nota común en los tres primeros acordes.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotulo "a)" g'1 | a'2 g' | g'1 \bar "||"
  \rotulo "b)" c''2~ c''~ | c'' b' | c''1 \bar "||"
  \key d \minor
  \rotulo "c)" d''2~ d''~ | d'' cs'' | d''1 \bar "|."
}

contralto = {
  \voiceTwo
  e'1 | d'2 d' | e'1
  e'2 d' | e' d' | e'1
  f'2 f' | e' e' | f'1
}

tenor = {
  \voiceOne
  c'1~ | c'2 b | c'1
  g2 a | g g | g1
  \key d \minor
  a2 bf | bf a | a1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c1 | \acorde "II6/5" f2 \acorde "V" g | \acorde "I" c1
  \acorde "I" c2 \acorde "II6/5" f | \acorde "I6/4" g \acorde "V" g, | \acorde "I" c1
  \key d \minor
  \acorde "I" d2 \acorde "VI" bf, | \acorde "II6/5" g, \acorde "V" a, | \acorde "I" d1
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
