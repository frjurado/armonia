%% Etiquetas de análisis compartidas por los ejemplos.
%% Se incluyen aparte de comun.ily porque son vocabulario del análisis,
%% no del grabado: al cambiar la notación de los apuntes se toca esto.
%%
%%   \rotulo "a) cadencial"       rótulo sobre el sistema (soprano)
%%   \grado "I"                   grado bajo el bajo (admite \markup)
%%   \gradoSeis "I"               grado en 1.ª inversión (I con 6 volado)
%%   \cifra "V" "6" "4"           grado con cifra apilada, volada como el 6
%%   \figuras "6" "4"             bajo cifrado sin grado: cifras apiladas
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

%% Las cifras de un grado van voladas (\super), como el 6 de \gradoSeis:
%% la de arriba, a la altura del 6 suelto, y la de abajo debajo de ella.
cifra =
#(define-music-function (romano arriba abajo) (markup? markup? markup?)
   #{ \grado \markup {
        \concat { #romano
                  \super \override #'(baseline-skip . 1.3)
                  \center-column { #arriba #abajo } } } #})

gradoSeis =
#(define-music-function (texto) (markup?)
   #{ \grado \markup { \concat { #texto \super "6" } } #})

%% Bajo cifrado propiamente dicho, sin romano: a tamaño de texto, y la
%% cifra de arriba sobre la misma línea base que un \grado "6" suelto.
figuras =
#(define-music-function (arriba abajo) (markup? markup?)
   #{ \grado \markup { \override #'(baseline-skip . 2)
                       \center-column { #arriba #abajo } } #})

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
