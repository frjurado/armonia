\version "2.24.0"

%% 4.º UD 1 §3.1 — De dónde sale la secuencia de séptimas: una cadena de
%% retardos 7–6 sobre un bajo que baja por grado (A/S ej. 24-5), a tres
%% voces, como en el contrapunto barroco: la contralto, en 10.as con el
%% bajo; la soprano entra en la segunda mitad del primer compás y se
%% retrasa siempre medio compás. Las tres 7.as (mi, re, do sobre fa, mi,
%% re) son las del IV7, el III7 y el II7 de c4u1-quintas-7.ly.
%% Entre paréntesis, en la segunda mitad de cada compás del bajo, la nota
%% que lo convierte en el bajo del círculo de 5.as (si, la, sol): es
%% análisis, y no sale en la versión para clase.

\include "comun.ily"
\include "etiquetas.ily"

soprano = { \voiceOne r2 e''2~ | e'' d''~ | d'' c''~ | c'' b' | c''1 \bar "|." }
contralto = { \voiceTwo g'1 | a' | g' | f' | e' }

%% Al final, re–do directamente: el sol del círculo queda implícito.
bajo = { \voiceOne c1 | f | e | d | c }

%% Cifras y notas del círculo de 5.as, en una voz aparte para poder
%% ponerlas a mitad de compás sin partir las redondas del bajo.
nota =
#(define-music-function (n) (ly:music?)
   #{ \analitico { \once \omit Stem \once \override NoteHead.font-size = #-3
                   \parenthesize #n } #})

circulo = {
  \voiceTwo
  \textLengthOn
  s1
  | \figuras "7" s2 \figuras "6" \nota b,4 s4
  | \figuras "7" s2 \figuras "6" \nota a,4 s4
  | \figuras "7" s2 \figuras "6" \nota g,4 s4
  | s1
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \bajo \new Voice \circulo >>
  >>
  \layout { }
}
