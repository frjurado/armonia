# Bajo cifrado — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 3.º UD 1, familia *Morfología* (consigna Bajo cifrado; la segunda, Consonancia, usa el material de `intervalos.md`).

Primera familia de la UD 1, **antes** de *Intervalos* y *Movimiento armónico*, que quedan
detrás y ocultas en la versión pública (`publico:false` por familia, `../Modelo-ejercicios.md` §3). Solo hay
identificación, así que la familia no usa modos id/au/ct sino `tipos`, como las UD 0.
Ficheros: `ejercicios/c3u1-morfologia-core.js` (global `Morfologia`, sobre el modelo de
acorde de `cuatro-voces-core.js`) y una página por variante. ⟶ DECIDIDO (2026-10-04) lo
que sigue, salvo lo marcado.

## 1. Variante *Bajo cifrado* (`c3u1-morfologia-bajo.html`)

- **Se da:** la tonalidad (como dato en la partitura, igual que en 4.º) y un bajo de **5 o
  6 notas**, redondas, un acorde por compás (compás invisible), con su cifrado: solo
  tríadas, sin cifra / 6 / 6/4. Siempre los dos pentagramas; el de Sol, vacío.
- **Se pide:** el **grado del bajo** (en círculo, encima del pentagrama de Fa) y el
  **acorde** (romano, debajo, delante del cifrado).
- **Al revelar:** grados en círculo, romano + cifras, y en clave de Sol cada acorde en
  **estado fundamental y posición cerrada** (fundamental entre Mi4 y Re5) con su
  **americano** encima en segundo plano (como en 4.º). Suena el bajo; al revelar, con los
  acordes. En el titular, la sucesión de romanos; en el detalle, los grados del bajo y el
  uso de cada 6/4.

**Generación.** Búsqueda en profundidad con orden aleatorio ponderado sobre:

- **Inventario:** I, I6, II, II6, III, IV, IV6, V, V6, VI, VII6 y tres 6/4: I6/4 cadencial,
  V6/4 de paso (entre I e I6, bajo ①–②–③ o al revés) e I6/4 de paso (entre IV y IV6,
  ④–⑤–⑥). Fuera: VII en estado fundamental; en menor, II en fundamental (disminuido) y
  III (aumentado en la armónica: menor estrictamente armónica).
- **Gramática de sucesiones** (`SIGUE`, con pesos): 5.ª descendente, 2.ª ascendente,
  3.ª descendente; nada de V → IV ni V → II. El 6/4 cadencial, tras predominante (II, II6,
  IV, IV6) y seguido de V sobre la misma nota.
- **Forma:** empieza en I o I6 (3:1); acaba en **V–I** (65 %) o en **V** precedido de
  predominante o 6/4 cadencial. Sin el mismo acorde dos veces seguidas, sin tres del mismo
  grado (I–I6–I), sin repetir un par (I6–V–I6–V), cada 6/4 una vez como mucho, y al menos
  una inversión.
- **Normas melódicas del bajo:** Mi2–Do4; 2.ª, 3.ª, 4.ª y 5.ª justas, 6.ª menor y 8.ª
  justa (nunca aumentados, disminuidos, 7.ª ni 6.ª mayor); tras salto de 4.ª o más, cambio
  de dirección; dos saltos seguidos en la misma dirección, solo 3.ª + 3.ª; el marco de tres
  notas en la misma dirección tampoco puede ser aumentado ni disminuido; la sensible sube
  a la tónica. **Nota repetida** solo en 6/4 cadencial → V y en el cambio de acorde sobre
  el mismo bajo, 5/3 → 6 (IV → II6, VI → IV6); el mismo grado seguido nunca va a la 8.ª.
  Preferencia por el grado conjunto (pesos por intervalo).

**Cifrado.** Las cifras son el dato, así que van más grandes que los índices de 4.º
(`fontsize` 140 % en el `<rend rend="sup|sub">`) y, sin revelar, solas y centradas bajo la
nota. El V tras el 6/4 cadencial se cifra 5/3. En menor, la sensible fuera del bajo lleva
su alteración: sola si es la 3.ª (♯), delante si es la 6.ª (♯6: V6/4, VII6). Verovio
cambia la alteración por un glifo de su fuente musical, con otro cuerpo:
`ArmoniaEj.apilarCifras` lo descarta al comparar cuerpos y apila centrando la parte numérica
(el ♯ de «♯6» cuelga a la izquierda; un ♯ solo, como en 5/♯, se centra bajo el 5). Al revelar,
el romano va delante **con las mismas cifras** (en menor, «V♯»). ⟶ ABIERTO: ¿se quiere así,
o el romano a la convención de los apuntes (sin alteración) y la alteración solo en el
dato?

**Grado del bajo en círculo.** `<harm type="gradobajo">` con la cifra sola (y la
alteración delante, separada por un espacio de cuarto: ♯⑦); el círculo lo dibuja
`ArmoniaEj.circularGrados` tras el render, porque ni Source Serif ni Leland traen ①…⑦.

**Niveles.** 1: Do y Sol mayor. 2: añade La y Re menor. (Tonalidades del trimestre 1.)

**Validación.** `tests/masivo-morfologia.js [nivel] [n]`: forma, normas del bajo con
reglas escritas aparte del core, usos del 6/4, cifrado frente a las notas, parser y render
en Verovio. 0 fallos en 3000 instancias por nivel (2026-10-04). Frecuencias: 6/4 cadencial
en ~24 % de los ejercicios, de paso en ~19 %; III en ~1 %.

## 2. Segunda consigna de la familia: consonancia y disonancia

⟶ DECIDIDO (2026-10-05): la segunda variante de *Morfología* es **Consonancia** (apuntes c3u1 §1.3). Su material no es el bajo cifrado sino el **intervalo**: se diseña en `intervalos.md` (§ Consonancia) y aquí solo se ubica. Si el curso que viene la Morfología pasa a la UD 0 y la consonancia se queda con la conducción, se mueve en `curriculum-data.js`, sin tocar ficheros.
