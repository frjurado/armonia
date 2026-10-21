\version "2.24.0"

%% Plantilla del tipo `septima-bajo-cifrado` (curriculum/Ejercicios-papel.md).
%% Varios gestos cadenciales en un mismo sistema, cada uno en su tonalidad:
%% por eso el ejercicio no lleva tono="…" (la marca TONALIDAD queda vacía),
%% y las armaduras las pone el material. construir.py sustituye la marca
%% MATERIAL por el bloque lilypond de la ficha, que define cinco variables:
%%
%%   global               compás, y la armadura y la doble barra de cada
%%                        gesto: \key ef \major s1*3 \bar "||" …
%%   soprano, contralto   pentagrama de Sol
%%   tenor, bajo          pentagrama de Fa; el bajo, con sus \figuras
%%
%% El primer acorde de cada gesto es el dato: va fuera de \analitico, y la
%% soprano lleva delante el rótulo del gesto (\rotulo "a)"); la tonalidad
%% no se dice: la dan la armadura y el primer acorde. Lo demás es la solución, dentro de \analitico. La
%% ligadura que une la preparación con la 7.ª es parte de la respuesta: se
%% escribe \ligadura, no ~, y sin análisis no sale. Sin modelo: el primer
%% acorde ya es el punto de partida.
%%
%% espacio: 0.3cm

\include "comun.ily"
\include "etiquetas.ily"

alturaFiguras = #-6.5

%% Una ligadura que solo sale con el análisis (la de la preparación, que
%% sale del primer acorde, que sí se ve).
ligadura =
#(define-event-function () ()
   (if conAnalisis (make-music 'TieEvent) (make-music 'PostEvents)))

%%MATERIAL%%

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

\score {
  \new GrandStaff <<
    \new Staff << \global
                  \new Voice { \voiceOne \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass \global
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \bajo } >>
  >>
  \layout { }
}
