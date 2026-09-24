\version "2.24.0"

%% 3.º UD 0 §2.3 — Leer el sistema de dos pentagramas como uno solo.
%%
%% a) El do central, la bisagra: primera línea adicional por debajo del
%%    pentagrama de Sol y primera por encima del de Fa son la MISMA nota,
%%    escrita aquí una vez en cada clave.
%% b) Una 10.ª y una 3.ª a caballo de los dos pentagramas: misma
%%    clasificación, distinta distancia.
%% c) Un cruce: la contralto está escrita arriba (do4) y el tenor abajo
%%    (mi4), pero el tenor suena por encima. Se eligen esas dos notas y
%%    no otras porque caen a una línea adicional de cada pentagrama, que
%%    es justo la referencia de (a): el cruce se ve sin contar.
%%    Escrito así es una falta (-> UD 1); aquí solo se trata de verlo.
%%
%% Los rótulos de arriba van SIN \textLengthOn, a propósito: si reservan
%% su ancho, «a) do central» empuja hacia la derecha la segunda nota de
%% su propio grupo, y las dos notas que hay que ver juntas —la misma, en
%% las dos claves— acaban separadas media línea. Alineados a la
%% izquierda y cortos, no se pisan entre sí.
%% Los de abajo sí lo llevan: van uno por nota, y sin reservar sitio
%% LilyPond los apila en dos alturas para esquivarse.

\include "comun.ily"
\include "etiquetas.ily"

\score {
  \new GrandStaff <<
    \new Staff {
      \clef treble
      \omit Staff.TimeSignature
      \cadenzaOn
      \override TextScript.self-alignment-X = #LEFT
      \override TextScript.staff-padding = #2.5

      \rotulo "a) do central"  c'1  s   \bar "|"
      \rotulo "b) 10.ª y 3.ª"  e'   e'  \bar "|"
      \rotulo "c) cruce"       c'
      \bar "|."
    }
    \new Staff {
      \clef bass
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \override TextScript.self-alignment-X = #LEFT
      \override TextScript.staff-padding = #2.5

      s1 c'  \bar "|"
      \grado "10.ª M" c  \grado "3.ª M" c'  \bar "|"
      e'
      \bar "|."
    }
  >>
  \layout { }
}
