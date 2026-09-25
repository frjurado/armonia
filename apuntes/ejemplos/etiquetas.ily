%% Etiquetas de análisis compartidas por los ejemplos.
%% Se incluyen aparte de comun.ily porque son vocabulario del análisis,
%% no del grabado: al cambiar la notación de los apuntes se toca esto.
%%
%%   \rotulo "a) cadencial"       rótulo sobre el sistema (soprano)
%%   \acorde "V6/5"               grado con su cifrado, por CÓDIGO (ver abajo)
%%   \grado "cerrada"             cualquier otra etiqueta bajo el bajo
%%   \figuras "6/4"               bajo cifrado sin grado: cifras apiladas
%%   \rotuloBien, \bien, \mal...  bien y mal (ver al final)
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

alturaRotulos = #6.5
alturaGrados = #-7

rotulo =
#(define-music-function (texto) (markup?)
   #{ s1*0 -\tweak outside-staff-priority ##f
           -\tweak Y-offset #alturaRotulos
           ^\markup { \bold \fontsize #-1 #texto } #})

grado =
#(define-music-function (texto) (markup?)
   #{ s1*0 -\tweak outside-staff-priority ##f
           -\tweak Y-offset #alturaGrados
           _\markup { #texto } #})

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

#(define (acorde->markup codigo)
   (let ((m (string-match
             "^([(]?)(VII|VI|V|IV|III|II|I)(6/4|6/5|4/3|4/2|6|7)?([)]?)$"
             codigo)))
     (if (not m)
         (ly:error "acorde: no entiendo el código «~a»" codigo))
     (let* ((romano (match:substring m 2))
            (inversion (or (match:substring m 3) ""))
            (tabla (if (member inversion '("7" "6/5" "4/3" "4/2"))
                       (if (member romano (assoc-ref tablaCifrado "dominante"))
                           "séptima de dominante"
                           "séptima")
                       "tríada"))
            (cifras (assoc-ref (assoc-ref tablaCifrado tabla) inversion)))
       (make-concat-markup
        (list (match:substring m 1)
              romano
              (if (null? cifras) "" (columna-cifras cifras))
              (match:substring m 4))))))

acorde =
#(define-music-function (codigo) (string?)
   #{ \grado #(acorde->markup codigo) #})

%% Bajo cifrado sin romano: las cifras de arriba abajo, separadas por
%% «/», como en el texto: \figuras "6/4", \figuras "6/(3)", \figuras "♯".
%% Misma fuente y misma columna que las cifras de \acorde, para que todo el
%% cifrado de los apuntes se vea igual (por eso no se usa el \figuremode de
%% LilyPond, con sus cifras negritas: ver ESTILO.md). Pero a tamaño de
%% texto: sin romano al lado, a tamaño de volado no se leen. Estas no pasan
%% por la tabla de cifrado: son las cifras tal cual.
figuras =
#(define-music-function (cifras) (string?)
   #{ \grado #(make-override-markup '(baseline-skip . 2)
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
