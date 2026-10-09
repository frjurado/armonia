\version "2.24.0"

%% 4.º UD 1 §3.2 — Corelli, Concerto grosso op. 6 n.º 8, Pastorale, cc.
%% 8–10, Sol mayor. Reducción para piano (IMSLP), como la da A/S ej. 24-8
%% en armonía y bajo; se omite la última corchea del c. 10, que es
%% anacrusa de la frase siguiente.
%% Quintas descendentes con 4/2 y 6/3: I – II4/2 – V6 – I4/2 – IV6 –
%% VII4/2 – III6 – VI4/2 – II6 – V4/2 – I6. El bajo baja por grado, de
%% sol a si, sincopado: cada nota llega como consonancia, se liga, es la
%% 7.ª del 4/2 y resuelve bajando. Prolonga el I (de I a I6).

\include "comun.ily"
\include "etiquetas.ily"

superior = {
  \voiceOne
  g''4. r4 b''8 c''' b'' a'' d'''4 d''8
  | <g'' b''>4 b'8 r4 c'''8 a'' g'' fs'' b''4 b'8
  | <e'' g''>4 g'8 r4 a''8 fs'' e'' d'' g''4. \bar "||"
}

inferior = {
  \voiceTwo
  <b' d''>4. s4 g''8 a''4. r4.
  | s4 g'8 r4 e''8 fs''4. r4.
  | s4 e'8 r4 c''8 d''4. r4.
}

bajo = {
  \voiceOne
  g,4. g'2. fs'4.~ | fs' e'2. d'4.~ | d' c'2. b4.
}

%% Los romanos, en una voz aparte: caen a mitad de las notas largas.
analisis = {
  \voiceTwo
  \textLengthOn
  \acorde "I" s4. s4. \acorde "II4/2" s4. \acorde "V6" s4.
  | \acorde "I4/2" s4. \acorde "IV6" s4. \acorde "VII4/2" s4. \acorde "III6" s4.
  | \acorde "VI4/2" s4. \acorde "II6" s4. \acorde "V4/2" s4. \acorde "I6" s4.
}

\score {
  \new PianoStaff <<
    \new Staff << \key g \major \time 12/8
                  \new Voice \superior \new Voice \inferior >>
    \new Staff << \clef bass \key g \major \time 12/8
                  \new Voice \bajo \new Voice \analisis >>
  >>
  \layout { }
}
