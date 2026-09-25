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
%% Los rótulos de arriba reservan su ancho (\textLengthOn) SOLO frente a lo
%% que está a su altura, es decir, frente a los otros rótulos
%% (extra-spacing-height a cero), con algo de aire detrás. Así no se
%% pisan entre sí, y a la vez «a) do central» puede pasar por encima de
%% la segunda nota de su grupo sin empujarla: las dos notas que hay que
%% ver juntas —la misma, en las dos claves— no se separan. Reservando
%% contra todo, las separaba media línea; sin reservar, «a)» y «b)» se
%% montaban (o LilyPond subía uno para esquivar).
%% Los de abajo sí lo llevan: van uno por nota, y sin reservar sitio
%% LilyPond los apila en dos alturas para esquivarse.

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
      \override TextScript.extra-spacing-height = #'(0 . 0)
      \override TextScript.extra-spacing-width = #'(0 . 1.5)
      \override TextScript.self-alignment-X = #LEFT
      \override TextScript.staff-padding = #2.5

      \rotulo "a) do central"  c'1  s   \bar "|"
      \rotulo "b) 10ª y 3ª"  e'   e'  \bar "|"
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
      \grado "10ªM" c  \grado "3ªM" c'  \bar "|"
      e'
      \bar "|."
    }
  >>
  \layout { }
}
