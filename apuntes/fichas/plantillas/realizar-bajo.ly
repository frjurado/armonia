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
%% espacio: 0.6cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-9.5
alturaEncima = #8

%%MATERIAL%%

\score {
  \new GrandStaff <<
    \new Staff << %%TONALIDAD%% \time 4/4
                  \new Voice { \voiceOne \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass %%TONALIDAD%% \time 4/4
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \textLengthOn \bajo } >>
  >>
  \layout { }
}
