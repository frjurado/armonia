\version "2.24.0"

%% Plantilla del tipo `plantear-bajo` (curriculum/Ejercicios-papel.md).
%% Solo el planteamiento de un bajo sin cifrar: tonalidad, grados con su
%% inversión y procedimientos (prolongación, secuencia, cadencia). Por eso
%% solo hay un pentagrama, el de Fa: no se realiza. construir.py sustituye la
%% marca TONALIDAD (del atributo tono="…", que da la armadura) y la de
%% MATERIAL, el bloque lilypond de la ficha, que define:
%%
%%   compas   \time 3/4 (y \partial, si hay anacrusa); 4/4 por defecto
%%   bajo     el dato, con la respuesta como análisis:
%%              \acorde "II6"     el grado, debajo
%%              \otro "IV"        otra lectura que también vale con ese
%%                                bajo, en una segunda fila («o IV»)
%%              \encima "CA"      el tramo que empieza en esa nota, encima;
%%                                en la primera, con la tonalidad:
%%                                \encima "Sol menor · Prol. I"
%%
%% Las filas quedan reservadas (\reservaArriba, \reservaAbajo), para que el
%% ejercicio deje sitio para escribir.
%%
%% espacio: 0.3cm

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-8.5
alturaOtro = #-12
alturaEncima = #5.5

compas = { \time 4/4 }

otro =
#(define-music-function (codigo) (string?)
   (analitica (lambda (m) #{ \etiquetaAbajo #alturaOtro #m #})
              (make-concat-markup (list (make-italic-markup "o ") (acorde->markup codigo)))))

%%MATERIAL%%

\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

reservaArriba = \etiquetaArriba #alturaEncima \markup \transparent "CAP"
reservaAbajo = \etiquetaAbajo #alturaGrados \markup \transparent "I"

\score {
  \new Staff {
    \clef bass
    %%TONALIDAD%%
    \compas
    \textLengthOn
    \reservaArriba \reservaAbajo \bajo
  }
  \layout { }
}
