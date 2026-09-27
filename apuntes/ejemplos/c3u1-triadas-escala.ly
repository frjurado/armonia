\version "2.24.0"

%% 3.º UD 1 §1.1 — Las siete tríadas de Do mayor y las siete de La
%% menor, en estado fundamental. Encima, el cifrado americano (el tipo);
%% debajo, el romano (el grado). En La menor, el sol♯ del V y del VII,
%% tintado: es lo único que no sale de la escala natural.
%% Dos pentagramas en un solo sistema, alineados grado a grado, para
%% comparar en vertical el tipo de cada grado en los dos modos. (Dos
%% sistemas con \break quedaban pegados: -dcrop no respeta el
%% system-system-spacing.)

\include "comun.ily"
\include "etiquetas.ily"

alturaEncima = #4.5
alturaGrados = #-6.5

%% Ni el verde ni el rojo de \bien y \mal: aquí no hay nada bien ni mal.
colorSensible = #(rgb-color 0.12 0.30 0.55)

mayor = {
  \omit Staff.TimeSignature
  \cadenzaOn
  \textLengthOn
  \encima "C"  \acorde "I"   <c' e' g'>1
  \encima "Dm" \acorde "II"  <d' f' a'>
  \encima "Em" \acorde "III" <e' g' b'>
  \encima "F"  \acorde "IV"  <f' a' c''>
  \encima "G"  \acorde "V"   <g' b' d''>
  \encima "Am" \acorde "VI"  <a' c'' e''>
  \encima "B°" \acorde "VII" <b' d'' f''>
  \bar "|."
}

menor = {
  \key a \minor
  \omit Staff.TimeSignature
  \cadenzaOn
  \textLengthOn
  \encima "Am"  \acorde "I"   <a c' e'>1
  \encima "B°"  \acorde "II"  <b d' f'>
  \encima "C"   \acorde "III" <c' e' g'>
  \encima "Dm"  \acorde "IV"  <d' f' a'>
  \encima "E"   \acorde "V"   <e' \tweak color #colorSensible \tweak Accidental.color #colorSensible gs' b'>
  \encima "F"   \acorde "VI"  <f' a' c''>
  \encima "G♯°" \acorde "VII" <\tweak color #colorSensible \tweak Accidental.color #colorSensible gs' b' d''>
  \bar "|."
}

%% Sin agrupar: no son las dos manos de una misma música (eso sería un
%% GrandStaff, ver README), sino dos tonalidades puestas lado a lado.
\score {
  <<
    \new Staff \with {
      instrumentName = "Do mayor"
      \override VerticalAxisGroup.staff-staff-spacing =
        #'((basic-distance . 16) (padding . 4))
    } \mayor
    \new Staff \with { instrumentName = "La menor" } \menor
  >>
  \layout { indent = 16\mm }   % sitio para el nombre de cada pentagrama
}
