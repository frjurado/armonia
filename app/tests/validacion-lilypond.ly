% ============================================================
%  Validación del camino a papel — mini-LilyPond → LilyPond
% ------------------------------------------------------------
%  Cada \score es lo que produciría el exportador a papel:
%  el envoltorio de contexto (\language, \clef, \key, \time)
%  tomado del JSON, + la cadena mini-LilyPond SIN RETOCAR.
%  Las cadenas musicales son idénticas a las del prototipo web
%  y a las que valida el parser.
%
%  Compilar (con LilyPond instalado):
%      lilypond validacion-lilypond.ly
%  Genera validacion-lilypond.pdf con los 5 ejemplos.
% ============================================================

\version "2.24.0"
\language "english"

% 1 · La menor — i (estado fundamental), clave de sol
\score {
  \new Staff { \clef treble \key a \minor <a c' e'>1 }
  \header { piece = "1 · La m, i" }
}

% 2 · La menor — III+ (aumentada; sensible sol♯), clave de sol
\score {
  \new Staff { \clef treble \key a \minor <c' e' gs'>1 }
  \header { piece = "2 · La m, III+ (gs)" }
}

% 3 · Re menor — i, clave de fa (armadura de 1 bemol)
\score {
  \new Staff { \clef bass \key d \minor <d f a>1 }
  \header { piece = "3 · Re m, i (clave de fa)" }
}

% 4 · Do mayor — V, clave de sol
\score {
  \new Staff { \clef treble \key c \major <g b d'>1 }
  \header { piece = "4 · Do M, V" }
}

% 5 · Rítmico: puntillo, ligadura de prolongación y bar check (La menor, 4/4)
\score {
  \new Staff { \clef treble \key a \minor \time 4/4 gs'2 gs'4 ~ gs'4 | a'1 }
  \header { piece = "5 · ritmo + tie + bar check" }
}
