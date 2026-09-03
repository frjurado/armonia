# mini-LilyPond — Gramática de la representación musical

> **Estado.** Boceto inicial. Define la sintaxis de la **cadena de contenido musical** que vive
> dentro del campo `music` de cada voz (ver `Generador-ejercicios.md` §5.2). Complementa, no
> sustituye, a ese documento: aquí solo se especifica la **notación**; el contexto (clave,
> tonalidad, compás), los metadatos y las anotaciones viven en el JSON que la envuelve.

## 1. Alcance y principio rector

La cadena mini-LilyPond contiene **solo eventos musicales de una voz**: notas, silencios,
acordes y marcas de duración. **No** lleva claves, armaduras, compases ni comandos: todo eso
son campos JSON y se inyectan al exportar.

Principio rector: **lo que escribamos debe ser LilyPond válido**. mini-LilyPond es un
**subconjunto estricto** de LilyPond real, de modo que el camino a papel (LilyPond + Typst)
consista en envolver la cadena con `\clef`/`\key`/`\time` tomados del JSON, sin reescribir nada.
Para la web, un parser pequeño traduce la misma cadena al modelo interno de notas que ya
alimenta el exportador a MEI (Verovio).

## 2. Valoración de las decisiones

**Nombres de nota: solo notación de letras (a–g).** Se **omite el solfeo** (do, re, mi…) como
entrada. Es lo coherente con la adopción del cifrado americano (`Plan-Armonia.md` §1) y evita
mantener varios idiomas de nota de LilyPond.

**Convención de alteraciones: inglesa (decidido).** Sufijos `s` = sostenido, `f` = bemol,
`ss` = doble sostenido, `ff` = doble bemol: `cs` = do♯, `cf` = do♭, `css` = do𝄪, `cff` = do𝄫.
Es la lectura más natural para quien piensa en cifrado americano. Coste: una línea
`\language "english"` en el envoltorio de papel (trivial). No hay ambigüedad con los silencios:
un evento que empieza por letra `a–g` es una nota (`cs` = do♯); `s` en posición de evento es un
silencio invisible (ver más abajo).

**Octava: absoluta.** Octava de referencia **`c'` = Do central (C4)**; `c` (sin marca) = C3;
cada `'` sube una octava, cada `,` baja una. Coherente con la decisión de notación absoluta
de §5.2 (autoconsistente, fácil de generar y de anotar).

**Duraciones y puntillo: sí.** Cifra de duración (`1, 2, 4, 8, 16, 32`) con **puntillo** (`.`)
y doble puntillo (`..`). Se admite el **arrastre de duración** de LilyPond (si una nota no
indica duración, hereda la anterior; por defecto inicial, negra). El generador **siempre emite
duración explícita**; el arrastre es comodidad para modelos escritos a mano.

**Tresillos / grupos irregulares: se aplazan.** `\tuplet n/d { … }` introduce un comando y
llaves, lo único "no plano" que podríamos necesitar. Las familias 1–4 (intervalos, movimientos,
faltas) **no los requieren** de momento. Se reservan para una **fase posterior**, como única
extensión con comando admitida.

**Ligaduras — distinguir dos cosas:**

- **De prolongación (*tie*) `~`: activa.** Une duraciones de la misma altura (p. ej. a través
  de compás). Se usará pronto, así que entra desde ya.
- **De expresión (*slur*) `( )`: *deferred*** (no descartada). Eventualmente puede servir para
  **marcar fragmentos** —aunque no en su sentido expresivo original—; se reserva, como
  `\tuplet`, hasta que aparezca esa necesidad.

**Silencios:** `r` (silencio normal) y `s` (silencio invisible / *skip*, útil para alinear
voces): **ambos incluidos desde el principio.** **Barra de compás `|`:** se admite como
*bar check* y el parser **valida** que las duraciones acumuladas cuadran con el compás
(tomado del JSON); si no cuadra, error.

**Omisiones explícitas** (todo esto queda fuera de mini-LilyPond): comandos en general
(`\clef`, `\key`, `\time`, `\relative`…), `\markup` y texto, variables e `include`, notas de
adorno (*grace*), dinámicas y articulaciones, letra (*lyrics*), repeticiones, y todos los
idiomas de nota salvo el inglés. (*Slur* `( )` y `\tuplet` quedan **deferred**, no descartados.)

## 3. Gramática (EBNF)

```ebnf
voice       = ws? , event , { ws , event } , ws? ;

event       = note | chord | rest | barcheck ;

note        = pitch , [ duration ] , [ tie ] ;
chord       = "<" , ws? , pitch , { ws , pitch } , ws? , ">" , [ duration ] , [ tie ] ;
rest        = ( "r" | "s" ) , [ duration ] ;

pitch       = letter , [ accidental ] , [ octave ] ;
letter      = "a" | "b" | "c" | "d" | "e" | "f" | "g" ;
accidental  = "s" | "ss" | "f" | "ff" ;              (* inglés: s/f = ♯/♭, ss/ff = 𝄪/𝄫 *)
octave      = ( "'" , { "'" } ) | ( "," , { "," } ) ; (* ausencia = octava de referencia *)

duration    = base , { "." } ;                        (* "." = puntillo *)
base        = "1" | "2" | "4" | "8" | "16" | "32" ;

tie         = "~" ;
barcheck    = "|" ;
ws          = ( " " | "\t" | "\n" )+ ;
```

Notas sobre la semántica que el EBNF no captura:

- **Arrastre de duración:** si `duration` se omite, vale la última explícita (negra al inicio).
- **`tie`** se asocia a la nota/acorde inmediatamente anterior y exige misma altura en el
  evento siguiente.
- **Orden del acorde:** las alturas dentro de `< >` pueden ir en cualquier orden; el render las
  coloca por altura.

## 4. Tablas léxicas

| Duración | base | con puntillo | doble puntillo |
|---|---|---|---|
| redonda | `1` | `1.` | `1..` |
| blanca | `2` | `2.` | `2..` |
| negra | `4` | `4.` | `4..` |
| corchea | `8` | `8.` | `8..` |
| semicorchea | `16` | `16.` | — |
| fusa | `32` | — | — |

| Alteración | sufijo (inglés) | semitonos | ejemplo |
|---|---|---|---|
| doble bemol | `ff` | −2 | `cff` = do𝄫 |
| bemol | `f` | −1 | `cf` = do♭ |
| becuadro | *(sin sufijo)* | 0 | `c` = do |
| sostenido | `s` | +1 | `cs` = do♯ |
| doble sostenido | `ss` | +2 | `css` = do𝄪 |

| Octava | marca | resultado |
|---|---|---|
| C2 | `c,` | una 8.ª bajo C3 |
| C3 | `c` | octava de referencia inferior |
| C4 (central) | `c'` | Do central |
| C5 | `c''` | una 8.ª sobre el central |

## 5. Ejemplos

**Familia 1 — tríada de tónica de La menor, estado fundamental, redonda:**

```
<a c' e'>1
```

JSON que la envuelve:

```json
{
  "family": "triadas",
  "context": { "key": {"tonic": "a", "mode": "minor"}, "time": null },
  "voices": [ { "clef": "treble", "music": "<a c' e'>1" } ],
  "answer": { "quality": "menor", "inversion": 0 }
}
```

**Fragmento a dos voces (movimiento contrario), negras por arrastre:**

```
voz sup.:  e' f' g'
voz inf.:  c' b a
```

**Ritmo con puntillo y silencio:**

```
c'4. d'8 e'2 r4 g'4
```

**Alteración inglesa, ligadura de prolongación y silencio invisible** (sensible de La menor
ligada a través del compás; `s` alinea la otra voz):

```
gs'2 gs'4 ~ gs'4 | a'1
```

## 6. Cómo se consume

- **Web (Verovio):** `parse(music)` → modelo de notas `{letter, alter, octave, dur, dots, tie}`
  → exportador a **MEI** (ya existente en el prototipo de tríadas).
- **Papel (LilyPond + Typst):** envoltorio
  `\clef <clave> \key <ton> \time <compás> { <music> }` (+ `\language "english"` si se opta por
  la convención inglesa). La cadena entra **sin retoques**.
- **Audio:** del modelo de notas se obtienen los MIDI para los samples.

## 7. Decisiones tomadas y pendientes

Cerradas:

- [x] Alteraciones: **inglés** (`s`/`f`/`ss`/`ff`) (§2).
- [x] Ligadura de prolongación `~`: **activa** (§2).
- [x] Ligadura de expresión `( )`: **deferred**, no descartada (§2).
- [x] Tresillos `\tuplet`: **deferred** hasta que se vea la necesidad (§2).
- [x] *Bar check* `|`: **validar** el cuadre del compás (§2).
- [x] Silencio invisible `s`: **incluido** desde el principio (§2).

- [x] Doble sostenido: **solo `ss`**, sin el alias `x`, por analogía con `ff` (más claro).

- [x] **Parser** implementado en `ejercicios/mini-lilypond-parser.js` (módulo Node/navegador),
      con 25 tests en verde (acordes, puntillo, arrastre, *tie*, alteraciones inglesas, octavas,
      `r`/`s`, y validación de *bar check*).

- [x] Parser **integrado** en la familia de tríadas: el flujo es
      notas → cadena mini-LilyPond → parser → modelo → MEI → Verovio (verificado).

- [x] Camino a papel: fichero `tests/validacion-lilypond.ly` con 5 ejemplos (envoltorio
      de contexto + cadenas mini-LilyPond sin retocar). Las cadenas pasan el parser sin errores.
      **Compilación verificada** con LilyPond 2.24.3 (2026-09-02): los 5 `\score` compilan
      **sin errores ni avisos**, y las cadenas entran en el envoltorio sin un solo retoque.
      Queda así confirmado el principio rector de §1.

Pendientes:

- [ ] *(ninguno abierto en la gramática misma; las extensiones aplazadas —`\tuplet`, slur `( )`—
      siguen en §2 a la espera de que aparezca la necesidad.)*

## 8. Anotaciones del ejercicio (aclaración)

"Anotaciones" e "ids de nota/voz" se refiere a cómo el JSON **señala elementos concretos** de
la música para expresar la consigna y la respuesta. La cadena mini-LilyPond solo dice *qué
suena*; no dice *sobre qué se pregunta*. A partir de la familia 3 eso es imprescindible:
"identifica el intervalo entre la **3.ª nota** de la voz superior y la de la inferior", "las
**dos voces resaltadas** son la 1 y la 3", "las 5.ª paralelas están **entre los eventos 2 y 3**".

Para poder decir eso, cada nota/voz necesita una **dirección estable**. Dos enfoques:

- **Posicional** (recomendado): `voices[i]`, evento `j` (0-indexado). Como el generador produce
  música y anotaciones **a la vez**, los índices son estables por construcción. Simple, sin
  tocar la cadena musical.
- **Ids explícitos:** etiquetar eventos con un identificador propio. Más robusto ante ediciones
  manuales, pero LilyPond no deja incrustar ids sin comandos (excluidos), así que tendrían que
  asignarse en el parser y referenciarse igualmente por posición.

Propuesta: **direccionamiento posicional** por defecto; los ids explícitos solo si más adelante
hacen falta. La gramática concreta de las anotaciones (campos `answer`, `highlight`,
`expected`…) se especifica en el JSON, no aquí — pertenece a `Generador-ejercicios.md` §5.2.
