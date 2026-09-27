\version "2.24.0"

%% 3.º UD 1 §2.3 — Los cuatro movimientos armónicos, dos voces en el
%% pentagrama de Sol (Do mayor). Encima, el nombre; debajo, el intervalo
%% de cada sonoridad; y una raya une las dos notas de cada voz, para que
%% se vea la dirección.
%%   a) contrario  inferior mi4 → re4, superior sol4 → la4   (3 → 5)
%%   b) oblicuo    inferior do4 → do4, superior sol4 → la4   (5 → 6)
%%   c) directo    inferior do4 → re4, superior mi4 → si4    (3 → 6)
%%   d) paralelo   inferior do4 → re4, superior mi4 → fa4    (3ªM → 3ªm)

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-8.5

superior = {
  \voiceOne
  \cadenzaOn
  \textLengthOn
  \rotulo "a) contrario" g'2\glissando a'  \bar "||"
  \rotulo "b) oblicuo"   g'2\glissando a'  \bar "||"
  \rotulo "c) directo"   e'2\glissando b'  \bar "||"
  \rotulo "d) paralelo"  e'2\glissando f'  \bar "|."
}

inferior = {
  \voiceTwo
  \textLengthOn
  \grado "3ª"  e'2\glissando \grado "5ª" d'
  \grado "5ª"  c'2\glissando \grado "6ª" c'
  \grado "3ª"  c'2\glissando \grado "6ª" d'
  \grado "3ªM" c'2\glissando \grado "3ªm" d'
}

\score {
  \new Staff << \key c \major \omit Staff.TimeSignature
                \new Voice \superior \new Voice \inferior >>
  \layout { }
}
