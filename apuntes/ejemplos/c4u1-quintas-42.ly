\version "2.24.0"

%% 4.º UD 1 §3.2 — Quintas descendentes con 4/2, en Do mayor. El mismo
%% bajo en los dos casos: I – I6, y desde ahí baja por grado, sincopado:
%% cada nota llega en la segunda mitad del compás como consonancia y se
%% liga a la primera del siguiente, donde es la 7.ª del 4/2 (un retardo
%% en el bajo), que resuelve bajando. Corchetes: modelo y dos
%% repeticiones, un grado más abajo.
%% a) 4/2 y 6/3: I – I6 – IV4/2 – VII6 – III4/2 – VI6 – II4/2 – V6 – I.
%%    Soprano en zigzag: (sol) la–si, sol–la, fa–sol.
%% b) 4/2 y 6/5: I – I6 – IV4/2 – VII6/5 – III4/2 – VI6/5 – II4/2 –
%%    V6/5 – I. La soprano lleva las 7.as de los 6/5 (la, sol, fa),
%%    preparadas en el 4/2 anterior: la–la, sol–sol, fa–fa.
%% Dos sistemas: en uno no caben los diez compases.

\include "comun.ily"
\include "etiquetas.ily"

%% Aire entre los dos sistemas: los romanos del primero, a altura fija,
%% el espaciado no los ve.
\paper { system-system-spacing = #'((basic-distance . 30) (minimum-distance . 30) (padding . 2)) }

soprano = {
  \voiceOne
  \rotulo "a)" g'2 g'
  \once \override HorizontalBracketText.text = "modelo"
    | a'\startGroup b'\stopGroup | g'\startGroup a'\stopGroup
    | f'\startGroup g'\stopGroup | e'1 \bar "||" \break
  \rotulo "b)" g'2 g'
  \once \override HorizontalBracketText.text = "modelo"
    | a'~\startGroup a'\stopGroup | g'~\startGroup g'\stopGroup
    | f'~\startGroup f'\stopGroup | e'1 \bar "|."
}

contralto = {
  \voiceTwo
  e'2 e' | f' f' | e' e' | d' d' | c'1
  e'2 e' | f' f' | e' e' | d' d' | c'1
}

tenor = {
  \voiceOne
  c'2 c' | c' b
    %% Sitio para los romanos del primer sistema: van a altura fija y el
    %% espaciado no los ve (y -dcrop no respeta system-system-spacing).
    | s1*0_\markup \transparent \column { "I" \vspace #1 } b2 a | a g | g1
  c'2 c' | c' b | b a | a g | g1
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  \acorde "I" c2 \acorde "I6" e~ | \acorde "IV4/2" e \acorde "VII6" d~
    | \acorde "III4/2" d \acorde "VI6" c~ | \acorde "II4/2" c \acorde "V6" b,
    | \acorde "I" c1
  \acorde "I" c2 \acorde "I6" e~ | \acorde "IV4/2" e \acorde "VII6/5" d~
    | \acorde "III4/2" d \acorde "VI6/5" c~ | \acorde "II4/2" c \acorde "V6/5" b,
    | \acorde "I" c1
}

\score {
  \new GrandStaff <<
    \new Staff << \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \with { \consists Horizontal_bracket_engraver
                                     \override HorizontalBracket.direction = #UP
                                     \override HorizontalBracket.transparent = #(not conAnalisis)
                                     \override HorizontalBracketText.transparent = #(not conAnalisis) }
                    \soprano
                  \new Voice \contralto >>
    \new Staff << \clef bass \key c \major \time 4/4 \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
