# 7.ª diatónica — diseño

> Decidido el 2026-10-17 con el usuario. ⟶ HECHO (2026-10-17), pública desde el
> 2026-10-18. El modelo común (material, consigna, presentación, nivel; la página de
> ejercicio) está en `../Modelo-ejercicios.md`; el motor, en `../motor-cuatro-voces.md`.

Familia *7.ª diatónica* de 4.º UD 1, con tres consignas: **II grado**, **II y IV grados** y
**Bajo dado**. (La segunda familia de la unidad, *Secuencias*, irá aparte.) Apuntes: c4u1
§1.2 (la 7.ª como disonancia) y §2 (séptimas de predominante). Ficheros:
`ejercicios/septimas-core.js` (global `Septimas`), `septimas-ii.html`, `septimas-ii-iv.html`
y `septimas-bajo.html`.

## 1. Normas

Las que proponían los apuntes (c4u1 §1.2) pasan a `../../../curriculum/Minimos-conduccion.md`:
**N8** (resolución de la 7.ª) y **N11** (inversiones completas; el estado fundamental puede ir
sin 5.ª) valen para cualquier séptima, y la **N16**, nueva, pide que la 7.ª diatónica se
**prepare** en la misma voz, por nota común o como paso 8–7 sobre el mismo grado. Las aplican
el realizador (`normasTransicion`) y el comprobador independiente;
`tests/sensibilidad-comprobador.js` tiene sus casos. El II7 incompleto con la 3.ª doblada
no se admite de momento. El cifrado americano de la 7.ª mayor pasa a ser `maj7` (`Fmaj7`).

## 2. Fórmula (II grado; II y IV grados)

**T0 · PD con 7.ª · (6/4 cadencial) · D · (I)**. La tónica inicial siempre: es la que
prepara la 7.ª como nota común (1̂ en el II, 3̂ en el IV).

| Casilla | Acordes (peso; nivel) |
|---------|-----------------------|
| T0 | I (3) · I6 (3) · VI (1; nivel 2) |
| PD, *II grado* | II6/5 (5) · II7 (3; 2) · II4/3 (1,5; 2) · II4/2 (2; 2) |
| PD, *II y IV* | II6/5 (3) · IV7 (3) · II7 (2; 2) · II4/3 (1; 2) · IV6/5 (2; 2, solo mayor) · II4/2 (1; 2) |
| tras II7, II6/5, II4/3, IV7 | 6/4 cadencial (40 %) · V o V7 (pesos por PD: tras el II6/5, mejor V: 4̂ está en el bajo y la 7.ª del V7 llegaría por salto) · I (CA) o nada (SC, 25 %) |
| tras II4/2 | V6/5 (3) o V6 (1) → I: no cadencial (c4u1 §2.3) |
| tras IV6/5 | V6/5 → I (el IV6/5 no puede bajar al V: 5.as) |

Vetos: VI–II4/3 y VI–IV6/5 (mismo bajo), I6–II4/3 e I6–IV6/5 (③–⑥, como I6–IV6 en Cadencias).
En menor, el IV6/5 → V6/5 daría ♭⑥–♯⑦ en el bajo: solo mayor. Ritmo: las plantillas de
Cadencias (N9), con la PD **preferentemente en parte más fuerte** que su resolución
(c4u1 §1.2; peso 0,25 si no). Soprano: la cláusula de Cadencias. 12 tonalidades, mayor y menor
desde el nivel 1; anacrusa en el nivel 2.

## 3. II grado

- **Se muestra**: el bajo **cifrado** (como un bajo cifrado: cifras de arriba abajo, la
  sensible del menor con su alteración, 5/3 tras el 6/4 cadencial; `preg`), el **primer
  acorde completo** y la tonalidad como dato.
- **Se pide**: en qué voz irá la 7.ª del II y en qué voz la sensible. Coinciden siempre (la
  7.ª, 1̂, resuelve en 7̂, aunque sea tras el 6/4), y por eso se preguntan las dos: al
  revelar se ve que son la misma voz. Para que la respuesta sea única, en el primer acorde
  **una sola voz superior** lleva la nota que será la 7.ª (filtro del realizador). En el
  II4/2 la 7.ª es el bajo.
- **Al revelar**: la realización con romano y americano, la **ligadura de preparación**
  (`<tie>`; si hay 6/4 cadencial, otra hasta él: la 7.ª se resuelve después) y, en gris (`atenua`), las notas superiores que no son de la línea de la 7.ª:
  quedan en tinta el bajo, la preparación, la 7.ª (también mantenida en el 6/4) y la
  sensible. En el texto, de dónde viene la 7.ª y adónde va.

## 4. II y IV grados

- **Se muestra**: el bajo **sin cifrar**, el primer acorde, la tonalidad y la **ligadura**
  de preparación, cuya nota de llegada está oculta.
- **Se pide**: II o IV, y en qué inversión. La ligadura señala la nota que será la 7.ª: con
  el bajo, decide. Sobre ④, 1̂ ligado = II6/5, 3̂ = IV7 (nivel 1); sobre ⑥, II4/3 frente a
  IV6/5; sobre ② solo cabe el II7, y sobre ①, el II4/2 (la ligadura, en el bajo).
- **Al revelar**: como en II grado; en el texto, además, la lectura que habría dado la otra
  nota ligada sobre el mismo bajo.

## 5. Bajo dado

Una **frase** de *Prolongación* (tipo 2, `prolongacion.md`) con el perfil
`Septimas.perfilSeptimas(nivel)`, que `prolongacion-core.js` acepta en `generar(…, {perfil})`
y lleva por toda la gramática (generación y análisis del bajo):

- `pdGen` / `pdLect`: la PD de la cadencia al generar y al analizar. En el nivel 1, solo
  II6/5, II7 o IV7; en el nivel 2, también las tríadas (IV, II6, II), siempre que la frase
  lleve una 7.ª en otro sitio (`exige`).
- `celulas`: las células con 7.ª, solo con el perfil: **I – II4/2 – V6/5 (o V6) – I**, bordadura
  inferior sobre ①–①–⑦–①, e **I – IV6/5 – V6/5 – I** (bajo ①–⑥–⑦–①, solo mayor), con sus
  líneas de soprano (la 7.ª del V6/5 preparada en el II4/2). Para ellas, la regla 3 del ritmo
  admite tres acordes en un compás con los dos subordinados seguidos.
- La base es el **nivel 2 de Prolongación** (inversiones de V7, 6/4 cadencial, menor, 12
  tonalidades), en los dos niveles.

Se pide la tonalidad, los acordes (con un II o un IV con 7.ª) y los tramos. Al revelar, lo de
Prolongación (romanos con subordinados entre paréntesis, alternativas, tramos) y, en el
color de la respuesta (`destaca`), la línea de cada 7.ª con su ligadura. En la cadencia, las
alternativas mostradas son **solo las de 7.ª**: las tríadas también caben, pero la consigna
pide una 7.ª.

## 6. Niveles

Pesos de la PD por nivel: en el nivel 2, los acordes del nivel 1 pesan como los nuevos
(revisión del 2026-10-17: el II6/5 y el IV7 seguían dominando), y la PD se elige **antes**
que la tónica inicial, entre las tónicas que no la vetan (si no, los vetos dejaban el II4/3
casi sin salir). El II4/2 y el IV6/5, con algo más de peso, para compensar los reintentos.
Respuesta de *II grado*: «7.ª y sensible · tenor» (siempre la misma voz).

| Nivel | II grado | II y IV grados | Bajo dado |
|-------|----------|----------------|-----------|
| 1 | II6/5 | II6/5 frente a IV7 (bajo ④) | 7.ª en la PD de la cadencia |
| 2 | + II7, II4/3, II4/2; VI inicial | + IV6/5 | + II4/2, IV6/5 en la prolongación |

## 7. Validación

`tests/masivo-septimas.js [n]`: cero infracciones del comprobador, la voz de la 7.ª igual a
la de la sensible (II grado), unicidad de la voz en el primer acorde, preparación por nota
común y resolución por grado descendente en la línea, cuadre rítmico de cada voz con el
parser, frecuencias de fórmulas y render en Verovio de una muestra.

⟶ ABIERTO: revisar a ojo y oído en clase; pesos de la fórmula; si el II4/3 merece quedarse
(los apuntes lo dejan en duda, c4u1 §2.3).
