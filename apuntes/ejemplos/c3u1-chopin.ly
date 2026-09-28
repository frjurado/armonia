\version "2.24.0"

%% 3.º UD 1, cierre — F. Chopin, Nocturno op. 37 n.º 1, cc. 41–44: el
%% coral de la sección central, justo tras el cambio de armadura
%% (Mi♭ mayor). Transcrito de la edición de G. Henle Verlag, Múnich,
%% 1980 (p. 60); sin digitaciones y sin la ligadura de fraseo, que sigue
%% más allá del c. 44.
%%
%% Cuatro voces en acordes, todos en estado fundamental:
%%   41  I – IV – IV – I      42  IV – I – V – I
%%   43  V – I – IV – I       44  V – VI – V7 – I
%% En los cc. 41–42 la mano derecha está escrita, como en el original,
%% en el pentagrama de Fa (plicas arriba); en el 43 sube al de Sol. En
%% el V7 del c. 44, arpegio y apoyatura (sol4). El I final va sin 5.ª:
%% la sensible y la 5.ª del V7 llegan las dos al mi♭4.
%%
%% Va en los ejemplos para clase (.aula): sin análisis, sale sin los
%% romanos, que es lo que se hace en clase.

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-9.5

derecha = {
  \key ef \major
  \change Staff = "abajo"
  \voiceOne
  <ef g bf>4^\p <ef af c'> <ef af c'> <ef g bf> |
  <ef af c'> <g bf ef'> <f bf d'> <g bf ef'> |
  \change Staff = "arriba"
  \oneVoice
  <bf d' f'> <bf ef' g'> <c' ef' af'> <bf ef' g'> |
  %% Duraciones explícitas tras el \grace, o heredan su corchea.
  <bf d' f'> <g c' ef'> \grace g'8 <af d' f'>4\arpeggio <g ef'>4 \bar "||"
}

izquierda = {
  \key ef \major
  \voiceTwo
  \acorde "I" ef,4 \acorde "IV" af, af, \acorde "I" ef, |
  \acorde "IV" af, \acorde "I" ef, \acorde "V" bf, \acorde "I" ef, |
  \oneVoice
  \acorde "V" bf, \acorde "I" ef \acorde "IV" af, \acorde "I" ef |
  \acorde "V" bf, \acorde "VI" c \grace s8 \acorde "V7" bf,4 \acorde "I" ef, |
}

\score {
  \new PianoStaff <<
    \new Staff = "arriba" { \key ef \major s1*4 }
    \new Staff = "abajo" { \clef bass << \new Voice \derecha \new Voice \izquierda >> }
  >>
  %% Algo más ancho que el espaciado natural de las negras: debajo de
  %% cada acorde va un romano, y en la versión para clase se escribe a
  %% mano. No más: con 1/32 medía 437 pt y había que reducirlo para que
  %% cupiera en la caja; con 1/8 son 296 y sale a la escala de los demás.
  \layout { \context { \Score \override SpacingSpanner.base-shortest-duration =
                       #(ly:make-moment 1/8) } }
}
