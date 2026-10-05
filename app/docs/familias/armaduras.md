# Armaduras — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 3.º UD 0, familia *Armaduras*. Sin niveles. Es la única familia en **series** (12 armaduras, sin repetir): el orden es contenido (el círculo, la escala cromática) o garantiza cubrirlo todo (Aleatorio). Ver `../Modelo-ejercicios.md` §1.5.

Series **encadenadas de 12 armaduras** (siempre las 12 clases de altura, sin repetir), en
clave de Sol, desveladas una a una («Respuesta» → «Siguiente»; en *Por quintas*, ya como
tira deslizante con avance automático — ver abajo). Conmutadores **inclusivos**
de mayor/menor (al menos uno activo). Nunca se usan 7 alteraciones: se prefiere siempre la
enarmónica de 5 (Re♭ mayor antes que Do♯ mayor); el caso de 6 se decide por variante.

- **Por quintas** (icono de reloj sin manecillas, evocando el círculo): se parte de 2–5
  bemoles y se avanza hacia los sostenidos, o al revés (2–5 sostenidos y de vuelta); se
  muestra la **armadura** y se pide la **tonalidad** (mayor y/o menor según los
  conmutadores). Con 6 alteraciones: sostenidos en sentido horario, bemoles en antihorario.
  **Presentación en tira** (implementada): la serie entera se renderiza de una vez como
  **tira continua** —un solo sistema, un compás vacío por armadura— y se desliza centrando
  la armadura actual, con lo anterior/posterior oculto tras velos laterales; la respuesta
  se superpone en capas HTML absolutas (mayor **encima** del pentagrama, menor **debajo**),
  no en el SVG, y tras una pausa la tira avanza sola al siguiente compás. El deslizamiento
  vive encapsulado en `ejercicios/tira-partitura.js` (módulo `TiraPartitura`, reutilizable
  para otras series encadenadas, p. ej. la variante cromática). Nota técnica: Verovio solo
  renderiza el cambio de armadura si va como `scoreDef/staffGrp/staffDef@keysig` (las
  formas `scoreDef@keysig` y `scoreDef/keySig` se ignoran), y el cambio a 0 alteraciones
  produce un `g.keySig` vacío (sin becuadros de cortesía) cuya ancla se interpola.
- **Cromático** (icono de escalones): **doble escala cromática** — la tónica mayor parte
  de una nota blanca y asciende o desciende por semitonos toda la octava, con su relativa
  menor en paralelo (Do M/La m, Re♭ M/Si♭ m…). Se muestran los **nombres** (mayor y/o
  menor según los conmutadores, que ya no cambian la serie) y se pide la **armadura**,
  dibujada al revelar. Subiendo se prefieren tónicas con sostenido hasta un máximo de 6
  alteraciones; bajando, con bemol. **Presentación en tira** invertida respecto a las otras
  variantes: los nombres van superpuestos (pregunta, en tinta) y las armaduras viajan
  **ocultas** en la tira (`visibility:hidden` sobre su `g.keySig`, para no ver nunca las
  siguientes antes de tiempo); «Respuesta» hace visible la del compás centrado (para
  Do M/La m, sin glifo, se muestra el rótulo «sin alteraciones») y tras la pausa se
  desliza a la siguiente.
- **Aleatorio** (icono de dado): las 12 armaduras barajadas, sin repetición; se muestra
  la **armadura** y se pide la **tonalidad**, como en *Por quintas* —solo cambia el
  orden— y con la misma presentación en tira deslizante (con 6 alteraciones, enarmónico
  al azar). *(Simplificado: antes cada paso preguntaba tonalidad o armadura al azar.)*
