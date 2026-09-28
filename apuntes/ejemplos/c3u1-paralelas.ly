\version "2.24.0"

%% 3.º UD 1 §2.4 — Quintas y octavas paralelas, a dos voces, con el
%% intervalo entre ellas debajo.
%%   a) mal: 5.as paralelas, las dos voces en el Sol
%%      (inferior sol4 → la4, superior re5 → mi5).
%%   b) mal: 8.as paralelas (bajo do3 → re3, superior do4 → re4).
%%   c) mal: 5.as por movimiento contrario (inferior do4 → fa3, superior
%%      sol4 → do5): 5.ª → 12.ª, la segunda compuesta. (El guion ponía el
%%      bajo una 8.ª más abajo, 12.ª → 19.ª: igual de mal, peor de leer.)
%%   d) bien: 5.ª justa → 5.ª disminuida (inferior do4 → si3, superior
%%      sol4 → fa4): la segunda ya no es consonancia perfecta.
%% Tintadas y unidas por una raya, las dos voces de cada paralela, como
%% en c4u0-paralelas-directas. (Era c3u1-5as-paralelas, solo el caso a.)

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-6.5

superior = {
  \voiceOne
  \cadenzaOn
  \rotuloMal "a)"  \mal d''2\glissando \mal e''  \bar "||"
  \rotuloMal "b)"  \mal c'2\glissando \mal d'    \bar "||"
  \rotuloMal "c)"  \mal g'2\glissando \mal c''   \bar "||"
  \rotuloBien "d)" g'2 f'                        \bar "|."
}

%% La voz inferior de a) va en el pentagrama de Sol, con la superior.
inferiorArriba = {
  \voiceTwo
  \grado "5ªJ" \mal g'2\glissando \grado "5ªJ" \mal a'
  s1 s1 s1
}

inferior = {
  \textLengthOn
  s1
  \grado "8ªJ"  \mal c2\glissando  \grado "8ªJ"  \mal d
  \grado "5ªJ"  \mal c'2\glissando \grado "12ªJ" \mal f
  \grado "5ªJ"  c'2                \grado "5ªD"  b
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \omit Staff.TimeSignature
                  \new Voice \superior \new Voice \inferiorArriba >>
    \new Staff << \clef bass \key c \major \omit Staff.TimeSignature
                  \new Voice \inferior >>
  >>
  \layout { }
}
