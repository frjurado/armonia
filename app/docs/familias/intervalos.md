# Intervalos — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Un solo material (el intervalo armónico a dos voces) y hoy **dos generadores**: `unidad0-intervalos-core.js` (3.º UD 0, tres consignas) y `familia2-intervalos-core.js` (la antigua «familia 2», oculta en 3.º UD 1). ⟶ DECIDIDO (2026-10-05): **se funden** en un generador, y la familia oculta queda reducida a su única consigna propia, **consonancia / disonancia**, que pasa a ser la 2.ª variante de *Morfología* en 3.º UD 1 (`bajo-cifrado.md` §2).

⟶ DECIDIDO (2026-10-05), ⟶ PENDIENTE de implementar:

- **Identificación** y **Con grados**: en **pentagrama doble** siempre, con intervalos compuestos (la forma simple primero y la real en segundo plano, como ya hace la familia 2). Absorbe lo que eran los niveles 2–3 de la familia 2.
- **Con inversión**: en un pentagrama, porque invertir es una operación dentro de la 8.ª.
- **Sin niveles** en la UD 0.
- **Consonancia**: la pregunta es la clasificación (perfecta / imperfecta / disonancia), con la presentación «Oír» disponible (la consonancia se oye). Sus niveles, si los tiene, por decidir.

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

## Consonancia (hoy «Intervalos», 3.º UD 1, oculta)

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
