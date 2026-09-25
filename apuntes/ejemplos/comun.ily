%% Preámbulo compartido por todos los ejemplos de los apuntes.
%% Fija idioma, escala de grabado y limpieza de página.
%% Los ficheros de ejemplo solo contienen música.

\version "2.24.0"
\language "english"          % coherente con mini-LilyPond §2: s/f = sostenido/bemol

#(set-global-staff-size 15)  % grosor del grabado, igual en todos los ejemplos

%% El texto de las partituras (grados, cifras, rótulos) va en «Armonia
%% Serif», la fuente de los apuntes: un V⁶₅ o un ⑤ tienen que ser el mismo
%% dibujo en el texto y en el ejemplo. La carpeta la da construir.py en
%% ARMONIA_FUENTES, una copia en una ruta SIN TILDES: fontconfig no carga
%% fuentes de una ruta con «Armonía» y, si no la encuentra, LilyPond
%% sustituye sin avisar. Sin la variable (una ruta sin tildes, como en la
%% publicación), se usa la carpeta del repositorio.
#(ly:font-config-add-directory
  (or (getenv "ARMONIA_FUENTES") "_formato/fuentes"))

\paper {
  #(define fonts (set-global-fonts #:roman "Armonia Serif"
                                   #:factor (/ staff-height pt 20)))
  indent = 0
  ragged-right = ##t
  print-page-number = ##f
  tagline = ##f              % fuera el "Music engraving by LilyPond"
}

%% Los ejemplos son fragmentos, no partituras: el número de compás que
%% LilyPond pone al empezar cada sistema solo despista.
\layout {
  \context { \Score \omit BarNumber }
}
