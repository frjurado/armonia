\version "2.24.0"

%% 3.º UD 0 §3.2 — La misma tríada de Do mayor en sus tres inversiones.
%% Lo que cambia es SOLO la nota del bajo: arriba, el cifrado americano
%% con barra; abajo, la cifra del bajo cifrado, que cuenta los
%% intervalos que quedan sobre esa nota (de ahí 5/3, 6/3, 6/4, y de ahí
%% que las dos primeras se abrevien a nada y a 6).
%% Se escribe en dos pentagramas para que el bajo se vea como bajo y no
%% como «la nota de abajo del acorde».

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
      \override TextScript.staff-padding = #2.5

      \rotulo "C"   <e' g' c''>1
      \rotulo "C/E" <g' c'' e''>
      \rotulo "C/G" <c'' e'' g''>
      \bar "|."
    }
    \new Staff {
      \clef bass
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \override TextScript.staff-padding = #2.5

      \figuras "(5)/(3)" c1
      \figuras "6/(3)"     e
      \figuras "6/4"       g
      \bar "|."
    }
  >>
  \layout { }
}
