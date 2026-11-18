\version "2.24.0"

%% Plantilla del tipo `leer-bajo-cifrado` (curriculum/Ejercicios-papel.md):
%% la de `grados-bajo-cifrado` sin el pentagrama de Sol. Es la versión en
%% papel de Morfología › Bajo cifrado de la app, y el ejercicio mínimo de
%% 3.º UD 1. construir.py sustituye la marca de TONALIDAD por la armadura
%% y la de MATERIAL por el bloque lilypond de la ficha, que define:
%%
%%   abajo    el bajo cifrado: la nota con \figuras (el dato), y
%%            \gradoBajo y \acorde (la respuesta)
%%
%% Lo demás (respuesta solo en la solución, \modelo, filas reservadas),
%% como en grados-bajo-cifrado.ly, de la que se copian las definiciones:
%% si cambian allí, cambiarlas aquí.
%%
%% espacio: 0cm

\include "comun.ily"
\include "etiquetas.ily"

%% De arriba abajo: el grado del bajo, el bajo y, debajo, sus cifras y el
%% romano.
alturaFiguras = #-5
alturaGradosBajo = #5
alturaGrados = #-8.7

%% El grado del bajo, algo mayor que el texto: el círculo, a tamaño de
%% texto, se lee mal.
tamanoGradoBajo = #3
gradoBajo =
#(define-music-function (texto) (markup?)
   (analitica (lambda (m) #{ \etiquetaArriba #alturaGradosBajo \markup \fontsize #tamanoGradoBajo #m #})
              texto))

%% Las cifras y el romano: en el ejercicio, las cifras son el dato y el
%% romano la respuesta; en la solución, el romano lleva sus cifras y las
%% del bajo se quitan (ver grados-bajo-cifrado.ly).
alturaRomanoSolucion = #-6.3
#(define nada (make-music 'SequentialMusic 'elements '()))
figuras =
#(define-music-function (cifras) (string?)
   (if analisis-por-defecto
       nada
       #{ \etiquetaAbajo #alturaFiguras
            #(make-override-markup '(baseline-skip . 2)
               (make-center-column-markup (string-split cifras #\/))) #}))
#(define (romano-de codigo)
   (find (lambda (r) (string-prefix? r codigo)) '("VII" "VI" "V" "IV" "III" "II" "I")))
#(define (acorde-solucion codigo)
   (let* ((r (romano-de codigo))
          (resto (substring codigo (string-length r))))
     (make-with-dimensions-from-markup
      r
      (if (or (string-prefix? "5/" resto) (member resto '("♮" "♭")))
          (make-concat-markup (list r (columna-cifras (string-split resto #\/))))
          (acorde->markup codigo)))))
acorde =
#(define-music-function (codigo) (string?)
   (cond (analisis-por-defecto #{ \etiquetaAbajo #alturaRomanoSolucion #(acorde-solucion codigo) #})
         (conAnalisis #{ \etiquetaAbajo #alturaGrados #(romano-de codigo) #})
         (else nada)))

%%MATERIAL%%

%% Ancho fijo, como en grados-bajo-cifrado.ly: el de la caja de texto.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

%% Las filas de respuesta, reservadas siempre con un texto invisible.
reservaAbajo = {
  \etiquetaArriba #alturaGradosBajo \markup \transparent \fontsize #tamanoGradoBajo "①"
  \etiquetaAbajo #alturaGrados \markup \transparent "I"
}

\score {
  \new Staff {
    \clef bass
    %%TONALIDAD%%
    \omit Staff.TimeSignature
    \cadenzaOn
    \textLengthOn
    \reservaAbajo \abajo
    \bar "|."
  }
  \layout {
    %% Aire entre notas, para escribir encima y debajo de cada una.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/32) }
    %% Todos los textos (grado, cifras, romano), centrados en su nota.
    \context { \Voice \override TextScript.self-alignment-X = #CENTER
                      \override TextScript.parent-alignment-X = #CENTER }
  }
}
