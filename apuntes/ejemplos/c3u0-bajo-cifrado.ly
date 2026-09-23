\version "2.24.0"

%% 3.º UD 0 §3.2 — Un bajo cifrado breve y su realización, en la menor.
%% Progresión: i - i6 - V - i.
%%
%% Lo que se quiere ver es el tercer acorde. La armadura de la menor no
%% lleva sostenidos, así que la sensible hay que pedirla: el ♯ SUELTO
%% bajo el mi no significa «mi sostenido», sino «sube la 3.ª sobre este
%% bajo», es decir sol♯. Y por eso mismo la cifra no dice de qué tipo es
%% el acorde: eso se ve al realizarlo.
%% El segundo acorde, con su 6, es la otra cara: la cifra sí basta para
%% saber que el bajo no es la fundamental.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \voiceOne
  c''1  c''  b'  c''
}

contralto = {
  \voiceTwo
  a'1  a'  gs'  a'
}

tenor = {
  \voiceOne
  e'1  e'  e'  e'
}

bajo = {
  \voiceTwo
  \textLengthOn
  \override TextScript.staff-padding = #2.5
  a,1  \grado "6" c  \grado \markup { \sharp } e  a,
  \bar "|."
}

\score {
  \new GrandStaff <<
    \new Staff << \key a \minor \omit Staff.TimeSignature
                  \new Voice \soprano \new Voice \contralto >>
    \new Staff << \clef bass \key a \minor \omit Staff.TimeSignature
                  \new Voice \tenor \new Voice \bajo >>
  >>
  \layout { }
}
