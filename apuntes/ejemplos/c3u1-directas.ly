\version "2.24.0"

%% 3.º UD 1 §2.5 — Quintas y octavas directas entre bajo y soprano, con
%% el intervalo entre ellos debajo.
%%   a) bien: 8.ª directa con la soprano por grado (bajo sol3 → do4,
%%      soprano si4 → do5; 10.ª → 8.ª). Es el V–I de cualquier cadencia.
%%   b) mal: 8.ª directa con la soprano por salto (bajo mi3 → do3,
%%      soprano sol4 → do4; 10.ª → 8.ª).
%%   c) mal: 5.ª directa con la soprano por salto (bajo do3 → re3,
%%      soprano mi4 → la4; 10.ª → 12.ª).
%% El guion ponía a) con la soprano en si3 → do4, por debajo de su
%% tesitura (do4–la5): se sube todo una 8.ª y queda la misma 10.ª → 8.ª.
%% Coincide con c4u0-paralelas-directas, que tiene b) y c) como enlaces
%% completos (V–I bien, I–V mal).
%% Sin el d) opcional del guion (la directa entre voces internas, que
%% está permitida): pediría cuatro voces para un caso que no se prohíbe.

\include "comun.ily"
\include "etiquetas.ily"

soprano = {
  \cadenzaOn
  \rotuloBien "a)" \bien b'2\glissando \bien c''  \bar "||"
  \rotuloMal "b)"  \mal g'2\glissando \mal c'     \bar "||"
  \rotuloMal "c)"  \mal e'2\glissando \mal a'     \bar "|."
}

bajo = {
  \textLengthOn
  \grado "10ª" \bien g2\glissando  \grado "8ª"  \bien c'
  \grado "10ª" \mal e2\glissando   \grado "8ª"  \mal c
  \grado "10ª" \mal c2\glissando   \grado "12ª" \mal d
}

\score {
  \new GrandStaff <<
    \new Staff { \key c \major \omit Staff.TimeSignature \soprano }
    \new Staff { \clef bass \key c \major \omit Staff.TimeSignature \bajo }
  >>
  \layout { }
}
