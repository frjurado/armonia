\version "2.24.0"

%% Plantilla del tipo `faltas-melodicas` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define una variable:
%%
%%   melodia   la línea, en blancas y sin compás, en clave de Sol (para
%%             otra clave, \clef al principio). La respuesta va en
%%             corchetes encima de las notas de cada defecto, que se abren
%%             en la primera nota y se cierran en la última:
%%               bf'2\falta "2.ª aum." cs''2\stopGroup
%%               d''2\mejorable "sin compensar" a' f'\stopGroup
%%             \falta para las normas (en el color de lo que está mal),
%%             \mejorable para las preferencias (en gris, entre paréntesis).
%%
%% Como en Movimientos › Melódicos de la app. Los corchetes son la
%% solución: en el ejercicio no salen. Sin modelo.
%%
%% espacio: 1cm

\include "comun.ily"
\include "etiquetas.ily"

#(define (corchete color texto)
   #{ -\tweak HorizontalBracket.color #color
      -\tweak HorizontalBracketText.color #color
      -\tweak HorizontalBracketText.text \markup \fontsize #-1 #texto
      \startGroup #})

falta =
#(define-event-function (texto) (markup?)
   (corchete colorMal texto))

mejorable =
#(define-event-function (texto) (markup?)
   (corchete (rgb-color 0.45 0.45 0.45) #{ \markup \concat { "(" #texto ")" } #}))

%% Sin análisis, los corchetes no se dibujan (pero se quedan, invisibles,
%% guardando su sitio: el ejercicio y la solución miden lo mismo).
ocultarCorchetes =
#(if conAnalisis
     #{ #}
     #{ \hide HorizontalBracket \hide HorizontalBracketText #})

%%MATERIAL%%

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella. Así todos los
%% apartados de una serie miden lo mismo y quedan alineados a los dos lados.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

\score {
  \new Staff \new Voice \with { \consists "Horizontal_bracket_engraver" } {
    %%TONALIDAD%%
    \omit Staff.TimeSignature
    \cadenzaOn
    \override HorizontalBracket.direction = #UP
    \override HorizontalBracket.bracket-flare = #'(0 . 0)
    \ocultarCorchetes
    \melodia
    \bar "|."
  }
  \layout {
    %% Aire entre notas: en el ejercicio, para escribir encima.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/16) }
  }
}
