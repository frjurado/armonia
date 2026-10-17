\version "2.24.0"

%% Plantilla del tipo `realizar-bajo` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye la marca TONALIDAD (del atributo tono="…") y la
%% de MATERIAL, el bloque lilypond de la ficha, que define cuatro voces:
%%
%%   soprano, contralto   pentagrama de Sol
%%   tenor, bajo          pentagrama de Fa
%%
%% El bajo es el dato: sale siempre. Las otras tres son la solución y van
%% enteras dentro de \analitico: no hay acorde modelo, porque la
%% disposición la elige el alumno y hay varias buenas. Lo que sí va
%% resuelto es el primer grado (\modelo \acorde "I" \finModelo), que
%% enseña dónde se cifra. Las cadencias, con \encima sobre la soprano.
%% En el ejercicio quedan los dos pentagramas con el bajo solo.
%%
%% El compás es 4/4 si el material no define otro: compas = { \time 3/4 }.
%% Las filas de los grados y de las cadencias quedan siempre reservadas
%% (\reservaArriba, \reservaAbajo), también en los apartados de una serie,
%% que no llevan modelo.
%%
%% espacio: 0.1cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-8.5
alturaEncima = #6.5

compas = { \time 4/4 }

%%MATERIAL%%

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella. Así todos los
%% apartados de una serie miden lo mismo y quedan alineados a los dos lados.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

reservaArriba = \etiquetaArriba #alturaEncima \markup \transparent "CAP"
reservaAbajo = \etiquetaAbajo #alturaGrados \markup \transparent "I"

\score {
  \new GrandStaff <<
    \new Staff << %%TONALIDAD%% \compas
                  \new Voice { \voiceOne \reservaArriba \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass %%TONALIDAD%% \compas
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \textLengthOn \reservaAbajo \bajo } >>
  >>
  \layout { }
}
