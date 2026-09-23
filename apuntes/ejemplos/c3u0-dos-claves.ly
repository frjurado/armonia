\version "2.24.0"

%% 3.º UD 0 §2.3 — Leer el sistema de dos pentagramas como uno solo.
%%
%% a) El do central, la bisagra: primera línea adicional por debajo del
%%    pentagrama de Sol y primera por encima del de Fa son la MISMA nota
%%    (las dos notas del primer grupo suenan al unísono).
%% b) Una 10.ª y una 3.ª a caballo de los dos pentagramas: misma
%%    clasificación, distinta distancia.
%% c) Un cruce: la contralto está escrita arriba y el tenor abajo, pero
%%    el tenor (a') suena por encima de la contralto (f'). Escrito así
%%    es una falta (-> UD 1); aquí solo se trata de verlo al leer.

\include "comun.ily"
\include "etiquetas.ily"

\score {
  \new GrandStaff <<
    \new Staff {
      \clef treble
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \override TextScript.staff-padding = #2.5

      \rotulo "a) el do central" c'1  s
      \rotulo "b) 10.ª y 3.ª"    e'   e'
      \rotulo "c) cruce"         f'
      \bar "|."
    }
    \new Staff {
      \clef bass
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \override TextScript.staff-padding = #2.5

      s1  \grado "el mismo" c'
      \grado "10.ª M" c  \grado "3.ª M" c'
      \grado "suena encima" a'
      \bar "|."
    }
  >>
  \layout { }
}
