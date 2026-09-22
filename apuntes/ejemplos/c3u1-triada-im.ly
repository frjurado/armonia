\version "2.24.0"

%% 3.º UD 1 — Tríada de tónica de La menor, estado fundamental.
%% La cadena musical es una cadena mini-LilyPond copiada VERBATIM
%% desde el generador de ejercicios (Gramatica-mini-lilypond.md §5).
%% Solo se le añade el envoltorio de contexto.

\include "comun.ily"

\score {
  \new Staff {
    \clef bass \key a \minor
    <a c' e'>1          % <-- cadena mini-LilyPond sin retocar
  }
  \layout { }
}
