\version "2.24.0"

%% 3.º UD 1 §1.3 — Consonancias perfectas, imperfectas y disonancias,
%% en tres bloques. Todas sobre do4 salvo los dos intervalos del tritono,
%% que se escriben donde salen en la escala de Do: fa–si (4ªA) y si–fa
%% (5ªD). El unísono va a dos voces, con una plica para cada una: en un
%% acorde, las dos notas se dibujarían una encima de otra y no se vería.

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-7.5
rotulosLibres = ##t   % «Perfectas»… no apartan las notas de su bloque

\score {
  \new Staff {
    \omit Staff.TimeSignature
    \cadenzaOn
    \textLengthOn
    \rotulo "Perfectas"
    \grado "U" << { \voiceOne c'2 } \new Voice { \voiceTwo c'2 } >> \oneVoice
    \grado "5ªJ" <c' g'>1
    \grado "8ªJ" <c' c''>1
    \bar "||"
    \rotulo "Imperfectas"
    \grado "3ªm" <c' ef'>1
    \grado "3ªM" <c' e'>1
    \grado "6ªm" <c' af'>1
    \grado "6ªM" <c' a'>1
    \bar "||"
    \rotulo "Disonancias"
    \grado "2ªM" <c' d'>1
    \grado "7ªm" <c' bf'>1
    \grado "4ªA" <f' b'>1
    \grado "5ªD" <b' f''>1
    \bar "|."
  }
  \layout { }
}
