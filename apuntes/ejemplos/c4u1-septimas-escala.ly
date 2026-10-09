\version "2.24.0"

%% 4.º UD 1 §1.1 — Los acordes de séptima sobre los siete grados de Do
%% mayor y de La menor, en estado fundamental. Encima, el cifrado
%% americano (el tipo); debajo, el romano (el grado). En La menor, el sol♯
%% del V7 y del VII7, tintado: es lo único que no sale de la escala natural.
%% Mismo modelo que c3u1-triadas-escala.ly (las tríadas): dos pentagramas
%% en un solo sistema, alineados grado a grado.

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-6.5

colorSensible = #(rgb-color 0.12 0.30 0.55)

%% En Do mayor la séptima llega hasta el la5: el cifrado, más arriba.
alturaEncima = #6
mayor = {
  \omit Staff.TimeSignature
  \cadenzaOn
  \textLengthOn
  \encima "Cmaj7" <c' e' g' b'>1
  \encima "Dm7"   <d' f' a' c''>
  \encima "Em7"   <e' g' b' d''>
  \encima "Fmaj7" <f' a' c'' e''>
  \encima "G7"    <g' b' d'' f''>
  \encima "Am7"   <a' c'' e'' g''>
  \encima "Bø"    <b' d'' f'' a''>
  \bar "|."
}

alturaEncima = #4.5
menor = {
  \key a \minor
  \omit Staff.TimeSignature
  \cadenzaOn
  \textLengthOn
  \encima "Am7"   \acorde "I7"   <a c' e' g'>1
  \encima "Bø"    \acorde "II7"  <b d' f' a'>
  \encima "Cmaj7" \acorde "III7" <c' e' g' b'>
  \encima "Dm7"   \acorde "IV7"  <d' f' a' c''>
  \encima "E7"    \acorde "V7"   <e' \tweak color #colorSensible \tweak Accidental.color #colorSensible gs' b' d''>
  \encima "Fmaj7" \acorde "VI7"  <f' a' c'' e''>
  %% gs'!: en \cadenzaOn no hay compás que caduque el ♯ del V7.
  \encima "G♯°7"  \acorde "VII7" <\tweak color #colorSensible \tweak Accidental.color #colorSensible gs'! b' d'' f''>
  \bar "|."
}

\score {
  <<
    \new Staff \with {
      instrumentName = "Do mayor"
      \override VerticalAxisGroup.staff-staff-spacing =
        #'((basic-distance . 13) (minimum-distance . 13) (padding . 1))
    } \mayor
    \new Staff \with { instrumentName = "La menor" } \menor
  >>
  \layout { indent = 16\mm }
}
