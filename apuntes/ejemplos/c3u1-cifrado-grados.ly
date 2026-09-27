\version "2.24.0"

%% 3.º UD 1 §1.2 — Los tres cifrados de grado a la vez, en dos
%% fragmentos a tres voces:
%%   encima de la soprano   grado melódico      3̂ 1̂ 2̂ 7̂ 1̂
%%   primera fila de abajo  grado del bajo      ① ③ ④ ⑤ ①
%%   segunda fila de abajo  grado del acorde    I I6 II6 V I
%% a) Do mayor, 4/4: I–I6–II6–V–I.
%% b) La menor, 3/4: I–V6–IV6–V sobre el bajo del lamento, la–sol–fa–mi,
%%    con el 7.º grado natural al bajar (sol, no sol♯: el V6 es mi–sol–si)
%%    y la sensible solo en el V final.
%% Los compases se ven, a diferencia de otros ejemplos: los dos
%% fragmentos tienen un compás distinto implícito, y así se dice.
%%
%% Va en los ejemplos para clase (.aula): la versión sin análisis deja
%% solo las notas y los rótulos a) b), y las tres filas se quedan para
%% hacerlas en clase.

\include "comun.ily"
\include "etiquetas.ily"

%% Tres filas de análisis: los grados melódicos por encima de las plicas
%% de la soprano, y los rótulos a su vez por encima de ellos.
alturaEncima = #6
alturaRotulos = #9
alturaGradosBajo = #-6
alturaGrados = #-9

soprano = {
  \voiceOne
  \rotulo "a)"
  \encima "3̂" e''4 \encima "1̂" c'' \encima "2̂" d'' \encima "7̂" b' |
  \encima "1̂" c''1 \bar "||"
  \time 3/4
  \rotulo "b)"
  \encima "5̂" e''4 \encima "5̂" e'' \encima "4̂" d'' |
  \encima "5̂" e''2. \bar "|."
}

contralto = {
  \voiceTwo
  g'4 g' a' g' | e'1
  \key a \minor
  c''4 b' a' | gs'2.
}

bajo = {
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \gradoBajo "①" \acorde "I"   c4
  \gradoBajo "③" \acorde "I6"  e
  \gradoBajo "④" \acorde "II6" f
  \gradoBajo "⑤" \acorde "V"   g |
  \gradoBajo "①" \acorde "I"   c1
  \key a \minor
  \time 3/4
  \gradoBajo "①" \acorde "I"   a4
  \gradoBajo "⑦" \acorde "V6"  g
  \gradoBajo "⑥" \acorde "IV6" f |
  \gradoBajo "⑤" \acorde "V"   e2.
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 4/4
                  \new Voice \bajo >>
  >>
  \layout { }
}
