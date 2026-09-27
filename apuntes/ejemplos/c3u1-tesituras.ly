\version "2.24.0"

%% 3.º UD 1 §2.1 — Tesituras de las cuatro voces (Minimos N1), en el
%% pentagrama en que se escribe cada una: soprano y contralto en el de
%% Sol, tenor y bajo en el de Fa. Las dos notas límite de cada voz, en
%% redonda, con el nombre encima. Sustituye a la tabla del guion.

\include "comun.ily"
\include "etiquetas.ily"

alturaRotulos = #8

arriba = {
  \omit Staff.TimeSignature
  \cadenzaOn
  \textLengthOn
  \rotulo "Soprano"   c'1  a''  \bar "||"
  \rotulo "Contralto" f1   d''  \bar "||"
  \rotulo "Tenor"     s1   s    \bar "||"
  \rotulo "Bajo"      s1   s    \bar "|."
}

abajo = {
  \clef bass
  \omit Staff.TimeSignature
  \cadenzaOn
  s1 s
  s1 s
  c1  a'
  e,1 c'
}

\score {
  \new GrandStaff <<
    \new Staff \arriba
    \new Staff \abajo
  >>
  \layout { }
}
