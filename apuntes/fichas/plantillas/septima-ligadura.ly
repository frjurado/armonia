\version "2.24.0"

%% Plantilla del tipo `septima-ligadura` (curriculum/Ejercicios-papel.md).
%% Como septima-bajo-cifrado.ly: varios gestos cadenciales en un mismo
%% sistema, sin tono="…", y el material define las mismas cinco variables
%% (global, soprano, contralto, tenor, bajo). Cambia esto:
%%
%%   - el bajo va sin cifrar, y lleva la respuesta: \acorde bajo cada
%%     acorde (II o IV y su inversión), con el del primer acorde del
%%     primer gesto como modelo (\modelo \acorde "I" \finModelo);
%%   - la ligadura de preparación es el DATO: sale del primer acorde con ~,
%%     y llega a una nota escrita con \llega, que sin análisis está pero
%%     no se ve. Así la ligadura dice qué nota será la 7.ª sin decir nada
%%     más. Si la 7.ª sigue hasta un 6/4 cadencial, esa segunda ligadura
%%     es respuesta: \ligadura (no sale sin análisis).
%%
%% espacio: 0.3cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-7.5

llega =
#(define-music-function (nota) (ly:music?)
   (if conAnalisis nota #{ \hideNotes #nota \unHideNotes #}))

ligadura =
#(define-event-function () ()
   (if conAnalisis (make-music 'TieEvent) (make-music 'PostEvents)))

%% La fila de los grados, reservada: sin ella, el ejercicio no deja sitio
%% debajo para escribir.
reserva = \etiquetaAbajo #alturaGrados \markup \transparent "I"

%%MATERIAL%%

\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

\score {
  \new GrandStaff <<
    \new Staff << \global
                  \new Voice { \voiceOne \soprano }
                  \new Voice { \voiceTwo \contralto } >>
    \new Staff << \clef bass \global
                  \new Voice { \voiceOne \tenor }
                  \new Voice { \voiceTwo \textLengthOn \reserva \bajo } >>
  >>
  \layout { }
}
