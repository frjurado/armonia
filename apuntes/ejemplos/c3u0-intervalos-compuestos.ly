\version "2.24.0"

%% 3.º UD 0 §2.2 — Intervalos compuestos.
%% Dos sistemas, en dos \score: LilyPond los graba uno debajo de otro
%% y -dcrop los recorta juntos. Hacen falta dos porque el segundo lleva
%% dos pentagramas y el primero no.
%%
%% Sistema 1: la misma 3.ª M tres veces (3.ª, 10.ª, 17.ª). Restar 7
%%   devuelve siempre la simple, y la calidad no cambia.
%% Sistema 2: la 12.ª entre bajo y soprano, que a efectos de
%%   clasificación es la 5.ª J que se ve debajo. Lo que NO es lo mismo
%%   es la distancia real: de eso vive la disposición (-> UD 1).

\include "comun.ily"
\include "etiquetas.ily"

\score {
  \new Staff {
    \clef treble
    \omit Staff.TimeSignature
    \cadenzaOn
    \textLengthOn
    \override TextScript.staff-padding = #2

    \grado "3.ª M" <c' e'>1  \grado "10.ª M" <c' e''>  \grado "17.ª M" <c' e'''>
    \bar "|."
  }
  \layout { }
}

%% Los rótulos de este sistema van DEBAJO del pentagrama de Fa, no
%% encima del de Sol: encima chocan con los del sistema anterior, que
%% queda justo ahí al recortar los dos juntos.
\score {
  \new GrandStaff <<
    \new Staff {
      \clef treble
      \omit Staff.TimeSignature
      \cadenzaOn
      g'1  g'
      \bar "|."
    }
    \new Staff {
      \clef bass
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \override TextScript.staff-padding = #2
      \grado "12.ª J" c1  \grado "5.ª J" c'
      \bar "|."
    }
  >>
  \layout { }
}
