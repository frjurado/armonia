\version "2.24.0"

%% 4.º UD 1 §2.1 — Bach, coral «Helft mir Gotts Güte preisen» (BWV 16/6;
%% Riemenschneider 99), cc. 2–4, La menor. Es el ejemplo de P-D Tema 11
%% §2.1 y A/S ej. 12-2. Notas: edición de C. S. Sapp (bach-370-chorales,
%% chor099.krn), según Dörffel.
%% La contralto salta mi–la en el 2.º tiempo para tener el la (1̂) antes
%% del II6/5: así la 7.ª llega preparada, como retardo, y baja a sol♯.

\include "comun.ily"
\include "etiquetas.ily"

soprano = { \voiceOne \partial 4 e''4 | c'' a' b' b' | a'2.\fermata \bar "|." }
%% La ligadura discontinua no está en el original: señala la preparación
%% (los dos la son notas repetidas). «ret.», como en P-D y A/S.
contralto = {
  \voiceTwo \partial 4 e'4
  | e' \tieDashed a'~ \tieSolid \encima "ret." a' gs' | e'2.
}
tenor = { \voiceOne \partial 4 b4 | c'8 d' e'4 f' e'8 d' | c'2. }

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \partial 4 \acorde "V6" gs4
  | \acorde "I" a8 b \acorde "I6" c' a \acorde "II6/5" d4 \acorde "V" e
  | \acorde "I" a,2._\fermata
}

\score {
  \new GrandStaff <<
    \new Staff << \key a \minor \time 4/4
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key a \minor \time 4/4
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
