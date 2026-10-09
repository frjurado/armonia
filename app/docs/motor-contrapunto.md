# Material de conducción de la UD 1: dos voces, faltas inyectadas, comprobador

> Lo común a las familias de conducción de 3.º UD 1 (Consonancia, Disposición, Movimientos,
> Paralelas y directas). Decidido el 2026-10-09 (`../../informes/2026-10-09-plan-ud1.md`).
> ⟶ PENDIENTE (fase 5a). Las reglas son las de `../../curriculum/Minimos-conduccion.md`.

## 1. Correcto + faltas inyectadas + comprobador

Casi todas las consignas de la UD 1 son «encuentra lo que está mal». Se resuelven igual:

1. Se genera material **correcto**: un contrapunto a dos voces (`contrapunto-core.js`), una
   melodía, sonoridades sueltas o una realización a cuatro voces (`cuatro-voces-core.js`).
2. Se le **inyectan** faltas a propósito, del tipo que pide la consigna y en número acotado
   (una o dos): una disonancia, un salto de 7.ª, unas 5.as paralelas…
3. **La respuesta la da el comprobador independiente**, no el generador: es la lista de
   faltas que hay de verdad en lo escrito, cada una con su regla, sus voces y su posición.
   Si la inyección produjo alguna de más, sale en la respuesta; si produjo una que la
   consigna no admite (p. ej. una directa a dos voces en *Paralelas y directas*), se
   descarta la instancia.
4. Una parte de las instancias **sale sin faltas** (~20–25 %), para que «no hay ninguna»
   sea una respuesta posible.

Es el mismo principio de 4.º (motor y comprobador independientes, `motor-cuatro-voces.md`),
aplicado al revés: allí el comprobador demuestra que no hay faltas; aquí, cuáles hay.

## 2. Comprobador general (de una a cuatro voces)

`cuatro-voces-check.js` comprueba realizaciones a cuatro voces con sus acordes. Las reglas
de la UD 1 no dependen del acorde, así que se generaliza a **una, dos, tres o cuatro voces,
sin acordes**, conservando los identificadores de regla y la independencia respecto a los
generadores (no comparte con ellos las funciones de transición). Reglas que debe cubrir:

| Regla | Qué | Consignas |
|---|---|---|
| N1 | tesituras | A cuatro voces |
| N2 | distancia entre contiguas > 8.ª | Entre dos voces, A cuatro voces |
| N3 | cruces (sin la superposición entre acordes, por ahora) | Entre dos voces, A cuatro voces |
| P2 | unísono entre contiguas | Entre dos voces |
| N4 | 5.as, 8.as y unísonos paralelos (también por movimiento contrario) | Paralelas y directas |
| N5 | directas de 5.ª y 8.ª entre extremas, salvo soprano por grado | Paralelas y directas (solo a 3–4 voces) |
| N12 | intervalos melódicos aumentados y disminuidos | Melódicos |
| N13 | saltos excesivos (a dos voces, máximo 5.ª) | Melódicos |
| P9 | salto no compensado («mejorable», no falta) | Melódicos |

Y además la **clasificación** de cada intervalo armónico (perfecta / imperfecta /
disonancia; la 4.ª justa, disonancia a dos voces) y el **tipo de movimiento** de cada paso
(oblicuo / directo / contrario / paralelo), que no son faltas sino respuestas. Cada regla
nueva, con su caso de sensibilidad (`../tests/sensibilidad-comprobador.js`).

## 3. Dos voces del coro

Las cadenas y sonoridades a dos voces son una **pareja real** del coro —S–A, A–T, T–B,
S–B…—, cada voz con su tesitura (N1) y en su pentagrama natural: S–A en el de Sol, T–B en
el de Fa, las parejas con una voz de cada lado repartidas en los dos. Prepara la lectura a
cuatro voces y da sentido a reglas que dependen de la voz (N2 entre contiguas, N13 en el
bajo). Qué parejas usa cada consigna lo dice su ficha.

## 4. Resaltar una pareja entre cuatro voces

En *Armónicos* y *Paralelas y directas* (nivel 2), las dos voces por las que se pregunta
van en tinta y las demás en gris: una clase en el MEI (`@type`, como la máscara de la
página común) y una regla de CSS.

## 5. Motor de contrapunto

`contrapunto-core.js` genera contrapuntos 1:1 correctos pero sosos. Antes de la UD 1:
**preferencias puntuadas** (el mecanismo de `cuatro-voces-core.js`: normas duras +
preferencias con peso), las parejas del coro (§3) y los ganchos para inyectar faltas (§1).
