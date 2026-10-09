# Consonancia — diseño

> Decidido el 2026-10-09 (`../../../informes/2026-10-09-plan-ud1.md`). ⟶ HECHO (fase 5b,
> 2026-10-09): `consonancia-core.js` + `consonancia-cadena.html`, sobre la página común;
> en el menú, 2.ª consigna de *Morfología*, con `publico:false` hasta revisarla. Lo común a las consignas de conducción de la UD 1 —faltas inyectadas, comprobador,
> parejas del coro— está en `../motor-contrapunto.md`.

Hoy en el plan: 3.º UD 1, familia *Morfología*, 2.ª consigna (tras *Bajo cifrado*).
Apuntes: c3u1 §1.3 *Consonancia y disonancia*. Sustituye a la antigua familia oculta
«Intervalos» (intervalos sueltos a dos voces), retirada en la fase 4.

- **Material**: una **cadena a dos voces** —un contrapunto 1:1, como los posteriores—
  con **disonancias «incorrectas»** inyectadas (§1 de `../motor-contrapunto.md`).
  Melódicamente correcta: lo que falla es solo lo armónico.
- **Se pide**: la clase de **cada intervalo** —consonancia perfecta, imperfecta o
  disonancia—. Al revelar, bajo cada intervalo, el intervalo y su clase («5J · P», «3m · I»,
  «4A · D»).
- **Tonalidad**: dentro de una tonalidad (las del trimestre), menor armónica. Así aparecen
  solos los casos que subrayan los apuntes (sol♯–do en La menor: 4.ª disminuida, disonancia,
  aunque suene como una 3.ª mayor).
- **La 4.ª justa, siempre disonancia** a dos voces: la voz de abajo hace de bajo, sea cual
  sea la pareja.
- **Pareja**: dos voces del coro (§3 de `../motor-contrapunto.md`); intervalos compuestos
  según la pareja (se clasifican como los simples).
- **Niveles**: 1, modo mayor; 2, añade el menor (y con él los aumentados y disminuidos de la
  sensible).
- **Sin «Oír»** de momento.

**Valores por defecto** (2026-10-09, revisables tras usarlo en clase):

- **8 sonoridades**, en blancas; tonalidades del trimestre 1.
- **0–3 disonancias**: ninguna en ~20 % (que «ninguna» sea una respuesta posible), una en
  ~40 %, dos en ~30 %, tres en ~7 % (en 5 sonoridades interiores, sin dos seguidas, caben
  pocas). Nunca en la primera ni en las dos de la cadencia.
- **Inyección**: en una sonoridad interior, una de las voces cambia a otra nota de la
  escala a una 2.ª o 3.ª de distancia que forme disonancia; se reúnen todas las opciones
  sin otras faltas y se elige con pesos —la 4.ª justa, que sale con cualquier paso, pesa
  0,35; los intervalos de la sensible en menor (4.ª D, 5.ª A, 2.ª A, 7.ª D), 4—. Reparto
  resultante: 7.ª m ~29 %, 4.ª J ~25 %, 2.ª M ~22 %, 7.ª M ~11 %, tritonos ~18 %, 2.ª m
  ~9 %; en menor, los de la sensible ~20 %.
- **Se revela de una vez**: bajo cada sonoridad, el intervalo (forma simple: «4A», «7m»)
  y su clase (P / I / D); las disonancias, en el color de la respuesta. En el titular, las
  disonancias; en el detalle, la tonalidad, la pareja y en qué sonoridades están.

**Validación**: `../../tests/masivo-consonancia.js`, 3000 cadenas, 0 fallos (las clases,
recalculadas con una tabla propia; ninguna otra falta según el comprobador; disonancias en
su sitio; render).
