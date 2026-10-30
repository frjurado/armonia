\version "2.24.0"

%% Plantilla del tipo `grados-bajo-cifrado` (curriculum/Ejercicios-papel.md).
%% construir.py sustituye las dos marcas: la de TONALIDAD por la armadura
%% (del atributo tono="…" del ejercicio) y la de MATERIAL por el bloque
%% lilypond de la ficha, que define dos variables:
%%
%%   arriba   el pentagrama de Sol: el acorde escrito (\analitico) y su
%%            cifrado americano (\encima), una redonda por acorde
%%   abajo    el bajo cifrado: la nota con \figuras (el dato), y
%%            \gradoBajo y \acorde (la respuesta)
%%
%% Todo lo que es respuesta sale solo en las soluciones. En el ejercicio
%% no hay rayas: el primer acorde, resuelto (\modelo), ya enseña qué va
%% en cada fila y dónde (en una serie, solo el del apartado a). El alto
%% de las filas lo reserva la plantilla (ver abajo).
%%
%% Filas apretadas y sin espacio detrás, para que quepa una serie de
%% cuatro apartados en una hoja: el sitio para escribir ya está en las
%% filas reservadas.
%%
%% espacio: 0cm

\include "comun.ily"
\include "etiquetas.ily"

%% De arriba abajo: el cifrado americano (encima del Sol), el acorde, el
%% grado del bajo (entre los dos pentagramas, sobre el de Fa), el bajo y,
%% debajo, sus cifras y el romano.
alturaFiguras = #-5
alturaGradosBajo = #5
alturaGrados = #-8.7
alturaEncima = #4.8

%% El grado del bajo, algo mayor que el texto: el círculo, a tamaño de
%% texto, se lee mal.
tamanoGradoBajo = #3
gradoBajo =
#(define-music-function (texto) (markup?)
   (analitica (lambda (m) #{ \etiquetaArriba #alturaGradosBajo \markup \fontsize #tamanoGradoBajo #m #})
              texto))

%% Las cifras y el romano. En el ejercicio, las cifras son el dato (en su
%% fila, bajo el bajo) y el romano la respuesta (en la de debajo); en el
%% acorde modelo, el romano va solo, sin cifras, para no repetirlas. En la
%% solución, el romano lleva sus cifras, así que las del bajo sobran: se
%% quitan, y el romano ocupa su sitio, un poco más abajo (sus cifras
%% voladas no han de tocar las notas graves, con sus líneas adicionales).
%% Las dos versiones se distinguen por `analisis-por-defecto` (la de
%% \modelo cambia `conAnalisis` por el camino).
alturaRomanoSolucion = #-6.3
#(define nada (make-music 'SequentialMusic 'elements '()))
figuras =
#(define-music-function (cifras) (string?)
   (if analisis-por-defecto
       nada
       #{ \etiquetaAbajo #alturaFiguras
            #(make-override-markup '(baseline-skip . 2)
               (make-center-column-markup (string-split cifras #\/))) #}))
%% El romano del código: «V6/4» → «V».
#(define (romano-de codigo)
   (find (lambda (r) (string-prefix? r codigo)) '("VII" "VI" "V" "IV" "III" "II" "I")))
%% En la solución, el romano con sus cifras: las de la tabla de cifrado
%% (\acorde de siempre: «I6», «V♯»), o, si el código sigue con «5/…», las
%% del bajo tal cual («V5/3», «V5/♯»: el V tras el 6/4 cadencial, cuyas
%% cifras el romano no lleva). Mide lo que el romano solo: así se centra
%% el romano en la nota, y las cifras quedan voladas a su derecha.
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

%% Ancho fijo: la caja de texto (CAJA_PT en construir.py) entre la escala
%% de las figuras (ESCALA), y el sistema estirado hasta ella. Así todos los
%% apartados de una serie miden lo mismo y quedan alineados a los dos lados.
\paper { line-width = 327\pt ragged-right = ##f ragged-last = ##f }

%% Las filas de respuesta, reservadas siempre con un texto invisible: sin
%% ellas, un apartado de una serie (que no lleva \modelo) saldría sin
%% sitio para escribir encima y debajo.
reservaArriba = \etiquetaArriba #alturaEncima \markup \transparent "C"
reservaAbajo = {
  \etiquetaArriba #alturaGradosBajo \markup \transparent \fontsize #tamanoGradoBajo "①"
  \etiquetaAbajo #alturaGrados \markup \transparent "I"
}

\score {
  \new GrandStaff <<
    \new Staff {
      %%TONALIDAD%%
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \reservaArriba \arriba
      \bar "|."
    }
    \new Staff {
      \clef bass
      %%TONALIDAD%%
      \omit Staff.TimeSignature
      \cadenzaOn
      \textLengthOn
      \reservaAbajo \abajo
      \bar "|."
    }
  >>
  \layout {
    %% Aire entre acordes, para escribir debajo y encima de cada uno.
    \context { \Score \override SpacingSpanner.base-shortest-duration =
               #(ly:make-moment 1/32) }
    %% Todos los textos (americano, grado, cifras, romano), centrados en
    %% su acorde, no alineados a la izquierda.
    \context { \Voice \override TextScript.self-alignment-X = #CENTER
                      \override TextScript.parent-alignment-X = #CENTER }
  }
}
