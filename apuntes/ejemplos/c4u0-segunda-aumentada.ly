\version "2.24.0"

%% 4.º UD 0 §1.1 — La 2.ª aumentada 6-#7 en La menor, y cómo se evita.
%% a) IV6-V: la soprano sube de 6 a #7 (2.ª aumentada). Es lo único mal.
%% b) IV-V: 6 y #7 en voces distintas; 6 baja a 5 en la soprano y la
%%    sensible la trae la contralto.
%% c) II6-V-I con la escala melódica subiendo: #6-#7-8 en la soprano.
%% Tintados, 6 y #7 en cada caso; con raya, cuando van en la misma voz.
%% Cifrado en mayúsculas y sin marca de calidad, como en la app.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  \rotuloMal "a)"  \mal f''2\glissando \mal gs''          \bar "||"
  \rotuloBien "b)" \bien f''2 e''                         \bar "||"
  \rotuloBien "c)" \bien fs''2\glissando \bien gs'' | a''1 \bar "|."
}

contralto = {
  \voiceTwo
  a'2 b'
  a'2 \bien gs'
  b'2 b' | a'1
}

tenor = {
  \voiceOne
  d'2 b
  d'2 b
  d'2 b | c'1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \gradoSeis "IV" f2 \grado "V" e
  \grado "IV" d2 \grado "V" e
  \gradoSeis "II" d2 \grado "V" e | \grado "I" a1
}

\score {
  \new GrandStaff <<
    \new Staff << \key a \minor \time 2/2 \omit Staff.TimeSignature
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key a \minor \time 2/2 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
