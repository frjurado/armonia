\version "2.24.0"

%% 4.º UD 0, cierre — Ocho compases en Re mayor que reúnen los tres tipos
%% de progresión de la unidad (del MusicXML del profesor):
%%   cc. 1–3  prolongación de la tónica con la regla de la 8.ª en el bajo
%%            (①–②–③, y ⑦–①): I – V4/3 – I6 – V6 – I
%%   cc. 3–4  SC: II6 – I6/4 – V (el V4/2 del último tiempo enlaza con
%%            el I6 siguiente)
%%   cc. 5–6  secuencia: I6–IV, y un grado más abajo, VII6–III
%%   cc. 7–8  CAP: II6 – I6/4 – V – I
%% Encima, los corchetes de cada zona; debajo, los grados. Los dos son
%% análisis: en los ejemplos para clase sale solo la música.

\include "comun.ily"
\include "etiquetas.ily"

alturaGrados = #-9.5

%% Los corchetes de cada zona van en la soprano, como en
%% c4u0-circulo-quintas: el grabador de corchetes necesita notas, y en
%% una voz de silencios invisibles no dibuja nada.
soprano = {
  \voiceOne
  \once \override HorizontalBracketText.text = "regla de la 8.ª"
  d''2\startGroup cs'' | d'' e'' | fs''\stopGroup
  \once \override HorizontalBracketText.text = "SC"
  e''\startGroup | d'' cs''\stopGroup |
  \once \override HorizontalBracketText.text = "secuencia"
  d''\startGroup b' | cs'' a'\stopGroup |
  \once \override HorizontalBracketText.text = "CAP"
  g'\startGroup fs'4 e' | d'1\stopGroup \bar "|."
}

contralto = {
  \voiceTwo
  a'2 a' | a' a' | a' g' | a'1 |
  a'2 g' | g' fs' | e' d'4 cs' | a1
}

tenor = {
  \voiceOne
  fs'2 g' | fs' e' | d' b | fs' e' |
  d'1 | cs' | b2 a | fs1
}

bajo = {
  \voiceTwo
  d2 e | fs cs | d g, | a,2. g4 |
  fs2 g | e fs | g a4 a, | d1
}

%% Los grados, en otra voz de silencios: el la del c. 4 dura tres
%% tiempos y cambia de acorde en el tercero.
grados = {
  \acorde "I" s2 \acorde "V4/3" s2 |
  \acorde "I6" s2 \acorde "V6" s2 |
  \acorde "I" s2 \acorde "II6" s2 |
  \acorde "I6/4" s2 \acorde "V" s4 \acorde "V4/2" s4 |
  \acorde "I6" s2 \acorde "IV" s2 |
  \acorde "VII6" s2 \acorde "III" s2 |
  \acorde "II6" s2 \acorde "I6/4" s4 \acorde "V" s4 |
  \acorde "I" s1
}

\score {
  \new GrandStaff <<
    \new Staff << \key d \major \time 4/4
                  %% Los corchetes son análisis: sin él, invisibles.
                  \new Voice \with { \consists Horizontal_bracket_engraver
                                     \override HorizontalBracket.direction = #UP
                                     \override HorizontalBracket.transparent = #(not conAnalisis)
                                     \override HorizontalBracketText.transparent = #(not conAnalisis) }
                    \soprano
                  \new Voice \contralto >>
    \new Staff << \clef bass \key d \major \time 4/4
                  \new Voice \tenor
                  \new Voice \bajo
                  \new Voice { \textLengthOn \grados } >>
  >>
  \layout { }
}
