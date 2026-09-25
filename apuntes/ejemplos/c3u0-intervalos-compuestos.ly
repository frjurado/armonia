\version "2.24.0"

%% 3.º UD 0 §2.2 — Intervalos compuestos.
%%
%% a) La misma 3.ª M tres veces (3.ª, 10.ª, 17.ª): restar 7 devuelve
%%    siempre la simple, y la calidad no cambia.
%% b) La 12.ª entre bajo y soprano, que a efectos de clasificación es la
%%    5.ª J que tiene al lado. Lo que NO es lo mismo es la distancia
%%    real: de eso vive la disposición (-> UD 1).
%%
%% Todo en un sistema, aunque la primera mitad deje vacía la clave de
%% Fa: son dos caras del mismo asunto y separarlas en dos sistemas las
%% hacía parecer dos ejemplos distintos. Los rótulos van todos debajo
%% del pentagrama de Fa, incluidos los de la parte en que está vacío;
%% \grado se cuelga de un silencio de duración cero y no necesita nota.

\include "comun.ily"
\include "etiquetas.ily"

%% Solo redondas y nada por debajo del pentagrama de Fa: los grados
%% pueden subir (ver «altura fija» en etiquetas.ily).
alturaGrados = #-4.5

\score {
  \new GrandStaff <<
    \new Staff {
      \clef treble
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \rotulo "a)" <c' e'>1  <c' e''>  <c' e'''>  \bar "|"
      \rotulo "b)" g'1  g'
      \bar "|."
    }
    \new Staff {
      \clef bass
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \override TextScript.staff-padding = #2

      \grado "3ªM" s1  \grado "10ªM" s  \grado "17ªM" s  \bar "|"
      \grado "12ªJ" c1  \grado "5ªJ" c'
      \bar "|."
    }
  >>
  \layout { }
}
