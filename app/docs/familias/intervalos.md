# Intervalos — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Un solo material (el intervalo armónico a dos voces) y hoy **dos generadores**:
`intervalos-core.js` (3.º UD 0, tres consignas) y `familia2-intervalos-core.js` (la antigua
«familia 2», oculta en 3.º UD 1). ⟶ DECIDIDO: **se funden** en `intervalos-core.js`, que
absorbe de la familia 2 los compuestos y las dos claves, y pasa a usar `tonalidades.js`; la
familia oculta se **retiró** (fase 4, 2026-10-09). Su consigna propia, la consonancia, no se queda aquí:
el 2026-10-09 pasó a ser una **cadena a dos voces** (`consonancia.md`), otro material.

⟶ DECIDIDO (2026-10-05 y 2026-10-09), ⟶ HECHO (2026-10-09; validación:
`../../tests/masivo-intervalos.js`, 0 fallos en 3000 instancias por consigna):

- **Identificación** y **Con grados**: en **pentagrama doble** siempre, con intervalos
  compuestos **hasta la 12.ª** (la forma simple en el titular y la real en segundo plano,
  «5.ª justa (12.ª)», como ya hace la familia 2). Las dos notas, por tercios: las dos en
  Sol, las dos en Fa, o una en cada pentagrama (2026-10-09).
- **Aumentados y disminuidos** (2026-10-09): solo los que aparecen en la escala mayor o en
  la menor armónica, y sus compuestos —4.ª aumentada y 5.ª disminuida; 2.ª aumentada y 7.ª
  disminuida; 5.ª aumentada y 4.ª disminuida—. Fuera el unísono aumentado, la 2.ª
  disminuida, las 3.as y 6.as aumentadas y disminuidas, la 7.ª aumentada y las 8.as
  alteradas (la 6.ª aumentada volverá en 4.º).
- **Con inversión**: en un pentagrama, porque invertir es una operación dentro de la 8.ª.
- **Sin niveles** en la UD 0 (ya no los tenía).
- ⟶ HECHO (2026-10-06): las tres páginas de la UD 0, sobre la página común
  (`../Modelo-ejercicios.md` §2), aún con su contenido actual. En *Con inversión* el segundo
  compás y la barra doble están dibujados desde el principio, ocultos (el compás lleva
  `type="barra-resp"`); en *Con grados*, los grados, y la tonalidad pasa a la partitura como
  dato. Corregido de paso: en el unísono, el grado de arriba se colocaba como el de abajo y
  caía dentro del pentagrama.
- ~~Consonancia como consigna de intervalos sueltos~~ → cadena a dos voces, en
  `consonancia.md` (2026-10-09).

## Consignas de la UD 0

Intervalos **armónicos** en clave de Sol, del unísono a la 8.ª (sin compuestos), escritos
**a dos voces** en un pentagrama (dos capas: plicas arriba/abajo, en blancas). Fuera de
tonalidad: alteraciones sueltas de **un solo ♯/♭** (sin dobles) y **sin intervalos doble
aumentados/disminuidos**; los aumentados/disminuidos simples sí salen, amortiguados a ~25 %
de los casos (sin amortiguar dominarían la generación libre).

- **Identificación** (icono de dos notas simultáneas con plicas hacia fuera: la superior
  arriba, la inferior abajo): nombrar amplitud y calidad («3.ª menor»).
- **Con inversión** (icono de flechas cruzadas): amplitudes de 2.ª a 7.ª; se pide la
  inversión y, al revelar, aparecen las notas invertidas —segundo compás, oculto como
  `<space>` hasta entonces (layout estable)— y el intervalo resultante (do–mi → mi–do,
  6.ª menor).
- **Con grados** (icono de número con circunflejo): el intervalo pertenece a una
  tonalidad (armadura + nombre; las 4 del trimestre 1); se piden el intervalo y el
  **grado** de cada nota, que al revelar se escriben encima/debajo del pentagrama
  (`<dir>` de MEI, «4̂»). Único accidental posible: la sensible del menor.

## La antigua «familia 2» (3.º UD 1, oculta; retirada el 2026-10-09)

- Clave de sol, luego de fa, luego las dos; tonalidades válidas; accidentales limitados (sensible).
- Se muestra un **intervalo a dos voces** → indicar **amplitud** (p. ej. "3.ª Mayor") y
  **tipo** (consonancia perfecta / imperfecta / disonancia). Respecto a la amplitud, pueden ser
  intervalos compuestos (9.ª, 10.ª...): a partir de la 10.ª, mostrar primero su versión simple (3.ª), 
  y en menor tamaño/color secundario el intervalo completo.
- **Versión auditiva:** suena **sin mostrar**; se muestra **después**, al revelar la solución. 
  En el caso auditivo, mostrar primero/más resaltado el tipo (consonancia, etc.) que la amplitud.

⟶ HECHO: prototipo de la familia 2 (intervalos a dos voces, esta sección) en
`ejercicios/familia2-intervalos-id.html` (identificación) y `ejercicios/familia2-intervalos-au.html`
(audición), con la lógica de generación compartida en `ejercicios/familia2-intervalos-core.js`.
Mismo pipeline que la familia 1, generalizado a **varios pentagramas** (`voices[]`, como prevé
`../Modelo-ejercicios.md` §5) para el nivel 3. La versión de audición no muestra la partitura hasta revelar la
respuesta, como pide esta sección; en su respuesta se invierte el orden respecto a la de
identificación (tipo grande primero, amplitud pequeña después). Amplitud + calidad + categoría
(perfecta/imperfecta/disonancia) verificadas por generación masiva, incluidos los intervalos
compuestos. Enlazado en el menú (`index.html`).

### Niveles de la familia 2 (ajustados tras revisión):
- **Nivel 1** — modo mayor, clave de Sol; amplitudes 1.ª a 8.ª (unísono a octava incluidos).
  Únicos intervalos aumentado/disminuido posibles: 4.ª aumentada / 5.ª disminuida (el único
  tritono de la escala mayor natural). Verificado por generación masiva: no aparece ningún otro.
- **Nivel 2** — añade el modo menor (con la sensible: pueden salir otros intervalos
  aumentados/disminuidos, p. ej. 2.ª aumentada) y la clave de Fa. Amplitudes hasta la **12.ª**
  (intervalos compuestos): la respuesta muestra la forma reducida en grande (p. ej. "5.ª justa")
  y, si es compuesto, la amplitud real en pequeño y en gris al lado (p. ej. "(12.ª justa)").
- **Nivel 3** — **dos claves a la vez**: una nota en clave de Fa y otra en clave de Sol, cada
  una con su propia tesitura. Incluye el unísono entre claves distintas (misma altura real,
  notada de dos formas). Se evitan los cruces (la voz en Fa nunca puede sonar más aguda que la
  de Sol). Al usar dos pentagramas independientes, la mayoría de los intervalos resultan
  compuestos, a veces muy amplios.

**Tesitura / líneas adicionales:** la familia 1 (tríadas) limita a **1 línea adicional** por
encima/debajo del pentagrama. La familia 2 necesita más margen —desde el nivel 2 hay intervalos
compuestos hasta la 12.ª, y en el nivel 3 cada nota vive en su propio pentagrama— así que el
límite aquí es de **2 líneas adicionales** (`MAX_LEDGER_LINES` en
`familia2-intervalos-core.js`), calculado por pasos diatónicos (letra+octava) desde la línea
límite de cada clave, no por semitonos, ya que eso es lo que determina cuántas líneas ocupa
realmente una nota en el pentagrama.
