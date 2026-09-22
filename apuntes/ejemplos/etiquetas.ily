%% Etiquetas de análisis compartidas por los ejemplos.
%% Se incluyen aparte de comun.ily porque son vocabulario del análisis,
%% no del grabado: al cambiar la notación de los apuntes se toca esto.
%%
%%   \rotulo "a) cadencial"       rótulo sobre el sistema (soprano)
%%   \grado "I"                   grado bajo el bajo (admite \markup)
%%   \gradoSeis "I"               grado en 1.ª inversión (I con 6 volado)
%%   \cifra "V" "6" "4"           grado con cifra apilada a su derecha
%%
%% Los tres van pegados a un silencio de duración cero, así que se
%% escriben DELANTE de la nota a la que acompañan.

\version "2.24.0"

rotulo =
#(define-music-function (texto) (markup?)
   #{ s1*0^\markup { \bold \fontsize #1 #texto } #})

grado =
#(define-music-function (texto) (markup?)
   #{ s1*0_\markup { #texto } #})

cifra =
#(define-music-function (grado arriba abajo) (markup? markup? markup?)
   #{ s1*0_\markup {
        \concat { #grado \hspace #0.3
                 \small \override #'(baseline-skip . 1.7)
                 \center-column { #arriba #abajo } } } #})

gradoSeis =
#(define-music-function (texto) (markup?)
   #{ s1*0_\markup { \concat { #texto \super "6" } } #})
