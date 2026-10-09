\version "2.24.0"

%% 4.º UD 1 §3.1 — Mozart, Sonata para piano en Fa mayor K. 332, I, cc.
%% 60–65 (en Do menor). Notas: edición de C. S. Sapp
%% (mozart-piano-sonatas, sonata12-1.krn).
%% Secuencia de séptimas por quintas descendentes, un acorde por compás
%% (los dos últimos eslabones, uno por medio compás): I – IV7 – VII7 –
%% III7 – VI7 – II7 – V7. La mano derecha son las dos voces que se
%% encadenan: la 3.ª de cada acorde se mantiene como 7.ª del siguiente
%% (mi♭, la♭, re, sol, do, fa), y la 7.ª baja a la 3.ª.
%% Dos sistemas: en uno, los seis compases de corcheas no caben a tamaño
%% normal. Los fp, en la mano derecha (entre los pentagramas), para dejar
%% la fila de los romanos libre.

\include "comun.ily"
\include "etiquetas.ily"

%% Por debajo del la♭1 y el sol1 del bajo.
alturaGrados = #-8.5

derecha = {
  <ef' g'>8\fp <ef' g'> r <ef' g'> r <ef' g'>
  | <ef' af'>8\fp <ef' af'> r <ef' af'> r <ef' af'>
  | <d' af'>8\fp <d' af'> r <d' af'> r <d' af'> \break
  | <d' g'>8\fp <d' g'> r <d' g'> r <d' g'>
  | <c' g'>8\fp <c' g'> r <c' g'> <c' f'>\fp <c' f'>
  | r <c' f'> <b f'>\fp <b f'> r <b f'> \bar "||"
}

izquierda = {
  \textLengthOn
  \acorde "I" <c, c>4 ef g
  | \acorde "IV7" <f, f>4 af c'
  %% Sitio para los romanos del primer sistema: van a altura fija y el
  %% espaciado no los ve (y -dcrop no respeta system-system-spacing).
  | \acorde "VII7" <bf,, bf,>4
    s1*0_\markup \transparent \column { "I" \vspace #2.5 } d4 f
  | \acorde "III7" <ef, ef>4 g bf
  | \acorde "VI7" <af,, af,>4 af \acorde "II7" <d, d>4
  | d'4 \acorde "V7" <g,, g,>4 g
}

\score {
  \new PianoStaff <<
    \new Staff << \key f \major \time 3/4 \derecha >>
    \new Staff << \clef bass \key f \major \time 3/4 \izquierda >>
  >>
  \layout { }
}
