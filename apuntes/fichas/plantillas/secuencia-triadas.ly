\version "2.24.0"

%% Plantilla del tipo `secuencia-triadas` (curriculum/Ejercicios-papel.md).
%% Varias secuencias breves en un mismo sistema, cada una en su tonalidad:
%% por eso el ejercicio no lleva tono="…" (la marca TONALIDAD queda vacía),
%% y las armaduras las pone el material. construir.py sustituye la marca
%% MATERIAL por el bloque lilypond de la ficha, que define cinco variables:
%%
%%   global               compás, y la armadura y la doble barra de cada
%%                        secuencia: \key g \major s2.*3 \bar "||" …
%%   soprano, contralto   pentagrama de Sol, enteras en \analitico; la
%%                        soprano lleva delante el rótulo con la tonalidad,
%%                        que es dato, y como análisis el nombre de la
%%                        secuencia: \rotuloAnalisis "a) Sol mayor"
%%                        "a) Sol mayor: romanesca"
%%   tenor                pentagrama de Fa, en \analitico
%%   bajo                 el dato, con los grados (\acorde) como análisis
%%
%% Como Secuencia › Secuencia de 4.º UD 0 en la app. Sin modelo.
%%
%% espacio: 0.1cm

\include "comun.ily"
\include "etiquetas.ily"

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
                  \new Voice { \voiceTwo \textLengthOn \bajo } >>
  >>
  \layout { }
}
