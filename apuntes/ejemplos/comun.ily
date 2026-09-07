%% Preámbulo compartido por todos los ejemplos de los apuntes.
%% Fija idioma, escala de grabado y limpieza de página.
%% Los ficheros de ejemplo solo contienen música.

\version "2.24.0"
\language "english"          % coherente con mini-LilyPond §2: s/f = sostenido/bemol

#(set-global-staff-size 18)  % grosor del grabado, igual en todos los ejemplos

\paper {
  indent = 0
  ragged-right = ##t
  print-page-number = ##f
  tagline = ##f              % fuera el "Music engraving by LilyPond"
}
