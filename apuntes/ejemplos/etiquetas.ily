%% Etiquetas de análisis compartidas por los ejemplos.
%% Se incluyen aparte de comun.ily porque son vocabulario del análisis,
%% no del grabado: al cambiar la notación de los apuntes se toca esto.
%%
%%   \rotulo "a) cadencial"       rótulo sobre el sistema (soprano)
%%   \acorde "V6/5"               grado con su cifrado, por CÓDIGO (ver abajo)
%%   \grado "cerrada"             cualquier otra etiqueta bajo el bajo
%%   \gradoBajo "①"              grado del bajo, en su propia fila
%%   \encima "3̂"                  análisis sobre el sistema (grados, C/E…)
%%   \figuras "6/4"               bajo cifrado sin grado: cifras apiladas
%%   \analitico <c' e' g'>1       notas que solo salen con el análisis
%%   \modelo … \finModelo         tramo que sale resuelto siempre (ver abajo)
%%   \rotuloBien, \bien, \mal...  bien y mal (ver al final)
%%
%% CON Y SIN ANÁLISIS. Las etiquetas que SON el análisis —\acorde,
%% \grado, \gradoBajo, \encima, \analitico— se pueden quitar sin tocar el
%% ejemplo: construir.py graba una segunda versión con la variable de
%% entorno ARMONIA_SIN_ANALISIS, y entonces desaparecen. Es la versión
%% que va a los «ejemplos para clase» (lo que el alumno trae para
%% analizar) y a los ejercicios de las fichas (sin las soluciones).
%% Lo que es MATERIAL y no análisis se queda siempre: \rotulo («a)»,
%% «CAP»…) y \figuras (un bajo cifrado es el dato, no la respuesta).
%% Con `huecos = ##t` (lo ponen las plantillas de las fichas), lo que
%% desaparece deja una raya en su lugar, para escribir la respuesta.
%%
%% Rótulos y grados van pegados a un silencio de duración cero, así que se
%% escriben DELANTE de la nota a la que acompañan.
%%
%% ALTURA FIJA. Grados y rótulos no se apartan cada uno de su nota (lo que
%% LilyPond hace por defecto, plicas incluidas, y deja una fila de grados
%% en escalera): van todos a la misma distancia del pentagrama, sobre la
%% misma línea base. Las distancias, en espacios de pentagrama desde la
%% línea central, son estas dos variables; un ejemplo con notas más
%% extremas las redefine antes de usar las etiquetas:
%%
%%   alturaGrados = #-8
%%
%% Como ya no esquivan nada, si una nota se sale de lo previsto la
%% etiqueta se le monta encima: mirar el ejemplo al cambiarlo.

\version "2.24.0"

%% Las filas que valen ##f toman la altura de otra: \encima la de los
%% rótulos, y \gradoBajo y \figuras la de los grados. Un ejemplo que
%% use dos filas a la vez (① y romano, o cifras y romano) las separa.
alturaRotulos = #6.5
alturaGrados = #-7
alturaEncima = ##f
alturaGradosBajo = ##f
alturaFiguras = ##f

#(define analisis-por-defecto (not (getenv "ARMONIA_SIN_ANALISIS")))
conAnalisis = #analisis-por-defecto
huecos = ##f

%% MODELO. Lo que va entre \modelo y \finModelo sale siempre con su
%% análisis, también en la versión sin él: es el primer acorde resuelto
%% de un ejercicio, para que se entienda qué se pide. Como las etiquetas
%% se deciden al leerse, basta con cambiar el interruptor por el camino:
%%   \modelo \gradoBajo "①" \acorde "I" \finModelo g,1
#(define (poner-analisis! valor) (set! conAnalisis valor))
modelo = #(define-void-function () () (poner-analisis! #t))
finModelo = #(define-void-function () () (poner-analisis! analisis-por-defecto))

etiquetaArriba =
#(define-music-function (altura texto) (number? markup?)
   #{ s1*0 -\tweak outside-staff-priority ##f
           -\tweak Y-offset #altura
           ^\markup { #texto } #})

etiquetaAbajo =
#(define-music-function (altura texto) (number? markup?)
   #{ s1*0 -\tweak outside-staff-priority ##f
           -\tweak Y-offset #altura
           _\markup { #texto } #})

%% Una etiqueta de análisis: `poner` es la función que la coloca en su
%% fila. Sin análisis no queda nada, o una raya si se piden huecos.
#(define (analitica poner texto)
   (cond (conAnalisis (poner texto))
         (huecos (poner (markup #:with-color (rgb-color 0.55 0.55 0.55)
                                #:draw-line '(3.5 . 0))))
         (else (make-music 'SequentialMusic 'elements '()))))

%% RÓTULOS QUE NO EMPUJAN. Con \textLengthOn, un rótulo largo («a)
%% contrario», «Imperfectas») ensancha su columna y aparta la nota
%% siguiente. Con `rotulosLibres = ##t`, los rótulos no cuentan para el
%% espaciado: las notas quedan donde las pone la música, y el rótulo
%% vuela por encima. Lo único que no se evita solo es que dos rótulos
%% seguidos se toquen: si pasa, hay que dar aire al bloque (mirar el
%% ejemplo al cambiarlo). Por defecto no, para no mover los publicados.
rotulosLibres = ##f

rotulo =
#(define-music-function (texto) (markup?)
   (if rotulosLibres
       #{ s1*0 -\tweak outside-staff-priority ##f
               -\tweak Y-offset #alturaRotulos
               -\tweak extra-spacing-width #'(+inf.0 . -inf.0)
               ^\markup { \bold \fontsize #-1 #texto } #}
       #{ \etiquetaArriba #alturaRotulos \markup { \bold \fontsize #-1 #texto } #}))

encima =
#(define-music-function (texto) (markup?)
   (analitica (lambda (m) #{ \etiquetaArriba #(or alturaEncima alturaRotulos) #m #})
              texto))

grado =
#(define-music-function (texto) (markup?)
   (analitica (lambda (m) #{ \etiquetaAbajo #alturaGrados #m #}) texto))

gradoBajo =
#(define-music-function (texto) (markup?)
   (analitica (lambda (m) #{ \etiquetaAbajo #(or alturaGradosBajo alturaGrados) #m #})
              texto))

%% Notas que son la respuesta (el acorde escrito, en una ficha): sin
%% análisis se cambian por un silencio invisible de la misma duración,
%% para que el pentagrama conserve su medida.
analitico =
#(define-music-function (musica) (ly:music?)
   (if conAnalisis musica (skip-of-length musica)))

%% GRADOS CON CIFRADO. Se escribe el código, con la inversión a la
%% anglosajona, igual que en el texto de los apuntes: \acorde "I6/4",
%% \acorde "V7", \acorde "V6/5". Admite paréntesis pegados, para lo que
%% prolonga: \acorde "(IV", \acorde "V7)", \acorde "(VII6)".
%% Qué cifras salen lo dice curriculum/cifrado.json (convención francesa:
%% V7 con + debajo, V6/5 con el 5 tachado, V+6, V+4), que construir.py
%% traduce a tmp/cifrado.ily. La misma tabla la usa el texto (cifrado.lua):
%% cambiar de convención es cambiarla ahí, no aquí.
%% Las cifras van voladas y apiladas: la de arriba a la altura de un
%% volado, la de abajo debajo.
\include "cifrado.ily"

#(use-modules (ice-9 regex))

%% La columna de cifras, voladas: igual con romano (\acorde) que sin él
%% (\figuras), y igual que en el texto (#cifra en pdf.typ, .cifras en el CSS).
#(define (columna-cifras cifras)
   (make-super-markup
    (make-override-markup '(baseline-skip . 1.3)
     (make-center-column-markup cifras))))

%% El ♯ se cambia por # antes de buscar: las expresiones regulares de
%% Guile cuentan bytes, y un carácter de varios bytes descuadra los
%% índices de match:substring.
#(define (acorde->markup codigo)
   (let ((m (string-match
             "^([(]?)(VII|VI|V|IV|III|II|I)(6/4|6/5|4/3|4/2|6|7|#)?([)]?)$"
             (ly:string-substitute "♯" "#" codigo))))
     (if (not m)
         (ly:error "acorde: no entiendo el código «~a»" codigo))
     (let* ((romano (match:substring m 2))
            (inversion (or (match:substring m 3) ""))
            (tabla (if (member inversion '("7" "6/5" "4/3" "4/2"))
                       (if (member romano (assoc-ref tablaCifrado "dominante"))
                           "séptima de dominante"
                           "séptima")
                       "tríada"))
            ;; «V♯»: la sensible explícita, voladita como una cifra. No es
            ;; la norma (la V tríada no lleva +), sino para subrayarla
            ;; donde hace falta: al lado de un V sin sensible, p. ej.
            (cifras (if (string=? inversion "#")
                        '("♯")
                        (assoc-ref (assoc-ref tablaCifrado tabla) inversion))))
       (make-concat-markup
        (list (match:substring m 1)
              romano
              (if (null? cifras) "" (columna-cifras cifras))
              (match:substring m 4))))))

acorde =
#(define-music-function (codigo) (string?)
   (analitica (lambda (m) #{ \etiquetaAbajo #alturaGrados #m #})
              (acorde->markup codigo)))

%% Bajo cifrado sin romano: las cifras de arriba abajo, separadas por
%% «/», como en el texto: \figuras "6/4", \figuras "6/(3)", \figuras "♯".
%% Misma fuente y misma columna que las cifras de \acorde, para que todo el
%% cifrado de los apuntes se vea igual (por eso no se usa el \figuremode de
%% LilyPond, con sus cifras negritas: ver ESTILO.md). Pero a tamaño de
%% texto: sin romano al lado, a tamaño de volado no se leen. Estas no pasan
%% por la tabla de cifrado: son las cifras tal cual.
%% No es análisis: sale también en la versión sin él.
figuras =
#(define-music-function (cifras) (string?)
   #{ \etiquetaAbajo #(or alturaFiguras alturaGrados)
        #(make-override-markup '(baseline-skip . 2)
           (make-center-column-markup (string-split cifras #\/))) #})

%% Bien y mal. Para los ejemplos que enseñan un error junto a su
%% arreglo:
%%
%%   \rotuloBien "b)"    \rotuloMal "a)"   rótulo con ✓ o ✗ detrás
%%   \bien c''2          \mal c''2         la nota siguiente, tintada
%%   \mal c''2\glissando \mal d''          y unida a la siguiente con una
%%                                         raya (el \glissando, que sale
%%                                         del color de la primera)
%%
%% Oscuros a propósito: se imprimen en negro, y un rojo claro sale
%% gris claro. Por eso también la raya y la marca: en papel, color
%% aparte, el ejemplo tiene que seguir leyéndose.
%% ✓ y ✗ van dibujados, no como caracteres: la fuente de LilyPond no
%% los trae y así no dependen de ninguna.

colorBien = #(rgb-color 0.10 0.42 0.20)
colorMal = #(rgb-color 0.62 0.08 0.08)

#(define-markup-command (marcaBien layout props) ()
   (interpret-markup layout props
     #{ \markup \with-color #colorBien
          \path #0.35 #'((moveto 0 0.55) (lineto 0.38 0.1) (lineto 1.05 1.1)) #}))

#(define-markup-command (marcaMal layout props) ()
   (interpret-markup layout props
     #{ \markup \with-color #colorMal
          \path #0.35 #'((moveto 0 0.1) (lineto 0.9 1.0)
                         (moveto 0 1.0) (lineto 0.9 0.1)) #}))

rotuloBien =
#(define-music-function (texto) (markup?)
   #{ \rotulo \markup { #texto \hspace #0.4 \marcaBien } #})

rotuloMal =
#(define-music-function (texto) (markup?)
   #{ \rotulo \markup { #texto \hspace #0.4 \marcaMal } #})

bien = {
  \once \override NoteHead.color = #colorBien
  \once \override Accidental.color = #colorBien
  \once \override Stem.color = #colorBien
  \once \override Glissando.color = #colorBien
}

mal = {
  \once \override NoteHead.color = #colorMal
  \once \override Accidental.color = #colorMal
  \once \override Stem.color = #colorMal
  \once \override Glissando.color = #colorMal
}
